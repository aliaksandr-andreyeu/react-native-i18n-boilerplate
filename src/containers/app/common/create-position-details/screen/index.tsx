import React, { FC, useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { View, ScrollView, Text, TouchableOpacity, Keyboard, SafeAreaView } from 'react-native';
import { PositionDetailsForm } from '@/store/slices/market/types';
import {
  BaseFormField,
  BaseButton,
  BaseButtonLoading,
  BaseButtonType,
  BaseButtonSize,
  BaseBackButton,
  BaseText,
  BaseSwitch,
  BaseTextVariant
} from '@/components';
import { useForm, Controller } from 'react-hook-form';
import { useTheme, ParamListBase, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import {
  useCalculateLimitsMutation,
  useCalculateMarginMutation,
  useGetSymbolConfigMutation,
  useGetSymbolLastTickQuery,
  useOpenPositionMutation,
  usePlaceOrderMutation
} from '@/store/api';
import { SymbolConfig, ORDER_TYPES } from '@/store/slices/portfolio/types';
import { UserAccount } from '@/store/slices/wallet/types';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import dateHelper from '@/helpers/dateHelper';
import { config, websocketUrls, testIDs } from '@/constants';
import { debounce } from 'throttle-debounce';
import { convertUtcTimeSmart, getAssetName, jsonParse } from '@/helpers';
import { useAppDispatch, useAppSelector, useTradingSchedule } from '@/hooks';
import { actions } from '@/store';
import { useNetwork } from '@/providers';
import OrderTypeSelector from '@/components/templates/app/order-type-selector';
import { createOrderMixpanel } from '@/helpers';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';

type CreatePositionDetailsScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.CreatePositionDetails
>;

interface CreatePositionDetailsScreenData extends CreatePositionDetailsScreenProps {
  account: UserAccount;
}

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  },
  validation: { floatRegex },
  isIOS
} = config;

const {
  application: { openModal }
} = actions;

let timeout: number;

const TRADING_ACCOUNT_CURRENCY = 'USD'; /*** PROVIDE HERE SELECTED ACCOUNT CURRENCY ***/

const calculateLimits = (action?: number, tick = 0, stopsLevel = 0, point = 0) => {
  let takeProfit = 0;
  let stopLoss = 0;

  if (action === null || action === undefined) {
    return { takeProfit, stopLoss };
  }

  if (action === 0) {
    takeProfit = tick + stopsLevel * point;
    stopLoss = tick - stopsLevel * point;
  } else {
    takeProfit = tick - stopsLevel * point;
    stopLoss = tick + stopsLevel * point;
  }

  return { takeProfit, stopLoss };
};

const CreatePositionDetailsScreen: FC<CreatePositionDetailsScreenData> = ({ account, route, navigation }) => {
  const { params } = route || {};
  const { entry, asset, ask, bid, amount, signalData } = params || {};
  const { websocket, isReadyState } = useNetwork();

  const { t } = useTranslation();

  const [tick, setTick] = useState(entry ? ask : bid);
  const [selectedDate, setDate] = useState<Date | null>(null);
  const [profitSymbol, setProfitSymbol] = useState<string | undefined>(undefined);
  const [profitSymbolDirect, setProfitSymbolDirect] = useState<boolean | undefined>(undefined);
  const [liveCurrencyAveragePrice, setLiveCurrencyAveragePrice] = useState<number | undefined>(undefined);

  const [currentAccount, setCurrentAccount] = useState<UserAccount | undefined>(undefined);

  const [isOrderSelectorOpened, openOrderSelector] = useState<boolean>(false);
  const [selectedOrderType, setOrderType] = useState<ORDER_TYPES>(params.selectedOrderType || 'market_order');

  const [openPositionQuery, response] = useOpenPositionMutation();
  const [calculateOrderLimits, limitsResponse] = useCalculateLimitsMutation();

  const [placeOrder, placeOrderResponse] = usePlaceOrderMutation();
  const [getSymbolConfig, symbolConfig] = useGetSymbolConfigMutation();

  const [calculateMargin, calculateMarginResponse] = useCalculateMarginMutation();

  const [getProfitSymbolLastTick, profitSymbolLastTick] = useGetSymbolLastTickQuery();

  const tradingAccounts = useAppSelector((store) => store.wallet.tradingAccounts);

  const tradingAssets = useAppSelector((store) => store.portfolio.tradingAssets) || [];

  const dispatch = useAppDispatch();

  const symbolConfigData = useMemo(() => {
    const { data } = symbolConfig || {};

    const isData = data !== undefined && data && Object.keys(data).length > 0;

    return isData ? data : ({} as SymbolConfig);
  }, [symbolConfig]);

  const scheduleData = useTradingSchedule({
    schedule: symbolConfigData?.tradingSessionShedule
  });

  useEffect(() => {
    if (scheduleData?.timeToOpen && !signalData) setOrderType('pending_order');
  }, [scheduleData]);

  const showErrorPopUp = useCallback(
    (subtitle?: string) => {
      const hasSubtitle = !!subtitle?.length;
      const hasNotEnoughMoney = hasSubtitle && subtitle.includes('Not enough money');
      dispatch(
        openModal({
          title: hasNotEnoughMoney
            ? t('screens.create-position.not-enough-money')
            : hasSubtitle
              ? t('errors.market-closed')
              : t('errors.modal-error-title'),
          subTitle: hasSubtitle ? convertUtcTimeSmart(subtitle) : t('errors.modal-error-subtitle'),
          icon: images.depositError,
          closeTime: 10,
          iconSize: {
            width: 96,
            height: 90
          },
          button: {
            text: t('errors.modal-got-it')
          }
        })
      );
    },
    [t]
  );

  const goToPortfolio = useCallback(() => {
    Keyboard.dismiss();
    requestAnimationFrame(() => navigation.navigate(APP_ROUTE_NAMES.Portfolio));
  }, [navigation]);
  const goToWallet = useCallback(() => {
    Keyboard.dismiss();
    requestAnimationFrame(() => navigation.navigate(APP_ROUTE_NAMES.Wallet));
  }, [navigation]);

  const handleLimitError = (hasOneTradingAccount: boolean = true, limit: number = 5) => {
    dispatch(
      openModal({
        title: t('screens.create-position.position-limit'),
        subTitle: hasOneTradingAccount
          ? t('screens.create-position.position-limit-one-info', { limit })
          : t('screens.create-position.position-limit-more-info', { limit }),
        icon: images.depositError,
        closeTime: 10,
        iconSize: {
          width: 96,
          height: 90
        },
        button: {
          text: t('screens.create-position.go-to-portfolio'),
          onPress: goToPortfolio,
          type: BaseButtonType.accent
        },
        ...(!hasOneTradingAccount && {
          secondaryButton: {
            text: t('screens.create-position.switch-accounts'),
            onPress: goToWallet,
            type: BaseButtonType.primary
          }
        })
      })
    );
  };

  useEffect(() => {
    if (response.isSuccess || placeOrderResponse.isSuccess) {
      const tradeActionDesc = entry
        ? t('screens.create-position-details.bought')
        : t('screens.create-position-details.sold');
      const pendingOrderActionDesc = entry
        ? t('screens.create-position-details.buy-item')
        : t('screens.create-position-details.sell-item');
      const data = selectedOrderType === 'pending_order' ? placeOrderResponse.data : response.data;
      if (data?.isSuccess) {
        let confidence = !!signalData ? 'Low' : ('' as 'Low' | 'Medium' | 'High' | '');
        if (signalData && signalData?.Report?.confidence >= 40 && signalData.Report?.confidence < 80)
          confidence = 'Medium';
        else if (signalData && signalData?.Report?.confidence >= 80) confidence = 'High';
        createOrderMixpanel({
          asset,
          usedTradingSignal: signalData !== undefined,
          view: 'advanced',
          orderType: selectedOrderType === 'pending_order' ? 'pending' : 'market',
          signalConfidence: confidence,
          typeId: account.typeId
        });

        const assetName = getAssetName(asset);
        dispatch(
          openModal({
            title:
              selectedOrderType === 'pending_order'
                ? t('screens.create-position-details.you-created-pending-order-item', {
                    action: pendingOrderActionDesc,
                    volume: (data?.quantity || 0) * (symbolConfig.data?.contractSize || 0),
                    asset: assetName,
                    assetUnit,
                    price: data.price?.toFixed(symbolConfig.data?.digits || 0)
                  })
                : t('screens.create-position-details.action-by-price-item', {
                    action: tradeActionDesc,
                    volume: ((data?.quantity || 0) * (symbolConfig.data?.contractSize || 0)).toFixed(
                      assetUnitOfMeasureDigits
                    ),
                    asset: assetName,
                    assetUnit,
                    price: data.price?.toFixed(symbolConfig.data?.digits || 0)
                  }),
            closeTime: 10,
            testID: testIDs.createPositionDetails.createPosition.successPopUp,
            icon: images.successArrow,
            onClosed: navigation.goBack,
            iconSize: {
              width: 115,
              height: 90
            },
            button: {
              text: t('screens.create-position-details.explore-other-ideas'),
              onPress: goToIdeasHub
            }
          })
        );
      } else if (!data.isSuccess && data?.message?.includes('positions or orders is reached')) {
        handleLimitError(tradingAccounts.length === 1, data?.limit);
      } else {
        showErrorPopUp();
      }
    } else if (!placeOrderResponse.isSuccess || !response.isSuccess) {
      const errorData = (response?.error || placeOrderResponse?.error) as any;
      const status = errorData?.status as number;
      if (errorData?.message?.includes?.('positions or orders is reached'))
        handleLimitError(tradingAccounts.length === 1, errorData?.limit);
      else if (`${status}`?.startsWith?.('4')) showErrorPopUp(errorData?.data?.message);
    }
    placeOrderResponse.reset();
    response.reset();
  }, [response.isSuccess || placeOrderResponse.isSuccess, signalData, account.typeId, tradingAccounts.length, t]);

  useEffect(() => {
    const errorData = (response.isError ? response.error : placeOrderResponse.error) as {
      data: { message: string; limit: number };
      status: number;
    };
    const status = errorData?.status;
    if (errorData) {
      if (errorData?.data?.message?.includes?.('positions or orders is reached'))
        handleLimitError(tradingAccounts.length === 1, errorData?.data?.limit);
      else if (`${status}`?.startsWith?.('4')) showErrorPopUp(errorData?.data?.message);
      else showErrorPopUp();
      placeOrderResponse.reset();
      response.reset();
    }
  }, [response.isError, placeOrderResponse.isError, tradingAccounts.length]);

  const openPositionHandler = useCallback(
    async (data: {
      isStopEnabled: boolean;
      isTakeEnabled: boolean;
      accountId: number | null;
      instrument: string;
      priceStopLoss: string;
      priceTakeProfit: string;
      price: string;
      volume: string;
      tradeAction: number;
    }) => {
      if (!data) {
        return;
      }
      const body = {
        accountId: data.accountId,
        instrument: data.instrument,
        priceTakeProfit: Number(data.priceTakeProfit || 0),
        priceStopLoss: Number(data.priceStopLoss || 0),
        expirationTime: selectedDate ? dateHelper.toTimestamp(selectedDate) : 0
      };

      const queryVolume = (Number(data.volume) || 0) / (symbolConfig.data?.contractSize || 1);

      if (selectedOrderType === 'pending_order') {
        const price = Number(data.price);
        const orderType = data.tradeAction === 0 ? (price < tick ? 2 : 4) : price > tick ? 3 : 5;
        placeOrder({
          ...body,
          price,
          orderType,
          volume: queryVolume
        });
      } else {
        openPositionQuery({
          ...body,
          volume: queryVolume,
          tradeAction: entry ? 0 : 1
        });
      }
    },
    [selectedDate, tick, selectedOrderType]
  );

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite }
  } = theme;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    trigger,
    watch,
    formState: { errors }
  } = useForm<PositionDetailsForm>({
    mode: 'onChange',
    defaultValues: {
      isStopEnabled: false,
      isTakeEnabled: false,
      accountId: null,
      instrument: '',
      priceStopLoss: '',
      priceTakeProfit: '',
      price: '',
      volume: '',
      tradeAction: 0
    }
  });

  console.log(getValues());

  const priceByParams = useMemo(() => {
    return (
      signalData?.Report?.action === 0
        ? signalData?.Report?.buy_entry_target_1
        : signalData?.Report?.sell_entry_target_1
    )?.toFixed(signalData?.Product.lastTick?.digits || 0);
  }, [signalData]);

  const tradeAction = entry ? 0 : 1;

  const { volume, isStopEnabled, isTakeEnabled, price } = watch();

  const pageIsFocused = useIsFocused();

  const isFormErrors = Boolean(errors && Object.keys(errors).length > 0);
  const isDisabled = Boolean(isFormErrors || volume === '');
  const enabledHandleMessage = websocket && pageIsFocused && isReadyState;

  const setInitialState = () => {
    setValue('instrument', asset);
    setValue('price', `${(params.price || priceByParams) ?? ''}`);
    setValue('tradeAction', tradeAction);
    setValue('volume', `${amount || ''}`);
  };

  const debouncedCalculatePosition = useCallback(
    debounce(500, (moneyAmount: number) => {
      const data = watch();
      if (moneyAmount && !errors.volume)
        calculateMargin({
          accountId: data.accountId || 0,
          instrument: data.instrument,
          tradeAction: data.tradeAction,
          volume: Number(moneyAmount || 0) / (symbolConfigData.contractSize || 1) || 0
        });
    }),
    [errors.volume, symbolConfigData.contractSize]
  );

  useEffect(() => {
    setInitialState();

    if (amount && selectedOrderType === 'market_order' && typeof symbolConfigData.contractSize !== 'undefined') {
      setTimeout(() => {
        debouncedCalculatePosition(amount);
      }, 300);
    }
  }, [tradeAction, asset, amount, selectedOrderType, symbolConfigData.contractSize, priceByParams, params.price]);

  const setInitialAccounts = () => {
    if (!account) {
      return;
    }

    setCurrentAccount(account);
  };

  useLayoutEffect(() => {
    setInitialAccounts();
  }, [account]);

  useEffect(() => {
    const { login } = currentAccount || {};

    if (!asset || !login) {
      return;
    }
    getSymbolConfig({
      symbol: asset,
      accountId: login
    });
  }, [asset, currentAccount, currentAccount]);

  const limits = useMemo(() => {
    return calculateLimits(
      tradeAction,
      selectedOrderType === 'pending_order' ? Number(price) : tick,
      symbolConfig.data?.stopsLevel,
      symbolConfig.data?.point
    );
  }, [tradeAction, selectedOrderType, tick, price, symbolConfig.data]);

  useLayoutEffect(() => {
    const { login } = currentAccount || {};
    if (currentAccount === undefined || login === undefined) {
      return;
    }
    setValue('accountId', parseInt(login));
  }, [currentAccount]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: '',
      headerStyle: styles.headerStyle,
      headerLeft: () => <BaseBackButton isChevron={false} />,
      headerRight: () => null
    });
    return () => {};
  }, [navigation, route]);

  useFocusEffect(
    useCallback(() => {
      makeSocketConnection();
      return () => {
        closeSocketConnection();
      };
    }, [navigation, route])
  );

  useLayoutEffect(() => {
    handleGetMaxMargin();
  }, [asset, currentAccount?.login, selectedOrderType]);

  const handleGetMaxMargin = useCallback(() => {
    if (!asset || !currentAccount?.login) {
      return;
    }
    calculateOrderLimits({
      accountId: parseInt(currentAccount?.login),
      instrument: asset,
      tradeAction: entry ? 0 : 1
    });
  }, [currentAccount?.login, asset, entry]);

  const debounceSetCurrencyData = useCallback(
    (askPrice: number, bidPrice: number) => {
      if (!enabledHandleMessage) {
        return;
      }

      if (askPrice && bidPrice) {
        const averagePrice = (askPrice + bidPrice) / 2;

        setLiveCurrencyAveragePrice(averagePrice);
      }

      // console.log('*************** LiveCurrencyAveragePrice', askPrice, bidPrice)
    },
    [enabledHandleMessage, setLiveCurrencyAveragePrice]
  );

  const setCurrencyData = debounce(250, debounceSetCurrencyData);

  const onSocketClosed = useCallback(() => {
    if (!pageIsFocused) {
      return;
    }
    timeout && clearTimeout(timeout);
    timeout = setTimeout((pageIsFocused: boolean) => {
      if (pageIsFocused) {
        makeSocketConnection();
      }
    }, 1500);
  }, [pageIsFocused, timeout]);

  const onSocketOpened = useCallback(() => {
    if (!pageIsFocused) {
      return;
    }
    websocket.send(`unsubscribe ALL`);

    const symbolsList = [asset];

    if (profitSymbol) {
      symbolsList.push(profitSymbol);
    }

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const data = jsonParse(event?.data);
      if (!data) {
        return;
      }
      const {
        ask: dataAsk,
        bid: dataBid,
        symbol: dataSymbol
      } = (data || {}) as { ask: number; bid: number; symbol: string };

      if (dataAsk === undefined || dataBid === undefined || dataSymbol === undefined) {
        return;
      }
      const value = entry ? dataAsk : dataBid;
      // console.log('***** WS CreatePositionDetailsScreen', data);
      if (dataSymbol === asset && tick !== value) {
        setTick(value);
      }
      if (profitSymbol && dataSymbol === profitSymbol) {
        setCurrencyData(dataAsk, dataBid);
      }
    });
    websocket.send(`subscribe ${symbolsList.join(' ')}`);
  }, [pageIsFocused, entry, asset, tick, profitSymbol]);

  const makeSocketConnection = useCallback(() => {
    websocket.init(websocketUrls.tickersPrices, onSocketOpened, onSocketClosed, onSocketClosed);
  }, [onSocketOpened, onSocketClosed, profitSymbol]);

  useEffect(() => {
    if (profitSymbol) {
      makeSocketConnection();
    }
  }, [profitSymbol]);

  const closeSocketConnection = useCallback(() => {
    timeout && clearTimeout(timeout);
    websocket.close();
  }, [timeout]);

  const caption = useMemo(() => {
    if (entry === undefined || asset === undefined || bid === undefined || ask === undefined) {
      return null;
    }

    const assetName = getAssetName(asset);
    const title = `${entry ? t('screens.create-position.buy') : t('screens.create-position.sell')} ${assetName}`;
    const desc = `1 ${assetName} = ${tick.toFixed(symbolConfig.data?.digits || 2)}`;

    return (
      <View style={styles.titleBox}>
        <BaseText variant={BaseTextVariant.title}>{title}</BaseText>
        <BaseText style={styles.desc} variant={BaseTextVariant.small}>
          {desc}
        </BaseText>
      </View>
    );
  }, [entry, asset, bid, ask, styles, symbolConfig.data?.digits, tick]);

  const goToIdeasHub = () => {
    navigation.replace(PULSEAI_ROUTE_NAMES.PulseAI);
  };

  const goToSelectDate = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.SelectDate, {
      date: selectedDate,
      updatedValues: getValues(),
      onSubmit: (d: Date, updatedValues?: PositionDetailsForm) => {
        setDate(d);
        if (updatedValues) {
          reset(updatedValues);
        }
      }
    });
  };

  useEffect(() => {
    if (selectedOrderType === 'market_order') {
      setValue('price', '', { shouldValidate: true });
      debouncedCalculatePosition(Number(volume));
    }
  }, [selectedOrderType]);

  useEffect(() => {
    if (!isStopEnabled) {
      setValue('priceStopLoss', '', { shouldValidate: true });
    }
  }, [isStopEnabled]);

  useEffect(() => {
    if (!isTakeEnabled) {
      setValue('priceTakeProfit', '', { shouldValidate: true });
    }
  }, [isTakeEnabled]);

  useEffect(() => {
    if (signalData?.Report) {
      const { stop, action, buy_target_1, sell_target_1, status, buy_entry_target_1, sell_entry_target_1, expiry } =
        signalData.Report;

      if (status === 9 && selectedOrderType !== 'market_order') {
        setOrderType('market_order');
      } else if (signalData && status !== 9 && selectedOrderType !== 'pending_order') {
        setOrderType('pending_order');
      }

      setValue('isStopEnabled', true);
      setValue('isTakeEnabled', true);

      if (expiry && status !== 9) setDate(new Date(expiry));

      setTimeout(() => {
        setValue('priceTakeProfit', `${(action === 0 ? buy_target_1 : sell_target_1) || ''}`, { shouldValidate: true });
        setValue('priceStopLoss', `${stop || ''}`, { shouldValidate: true });
        if (status !== 9) {
          const price = action === 0 ? buy_entry_target_1 : sell_entry_target_1;
          if (price) {
            setValue('price', `${price}`, {
              shouldValidate: true
            });
          }
        }
      }, 200);
    }
  }, [signalData?.Report]);

  const assetUnit = useMemo(() => {
    return tradingAssets.find((item: ParsedTradingAssets) => item.systemName === asset)?.assetUnitOfMeasure || '';
  }, [asset]);

  const assetUnitOfMeasureDigits = useMemo(() => {
    return tradingAssets.find((item: ParsedTradingAssets) => item.systemName === asset)?.assetUnitOfMeasureDigits || 2;
  }, [asset]);

  const calculatePnL = useCallback(
    (targetPrice: number) => {
      const { bid: lastTickBid, ask: lastTickAsk } = profitSymbolLastTick.data || {};
      let currentPrice = selectedOrderType === 'pending_order' ? Number(price) : tick;
      const diff = !entry ? currentPrice - targetPrice : targetPrice - currentPrice;

      const pnl = diff * Number(volume || 0);

      if (profitSymbol && lastTickBid && lastTickAsk) {
        const currencyAveragePrice = (lastTickBid + lastTickAsk) / 2;
        const averagePrice = liveCurrencyAveragePrice || currencyAveragePrice;

        return (profitSymbolDirect ? pnl * averagePrice : pnl / averagePrice).toFixed(2);
      }
      return pnl.toFixed(2);
    },
    [
      entry,
      liveCurrencyAveragePrice,
      symbolConfig.data?.contractSize,
      tick,
      selectedOrderType,
      volume,
      price,
      profitSymbolLastTick.data
    ]
  );

  const checkProfitCurrency = () => {
    if (tradingAssets.length === 0) {
      return;
    }

    const { symbol, currencyProfit } = symbolConfig.data || {};

    if (!symbol || !currencyProfit) {
      return;
    }

    const directPair = `${currencyProfit}${TRADING_ACCOUNT_CURRENCY}`.toUpperCase();
    const reversePair = `${TRADING_ACCOUNT_CURRENCY}${currencyProfit}`.toUpperCase();

    const currencyProfitDirectPair = tradingAssets.find((asset) => asset.systemName === directPair);
    const currencyProfitReversePair = tradingAssets.find((asset) => asset.systemName === reversePair);

    const currencyProfitSymbol = currencyProfitDirectPair?.systemName || currencyProfitReversePair?.systemName;
    const currencyProfitSymbolDirect = Boolean(currencyProfitDirectPair?.systemName);

    if (currencyProfitSymbol) {
      setProfitSymbol(currencyProfitSymbol);
      setProfitSymbolDirect(currencyProfitSymbolDirect);
    }
  };

  useEffect(() => {
    checkProfitCurrency();
  }, [symbolConfig.data, tradingAssets]);

  useEffect(() => {
    getProfitSymbolLastTickHandler();
  }, [profitSymbol, currentAccount?.login]);

  const getProfitSymbolLastTickHandler = async () => {
    if (!currentAccount?.login || !profitSymbol) {
      return;
    }
    try {
      await getProfitSymbolLastTick({ symbol: profitSymbol, accountId: parseInt(currentAccount?.login) });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const actionButtonText = useMemo(() => {
    let text = '';
    if (!signalData) return t('screens.create-position-details.confirm');
    if (signalData.Report?.status === 9 || !price) {
      text = signalData.Report?.action === 0 ? t('components.signals.buy-now') : t('components.signals.sell-now');
    } else {
      text =
        signalData.Report?.action === 0
          ? t('components.signals.buy-at', {
              entry: price
            })
          : t('components.signals.sell-at', {
              entry: price
            });
    }
    return text;
  }, [signalData, symbolConfig.data?.digits, price]);

  const closeOrderSelector = useCallback(() => {
    openOrderSelector(false);
  }, []);

  const renderLoader = useCallback((width = 100) => {
    return (
      <ContentLoader
        speed={2}
        width={width}
        height={16}
        style={{ marginTop: 2 }}
        backgroundColor={'#E2E6F2'}
        foregroundColor={theme.palette.graphite['050']}
      >
        <Rect rx={4} ry={4} width={100} height={16} />
      </ContentLoader>
    );
  }, []);

  const amountLimits = useMemo((): { min: number; max: number } => {
    const max = (limitsResponse.data?.maxVolume || 0) * (symbolConfigData.contractSize || 0);
    const min = (limitsResponse.data?.minVolume || 0) * (symbolConfigData.contractSize || 0);

    return { max, min };
  }, [limitsResponse.data, symbolConfigData.contractSize]);

  useEffect(() => {
    if (volume) trigger('volume');
  }, [amountLimits.max, amountLimits.min]);

  const handleEnterMax = useCallback(() => {
    setValue('volume', `${amountLimits.max ? amountLimits.max.toFixed(assetUnitOfMeasureDigits) : ''}`);
    if (selectedOrderType === 'market_order') {
      debouncedCalculatePosition(Number(amountLimits.max));
    }
  }, [amountLimits.max, assetUnitOfMeasureDigits]);

  const handleChangeOrderType = useCallback(() => {
    Keyboard.dismiss();
    openOrderSelector(true);
  }, []);

  const timeSchedule = useMemo(() => {
    if (!scheduleData || signalData) {
      return <View />;
    }

    const { timeToOpen } = scheduleData || {};

    let desc: string | null = null;

    if (timeToOpen) {
      desc = t('screens.create-position.market-opens', { time: timeToOpen });
    } else {
      return <View />;
    }

    return (
      <View style={styles.alertBox}>
        <BaseText variant={BaseTextVariant.titleXXS}>{desc}</BaseText>
        <BaseText variant={BaseTextVariant.small}>{t('screens.create-position.market-reopens-warning')}</BaseText>
      </View>
    );
  }, [scheduleData, t, signalData]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <View style={styles.header}>
          {caption}
          <TouchableOpacity
            style={[styles.sheetDetails, Boolean(scheduleData?.timeToOpen || signalData) ? styles.disabledDetails : {}]}
            activeOpacity={activeOpacity}
            hitSlop={hitSlop}
            onPress={handleChangeOrderType}
            disabled={Boolean(scheduleData?.timeToOpen || signalData)}
          >
            <BaseText variant={BaseTextVariant.tag} style={styles.changeTypeText}>
              {selectedOrderType === 'market_order'
                ? t('screens.create-position.market-order')
                : t('screens.create-position.pending-order')}
            </BaseText>
            {Boolean(!scheduleData?.timeToOpen && !signalData) && (
              <SvgIcon name={SvgXmlIconNames.chevronDown} size={IconSize.sm} color={theme.palette.graphite['900']} />
            )}
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
          {timeSchedule}
          <View style={styles.amount}>
            <View style={styles.row}>
              <BaseText variant={BaseTextVariant.caption}>
                {t('screens.create-position.order-amount', { shares: assetUnit || '' })}
              </BaseText>
            </View>
            <Controller
              name='volume'
              control={control}
              rules={{
                required: t('errors.required'),
                validate: {
                  greaterThanMaximum: (value) => {
                    const maxValue = amountLimits.max || Number.MAX_SAFE_INTEGER;
                    if (parseFloat(value.toString()) > maxValue) {
                      return t('screens.create-position-details.amount-exceeds-balance');
                    }
                    return true;
                  },
                  minimumValidation: (value) => {
                    const minValue = amountLimits.min || 0;
                    if (parseFloat(value.toString()) < minValue && selectedOrderType === 'market_order') {
                      return t('screens.create-position-details.min-amount-validation', {
                        min: minValue.toFixed(assetUnitOfMeasureDigits)
                      });
                    }
                    return true;
                  },
                  validFloat: (value) => {
                    const normalizedValue = value.replace(',', '.');
                    if (!floatRegex.test(normalizedValue)) {
                      return t('errors.invalidFloat');
                    }
                    return true;
                  }
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <BaseFormField
                  required
                  style={styles.formField}
                  returnKeyType={'next'}
                  keyboardType={'numeric'}
                  error={errors.volume?.message}
                  onBlur={onBlur}
                  onChange={(val: any) => {
                    const normalizedValue = val.replace(',', '.');
                    const regex = new RegExp(`^\\d+(\\.\\d{0,${assetUnitOfMeasureDigits}})?$`);
                    if (regex.test(normalizedValue) || normalizedValue === '') {
                      onChange(normalizedValue);
                      if (selectedOrderType === 'market_order') {
                        debouncedCalculatePosition(Number(normalizedValue));
                      }
                    }
                  }}
                  value={value}
                  title={t('screens.create-position.amount', { shares: assetUnit })}
                />
              )}
            />
          </View>
          <View style={styles.availableTextWrap}>
            {limitsResponse.isLoading ? (
              renderLoader()
            ) : (
              <BaseText style={styles.available}>
                <Text style={{ color: graphite['900'] }}>
                  {amountLimits.min.toFixed(assetUnitOfMeasureDigits)} -{' '}
                  {amountLimits.max.toFixed(assetUnitOfMeasureDigits)}
                </Text>
              </BaseText>
            )}
            <BaseButton
              onPress={handleEnterMax}
              size={BaseButtonSize.small}
              label={t('screens.create-position.enter-max')}
              type={BaseButtonType.link}
              style={{ paddingHorizontal: 0 }}
            />
          </View>
          {selectedOrderType === 'pending_order' && (
            <>
              <View style={styles.caption}>
                <BaseText variant={BaseTextVariant.caption}>
                  {t('screens.create-position-details.action-when-price', {
                    action: entry ? t('screens.create-position.buy') : t('screens.create-position.sell')
                  })}
                </BaseText>
              </View>
              <Controller
                name='price'
                control={control}
                rules={{
                  validate: {
                    required: (value) => {
                      if (!value && selectedOrderType === 'pending_order') return t('errors.required');
                      return true;
                    },
                    validFloat: (value) => {
                      const normalizedValue = value.replace(',', '.');
                      if (!floatRegex.test(normalizedValue)) {
                        return t('errors.invalidFloat');
                      }
                      return true;
                    }
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <BaseFormField
                    style={styles.formField}
                    returnKeyType={'next'}
                    keyboardType={'numeric'}
                    error={errors.price?.message}
                    onBlur={onBlur}
                    onChange={(val: any) => {
                      const normalizedValue = val.replace(',', '.');
                      onChange(normalizedValue);
                    }}
                    value={value}
                    title={t('screens.create-position-details.price')}
                  />
                )}
              />
              <View style={styles.row}>
                <BaseText variant={BaseTextVariant.authSmall}>
                  {t('screens.create-position-details.valid-till')}
                </BaseText>
                <View style={styles.horizontal}>
                  <BaseButton
                    type={BaseButtonType.link}
                    size={BaseButtonSize.tiny}
                    label={
                      selectedDate
                        ? dateHelper.to(selectedDate, 'HH:mm, DD MMMM YYYY')
                        : t('screens.create-position-details.add-date')
                    }
                    onPress={goToSelectDate}
                  />
                  {selectedDate && (
                    <TouchableOpacity
                      style={{ padding: 4 }}
                      onPress={() => {
                        setDate(null);
                      }}
                    >
                      <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xs} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}
          <Controller
            name='isStopEnabled'
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.caption}>
                <BaseText variant={BaseTextVariant.caption}>{t('screens.create-position-details.stop-loss')}</BaseText>
                <BaseSwitch value={value} onChange={onChange} />
              </View>
            )}
          />
          {isStopEnabled && (
            <Controller
              name='priceStopLoss'
              control={control}
              rules={{
                validate: {
                  required: (value) => {
                    if (!value && isStopEnabled) return t('errors.required');
                    return true;
                  },
                  greaterThanMinimum: (value) => {
                    if (tradeAction === 0) {
                      if (parseFloat(value) > (limits.stopLoss || Number.MAX_SAFE_INTEGER)) {
                        return t('screens.create-position-details.max-validation', {
                          max: limits.stopLoss?.toFixed(symbolConfig.data?.digits || 0)
                        });
                      }
                    } else {
                      if (parseFloat(value) < limits.stopLoss) {
                        return t('screens.create-position-details.min-validation', {
                          min: limits.stopLoss?.toFixed(symbolConfig.data?.digits || 0)
                        });
                      }
                    }
                    return true;
                  },
                  validFloat: (value) => {
                    const normalizedValue = value.replace(',', '.');
                    if (!floatRegex.test(normalizedValue)) {
                      return t('errors.invalidFloat');
                    }
                    return true;
                  }
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <BaseFormField
                    style={styles.formField}
                    returnKeyType={'next'}
                    keyboardType={'numeric'}
                    error={errors.priceStopLoss?.message}
                    onBlur={onBlur}
                    onChange={(val: any) => onChange(val.replace(',', '.'))}
                    value={String(value)}
                    title={t('screens.create-position-details.price')}
                  />
                  {symbolConfig.isLoading ||
                  profitSymbolLastTick.isLoading ||
                  (profitSymbol && !profitSymbolLastTick.data)
                    ? renderLoader()
                    : value &&
                      volume && (
                        <BaseText variant={BaseTextVariant.small}>
                          <Text style={{ color: '#8fa6ae', fontSize: 10 }}>PnL:</Text>
                          {calculatePnL(Number(value))}
                        </BaseText>
                      )}
                </>
              )}
            />
          )}
          <Controller
            name='isTakeEnabled'
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.caption}>
                <BaseText variant={BaseTextVariant.caption}>
                  {t('screens.create-position-details.take-profit')}
                </BaseText>
                <BaseSwitch value={value} onChange={onChange} />
              </View>
            )}
          />
          {isTakeEnabled && (
            <Controller
              name='priceTakeProfit'
              control={control}
              rules={{
                validate: {
                  required: (value) => {
                    if (!value && isTakeEnabled) return t('errors.required');
                    return true;
                  },
                  greaterThanMinimum: (value) => {
                    if (tradeAction === 0) {
                      if (parseFloat(value) < limits.takeProfit) {
                        return t('screens.create-position-details.min-validation', {
                          min: limits.takeProfit?.toFixed(symbolConfig.data?.digits || 0)
                        });
                      }
                    } else {
                      if (parseFloat(value) > (limits.takeProfit || Number.MAX_SAFE_INTEGER)) {
                        return t('screens.create-position-details.max-validation', {
                          max: limits.takeProfit?.toFixed(symbolConfig.data?.digits || 0)
                        });
                      }
                    }
                    return true;
                  },
                  validFloat: (value) => {
                    const normalizedValue = value.replace(',', '.');
                    if (!floatRegex.test(normalizedValue)) {
                      return t('errors.invalidFloat');
                    }
                    return true;
                  }
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <BaseFormField
                    style={styles.formField}
                    returnKeyType={'next'}
                    keyboardType={'numeric'}
                    error={errors.priceTakeProfit?.message}
                    onBlur={onBlur}
                    onChange={(val: any) => onChange(val.replace(',', '.'))}
                    value={String(value)}
                    title={t('screens.create-position-details.price')}
                  />
                  {symbolConfig.isLoading ||
                  profitSymbolLastTick.isLoading ||
                  (profitSymbol && !profitSymbolLastTick.data)
                    ? renderLoader()
                    : value &&
                      volume && (
                        <BaseText variant={BaseTextVariant.small}>
                          <Text style={{ color: '#8fa6ae', fontSize: 10 }}>PnL:</Text>
                          {calculatePnL(Number(value))}
                        </BaseText>
                      )}
                </>
              )}
            />
          )}
          {volume && !errors.volume && selectedOrderType === 'market_order' ? (
            <View style={[styles.row, { marginTop: 'auto' }]}>
              <View>
                <BaseText style={styles.positionText}>{t('screens.create-position.position-value')}</BaseText>
                {calculateMarginResponse.isLoading || symbolConfig.isLoading ? (
                  renderLoader()
                ) : (
                  <BaseText>~{(calculateMarginResponse.data?.value || 0).toFixed(2)}</BaseText>
                )}
              </View>
              <View>
                <BaseText style={styles.positionText}>
                  {t('screens.create-position.required-margin', { unit: assetUnit })}
                </BaseText>
                {calculateMarginResponse.isLoading || symbolConfig.isLoading ? (
                  renderLoader()
                ) : (
                  <BaseText>~{(calculateMarginResponse.data?.margin || 0).toFixed(2)}</BaseText>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.row} />
          )}
        </ScrollView>
        <View style={styles.buttons}>
          <BaseButton
            style={{ borderWidth: 0 }}
            type={BaseButtonType.primary}
            fullWidth={true}
            size={BaseButtonSize.large}
            label={actionButtonText}
            onPress={handleSubmit(openPositionHandler)}
            loading={response.isLoading || placeOrderResponse.isLoading}
            loadingType={BaseButtonLoading.ellipsis}
            disabled={isDisabled}
          />
        </View>
      </KeyboardAvoidingView>
      <OrderTypeSelector
        visible={isOrderSelectorOpened}
        setVisible={closeOrderSelector}
        onSelect={(orderType) => {
          setOrderType(orderType as ORDER_TYPES);
        }}
        entry={entry}
        orderType={selectedOrderType}
      />
    </SafeAreaView>
  );
};

export default CreatePositionDetailsScreen;

import React, {
  FC,
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useCallback,
  useLayoutEffect,
  useState,
  useEffect
} from 'react';
import { useTheme, useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { COMMON_ROUTE_NAMES, IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { BackHandler, View, TouchableOpacity, InteractionManager, ImageSourcePropType, Keyboard } from 'react-native';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseFormField,
  BaseImage,
  BaseText,
  BaseTextVariant,
  SheetBackdrop,
  SignalInfoPrices,
  SingleDateSelector,
  BaseToast,
  BaseToastVariant
} from '@/components';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { useTranslation } from 'react-i18next';
import { config, testIDs } from '@/constants';
import { BottomSheetModal, BottomSheetScrollView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useAppDispatch, useAppSelector, useTradingSchedule } from '@/hooks';
import {
  useGetDealsAccountsQuery,
  useGetSymbolLastTickQuery,
  usePlaceOrderMutation,
  useGetTradingAccountsMutation,
  useOpenPositionMutation,
  useCalculateLimitsMutation,
  useCalculateMarginMutation
} from '@/store/api';
import { jsonParse, formatNumberToAmount, getAssetName, formatTwoDecimals, convertUtcTimeSmart } from '@/helpers';
import { debounce } from 'throttle-debounce';
import { useNetwork } from '@/providers';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { SymbolConfig, ORDER_TYPES, Signals } from '@/types';
import { actions } from '@/store';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import dateHelper from '@/helpers/dateHelper';
import useStyles from './styles';
import OrderTypeSelector from '../order-type-selector';
import { Controller, useForm } from 'react-hook-form';
import LoginContent from './login-content';
import { createOrderMixpanel } from '@/helpers';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  },
  validation: { floatRegex }
} = config;

const {
  application: { openModal },
  portfolio: { useGetSymbolConfigMutation }
} = actions;

const popularAmount = [
  5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000, 25000, 50000, 75000, 100000, 250000, 500000,
  750000
];
const websocket_key = 'signal-bottom-sheet';
const TRADING_ACCOUNT_CURRENCY = 'USD'; /*** PROVIDE HERE SELECTED ACCOUNT CURRENCY ***/

interface CreatePositionProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  entry: boolean | undefined;
  asset: string | undefined;
  bid: number | undefined;
  ask: number | undefined;
  signalData?: Signals;
}

const CreatePosition: FC<CreatePositionProps> = ({ bid, ask, setVisible, visible, entry, asset, signalData }) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { dismissAll } = useBottomSheetModal();

  const { top } = useSafeAreaInsets();

  const { websocket } = useNetwork();

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();

  const {
    palette: { graphite, purple }
  } = theme;

  const [selectedAmount, setAmount] = useState<number>(0);

  const [tick, setTick] = useState(entry ? ask : bid);
  const [profitSymbol, setProfitSymbol] = useState<string | undefined>(undefined);
  const [profitSymbolDirect, setProfitSymbolDirect] = useState<boolean | undefined>(undefined);
  const [liveCurrencyAveragePrice, setLiveCurrencyAveragePrice] = useState<number | undefined>(undefined);
  const [isOrderSelectorOpened, openOrderSelector] = useState<boolean>(false);
  const [selectedOrderType, setOrderType] = useState<ORDER_TYPES>('market_order');
  const [selectedDate, setDate] = useState<Date | null>(null);
  const [dateIsOpen, setDateIsOpen] = useState<boolean>(false);

  const [balanceLive, setBalanceLive] = useState({ equity: 0 });

  const BottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetState = useRef<boolean>(false);

  const { accessToken } = useAppSelector((state) => state.auth);
  const portfolio = useAppSelector((state) => state.portfolio);
  const { selectedAccount: initialAccount, userInfo, tradingAssets = [] } = portfolio || {};

  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getTradingAccounts] = useGetTradingAccountsMutation({});

  const tradingAccount = useAppSelector((state) => state.wallet.accounts.trading);
  const tradingAccounts = useAppSelector((store) => store.wallet.tradingAccounts);

  const [calculateLimits, limitsResponse] = useCalculateLimitsMutation();
  const [openPositionQuery, response] = useOpenPositionMutation();
  const [placeOrder, placeOrderResponse] = usePlaceOrderMutation();
  const [calculateMargin, calculateMarginResponse] = useCalculateMarginMutation();

  const [getProfitSymbolLastTick, profitSymbolLastTick] = useGetSymbolLastTickQuery();

  const [getSymbolConfig, symbolConfigData] = useGetSymbolConfigMutation();

  const isAuthorized = Boolean(accessToken);
  const showGuidance = useMemo(() => {
    return (
      !isAuthorized ||
      !userInfo.isVerified ||
      (userInfo.isVerified && !userInfo.firstDepositDate && !balanceLive.equity) ||
      (userInfo.isVerified && userInfo.firstDepositDate && !balanceLive.equity && !userInfo.lastTradedAt)
    );
  }, [isAuthorized, userInfo.isVerified, userInfo.firstDepositDate, balanceLive.equity, userInfo.lastTradedAt]);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    clearErrors,
    formState: { errors }
  } = useForm<{
    price: string;
    volume: string;
  }>({
    mode: 'onChange',
    defaultValues: {
      price: '',
      volume: ''
    }
  });

  const formValues = watch();

  useLayoutEffect(() => {
    setTick(entry ? ask : bid);
  }, [entry]);

  useEffect(() => {
    setValue('volume', '');
  }, [asset]);

  const getTradingAccountsHandler = async () => {
    try {
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getDealsAccountsHandler = async () => {
    if (userInfo.id === undefined) {
      return;
    }
    try {
      await getDealsAccounts(userInfo.id);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getProfitSymbolLastTickHandler = async () => {
    if (!initialAccount || !profitSymbol) {
      return;
    }
    try {
      await getProfitSymbolLastTick({ symbol: profitSymbol, accountId: initialAccount });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTradingAccountsHandler();
  }, [visible]);

  useEffect(() => {
    getDealsAccountsHandler();
  }, [visible, userInfo.id]);

  useEffect(() => {
    if (signalData && signalData.Report?.status === 9 && selectedOrderType !== 'market_order') {
      setOrderType('market_order');
    } else if (signalData && signalData.Report?.status !== 9 && selectedOrderType !== 'pending_order') {
      setOrderType('pending_order');
    }
  }, [signalData?.Report?.status]);

  useLayoutEffect(() => {
    if (!tradingAccount) {
      return;
    }
    const { equity = 0 } = tradingAccount || {};

    setBalanceLive(() => ({ equity }));
  }, [tradingAccount]);

  useEffect(() => {
    if (formValues.volume) trigger('volume');
  }, [selectedOrderType]);

  useEffect(() => {
    getProfitSymbolLastTickHandler();
  }, [profitSymbol, initialAccount]);

  const getSymbolConfigHandler = useCallback(async () => {
    if (!asset || !initialAccount) {
      return;
    }
    try {
      await getSymbolConfig({
        accountId: initialAccount,
        symbol: asset
      });
    } catch (error: unknown) {
      console.error(error);
    }
  }, [asset, initialAccount]);

  const symbolConfig = useMemo(() => {
    const { data } = symbolConfigData || {};

    const isData = data !== undefined && data && Object.keys(data).length > 0;

    return isData ? data : ({} as SymbolConfig);
  }, [symbolConfigData]);

  const scheduleData = useTradingSchedule({
    schedule: symbolConfig?.tradingSessionShedule
  });

  useEffect(() => {
    if (scheduleData?.timeToOpen && !signalData) setOrderType('pending_order');
  }, [scheduleData]);

  const checkProfitCurrency = useCallback(() => {
    if (
      //calculatePositionResponse?.data === undefined || //BUG
      tradingAssets.length === 0
    ) {
      return;
    }

    const { symbol, currencyProfit } = symbolConfig || {};

    if (!symbol || !currencyProfit) {
      return;
    }

    const directPair = `${currencyProfit}${TRADING_ACCOUNT_CURRENCY}`.toUpperCase();
    const reversePair = `${TRADING_ACCOUNT_CURRENCY}${currencyProfit}`.toUpperCase();

    const currencyProfitDirectPair = tradingAssets.find(
      (asset) => getAssetName(asset.systemName) === getAssetName(directPair)
    );
    const currencyProfitReversePair = tradingAssets.find(
      (asset) => getAssetName(asset.systemName) === getAssetName(reversePair)
    );

    const currencyProfitSymbol = getAssetName(
      currencyProfitDirectPair?.systemName || currencyProfitReversePair?.systemName
    );
    const currencyProfitSymbolDirect = Boolean(currencyProfitDirectPair?.systemName);

    if (currencyProfitSymbol) {
      setProfitSymbol(currencyProfitSymbol);
      setProfitSymbolDirect(currencyProfitSymbolDirect);
    } else {
      setProfitSymbol(undefined);
      setProfitSymbolDirect(undefined);
    }
  }, [
    //calculatePositionResponse,
    tradingAssets,
    symbolConfig,
    asset
  ]);

  const debounceSetCurrencyData = useCallback(
    (askPrice: number, bidPrice: number) => {
      if (askPrice && bidPrice) {
        const averagePrice = (askPrice + bidPrice) / 2;
        setLiveCurrencyAveragePrice(averagePrice);
      }
    },
    [setLiveCurrencyAveragePrice]
  );

  const setCurrencyData = debounce(250, debounceSetCurrencyData);

  useLayoutEffect(() => {
    checkProfitCurrency();
  }, [symbolConfig, tradingAssets, asset]);

  useLayoutEffect(() => {
    if (asset) getSymbolConfigHandler();
  }, [asset, initialAccount]);

  useLayoutEffect(() => {
    if (visible) {
      handleGetMaxMargin();
    }
  }, [asset, initialAccount, selectedOrderType, visible]);

  const debounceSetData = useCallback(
    (value: number) => {
      setTick(value);
    },
    [setTick]
  );

  const setData = debounce(250, debounceSetData);

  const subscribeWebsocket = useCallback(() => {
    if (!asset || showGuidance) {
      return;
    }

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const wsData = jsonParse(event?.data);
      if (!wsData) {
        return;
      }
      const {
        ask: dataAsk,
        bid: dataBid,
        symbol: dataSymbol
      } = (wsData || {}) as { ask: number; bid: number; symbol: string };
      if (dataAsk === undefined || dataBid === undefined || dataSymbol === undefined) {
        return;
      }
      const value = entry ? dataAsk : dataBid;

      if (getAssetName(dataSymbol) === asset && tick !== value) {
        setData(value);
      }
      if (profitSymbol && getAssetName(dataSymbol) === profitSymbol) {
        setCurrencyData(dataAsk, dataBid);
      }
    }, websocket_key);
  }, [asset, entry, tick, setData, profitSymbol, websocket_key, showGuidance]);

  const unsubscribeWebsocket = useCallback(() => {
    websocket?.removeEventListener(websocket_key);
    setData.cancel();
    setCurrencyData.cancel();
  }, [setData, asset, setCurrencyData, websocket_key]);

  const websocketHandler = useCallback(() => {
    if (!visible) {
      unsubscribeWebsocket();
      return;
    }
    subscribeWebsocket();
  }, [visible, unsubscribeWebsocket, subscribeWebsocket]);

  useEffect(() => {
    websocketHandler();
  }, [visible]);

  const limits = useMemo((): { min: number; max: number } => {
    const max = (limitsResponse.data?.maxVolume || 0) * (symbolConfig.contractSize || 0);
    const min = (limitsResponse.data?.minVolume || 0) * (symbolConfig.contractSize || 0);

    return { max, min };
  }, [limitsResponse.data, symbolConfig.contractSize]);

  const amounts = useMemo(() => {
    const array = popularAmount.filter((amount) => limits.max && amount < limits.max && amount > limits.min);

    return array.slice(-6);
  }, [popularAmount, limits.max, limits.min]);

  useLayoutEffect(() => {
    if (!visible) {
      BottomSheetRef.current?.dismiss();
      return;
    }
    BottomSheetRef.current?.present();
  }, [visible]);

  const assetUnit = useMemo(() => {
    return (
      tradingAssets.find((item: ParsedTradingAssets) => getAssetName(item.systemName) === asset)?.assetUnitOfMeasure ||
      ''
    );
  }, [asset]);

  const assetUnitOfMeasureDigits = useMemo(() => {
    return (
      tradingAssets.find((item: ParsedTradingAssets) => getAssetName(item.systemName) === asset)
        ?.assetUnitOfMeasureDigits || 2
    );
  }, [asset]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOrderSelectorOpened || sheetState.current) dismissAll();
      else navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, [isOrderSelectorOpened]);

  const onClose = useCallback(() => {
    setVisible(false);
    setProfitSymbol(undefined);
    setProfitSymbolDirect(undefined);
    sheetState.current = false;
  }, [setVisible]);

  const goCreatePosition = () => {
    if (sheetState.current) BottomSheetRef.current?.dismiss();

    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate(ROOT_ROUTE_NAMES.CreatePositionDetails, {
          entry,
          asset,
          bid,
          ask,
          amount: selectedAmount || formValues.volume || '',
          price: formValues.price || '',
          signalData,
          selectedOrderType
        });
      });
    }, 450);
  };

  const goToIdeasHub = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

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
    setTimeout(() => {
      BottomSheetRef.current?.dismiss();
    }, 350);
    requestAnimationFrame(() => {
      navigation.navigate(APP_ROUTE_NAMES.Portfolio);
    });
  }, [navigation]);

  const goToWallet = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      BottomSheetRef.current?.dismiss();
    }, 250);
    requestAnimationFrame(() => {
      navigation.navigate(APP_ROUTE_NAMES.Wallet);
    });
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
    if ((placeOrderResponse.isSuccess || response.isSuccess) && sheetState.current) {
      BottomSheetRef.current?.dismiss();

      setTimeout(() => {
        const data = response.isSuccess ? response.data : placeOrderResponse.data;
        if (data.isSuccess) {
          const assetName = getAssetName(asset);
          const tradeActionDesc = entry
            ? t('screens.create-position-details.bought')
            : t('screens.create-position-details.sold');
          let title = t('screens.create-position-details.action-by-price-item', {
            action: tradeActionDesc,
            volume: ((data?.quantity || 0) * (symbolConfig.contractSize || 0)).toFixed(assetUnitOfMeasureDigits),
            asset: assetName,
            assetUnit,
            price: data.price?.toFixed(symbolConfig.digits || 0)
          });
          if ((signalData && signalData.Report?.status !== 9) || selectedOrderType === 'pending_order') {
            title = t('screens.create-position-details.you-created-pending-order-item', {
              action: entry
                ? t('screens.create-position-details.buy-item')
                : t('screens.create-position-details.sell-item'),
              volume: ((data?.quantity || 0) * (symbolConfig.contractSize || 0)).toFixed(assetUnitOfMeasureDigits),
              asset: assetName,
              assetUnit,
              price: data.price?.toFixed(symbolConfig?.digits || 0)
            });
          }
          let confidence = !!signalData ? 'Low' : ('' as 'Low' | 'Medium' | 'High' | '');
          if (signalData && signalData?.Report?.confidence >= 40 && signalData.Report?.confidence < 80)
            confidence = 'Medium';
          else if (signalData && signalData?.Report?.confidence >= 80) confidence = 'High';
          createOrderMixpanel({
            asset: assetName,
            usedTradingSignal: signalData !== undefined,
            view: 'simplified',
            orderType: selectedOrderType === 'pending_order' ? 'pending' : 'market',
            signalConfidence: confidence,
            typeId: tradingAccount.typeId
          });
          dispatch(
            openModal({
              title,
              icon: images.successArrow,
              testID: testIDs.components.templates.app.createPosition.successPopUp,
              closeTime: 10,
              iconSize: {
                width: 115,
                height: 90
              },
              button: {
                text: t('screens.create-position.explore-other-ideas'),
                onPress: goToIdeasHub
              }
            })
          );
        } else if (!data.isSuccess && data?.message?.includes('positions or orders is reached')) {
          handleLimitError(tradingAccounts.length === 1, data?.limit);
        } else {
          showErrorPopUp();
        }
      }, 300);
    } else if (!placeOrderResponse.isSuccess || !response.isSuccess) {
      const errorData = response?.error || (placeOrderResponse?.error as any);
      const status = errorData?.status as number;
      if (errorData?.message?.includes?.('positions or orders is reached'))
        handleLimitError(tradingAccounts.length === 1, errorData?.limit);
      else if (`${status}`?.startsWith?.('4')) showErrorPopUp(errorData?.data?.message);
    }
    placeOrderResponse.reset();
    response.reset();
  }, [response.isSuccess, placeOrderResponse.isSuccess, tradingAccount.typeId, tradingAccounts.length]);

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
  }, [response.error, placeOrderResponse.error, tradingAccounts.length]);

  const sendRequest = useCallback(
    (formValues: { volume: string; price: string }) => {
      const priceTakeProfit =
        (signalData?.Report?.action === 0 ? signalData?.Report?.buy_target_1 : signalData?.Report?.sell_target_1) || 0;
      const priceStopLoss = signalData?.Report?.stop || 0;

      const body = {
        accountId: initialAccount,
        instrument: asset,
        priceTakeProfit: signalData ? priceTakeProfit : undefined,
        priceStopLoss: signalData ? priceStopLoss : undefined
      };

      const moneyAmount = selectedAmount || Number(formValues.volume);
      const volume = (moneyAmount || 0) / (symbolConfig.contractSize || 1);

      if (selectedOrderType === 'market_order') {
        openPositionQuery({
          ...body,
          volume,
          tradeAction: entry ? 0 : 1
        });
      } else {
        const price =
          Number(formValues.price) ||
          (signalData?.Report?.action === 0
            ? signalData?.Report?.buy_entry_target_1
            : signalData?.Report?.sell_entry_target_1) ||
          0;
        const expirationTime = signalData?.Report.expiry ? dateHelper.toTimestamp(signalData?.Report.expiry) : 0;
        placeOrder({
          ...body,
          price,
          volume,
          orderType: entry ? (price < (tick || 0) ? 2 : 4) : price > (tick || 0) ? 3 : 5,
          expirationTime: expirationTime || (selectedDate ? dateHelper.toTimestamp(selectedDate) : 0)
        });
      }
    },
    [
      initialAccount,
      asset,
      entry,
      selectedAmount,
      signalData,
      tick,
      entry,
      selectedOrderType,
      selectedDate,
      symbolConfig
    ]
  );

  const handleCalculateMargin = useCallback(
    (selectedAmount: number) => {
      if (!initialAccount || !asset) return;
      if (selectedOrderType === 'market_order') {
        calculateMargin({
          accountId: initialAccount,
          instrument: asset,
          tradeAction: entry ? 0 : 1,
          volume: selectedAmount / symbolConfig.contractSize || 0
        });
      }
    },
    [initialAccount, asset, entry, tick, signalData?.Report, selectedOrderType, symbolConfig.contractSize]
  );

  const handleGetMaxMargin = useCallback(() => {
    if (!asset || !initialAccount) {
      return;
    }
    calculateLimits({
      accountId: initialAccount,
      instrument: asset,
      tradeAction: entry ? 0 : 1
    });
  }, [initialAccount, asset, entry]);

  const calculateMarginDebounce = debounce(250, handleCalculateMargin);

  const onOpen = useCallback(
    (index: number) => {
      if (index !== -1 && asset) {
        sheetState.current = true;
        setTick(entry ? ask : bid);
      }
    },
    [asset, selectedAmount, handleCalculateMargin, onClose, visible]
  );

  const onAnimate = useCallback(() => {
    sheetState.current = true;
  }, []);

  const onDismiss = useCallback(() => {
    onClose();
    setAmount(0);
  }, []);

  const caption = useMemo(() => {
    const { digits = 0 } = symbolConfig || {};

    if (entry === undefined || asset === undefined) {
      return null;
    }

    const assetName = getAssetName(asset);

    const title = `${entry ? t('screens.create-position.buy') : t('screens.create-position.sell')} ${assetName}`;
    const desc = tick ? `1 ${assetName} = ${tick.toFixed(digits || 0)}` : null;

    const isSelectorDisabled = Boolean(scheduleData?.timeToOpen || signalData);

    return (
      <View style={styles.sheetCaption} testID={testIDs.components.organisms.createPosition.caption.root}>
        <View style={styles.sheetTitle}>
          <BaseText variant={BaseTextVariant.title} testID={testIDs.components.organisms.createPosition.caption.title}>
            {title}
          </BaseText>
          <BaseText
            style={styles.sheetDesc}
            variant={BaseTextVariant.small}
            testID={testIDs.components.organisms.createPosition.caption.desc}
          >
            {desc}
          </BaseText>
        </View>
        <TouchableOpacity
          style={[styles.sheetDetails, isSelectorDisabled ? styles.disabledDetails : {}]}
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          onPress={() => {
            openOrderSelector(true);
          }}
          disabled={isSelectorDisabled}
          testID={testIDs.components.organisms.createPosition.caption.orderTypeButton}
        >
          <BaseText
            variant={BaseTextVariant.tag}
            style={styles.changeTypeText}
            testID={testIDs.components.organisms.createPosition.caption.orderTypeLabel}
          >
            {selectedOrderType === 'market_order'
              ? t('screens.create-position.market-order')
              : t('screens.create-position.pending-order')}
          </BaseText>
          {!isSelectorDisabled && (
            <SvgIcon name={SvgXmlIconNames.chevronDown} size={IconSize.sm} color={graphite['900']} />
          )}
        </TouchableOpacity>
      </View>
    );
  }, [tick, entry, asset, goCreatePosition, styles, symbolConfig, selectedOrderType, signalData, scheduleData]);

  const renderLoader = useCallback((width: number | string = 100, height?: number) => {
    return (
      <ContentLoader
        speed={2}
        width={width}
        height={height || 16}
        style={{ marginTop: 2 }}
        backgroundColor={'#E2E6F2'}
        foregroundColor={theme.palette.graphite['050']}
      >
        <Rect rx={4} ry={4} width={typeof width === 'string' ? width : 100} height={16} />
      </ContentLoader>
    );
  }, []);

  const currentPositionValue = useMemo(() => {
    if (!formValues.volume && !selectedAmount) {
      return null;
    }

    const { isLoading, data } = calculateMarginResponse || {};
    const { value } = data || {};

    if (isLoading) {
      return renderLoader();
    }

    return (
      <BaseText style={styles.positionText2} testID={testIDs.components.organisms.createPosition.summary.positionValue}>
        ~{formatNumberToAmount(value?.toFixed(2))}
      </BaseText>
    );
  }, [selectedAmount, calculateMarginResponse, formValues.volume, theme.dark]);

  const calculatePnL = useCallback(
    (targetPrice: number) => {
      const entryPrice =
        signalData?.Report?.action === 0
          ? signalData?.Report?.buy_entry_target_1
          : signalData?.Report?.sell_entry_target_1;
      let currentPrice = (signalData?.Report?.status === 9 ? tick : entryPrice) || 0;
      const diff = !entry ? currentPrice - targetPrice : targetPrice - currentPrice;
      const pnl = diff * Number(selectedAmount || formValues.volume || 0);
      const { bid: lastTickBid, ask: lastTickAsk } = profitSymbolLastTick.data || {};

      if (profitSymbol && lastTickBid && lastTickAsk) {
        const currencyAveragePrice = (lastTickBid + lastTickAsk) / 2;
        const averagePrice = liveCurrencyAveragePrice || currencyAveragePrice;

        return profitSymbolDirect ? pnl * averagePrice : pnl / averagePrice;
      }
      return pnl;
    },
    [
      entry,
      liveCurrencyAveragePrice,
      symbolConfig?.contractSize,
      tick,
      signalData?.Report,
      profitSymbol,
      formValues.volume,
      selectedAmount
    ]
  );

  const actionButtonText = useMemo(() => {
    let text = '';
    if (selectedOrderType === 'market_order') {
      text = (signalData ? signalData?.Report?.action === 0 : entry)
        ? t('components.signals.buy-now')
        : t('components.signals.sell-now');
    } else {
      text = (signalData ? signalData?.Report?.action === 0 : entry)
        ? t('components.signals.buy-at', {
            entry: signalData
              ? signalData?.Report?.buy_entry_target_1?.toFixed(symbolConfig.digits || 0)
              : formValues.price || 0
          })
        : t('components.signals.sell-at', {
            entry: signalData
              ? signalData?.Report?.sell_entry_target_1?.toFixed(symbolConfig.digits || 0)
              : formValues.price || 0
          });
    }
    return text;
  }, [signalData, symbolConfig.digits, selectedOrderType, formValues.price, entry]);

  const closeOrderSelector = useCallback(() => {
    openOrderSelector(false);
  }, []);

  const goToSelectDate = useCallback(() => setDateIsOpen(true), []);

  useEffect(() => {
    if (formValues.volume && selectedAmount) {
      setValue('volume', '');
    }
  }, [selectedAmount]);

  const isThereAmount = !formValues.volume && !selectedAmount;

  const goToVerification = useCallback(() => {
    BottomSheetRef.current?.dismiss();
    setTimeout(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Common, {
        screen: COMMON_ROUTE_NAMES.Verification
      });
    }, 200);
  }, [navigation]);

  const renderGuidance = useCallback(
    (image: ImageSourcePropType, title = '', subTitle = '', buttonText = '', onPress?: () => void) => {
      return (
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContainer}
          testID={testIDs.components.organisms.createPosition.guidance.root}
        >
          <BaseImage
            style={styles.guidanceImage}
            resizeMode='contain'
            source={image}
            testID={testIDs.components.organisms.createPosition.guidance.image}
          />
          <BaseText
            variant={BaseTextVariant.captionSemiBold}
            style={styles.guidanceTitle}
            testID={testIDs.components.organisms.createPosition.guidance.title}
          >
            {title}
          </BaseText>
          {subTitle && (
            <BaseText
              style={styles.guidanceText}
              testID={testIDs.components.organisms.createPosition.guidance.subtitle}
            >
              {subTitle}
            </BaseText>
          )}
          <BaseButton
            style={styles.guidanceButton}
            type={BaseButtonType.primary}
            label={buttonText}
            onPress={onPress}
            testID={testIDs.components.organisms.createPosition.guidance.button}
          />
        </BottomSheetScrollView>
      );
    },
    []
  );

  const guidanceSelector = useCallback(() => {
    if (!isAuthorized)
      return (
        <LoginContent
          onPress={() => {
            if (sheetState.current) BottomSheetRef.current?.dismiss();
          }}
        />
      );
    if (!userInfo.isVerified)
      return renderGuidance(
        images.blackKey,
        t('screens.create-position.complete-verification'),
        '',
        t('screens.create-position.complete-profile-verification'),
        goToVerification
      );

    if (userInfo.isVerified && !userInfo.firstDepositDate && !balanceLive.equity)
      return renderGuidance(
        images.safe,
        t('screens.create-position.add-funds-wallet'),
        t('screens.create-position.deposit-now-start-trading'),
        'Fund now',
        () => {
          BottomSheetRef.current?.dismiss();
          setTimeout(() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
          }, 200);
        }
      );

    if (userInfo.isVerified && userInfo.firstDepositDate && !balanceLive.equity && !userInfo.lastTradedAt)
      return renderGuidance(
        images.rocket,
        t('screens.create-position.top-up-trading-account'),
        t('screens.create-position.transfer-funds-main-wallet'),
        t('screens.create-position.transfer-funds-now'),
        () => {
          BottomSheetRef.current?.dismiss();
          setTimeout(() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
          }, 200);
        }
      );

    return null;
  }, [userInfo, balanceLive.equity, isAuthorized]);

  const timeSchedule = useMemo(() => {
    if (!scheduleData || signalData) {
      return null;
    }

    const { timeToOpen } = scheduleData || {};

    let toastTitle: string | null = null;

    if (timeToOpen) {
      toastTitle = t('screens.create-position.market-opens', { time: timeToOpen });
    } else {
      return null;
    }

    return (
      <BaseToast
        style={styles.alertBox}
        variant={BaseToastVariant.info}
        title={toastTitle}
        desc={t('screens.create-position.market-reopens-warning')}
        testID={testIDs.components.organisms.createPosition.marketToast}
      />
    );
  }, [scheduleData, signalData, t]);

  const [keyboardOpen, setKeyboardOpen] = useState<boolean>();

  const onDismissDate = useCallback(() => setDateIsOpen(false), []);
  const onDateSubmit = useCallback((d: Date) => setDate(d), []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <>
      <BottomSheetModal
        ref={BottomSheetRef}
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        onChange={onOpen}
        handleIndicatorStyle={styles.indicator}
        onDismiss={onDismiss}
        topInset={top}
        backgroundStyle={styles.sheetBgStyle}
        enablePanDownToClose
        onAnimate={onAnimate}
        backdropComponent={SheetBackdrop}
        snapPoints={['100%']}
        enableDynamicSizing={!keyboardOpen}
      >
        {showGuidance ? (
          guidanceSelector()
        ) : (
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetContainer}
            testID={testIDs.components.organisms.createPosition.content}
          >
            {caption}
            {Boolean(signalData) ? (
              <SignalInfoPrices
                data={(signalData as Signals) || []}
                style={styles.signalInfo}
                potentialLoss={
                  !!signalData && !symbolConfigData.isLoading
                    ? selectedAmount || Number(formValues.volume)
                      ? `-${Math.abs(calculatePnL(signalData?.Report?.stop)).toFixed(2)}`
                      : undefined
                    : '...'
                }
                expectedProfit={
                  !!signalData && !symbolConfigData.isLoading
                    ? selectedAmount || Number(formValues.volume)
                      ? `+${Math.abs(
                          calculatePnL(
                            signalData?.Report?.action === 0
                              ? signalData?.Report?.buy_target_1
                              : signalData?.Report?.sell_target_1
                          )
                        ).toFixed(2)}`
                      : undefined
                    : '...'
                }
                testID={testIDs.components.organisms.createPosition.signalInfo}
              />
            ) : null}
            {timeSchedule}
            <View style={styles.sheetCaption} testID={testIDs.components.organisms.createPosition.amount.headerRow}>
              <View style={styles.howMuchInvest}>
                <BaseText
                  variant={BaseTextVariant.caption}
                  testID={testIDs.components.organisms.createPosition.amount.label}
                >
                  {t('screens.create-position.order-amount', { shares: assetUnit || '' })}
                </BaseText>
                {limitsResponse.isLoading ? (
                  <View style={styles.available}>{renderLoader(350)}</View>
                ) : (
                  <BaseText
                    style={styles.available}
                    variant={BaseTextVariant.authSmall}
                    testID={testIDs.components.organisms.createPosition.amount.range}
                  >
                    {formatTwoDecimals(limits.min?.toFixed(assetUnitOfMeasureDigits))} -{' '}
                    {formatTwoDecimals(limits.max?.toFixed(assetUnitOfMeasureDigits))}
                  </BaseText>
                )}
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: amounts.length % 6 === 0 ? 'space-between' : undefined
              }}
              testID={testIDs.components.organisms.createPosition.amount.grid}
            >
              {amounts.map((amount, index) => {
                const isSelected = amount === selectedAmount;
                return (
                  <BaseButton
                    labelStyle={[styles.amount, { color: isSelected ? purple[800] : graphite['900'] }]}
                    key={index}
                    label={amount.toLocaleString()}
                    style={{
                      marginRight: index % 3 === 2 ? 0 : 12,
                      width: '29%',
                      marginBottom: 12,
                      borderWidth: isSelected ? 1 : 0,
                      borderColor: purple[800],
                      paddingHorizontal: 8,
                      backgroundColor: theme.palette.background.card.primary
                    }}
                    onPress={() => {
                      setAmount(isSelected ? 0 : amount);
                      clearErrors('volume');
                      if (!isSelected) handleCalculateMargin(amount);
                    }}
                    testID={testIDs.components.organisms.createPosition.amount.button(amount)}
                  />
                );
              })}
            </View>
            <Controller
              name='volume'
              control={control}
              rules={{
                validate: {
                  greaterThanMaximum: (value) => {
                    const maxValue = limits.max || Number.MAX_SAFE_INTEGER;
                    if (parseFloat(value.toString()) > maxValue) {
                      return t('screens.create-position-details.amount-exceeds-balance');
                    }
                    return true;
                  },
                  minimumValidation: (value) => {
                    const minValue = limits.min || 0;
                    if (parseFloat(value.toString()) < minValue) {
                      return t('screens.create-position-details.min-amount-validation-unit', {
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
                  returnKeyType={'next'}
                  keyboardType={'numeric'}
                  isBottomSheet
                  error={errors.volume?.message}
                  focusedBorderColor={selectedAmount ? undefined : theme.palette.border.interaction.input}
                  onBlur={onBlur}
                  onChange={(val: any) => {
                    const normalizedValue = val.replace(',', '.');
                    const regex = new RegExp(`^\\d+(\\.\\d{0,${assetUnitOfMeasureDigits}})?$`);
                    if (regex.test(normalizedValue) || normalizedValue === '') {
                      onChange(normalizedValue);
                      calculateMarginDebounce(Number(normalizedValue));
                      if (selectedAmount) setAmount(0);
                    }
                  }}
                  value={value}
                  title={t(
                    !!tradingAccount.balance
                      ? 'screens.create-position.other-amount'
                      : 'screens.create-position.amount',
                    {
                      shares: assetUnit
                    }
                  )}
                  testID={testIDs.components.organisms.createPosition.amount.input}
                />
              )}
            />
            {selectedOrderType === 'pending_order' && !signalData && (
              <>
                <BaseText
                  variant={BaseTextVariant.caption}
                  style={styles.fieldName}
                  testID={testIDs.components.organisms.createPosition.pending.actionWhenPriceLabel}
                >
                  {t('screens.create-position-details.action-when-price', {
                    action: entry ? t('screens.create-position.buy') : t('screens.create-position.sell')
                  })}
                </BaseText>
                <Controller
                  name='price'
                  control={control}
                  rules={{
                    validate: {
                      required: (value) => {
                        if (!value) return t('errors.required');
                        return true;
                      },
                      minimumValidation: (value) => {
                        const minValue = 0;
                        if (parseFloat(value.toString()) <= minValue) {
                          return t('screens.create-position.minimum-zero');
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
                      returnKeyType={'next'}
                      keyboardType={'numeric'}
                      error={errors.price?.message}
                      isBottomSheet
                      onBlur={onBlur}
                      onChange={(val: any) => {
                        const normalizedValue = val.replace(',', '.');
                        onChange(normalizedValue);
                      }}
                      value={value}
                      title={t('screens.create-position-details.price')}
                      testID={testIDs.components.organisms.createPosition.pending.priceInput}
                    />
                  )}
                />
                <View style={styles.dateRow} testID={testIDs.components.organisms.createPosition.pending.dateRow}>
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
                      testID={testIDs.components.organisms.createPosition.pending.dateButton}
                    />
                    {selectedDate && (
                      <TouchableOpacity
                        style={{ padding: 4 }}
                        onPress={() => {
                          setDate(null);
                        }}
                        testID={testIDs.components.organisms.createPosition.pending.dateClearBtn}
                      >
                        <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xs} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
            {(selectedAmount || formValues.volume) && selectedOrderType === 'market_order' ? (
              <View
                style={[styles.row, styles.height44]}
                testID={testIDs.components.organisms.createPosition.summary.root}
              >
                <View>
                  <BaseText
                    variant={BaseTextVariant.tiny}
                    style={styles.positionText1}
                    testID={testIDs.components.organisms.createPosition.summary.positionValueLabel}
                  >
                    {t('screens.create-position.position-value')}
                  </BaseText>
                  {currentPositionValue}
                </View>
                <View>
                  <BaseText
                    variant={BaseTextVariant.tiny}
                    style={styles.positionText1}
                    testID={testIDs.components.organisms.createPosition.summary.requiredMarginLabel}
                  >
                    {t('screens.create-position.required-margin', { unit: assetUnit })}
                  </BaseText>
                  {calculateMarginResponse.isLoading ? (
                    renderLoader('100%', 16)
                  ) : (
                    <BaseText
                      style={styles.positionText2}
                      testID={testIDs.components.organisms.createPosition.summary.requiredMarginValue}
                    >
                      {(calculateMarginResponse.data?.margin || 0).toFixed(2)}
                    </BaseText>
                  )}
                </View>
              </View>
            ) : (
              <View style={{ height: selectedOrderType === 'market_order' ? 72 : 32 }} />
            )}
            <View style={styles.buttonsWrapper} testID={testIDs.components.organisms.createPosition.footer.buttonsRow}>
              <BaseButton
                type={BaseButtonType.accent}
                onPress={goCreatePosition}
                size={BaseButtonSize.large}
                style={styles.settingsButton}
                icon={<SvgIcon name={SvgXmlIconNames.settings} size={IconSize.sm} color={graphite['900']} />}
                testID={testIDs.components.organisms.createPosition.footer.settingsBtn}
              />
              <BaseButton
                loading={response.isLoading || placeOrderResponse.isLoading}
                disabled={
                  Boolean(errors && Object.keys(errors).length > 0) ||
                  (selectedOrderType === 'market_order' || !!signalData
                    ? isThereAmount
                    : isThereAmount || !formValues.price)
                }
                type={BaseButtonType.primary}
                onPress={handleSubmit(sendRequest)}
                size={BaseButtonSize.large}
                label={actionButtonText}
                style={styles.actionButton}
                testID={testIDs.components.organisms.createPosition.footer.submitBtn}
              />
            </View>
          </BottomSheetScrollView>
        )}
        <OrderTypeSelector
          visible={isOrderSelectorOpened}
          setVisible={closeOrderSelector}
          onSelect={(orderType) => {
            setOrderType(orderType as ORDER_TYPES);
          }}
          entry={entry}
          orderType={selectedOrderType}
        />
      </BottomSheetModal>
      <View style={{ flex: 1 }}>
        <SingleDateSelector
          onDismiss={onDismissDate}
          onSubmit={onDateSubmit}
          visible={dateIsOpen}
          date={selectedDate}
          title={t('navigation.select-date')}
          testID={testIDs.components.organisms.createPosition.pending.datePicker}
        />
      </View>
    </>
  );
};

export default CreatePosition;

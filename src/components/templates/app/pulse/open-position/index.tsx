import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  memo,
  FC
} from 'react';
import { useTheme, useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { COMMON_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { BackHandler, EmitterSubscription, Keyboard } from 'react-native';
import { SheetBackdrop, SingleDateSelector, BaseToast, BaseToastVariant } from '@/components';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal, BottomSheetScrollView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useAppSelector, useTradingSchedule } from '@/hooks';
import {
  useGetDealsAccountsQuery,
  usePlaceOrderMutation,
  useGetTradingAccountsMutation,
  useOpenPositionMutation,
  useCalculateLimitsMutation,
  useCalculateMarginMutation,
  useGetSymbolLastTickQuery
} from '@/store/api';
import {
  jsonParse,
  getAssetName,
  formatTwoDecimals,
  convertUtcTimeSmart,
  positionScreenOpenMixpanel,
  TradeSource,
  positionOpenMixpanel,
  getLastTakeProfitStopLoss,
} from '@/helpers';
import { debounce } from 'throttle-debounce';
import { useNetwork } from '@/providers';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { SymbolConfig, ORDER_TYPES, Signals } from '@/types';
import { actions } from '@/store';
import dateHelper from '@/helpers/dateHelper';
import { useForm } from 'react-hook-form';
import { createOrderMixpanel } from '@/helpers';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PositionModal } from '..';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { PositionModalRef } from '../position-modal';
import useStyles from './styles';
import OpenPositionHeader from './OpenPositionHeader';
import OpenPositionGuidance from './OpenPositionGuidance';
import OpenPositionAmountSection from './OpenPositionAmountSection';
import PendingOrderSection from './PendingOrderSection';
import LimitsSection from './LimitsSection';
import OpenPositionSummarySection from './OpenPositionSummarySection';

const {
  portfolio: { useGetSymbolConfigMutation }
} = actions;

const websocket_key = 'signal-bottom-sheet';

interface CreatePositionProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  entry: boolean | undefined;
  asset: string | undefined;
  bid: number | undefined;
  ask: number | undefined;
  sl?: number;
  tp?: number;
  signalData?: Signals;
  tradeSource?: TradeSource;
  performanceMetric?: number;
  confidence?: number;
  category?: string;
  hasExternalRef?: boolean;
  onTryAgain?(): void;
}

type Abort = { abort?: () => void };

const OpenPosition: FC<CreatePositionProps> = ({
  bid,
  ask,
  setVisible,
  visible,
  entry,
  asset,
  signalData,
  tradeSource,
  performanceMetric,
  sl,
  tp,
  confidence,
  category,
  onTryAgain
}) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { dismissAll } = useBottomSheetModal();

  const { top } = useSafeAreaInsets();

  const { websocket } = useNetwork();

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const [selectedAmount, setAmount] = useState<number>(0);

  const [tick, setTick] = useState(entry ? ask : bid);
  // const [profitSymbol, setProfitSymbol] = useState<string | undefined>(undefined);
  // const [profitSymbolDirect, setProfitSymbolDirect] = useState<boolean | undefined>(undefined); //TODO: turned off for now. @Levon
  // const [liveCurrencyAveragePrice, setLiveCurrencyAveragePrice] = useState<number | undefined>(undefined); //TODO: turned off for now. @Levon
  const [selectedOrderType, setOrderType] = useState<ORDER_TYPES>('market_order');
  const [selectedDate, setDate] = useState<Date | null>(null);
  const [dateIsOpen, setDateIsOpen] = useState<boolean>(false);

  const BottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetState = useRef<boolean>(false);
  const positionModalRef = useRef<PositionModalRef>(null);

  const marginAbort = useRef<Abort>({ abort: () => { } });
  const dealsAbort = useRef<Abort>({ abort: () => { } });
  const tradeAbort = useRef<Abort>({ abort: () => { } });
  const lastTickAbort = useRef<Abort>({ abort: () => { } });
  const smybolConfigAbort = useRef<Abort>({ abort: () => { } });

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
      (userInfo.isVerified && !userInfo.firstDepositDate && !tradingAccount?.equity) ||
      (userInfo.isVerified && userInfo.firstDepositDate && !tradingAccount?.equity && !userInfo.lastTradedAt)
    );
  }, [isAuthorized, userInfo.isVerified, userInfo.firstDepositDate, tradingAccount?.equity, userInfo.lastTradedAt]);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    clearErrors,
    getValues,
    formState: { errors, isValid }
  } = useForm<{
    price: string;
    volume: string;
    tp: string;
    sl: string;
    slEnabled: boolean;
    tpEnabled: boolean;
  }>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      price: '',
      volume: '',
      tp: '',
      sl: '',
      slEnabled: true,
      tpEnabled: true
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
      tradeAbort.current = getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getDealsAccountsHandler = async () => {
    if (userInfo.id === undefined) {
      return;
    }
    try {
      dealsAbort.current = getDealsAccounts(userInfo.id);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const handleGetMaxMargin = useCallback(() => {
    if (!asset || !initialAccount) {
      return;
    }
    marginAbort.current = calculateLimits({
      accountId: initialAccount,
      instrument: asset,
      tradeAction: entry ? 0 : 1
    });
  }, [initialAccount, asset, entry, calculateLimits]);

  // const getProfitSymbolLastTickHandler = async () => { //TODO: turned off for now. @Levon
  //     if (!initialAccount || !profitSymbol) {
  //         return;
  //     }
  //     try {
  //         await getProfitSymbolLastTick({ symbol: profitSymbol, accountId: initialAccount });
  //     } catch (error: unknown) {
  //         console.error(error);
  //     }
  // };

  useLayoutEffect(() => {
    if (asset && visible && (performanceMetric !== undefined || confidence !== undefined)) {
      lastTickAbort.current = getProfitSymbolLastTick({
        accountId: initialAccount || 0,
        symbol: asset
      });
    }

    return () => {
      lastTickAbort.current?.abort?.();
    };
  }, [asset, initialAccount, visible, performanceMetric, confidence]);

  useLayoutEffect(() => {
    if (visible) {
      getTradingAccountsHandler();
      getDealsAccountsHandler();
    }

    return () => {
      tradeAbort.current?.abort?.();
      dealsAbort.current?.abort?.();
    };
  }, [visible, userInfo.id]);

  useEffect(() => {
    if (signalData && signalData.Report?.status === 9 && selectedOrderType !== 'market_order') {
      setOrderType('market_order');
    } else if (signalData && signalData.Report?.status !== 9 && selectedOrderType !== 'pending_order') {
      setOrderType('pending_order');
    }
  }, [signalData?.Report?.status]);

  useEffect(() => {
    if (formValues.volume) {
      trigger('volume');
    }
  }, [selectedOrderType]);

  const getSymbolConfigHandler = useCallback(async () => {
    if (!asset || !initialAccount) {
      return;
    }
    try {
      smybolConfigAbort.current = getSymbolConfig({
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

  // const checkProfitCurrency = useCallback(() => {
  //   if (
  //     //calculatePositionResponse?.data === undefined || //BUG
  //     tradingAssets.length === 0
  //   ) {
  //     return;
  //   }

  //   const { symbol, currencyProfit } = symbolConfig || {};

  //   if (!symbol || !currencyProfit) {
  //     return;
  //   }

  //   const directPair = `${currencyProfit}${TRADING_ACCOUNT_CURRENCY}`.toUpperCase();
  //   const reversePair = `${TRADING_ACCOUNT_CURRENCY}${currencyProfit}`.toUpperCase();

  //   const currencyProfitDirectPair = tradingAssets.find(
  //     (asset) => getAssetName(asset.systemName) === getAssetName(directPair)
  //   );
  //   const currencyProfitReversePair = tradingAssets.find(
  //     (asset) => getAssetName(asset.systemName) === getAssetName(reversePair)
  //   );

  //   const currencyProfitSymbol = getAssetName(
  //     currencyProfitDirectPair?.systemName || currencyProfitReversePair?.systemName
  //   );
  //   // const currencyProfitSymbolDirect = Boolean(currencyProfitDirectPair?.systemName); //TODO: turned off for now. @Levon

  //   if (currencyProfitSymbol) {
  //     setProfitSymbol(currencyProfitSymbol);
  //     // setProfitSymbolDirect(currencyProfitSymbolDirect); //TODO: turned off for now. @Levon
  //   } else {
  //     setProfitSymbol(undefined);
  //     // setProfitSymbolDirect(undefined);//TODO: turned off for now. @Levon
  //   }
  // }, [
  //   //calculatePositionResponse,
  //   tradingAssets,
  //   symbolConfig,
  //   asset
  // ]);

  // const debounceSetCurrencyData = useCallback( //TODO: turned off for now. @Levon
  //     (askPrice: number, bidPrice: number) => {
  //         if (askPrice && bidPrice) {
  //             const averagePrice = (askPrice + bidPrice) / 2;
  //             setLiveCurrencyAveragePrice(averagePrice);
  //         }
  //     },
  //     [setLiveCurrencyAveragePrice]
  // );

  // const setCurrencyData = debounce(150, debounceSetCurrencyData); //TODO: turned off for now. @Levon

  // useLayoutEffect(() => {
  //   checkProfitCurrency();
  // }, [symbolConfig, tradingAssets, asset]);

  useLayoutEffect(() => {
    if (asset) getSymbolConfigHandler();

    return () => {
      smybolConfigAbort.current?.abort?.();
    };
  }, [asset, initialAccount]);

  useLayoutEffect(() => {
    if (visible) {
      handleGetMaxMargin();
    }

    return () => {
      marginAbort.current?.abort?.();
    };
  }, [visible, handleGetMaxMargin]);

  const debounceSetData = useCallback(
    (value: number) => {
      // console.log('***** WS CreatePosition tick', value)
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
      if (!wsData) return;

      const { ask: dataAsk, bid: dataBid, symbol: dataSymbol } = wsData || {};
      if (dataAsk == null || dataBid == null || !dataSymbol) return;

      if (getAssetName(dataSymbol) !== asset) return;

      const value = entry ? dataAsk : dataBid;
      setData(value);
    }, websocket_key);
  }, [asset, entry, setData, showGuidance]);

  const unsubscribeWebsocket = useCallback(() => {
    websocket?.removeEventListener(websocket_key);
    setData.cancel();
    // setCurrencyData.cancel(); //TODO: turned off for now. @Levon
  }, [setData, asset, websocket_key]);

  useEffect(() => {
    if (visible) {
      positionScreenOpenMixpanel({
        source: tradeSource || TradeSource.Markets,
        direction: isBuyAction ? 'buy' : 'sell',
        card_category: signalData?.Product?.assetGroup || 'all'
      });
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      subscribeWebsocket();
    } else {
      unsubscribeWebsocket();
    }

    return () => {
      unsubscribeWebsocket();
    };
  }, [visible, unsubscribeWebsocket, subscribeWebsocket]);

  const limits = useMemo((): { min: number; max: number } => {
    const max = (limitsResponse.data?.maxVolume || 0) * (symbolConfig.contractSize || 0);
    const min = (limitsResponse.data?.minVolume || 0) * (symbolConfig.contractSize || 0);

    return { max, min };
  }, [limitsResponse.data, symbolConfig.contractSize]);


  const { lastStopLoss, lastTakeProfit } = useMemo(() => {
    return getLastTakeProfitStopLoss({
      entry,
      category,
      confidence,
      performanceMetric,
      ask: profitSymbolLastTick.data?.ask,
      bid: profitSymbolLastTick.data?.bid
    });
  }, [entry, profitSymbolLastTick.data, performanceMetric, confidence, category]);

  useEffect(() => {
    if (!BottomSheetRef.current) return;
    if (visible && asset) {
      BottomSheetRef.current?.present();
    } else if (!visible || !asset) {
      BottomSheetRef.current?.dismiss();
    }
  }, [visible, asset]);

  const { assetUnit, assetUnitOfMeasureDigits } = useMemo(() => {
    const findedAsset = tradingAssets.find((item: ParsedTradingAssets) => getAssetName(item.systemName) === asset);
    const assetUnit = findedAsset?.assetUnitOfMeasure || '';
    const assetUnitOfMeasureDigits = findedAsset?.assetUnitOfMeasureDigits || 2;
    return {
      assetUnit,
      assetUnitOfMeasureDigits
    };
  }, [asset]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetState.current) dismissAll();
      else navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, []);

  const onClose = useCallback(() => {
    setVisible(false);
    // setProfitSymbol(undefined);
    // setProfitSymbolDirect(undefined); //TODO: turned off for now. @Levon
    sheetState.current = false;
  }, [setVisible]);

  const showErrorPopUp = useCallback(
    (subtitle?: string) => {
      const hasSubtitle = !!subtitle?.length;
      const hasNotEnoughMoney = hasSubtitle && subtitle.includes('Not enough money');

      BottomSheetRef.current?.dismiss();
      requestAnimationFrame(() => {
        positionModalRef.current?.open({
          orderType: selectedOrderType,
          status: 'error',
          infoText: hasNotEnoughMoney
            ? t('screens.create-position.not-enough-money')
            : hasSubtitle
              ? t('errors.market-closed')
              : t('components.templates.position-modal.went-wrong'),
          errorText: hasSubtitle
            ? convertUtcTimeSmart(subtitle)
            : t('components.templates.position-modal.try-again-info')
        });
      });
    },
    [t]
  );

  const handleLimitError = (hasOneTradingAccount: boolean = true, limit: number = 5) => {
    BottomSheetRef.current?.dismiss();
    requestAnimationFrame(() => {
      positionModalRef.current?.open({
        orderType: selectedOrderType,
        status: 'error',
        infoText: t('screens.create-position.position-limit'),
        errorText: hasOneTradingAccount
          ? t('screens.create-position.position-limit-one-info', { limit })
          : t('screens.create-position.position-limit-more-info', { limit })
      });
    });
  };

  useEffect(() => {
    if ((placeOrderResponse.isSuccess || response.isSuccess) && sheetState.current) {
      BottomSheetRef.current?.dismiss();

      setTimeout(() => {
        const isMarket = response.isSuccess;
        const data = isMarket ? response.data : placeOrderResponse.data;
        if (data.isSuccess) {
          const assetName = getAssetName(asset);
          const volume = ((data?.quantity || 0) * (symbolConfig.contractSize || 0)).toFixed(assetUnitOfMeasureDigits);
          const tradeActionDesc = entry
            ? t('screens.create-position-details.buy-item')
            : t('screens.create-position-details.sell-item');
          const translatePath =
            (signalData && signalData.Report?.status !== 9) || selectedOrderType === 'pending_order'
              ? 'screens.create-position-details.action-by-price-item'
              : 'screens.create-position-details.you-created-pending-order-item';

          const title = t(translatePath, {
            action: tradeActionDesc,
            volume,
            asset: assetName,
            price: data.price?.toFixed(symbolConfig.digits || 0)
          });

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

          requestAnimationFrame(() => {
            positionModalRef.current?.open({
              status: 'success',
              orderType: selectedOrderType,
              infoText: title,
              direction: entry ? 'buy' : 'sell',
              ...(isMarket && {
                value: `$${(calculateMarginResponse?.data?.value || 0).toFixed(2)}`,
                margin: `$${(calculateMarginResponse?.data?.margin || 0).toFixed(2)}`
              })
            });
          });
        }
      }, 300);
      placeOrderResponse.reset();
      response.reset();
    }
  }, [
    calculateMarginResponse?.data,
    response.isSuccess,
    placeOrderResponse.isSuccess,
    tradingAccount.typeId,
    tradingAccounts.length
  ]);

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
  }, [response.error, placeOrderResponse.error, tradingAccounts.length, showErrorPopUp, handleLimitError]);


  const isMarketOrder = selectedOrderType === 'market_order';

  const disableAction = useMemo(() => {
    const hasAmount = isMarketOrder
      ? Boolean(selectedAmount || formValues.volume)
      : Boolean(formValues.volume);

    const hasPrice = isMarketOrder
      ? true
      : Boolean(formValues.price);

    return (
      profitSymbolLastTick.isFetching ||
      !isValid ||
      !hasAmount ||
      !hasPrice
    );
  }, [
    isMarketOrder,
    selectedAmount,
    formValues.volume,
    formValues.price,
    profitSymbolLastTick.isFetching,
    isValid
  ]);

  const sendRequest = useCallback(
    (formValues: { price: string; volume: string; tp: string; sl: string; slEnabled: boolean; tpEnabled: boolean }) => {
      if (disableAction) return;
      const priceTakeProfit =
        (signalData?.Report?.action === 0 ? signalData?.Report?.buy_target_1 : signalData?.Report?.sell_target_1) || 0;
      const priceStopLoss = signalData?.Report?.stop || 0;

      const { slEnabled, tpEnabled, tp, sl } = formValues;

      const moneyAmount = selectedAmount || Number(formValues.volume);
      const volume = (moneyAmount || 0) / (symbolConfig.contractSize || 1);

      const body = {
        accountId: initialAccount,
        instrument: asset,
        priceTakeProfit: signalData ? (tpEnabled ? +(tp || 0) : priceTakeProfit) : undefined,
        priceStopLoss: signalData ? (slEnabled ? +(sl || 0) : priceStopLoss) : undefined,
        volume
      };

      if (selectedOrderType === 'market_order') {
        openPositionQuery({
          ...body,
          tradeAction: entry ? 0 : 1
        });
      } else {
        const price =
          Number(formValues.price) ||
          (signalData?.Report?.action === 0
            ? signalData?.Report?.buy_entry_target_1
            : signalData?.Report?.sell_entry_target_1) ||
          0;
        // const expirationTime = signalData?.Report.expiry ? dateHelper.toTimestamp(signalData?.Report.expiry) : 0;
        placeOrder({
          ...body,
          price,
          orderType: entry ? (price < (tick || 0) ? 2 : 4) : price > (tick || 0) ? 3 : 5,
          expirationTime: selectedDate ? dateHelper.toTimestamp(selectedDate) : 0
        });
      }

      positionOpenMixpanel({
        source: tradeSource || TradeSource.Markets,
        direction: isBuyAction ? 'buy' : 'sell',
        card_category: signalData?.Product?.assetGroup || 'all',
        limit: {
          position_value: (calculateMarginResponse?.data?.value || 0).toFixed(2),
          currency: 'usd',
          margin: (calculateMarginResponse?.data?.margin || 0).toFixed(2),
          stop_loss: slEnabled ? sl : 'N/A',
          take_profit: tpEnabled ? tp : 'N/A'
        }
      });
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
      symbolConfig?.contractSize,
      disableAction
    ]
  );

  const handleCalculateMargin = useCallback(
    (selectedAmount: number) => {
      if (!initialAccount || !asset) return;
      calculateMargin({
        accountId: initialAccount,
        instrument: asset,
        tradeAction: entry ? 0 : 1,
        volume: selectedAmount / symbolConfig.contractSize || 0
      });
    },
    [initialAccount, asset, entry, symbolConfig.contractSize]
  );

  const calculateMarginDebounce = debounce(150, handleCalculateMargin);

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
  }, [onClose]);

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
        <Rect rx={4} ry={4} width={typeof width === 'string' ? width : 100} height={height || 16} />
      </ContentLoader>
    );
  }, []);

  // const calculatePnL = useCallback(
  //     (targetPrice: number) => {
  //         const entryPrice =
  //             signalData?.Report?.action === 0
  //                 ? signalData?.Report?.buy_entry_target_1
  //                 : signalData?.Report?.sell_entry_target_1;
  //         let currentPrice = (signalData?.Report?.status === 9 ? tick : entryPrice) || 0;
  //         const diff = !entry ? currentPrice - targetPrice : targetPrice - currentPrice;
  //         const pnl = diff * Number(selectedAmount || formValues.volume || 0);
  //         const { bid: lastTickBid, ask: lastTickAsk } = profitSymbolLastTick.data || {};

  //         if (profitSymbol && lastTickBid && lastTickAsk) {
  //             const currencyAveragePrice = (lastTickBid + lastTickAsk) / 2;
  //             const averagePrice = liveCurrencyAveragePrice || currencyAveragePrice;

  //             return profitSymbolDirect ? pnl * averagePrice : pnl / averagePrice;
  //         }
  //         return pnl;
  //     },
  //     [
  //         entry,
  //         liveCurrencyAveragePrice,
  //         symbolConfig?.contractSize,
  //         tick,
  //         signalData?.Report,
  //         profitSymbol,
  //         formValues.volume,
  //         selectedAmount
  //     ]
  // );

  const isBuyAction = useMemo(
    () => !!(signalData ? signalData?.Report?.action === 0 : entry),
    [signalData?.Report?.action, entry]
  );

  const actionButtonText = useMemo(() => {
    const text = isBuyAction ? t('components.signals.buy-now') : t('components.signals.sell-now');

    return text;
  }, [isBuyAction, t]);

  const goToSelectDate = useCallback(() => setDateIsOpen(true), []);

  useEffect(() => {
    if (formValues.volume && selectedAmount) {
      setValue('volume', '');
    }
  }, [selectedAmount]);

  const goToVerification = useCallback(() => {
    BottomSheetRef.current?.dismiss();
    setTimeout(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Common, {
        screen: COMMON_ROUTE_NAMES.Verification
      });
    }, 200);
  }, [navigation]);

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
      />
    );
  }, [scheduleData, signalData, t]);

  const onDismissDate = useCallback(() => setDateIsOpen(false), []);
  const onDateSubmit = useCallback((d: Date) => setDate(d), []);

  const setMaxVolume = useCallback(() => {
    if (selectedAmount) setAmount(0);
    clearErrors('volume');
    const maxLimit = limits.max?.toFixed(assetUnitOfMeasureDigits);
    setValue('volume', maxLimit);
    const normalizedValue = maxLimit.replaceAll(',', '.');
    const regex = new RegExp(`^\\d+(\\.\\d{0,${assetUnitOfMeasureDigits}})?$`);

    if (regex.test(normalizedValue) || normalizedValue === '') {
      if (normalizedValue !== '') {
        calculateMarginDebounce(Number(normalizedValue));
      }
    }
  }, [limits?.max, selectedAmount, calculateMarginDebounce]);


  const setEmptyDate = useCallback(() => setDate(null), []);

  const onSwitchChange = useCallback(
    (v: 'sl' | 'tp') => (value: boolean) => {
      setValue(`${v}Enabled`, value);
      !value && clearErrors(v);
    },
    []
  );

  const normalizeNumber = (v: number | null | undefined) => (v === null || v === undefined ? undefined : v);

  const onChangeOrderType = useCallback(
    async (v: ORDER_TYPES) => {
      setOrderType(v);

      if (v === 'market_order') {
        setValue('price', '', { shouldValidate: false });
      } else {
        setAmount(0);
      }

      clearErrors(['price', 'sl', 'tp', 'volume']);
    },
    [setOrderType, setValue, clearErrors, trigger, setAmount]
  );


  const onLoginPress = useCallback(() => {
    if (sheetState.current) BottomSheetRef.current?.dismiss();
  }, []);

  const onGoTransfer = useCallback(() => {
    BottomSheetRef.current?.dismiss();
    setTimeout(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
    }, 200);
  }, [navigation]);

  const onGoDeposit = useCallback(() => {
    BottomSheetRef.current?.dismiss();
    setTimeout(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
    }, 200);
  }, [navigation]);

  const onAmountSelect = useCallback(
    (selected: boolean, amount: number) => {
      if (!isMarketOrder) return;

      clearErrors('volume');
      setAmount(selected ? 0 : amount);
      if (!selected) handleCalculateMargin(amount);
    },
    [handleCalculateMargin, clearErrors, isMarketOrder]
  );

  const formattedMin = useMemo(() => {
    return formatTwoDecimals(limits.min?.toFixed(assetUnitOfMeasureDigits));
  }, [limits.min, assetUnitOfMeasureDigits]);

  const formattedMax = useMemo(() => {
    return formatTwoDecimals(limits.max?.toFixed(assetUnitOfMeasureDigits));
  }, [limits.max, assetUnitOfMeasureDigits]);

  useEffect(() => {
    let listener: EmitterSubscription
    if (visible) {
      listener = Keyboard.addListener('keyboardWillHide', () => BottomSheetRef.current?.snapToIndex(0));
    }

    return () => {
      listener?.remove?.();
    };
  }, [visible]);

  useEffect(() => {
    let frameId: number | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    let slFromSignal: number | undefined;
    let tpFromSignal: number | undefined;
    let priceFromSignal: number | undefined;
    let statusFromSignal: number | undefined;

    if (signalData?.Report) {
      const { stop, action, buy_target_1, sell_target_1, status, buy_entry_target_1, sell_entry_target_1, expiry } =
        signalData.Report;

      if (expiry && status !== 9) {
        setDate(new Date(expiry));
      }

      tpFromSignal = normalizeNumber(action === 0 ? buy_target_1 : sell_target_1);
      slFromSignal = normalizeNumber(stop);
      statusFromSignal = normalizeNumber(status);
      priceFromSignal = normalizeNumber(action === 0 ? buy_entry_target_1 : sell_entry_target_1);
    }
    const finalSl = lastStopLoss !== undefined ? lastStopLoss : sl || slFromSignal;
    const finalTp = lastTakeProfit !== undefined ? lastTakeProfit : tp || tpFromSignal;
    const finalPrice = priceFromSignal;
    const finalStatus = statusFromSignal;

    const shouldUpdate =
      finalSl !== undefined || finalTp !== undefined || finalPrice !== undefined || finalStatus !== undefined;

    if (shouldUpdate) {
      setValue('sl', finalSl !== undefined ? String(finalSl) : '', {
        shouldValidate: true
      });

      setValue('tp', finalTp !== undefined ? String(finalTp) : '', {
        shouldValidate: true
      });

      if (finalStatus !== 9) {
        setValue('price', finalPrice !== undefined ? String(finalPrice) : '', { shouldValidate: true });
      }
      trigger('sl');
      trigger('tp');
    }

    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [signalData?.Report, lastStopLoss, lastTakeProfit, setValue, setDate, sl, tp]);

  useEffect(() => {
    if (!visible) return;
    if (selectedOrderType !== 'pending_order') {
      setTimeout(() => {
        trigger(['sl', 'tp'])
      }, 1000);
      return
    };

    trigger(['tp', 'sl']);
  }, [formValues.price, selectedOrderType, visible, trigger]);

  const getPriceForLimits = useCallback(() => {
    if (selectedOrderType === 'pending_order') {
      return Number(getValues('price') || 0);
    }

    const live = tick ?? 0;
    const rest = entry
      ? profitSymbolLastTick.data?.bid ?? 0
      : profitSymbolLastTick.data?.ask ?? 0;

    return live || rest;
  }, [
    selectedOrderType,
    tick,
    entry,
    profitSymbolLastTick.data?.ask,
    profitSymbolLastTick.data?.bid,
    getValues,
  ]);

  //TODO: Signal info prices was disabled for now. talked with @Levon.

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
        enableDynamicSizing={true}
      >
        {showGuidance ? (
          <OpenPositionGuidance
            equity={tradingAccount?.equity || 0}
            isAuthorized={isAuthorized}
            isVerified={userInfo.isVerified}
            firstDepositDate={userInfo.firstDepositDate}
            lastTradedAt={userInfo.lastTradedAt}
            onGoTransfer={onGoTransfer}
            onGoDeposit={onGoDeposit}
            onGoVerification={goToVerification}
            onLoginPress={onLoginPress}
          />
        ) : (
          <BottomSheetScrollView contentContainerStyle={styles.sheetContainer}>
            <OpenPositionHeader
              digits={symbolConfig.digits || 0}
              entry={entry}
              selectedOrderType={selectedOrderType}
              asset={asset}
              isSelectorDisabled={!!scheduleData?.timeToOpen || !!signalData}
              onChangeOrderType={onChangeOrderType}
              tick={tick}
            />
            {timeSchedule}
            <OpenPositionAmountSection
              control={control}
              errors={errors}
              isMarketOrder={isMarketOrder}
              tradingAccountHasBalance={!!tradingAccount?.balance}
              assetUnit={assetUnit}
              limits={limits}
              formattedMin={formattedMin}
              formattedMax={formattedMax}
              limitsLoading={limitsResponse.isLoading}
              assetUnitOfMeasureDigits={assetUnitOfMeasureDigits}
              selectedAmount={selectedAmount}
              setAmount={setAmount}
              calculateMarginDebounce={calculateMarginDebounce}
              setMaxVolume={setMaxVolume}
              onAmountSelect={onAmountSelect}
              renderLoader={renderLoader}
            />
            {!isMarketOrder && !signalData && (
              <PendingOrderSection
                control={control}
                errors={errors}
                entry={entry}
                selectedDate={selectedDate}
                onSelectDate={goToSelectDate}
                onClearDate={setEmptyDate}
              />
            )}
            <Animated.View layout={LinearTransition} style={styles.separator} />
            <LimitsSection
              control={control}
              getValues={getValues}
              entry={entry}
              getPriceForLimits={getPriceForLimits}
              stopsLevel={symbolConfig?.stopsLevel ?? 0}
              point={symbolConfig?.point ?? 0}
              symbolDigits={symbolConfig?.digits || 0}
              formValues={formValues}
              onSwitchChange={onSwitchChange}
            />
            <Animated.View layout={LinearTransition} style={styles.separator} />
            <OpenPositionSummarySection
              summaryKey={isMarketOrder ? `${!!(selectedAmount || formValues.volume)}` : selectedOrderType}
              isMarketOrder={isMarketOrder}
              hasAmount={!!(selectedAmount || formValues.volume)}
              assetUnit={assetUnit}
              marginLoading={calculateMarginResponse.isLoading}
              marginValue={calculateMarginResponse.data?.margin}
              positionValue={calculateMarginResponse.data?.value}
              disableAction={disableAction}
              handleSubmit={handleSubmit}
              onSubmit={sendRequest}
              isBuyAction={isBuyAction}
              actionButtonText={actionButtonText}
              isSubmitting={profitSymbolLastTick.isFetching || response.isLoading || placeOrderResponse.isLoading}
            />
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>
      <PositionModal onTryAgain={onTryAgain} ref={positionModalRef} positionRef={BottomSheetRef} />
      <SingleDateSelector
        onDismiss={onDismissDate}
        onSubmit={onDateSubmit}
        visible={dateIsOpen}
        date={selectedDate}
        title={t('navigation.select-date')}
      />
    </>
  );
};

export default memo(OpenPosition);

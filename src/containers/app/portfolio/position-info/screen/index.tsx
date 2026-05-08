import React, { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { useTheme, ParamListBase, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BackHandler, Dimensions, InteractionManager, Keyboard, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { PORTFOLIO_ROUTE_NAMES, IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { PORTFOLIO_TAB_ROUTE_NAMES } from '@/containers/app/portfolio/portfolio/screen';
import { useAppDispatch, useAppSelector, useRate } from '@/hooks';
import getSymbolFromCurrency from 'currency-symbol-map';
import {
  useClosePositionMutation,
  useDeletePendingOrderQuery,
  useEditPendingOrderMutation,
  useEditPositionMutation,
  useGetSymbolLastTickQuery
} from '@/store/api';
import {
  BaseLoader,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseText,
  BaseTextVariant,
  DeleteBottomSheetContent,
  ClosePositionContent,
  BaseBackButton,
  SheetBackdrop
} from '@/components';
import { useTranslation } from 'react-i18next';
import { BaseTextVariantValue } from '@/components/atoms/text';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import EditPosition from '../components/edit-position';
import { images } from '@/assets';
import { DealsInfo, PendingOrder, Position, SymbolConfig, SymbolLastTick } from '@/store/slices/portfolio/types';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import dateHelper from '@/helpers/dateHelper';
import { actions } from '@/store';
import { debounce } from 'throttle-debounce';
import { useNetwork } from '@/providers';
import { jsonParse, formatNumberToAmount, getAssetName, formatTwoDecimals } from '@/helpers';
import { testIDs } from '@/constants';
import dayjs from 'dayjs';
import useStyles from './styles';

const {
  application: { openModal },
  portfolio: { setActiveTab, setLastValues }
} = actions;

type PositionInfoScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.PositionInfo>;

const TRADING_ACCOUNT_CURRENCY = 'USD'; /*** PROVIDE HERE SELECTED ACCOUNT CURRENCY ***/

interface PositionInfoScreenData extends PositionInfoScreenProps {
  data: Partial<Position & PendingOrder & DealsInfo & { priceClose: number; timeClose: number }>;
  getData: () => Promise<void>;
  loading: boolean;
  symbolConfigData: SymbolConfig | undefined;
  symbolLastTickData: SymbolLastTick | undefined;
  positionData: Position | undefined;
  orderData: PendingOrder | undefined;
}

const calculateLimits = (action?: number, bid = 0, ask = 0, stopsLevel = 0, point = 0) => {
  let takeProfit = 0;
  let stopLoss = 0;

  if (action === null || action === undefined) {
    return { takeProfit, stopLoss };
  }

  if (action === 0) {
    takeProfit = bid + stopsLevel * point;
    stopLoss = bid - stopsLevel * point;
  } else {
    takeProfit = ask - stopsLevel * point;
    stopLoss = ask + stopsLevel * point;
  }

  return { takeProfit, stopLoss };
};

const { width, height } = Dimensions.get('window');

const PositionInfoScreen: React.FC<PositionInfoScreenData> = ({
  navigation,
  route,
  getData,
  data,
  loading,
  symbolConfigData,
  symbolLastTickData,
  positionData,
  orderData
}) => {
  const { params } = route || {};
  const {
    closedPositionId,
    positionId,
    positionTicket = 0,
    title = '',
    isPosition,
    isClosed,
    account: positionAccount
  } = params || {};

  const dispatch = useAppDispatch();

  const { websocket, isReadyState } = useNetwork();

  const { requestReview } = useRate();

  const [fetching, setFetching] = useState<boolean>(Boolean(loading));

  const [liveAsk, setLiveAsk] = useState<number | undefined>(undefined);
  const [liveBid, setLiveBid] = useState<number | undefined>(undefined);

  const [liveCurrencyAveragePrice, setLiveCurrencyAveragePrice] = useState<number | undefined>(undefined);

  const [profitSymbol, setProfitSymbol] = useState<string | undefined>(undefined);
  const [profitSymbolDirect, setProfitSymbolDirect] = useState<boolean | undefined>(undefined);

  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = websocket && pageIsFocused && isReadyState && !isClosed;

  const BottomSheetRef = useRef<BottomSheetModal>(null);
  const EditBottomSheetRef = useRef<BottomSheetModal>(null);
  const DeleteBottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetState = useRef<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { selectedAccount: selectedStoreAccount = 0, tradingAssets } = portfolio || {};
  const selectedAccount = positionAccount || selectedStoreAccount;

  const wallet = useAppSelector((state) => state.wallet);
  const { tradingAccounts = [] } = wallet || {};

  const [editPosition, editPositionResponse] = useEditPositionMutation();
  const [editPendingOrder, editPendingOrderResponse] = useEditPendingOrderMutation();

  const [closePosition, closePositionResponse] = useClosePositionMutation();
  const [deletePendingOrder, { isLoading: isDeleteLoading }] = useDeletePendingOrderQuery();

  const [getProfitSymbolLastTick, profitSymbolLastTick] = useGetSymbolLastTickQuery();
  const { data: profitSymbolLastTickData } = profitSymbolLastTick || {};

  const theme = useTheme();
  const styles = useStyles(theme);

  const { t } = useTranslation();

  const {
    dark,
    palette: { graphite, red }
  } = theme;

  useEffect(() => {
    setFetching(Boolean(loading));
  }, [loading]);

  const setInitialState = () => {
    setLiveAsk(undefined);
    setLiveBid(undefined);
    setLiveCurrencyAveragePrice(undefined);
    setProfitSymbol(undefined);
    setProfitSymbolDirect(undefined);
  };

  const goToHistory = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Portfolio,
      params: {
        screen: PORTFOLIO_ROUTE_NAMES.Portfolio,
        params: {
          screen: PORTFOLIO_TAB_ROUTE_NAMES.History
        }
      }
    });
  };

  const goToOverview = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Portfolio,
      params: {
        screen: PORTFOLIO_ROUTE_NAMES.Portfolio,
        params: {
          screen: PORTFOLIO_TAB_ROUTE_NAMES.Overview
        }
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
      };
    }, [navigation, route])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: getAssetName(title),
      headerStyle: styles.headerStyle,
      headerTitleStyle: styles.headerTitle,
      headerLeft: () => (
        <View>
          <BaseBackButton
            customBack={() => {
              dispatch(setLastValues(undefined));
              if (navigation.isFocused() && navigation.canGoBack()) {
                return navigation.goBack();
              } else if (closedPositionId) {
                dispatch(setActiveTab(3));
                return goToHistory();
              } else {
                dispatch(setActiveTab(0));
                return goToOverview();
              }
            }}
            isChevron={false}
          />
        </View>
      )
    });

    return () => {
      navigation.setOptions({
        headerTitle: ''
      });
    };
  }, [title, navigation]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    getData();
  }, [editPositionResponse.isSuccess]);

  const checkProfitCurrency = () => {
    if (isClosed || data === undefined || tradingAssets.length === 0) {
      return;
    }

    const { currencyProfit } = data || {};

    if (!currencyProfit) {
      return;
    }

    const directPair = `${currencyProfit}${TRADING_ACCOUNT_CURRENCY}`.toUpperCase(); //JPYUSD
    const reversePair = `${TRADING_ACCOUNT_CURRENCY}${currencyProfit}`.toUpperCase(); //USDJPY

    const currencyProfitDirectPair = tradingAssets.find((asset) => asset.systemName === directPair);
    const currencyProfitReversePair = tradingAssets.find((asset) => asset.systemName === reversePair); //HERE WE TRY TO FIND

    const currencyProfitSymbol = currencyProfitDirectPair?.systemName || currencyProfitReversePair?.systemName;
    const currencyProfitSymbolDirect = Boolean(currencyProfitDirectPair?.systemName);

    if (currencyProfitSymbol) {
      setProfitSymbol(currencyProfitSymbol);
      setProfitSymbolDirect(currencyProfitSymbolDirect);
    }
  };

  useEffect(() => {
    checkProfitCurrency();
  }, [data, tradingAssets, isClosed]);

  const getProfitSymbolLastTickHandler = async () => {
    if (!selectedAccount || !profitSymbol) {
      return;
    }
    try {
      await getProfitSymbolLastTick({ symbol: profitSymbol, accountId: selectedAccount });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProfitSymbolLastTickHandler();
  }, [profitSymbol, selectedAccount]);

  const debounceSetData = useCallback(
    (askPrice: number, bidPrice: number) => {
      if (!enabledHandleMessage) {
        return;
      }

      if (askPrice) {
        setLiveAsk(askPrice);
      }
      if (bidPrice) {
        setLiveBid(bidPrice);
      }

      // console.log('*************** setLivePrice', askPrice, bidPrice)
    },
    [enabledHandleMessage, setLiveBid, setLiveAsk]
  );

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

  const setData = debounce(250, debounceSetData);
  const setCurrencyData = debounce(250, debounceSetCurrencyData);

  const subscribeWebsocket = useCallback(() => {
    const { symbol } = data || {};

    if (!enabledHandleMessage || !symbol) {
      setData.cancel();
      setCurrencyData.cancel();
      return;
    }

    const symbolsList = [symbol];

    if (profitSymbol) {
      symbolsList.push(profitSymbol);
    }

    websocket.send(`unsubscribe ALL`);

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

      // console.log('wsData', wsData)

      if (dataSymbol === symbol) {
        setData(dataAsk, dataBid);
      }

      if (profitSymbol && dataSymbol === profitSymbol) {
        setCurrencyData(dataAsk, dataBid);
      }
    });

    websocket.send(`subscribe ${symbolsList.join(' ')}`);
  }, [enabledHandleMessage, data, profitSymbol]);

  const unsubscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }

    setData.cancel();
    setCurrencyData.cancel();

    websocket.send(`unsubscribe ALL`);
  }, [enabledHandleMessage, setData, setCurrencyData]);

  useFocusEffect(
    useCallback(() => {
      subscribeWebsocket();
      return () => {
        unsubscribeWebsocket();
      };
    }, [navigation, route, enabledHandleMessage, data, profitSymbol])
  );

  const getDate = (date: string | number | undefined) => {
    if (!date) return date;
    return dayjs(date).format('HH:mm, DD/MM/YYYY');
  };

  const redColor = red['600'];
  const greenColor = '#159D55';

  const handleValue = (value: number | undefined, digits?: number) => {
    if (value === undefined) return value;
    if (value === 0) return `$${Math.abs(value)}`;
    return `${value > 0 ? '+' : '-'}$${digits ? Math.abs(value).toFixed(digits) : Math.abs(value)}`;
  };

  const handleColor = (value: number | undefined | null) => {
    if (value === undefined || value === 0 || value === null) return graphite['900'];
    return value > 0 ? greenColor : redColor;
  };

  const handleAction = (action: number | undefined, isP: boolean = true) => {
    if (action === undefined) return '';
    if (isP) return action === 0 ? t('screens.portfolio.bought') : t('screens.portfolio.sold');
    if (action === 8) return t('screens.portfolio.to-close');
    return action % 2 === 0 ? t('screens.portfolio.to-buy') : t('screens.portfolio.to-sell');
  };
  const handleActionButton = (action: number | undefined) =>
    action === 0 ? t('screens.portfolio.sell') : t('screens.portfolio.buy');

  const handleSuccessAction = (action: number | undefined) =>
    action === 0 ? t('screens.portfolio.sold').toLowerCase() : t('screens.portfolio.bought').toLowerCase();

  const handleActionAccessibilityLabel = (action: number | undefined) =>
    action === 0 ? testIDs.portfolio.positionDetails.buttonSell : testIDs.portfolio.positionDetails.buttonBuy;

  const positionValue = (
    volume: number | undefined,
    contractSize: number | undefined,
    priceCurrent: number | undefined
  ) => {
    if (volume === undefined || contractSize === undefined || priceCurrent === undefined) return undefined;
    return volume * contractSize * priceCurrent;
  };

  const priceSLAndTP = (value: number | undefined) => {
    if (value === undefined || value === 0) return undefined;
    return value;
  };

  const currentValue = (volume: number | undefined, contractSize: number | undefined) => {
    if (volume === undefined || contractSize === undefined) return 0;
    return volume * contractSize;
  };

  const position = useMemo(() => {
    if (!data) return {};

    const symbol = data.symbol || title;
    const assetUnit =
      tradingAssets.find((item: ParsedTradingAssets) => item.systemName === symbol)?.assetUnitOfMeasure || '';
    const assetUnitOfMeasureDigits =
      tradingAssets.find((item: ParsedTradingAssets) => item.systemName === symbol)?.assetUnitOfMeasureDigits || 2;
    const profit = data.profit;

    if (isClosed) {
      const handleClosedAction = (action: number | undefined) => {
        if (action === undefined) return '';
        else if (action === 0) return t('screens.portfolio.sold');
        else if (action === 1) return t('screens.portfolio.bought');
      };

      return {
        direction: handleClosedAction(data.action),
        positionSize: currentValue(positionId ? data.Volume : data.VolumeClosed, data.contractSize),
        assetUnit,
        storage: data.storage,
        assetUnitOfMeasureDigits,
        priceOpen: (positionId ? data.priceOpen : data.pricePosition) || 0,
        profit: handleValue(profit, 2),
        profitColor: handleColor(profit),
        price: positionId ? data.priceClose : data.price,
        priceSL: priceSLAndTP(data.priceSL),
        priceTP: priceSLAndTP(data.priceTP),
        timeCreate: getDate(data.timeCreate),
        time: getDate(positionId ? data.timeClose : data.time),
        positionID: data.positionId || positionId,
        timeOpened: getDate(positionId ? data.timeCreate : data.timeOpened)
      };
    }

    const action = isPosition ? data.action : data.type;

    const positionSize: number = currentValue(data.Volume || data.VolumeInitial, data.contractSize);
    const volumeMin = symbolConfigData?.volumeMinExt;
    const volumeStep = symbolConfigData?.volumestepExt;

    return {
      direction: handleAction(action, isPosition),
      symbol,
      positionSize,
      assetUnit,
      storage: data.storage,
      assetUnitOfMeasureDigits,
      priceOpen: data.priceOpen,
      profitColor: handleColor(profit),
      profit: handleValue(profit),
      positionValue: isPosition
        ? positionValue(data.Volume, data.contractSize, data.priceCurrent)
        : positionValue(data.VolumeInitial, data.contractSize, data.priceOrder),
      priceCurrent: data.priceCurrent,
      priceSL: priceSLAndTP(data.priceSL),
      priceTP: priceSLAndTP(data.priceTP),
      openDate: getDate(data.timeCreate),
      positionID: data.expertPositionId,
      action: isPosition ? handleActionButton(action) : t('screens.portfolio.delete'),
      accessibilityLabel: isPosition
        ? handleActionAccessibilityLabel(action)
        : testIDs.portfolio.positionDetails.buttonDelete,
      successAction: handleSuccessAction(action),
      timeSetup: getDate(data.timeSetup),
      timeExpiration: getDate(data.timeExpiration),
      orderID: positionTicket,
      priceOrder: data.priceOrder || 0,
      volumeMin,
      volumeStep,
      contractSize: data?.contractSize || 0,
      actionNumber: typeof action === 'number' ? action % 2 : 0
    };
  }, [data, tradingAssets, title, isPosition, dark, positionTicket, symbolConfigData, isClosed, t, positionId]);

  const currentPositionValue = useMemo(() => {
    if (!isPosition || positionData === undefined) {
      return null;
    }

    const { action, Volume, contractSize, priceCurrent } = positionData || {};

    let priceCurrentValue = priceCurrent;

    if (action === 0 && liveAsk) {
      priceCurrentValue = liveAsk;
    }
    if (action === 1 && liveBid) {
      priceCurrentValue = liveBid;
    }

    let positionValueData = Volume * contractSize * priceCurrentValue;

    const { bid: lastTickBid, ask: lastTickAsk } = profitSymbolLastTickData || {};

    if (profitSymbol && lastTickBid && lastTickAsk) {
      const currencyAveragePrice = (lastTickBid + lastTickAsk) / 2;

      const averagePrice = liveCurrencyAveragePrice || currencyAveragePrice;

      positionValueData = profitSymbolDirect ? positionValueData * averagePrice : positionValueData / averagePrice;
    }

    const roundedPositionValue = Math.round(positionValueData * 100) / 100;

    return roundedPositionValue;
  }, [
    liveAsk,
    liveBid,
    liveCurrencyAveragePrice,
    profitSymbol,
    profitSymbolDirect,
    profitSymbolLastTickData,
    positionData,
    isPosition
  ]);

  const currentOrderValue = useMemo(() => {
    if (
      isPosition ||
      orderData === undefined ||
      (profitSymbol && profitSymbolLastTickData === undefined) ||
      profitSymbolLastTick.isLoading
    ) {
      return null;
    }

    const { type, VolumeInitial, contractSize, priceOrder } = orderData || {};

    let priceCurrentValue = priceOrder;

    if (type % 2 === 0 && liveAsk) {
      priceCurrentValue = liveAsk;
    }
    if (type % 2 !== 0 && liveBid) {
      priceCurrentValue = liveBid;
    }

    let positionValueData = VolumeInitial * contractSize * priceCurrentValue;

    const { bid: lastTickBid, ask: lastTickAsk } = profitSymbolLastTickData || {};

    if (lastTickBid && lastTickAsk && profitSymbol) {
      const currencyAveragePrice = (lastTickBid + lastTickAsk) / 2;

      const averagePrice = liveCurrencyAveragePrice || currencyAveragePrice;

      positionValueData = profitSymbolDirect ? positionValueData * averagePrice : positionValueData / averagePrice;
    }

    const roundedPositionValue = Math.round(positionValueData * 100) / 100;

    return roundedPositionValue;
  }, [
    liveAsk,
    liveBid,
    liveCurrencyAveragePrice,
    profitSymbol,
    profitSymbolDirect,
    profitSymbolLastTick,
    profitSymbolLastTickData,
    orderData,
    isPosition
  ]);

  const formattedCurrentPositionValue = useMemo(() => {
    if (!currentPositionValue) {
      return null;
    }

    const formatPositionValue = formatNumberToAmount(currentPositionValue.toFixed(2));

    return `$${formatPositionValue}`;
  }, [currentPositionValue]);

  const formattedCurrentOrderValue = useMemo(() => {
    if (!currentOrderValue) {
      return null;
    }

    const formatPositionValue = formatNumberToAmount(currentOrderValue.toFixed(2));

    return `$${formatPositionValue}`;
  }, [currentOrderValue]);

  const currentPrice = useMemo(() => {
    if (data === undefined) {
      return null;
    }

    const { digits = 0, priceCurrent } = data || {};

    if (liveAsk && liveBid) {
      return ((liveAsk + liveBid) / 2).toFixed(digits);
    }

    if (priceCurrent) {
      return priceCurrent.toFixed(digits);
    }
  }, [liveAsk, liveBid, data]);

  const currentPnL = useMemo(() => {
    if (!isPosition || positionData === undefined) {
      return null;
    }

    const { profit = 0, action, priceOpen, Volume, contractSize } = positionData || {};

    let currentProfit = profit;

    if (action === 0 && liveBid) {
      currentProfit = (liveBid - priceOpen) * Volume * contractSize;

      if (profitSymbol && liveCurrencyAveragePrice) {
        /*** We should convert into profit currency ***/
        currentProfit = profitSymbolDirect
          ? currentProfit * liveCurrencyAveragePrice
          : currentProfit / liveCurrencyAveragePrice; //liveCurrencyAveragePrice = (ask + bid) /2
      }
    } else if (action === 1 && liveAsk) {
      currentProfit = (priceOpen - liveAsk) * Volume * contractSize;

      if (profitSymbol && liveCurrencyAveragePrice) {
        /*** We should convert into profit currency ***/
        currentProfit = profitSymbolDirect
          ? currentProfit * liveCurrencyAveragePrice
          : currentProfit / liveCurrencyAveragePrice; //liveCurrencyAveragePrice = (ask + bid) /2
      }
    }

    const roundedCurrentProfit = Math.round(Number(currentProfit) * 100) / 100;

    return roundedCurrentProfit;
  }, [liveAsk, liveBid, liveCurrencyAveragePrice, isPosition, positionData, profitSymbol, profitSymbolDirect]);

  const currentPnLColor = useMemo(() => {
    return handleColor(currentPnL);
  }, [currentPnL]);

  const formattedCurrentPnL = useMemo(() => {
    if (currentPnL === null) {
      return null;
    }
    return handleValue(currentPnL);
  }, [currentPnL]);

  const Item = useCallback(
    ({
      field,
      value,
      variant = BaseTextVariant.small,
      color = graphite['900']
    }: {
      field: string;
      value: string | number | undefined | null;
      variant?: BaseTextVariantValue;
      color?: string;
    }) => {
      return (
        <View style={styles.item}>
          <BaseText style={styles.field} variant={BaseTextVariant.small}>
            {field}
          </BaseText>
          <BaseText style={{ color }} variant={variant}>
            {value ?? '——'}
          </BaseText>
        </View>
      );
    },
    [dark]
  );

  const onEditButtonPress = useCallback(() => {
    if (!selectedAccount) {
      return;
    }
    EditBottomSheetRef.current?.[sheetState.current ? 'dismiss' : 'present']();
    if (Keyboard.isVisible()) setTimeout(Keyboard.dismiss, 250);
  }, [data?.symbol, selectedAccount]);

  const handleEditPosition = (stopLoss: number, takeProfit: number, price?: string, date?: Date | null | undefined) => {
    if (!selectedAccount) {
      return;
    }

    if (isPosition) {
      editPosition({
        accountId: selectedAccount,
        ticket: positionTicket,
        stopLoss,
        takeProfit
      });
    } else {
      const timeStamp = dateHelper.toTimestamp(date);

      editPendingOrder({
        accountId: selectedAccount,
        orderId: positionTicket,
        priceStopLoss: +stopLoss || 0,
        priceTakeProfit: +takeProfit || 0,
        expirationTime: timeStamp || 0,
        price: price?.trim?.() === '' ? 0 : +(price || 0)
      }).unwrap();
    }
    EditBottomSheetRef.current?.dismiss();
  };

  const onClose = useCallback(() => {
    sheetState.current = false;
    if (Keyboard.isVisible()) Keyboard.dismiss();
  }, []);
  const onOpen = useCallback(() => (sheetState.current = true), []);

  const editOnClose = useCallback(() => {
    setIsEditOpen(false);
    onClose();
  }, []);

  const editOnOpen = useCallback(() => {
    setIsEditOpen(true);
    onOpen();
  }, []);

  const onActionButtonPress = useCallback(() => {
    BottomSheetRef.current?.[sheetState.current ? 'dismiss' : 'present']();
    if (Keyboard.isVisible()) setTimeout(Keyboard.dismiss, 250);
  }, []);

  const onDeleteButtonPress = useCallback(() => {
    DeleteBottomSheetRef.current?.[sheetState.current ? 'dismiss' : 'present']();
    if (Keyboard.isVisible()) setTimeout(Keyboard.dismiss, 250);
  }, []);

  const closeDeleteBottomSheet = () => {
    DeleteBottomSheetRef.current?.dismiss();
  };

  const deleteActionDesc =
    data?.type && data?.type % 2 === 0 ? t('screens.position-info.buy') : t('screens.position-info.sell');

  const gotToOrdersWithConfirm = () => {
    //@ts-ignore
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Portfolio,
      params: {
        screen: PORTFOLIO_ROUTE_NAMES.Portfolio,
        params: {
          confirmation: {
            title: t('screens.position-info.delete-confirm', {
              action: deleteActionDesc,
              asset: position.symbol,
              price: position.priceOrder
            }),
            label: t('screens.position-info.explore-ideas'),
            onPress: backToIdeas
          }
        },
        merge: true
      }
    });
  };

  const deletePendingOrderHandler = async () => {
    if (!selectedAccount || positionTicket === undefined) {
      return;
    }

    try {
      await deletePendingOrder({ accountId: selectedAccount, orderId: positionTicket });
      gotToOrdersWithConfirm();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const accountCurrency = useMemo(() => {
    const tradingAccount = tradingAccounts.find((el) => el?.login === String(selectedAccount));
    const { currency: accountCurrency = 'USD' } = tradingAccount || {};
    return accountCurrency;
  }, [tradingAccounts]);

  const onConfirmButtonPress = useCallback(
    (volumeClose: number, isFullClose: boolean) => {
      const isVisibleKeyboard = Keyboard.isVisible();
      const timeout = isVisibleKeyboard ? 350 : 0;
      if (isVisibleKeyboard) Keyboard.dismiss();
      setTimeout(async () => {
        BottomSheetRef.current?.dismiss();
        if (closePositionResponse.isLoading) return;
        await closePosition({
          accountId: Number(selectedAccount),
          partialClosingVolume: isFullClose ? undefined : volumeClose,
          positionId: positionTicket
        })
          .unwrap()
          .then((data) => {
            if (data?.isSuccess) {
              const { price = 0, profit = 0 } = data || {};

              const profitRate = profit > 0 ? requestReview : undefined;
              const priceValue = price.toFixed(symbolConfigData?.digits || 0);
              const profitValue = Math.abs(profit);
              const profitStyle = { color: profit < 0 ? redColor : greenColor };
              const profitDesc =
                profit < 0 ? t('screens.position-info.you-made-loss') : t('screens.position-info.you-made-profit');
              const profitCurrency = getSymbolFromCurrency(accountCurrency);

              const subTitle = (
                <Fragment>
                  {profitDesc}
                  {` `}
                  <BaseText style={profitStyle} variant={BaseTextVariant.captionSemiBold}>
                    {profitCurrency}
                    {profitValue.toFixed(2)}
                  </BaseText>
                </Fragment>
              );

              showSuccessPopUp(
                t('screens.create-position-details.action-by-price-item', {
                  action: position.successAction,
                  volume: (volumeClose * (position.contractSize || 0)).toFixed(position.assetUnitOfMeasureDigits),
                  asset: getAssetName(title),
                  assetUnit: position.assetUnit,
                  price: priceValue
                }),
                subTitle,
                profitRate,
                testIDs.positionDetails.createPosition.successPopUp
              );
            } else {
              showErrorPopUp();
            }
          });
      }, timeout);
    },
    [
      requestReview,
      t,
      redColor,
      greenColor,
      accountCurrency,
      selectedAccount,
      positionTicket,
      closePositionResponse.isLoading,
      title,
      position.positionValue,
      symbolConfigData?.digits,
      position.successAction,
      position.contractSize
    ]
  );

  const backToIdeas = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }

    InteractionManager.runAfterInteractions(() => {
      //@ts-ignore
      navigation.navigate(ROOT_ROUTE_NAMES.App, {
        screen: APP_ROUTE_NAMES.Pulse,
        params: {
          screen: PULSEAI_ROUTE_NAMES.PulseAI
        }
      });
    });
  }, [navigation]);

  const getLimits = useCallback(
    (price = 0) => {
      return calculateLimits(
        isPosition ? data?.action : position.actionNumber,
        isPosition ? symbolLastTickData?.bid : price,
        isPosition ? symbolLastTickData?.ask : price,
        symbolConfigData?.stopsLevel,
        symbolConfigData?.point
      );
    },
    [
      isPosition,
      data?.action,
      position.actionNumber,
      symbolLastTickData?.bid,
      symbolLastTickData?.ask,
      symbolConfigData?.stopsLevel,
      symbolConfigData?.point
    ]
  );

  const showErrorPopUp = useCallback(() => {
    dispatch(
      openModal({
        title: t('errors.modal-error-title'),
        subTitle: t('errors.modal-error-subtitle'),
        icon: images.depositError,
        iconSize: {
          width: 96,
          height: 90
        },
        button: {
          text: t('errors.modal-got-it')
        }
      })
    );
  }, [t]);

  const showSuccessPopUp = useCallback(
    (title: string, subTitle?: string | ReactNode, onClosed?: () => Promise<boolean>, testID?: string) => {
      dispatch(
        openModal({
          title,
          ...(subTitle && { subTitle }),
          icon: images.successArrow,
          onClosed: async () => {
            if (onClosed && typeof onClosed === 'function') {
              await onClosed();
            }

            navigation.goBack();
          },
          testID,
          iconSize: {
            width: 115,
            height: 90
          },
          button: {
            text: t('screens.position-info.explore-ideas'),
            onPress: backToIdeas
          }
        })
      );
    },
    [t]
  );

  useEffect(() => {
    if (closePositionResponse.isError || editPendingOrderResponse.isError) {
      showErrorPopUp();
    }
  }, [closePositionResponse.isError, editPendingOrderResponse.isError]);

  useEffect(() => {
    if (editPendingOrderResponse.isSuccess) {
      showSuccessPopUp(t('screens.position-info.your-order-updated'));
    }
  }, [editPendingOrderResponse.isSuccess]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetState.current) {
        BottomSheetRef.current?.dismiss();
      } else {
        dispatch(setLastValues(undefined));
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else if (closedPositionId) {
          dispatch(setActiveTab(3));
          goToHistory();
        } else {
          dispatch(setActiveTab(0));
          goToOverview();
        }
      }
      return true;
    });

    return backHandler.remove;
  }, []);

  const positionSwap = useMemo(() => {
    const swap = position.storage || 0;
    const sign = swap < 0 ? '-' : '';

    return `${sign}$${Math.abs(swap).toFixed(2)}`;
  }, [position.storage]);

  const ContainerItems = useCallback(() => {
    if (isClosed) {
      return (
        <>
          <Item
            color={position.profitColor}
            variant={BaseTextVariant.textSemiBold}
            field={t('screens.portfolio.just-pnl')}
            value={formatTwoDecimals(position.profit)}
          />
          <Item
            variant={BaseTextVariant.textSemiBold}
            field={t('screens.portfolio.close-price')}
            value={formatTwoDecimals(position.price?.toFixed(symbolConfigData?.digits))}
          />
          <Item
            field={t('screens.portfolio.stop-loss')}
            value={formatTwoDecimals(position.priceSL?.toFixed(symbolConfigData?.digits))}
          />
          <Item
            field={t('screens.portfolio.take-profit')}
            value={formatTwoDecimals(position.priceTP?.toFixed(symbolConfigData?.digits))}
          />
          <Item field={t('screens.portfolio.swaps')} value={positionSwap} />
          <Item field={t('screens.portfolio.open-date')} value={position.timeOpened} />
          <Item field={t('screens.portfolio.close-date')} value={position.time} />
          <Item field={t('screens.portfolio.position-id')} value={position.positionID} />
        </>
      );
    } else if (isPosition) {
      return (
        <>
          <Item
            color={currentPnLColor}
            variant={BaseTextVariant.textSemiBold}
            field={t('screens.portfolio.just-pnl')}
            value={formattedCurrentPnL}
          />
          <Item
            variant={BaseTextVariant.textSemiBold}
            field={t('screens.portfolio.position-value')}
            value={formattedCurrentPositionValue}
          />
          <Item field={t('screens.portfolio.current-price')} value={formatTwoDecimals(currentPrice)} />
          <Item
            field={t('screens.portfolio.stop-loss')}
            value={formatTwoDecimals(position.priceSL?.toFixed(symbolConfigData?.digits))}
          />
          <Item
            field={t('screens.portfolio.take-profit')}
            value={formatTwoDecimals(position.priceTP?.toFixed(symbolConfigData?.digits))}
          />
          <Item field={t('screens.portfolio.swaps')} value={positionSwap} />
          <Item field={t('screens.portfolio.open-date')} value={position.openDate} />
          <Item field={t('screens.portfolio.position-id')} value={position.positionID} />
        </>
      );
    }
    return (
      <>
        <Item
          variant={BaseTextVariant.textSemiBold}
          field={t('screens.portfolio.order-value')}
          value={formattedCurrentOrderValue}
        />
        <Item field={t('screens.portfolio.current-price')} value={currentPrice} />
        <Item
          field={t('screens.portfolio.stop-loss')}
          value={formatTwoDecimals(position.priceSL?.toFixed(symbolConfigData?.digits))}
        />
        <Item
          field={t('screens.portfolio.take-profit')}
          value={formatTwoDecimals(position.priceTP?.toFixed(symbolConfigData?.digits))}
        />
        <Item field={t('screens.portfolio.open-date')} value={position.timeSetup} />
        <Item field={t('screens.portfolio.valid-till')} value={position.timeExpiration} />
        <Item field={t('screens.portfolio.order-id')} value={position.orderID} />
      </>
    );
  }, [
    isPosition,
    position,
    isClosed,
    currentPrice,
    formattedCurrentPnL,
    formattedCurrentPositionValue,
    formattedCurrentOrderValue,
    positionSwap,
    t
  ]);

  if (fetching) {
    const btnLoaderHeight = (width - 56) / 2;

    return (
      <SafeAreaView style={styles.safe}>
        <ContentLoader
          speed={2}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={theme.palette.graphite['050']}
        >
          <Rect x={20} y={26} width={100} height={31} rx={4} ry={4} />
          <Rect x={20} y={64} width={100} height={22} rx={4} ry={4} />
          <Rect x={width - 120} y={64} width={100} height={22} rx={4} ry={4} />
          <Rect x={20} y={111} width={width - 40} rx={12} ry={12} height={420} />
          <Rect x={20} y={558} width={btnLoaderHeight} height={34} rx={4} ry={4} />
          <Rect x={width - (20 + btnLoaderHeight)} y={558} width={btnLoaderHeight} height={34} rx={4} ry={4} />
        </ContentLoader>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
        <View style={styles.head}>
          <BaseText variant={BaseTextVariant.title}>{position.direction}</BaseText>
          <View style={styles.second}>
            <View style={styles.shares}>
              <BaseText>
                {formatTwoDecimals(position.positionSize?.toFixed(position.assetUnitOfMeasureDigits))}{' '}
                {position.assetUnit}
              </BaseText>
            </View>
            <BaseText variant={BaseTextVariant.textSemiBold}>
              <BaseText style={styles.at} variant={BaseTextVariant.small}>
                @
              </BaseText>{' '}
              {formatTwoDecimals(
                (isPosition ? position.priceOpen : position.priceOrder)?.toFixed(symbolConfigData?.digits)
              )}
            </BaseText>
          </View>
        </View>
        <View style={styles.container}>
          <ContainerItems />
        </View>
        {isClosed || (
          <View style={styles.btnContainer}>
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.small}
              style={styles.editBtn}
              labelStyle={styles.edit}
              onPress={onEditButtonPress}
              label={t('screens.portfolio.edit')}
              accessibilityValue={{
                text: testIDs.portfolio.positionDetails.buttonEdit
              }}
              accessibilityLabel={testIDs.portfolio.positionDetails.buttonEdit}
              accessible={true}
              testID={testIDs.portfolio.positionDetails.buttonEdit}
            />
            <BaseButton
              type={BaseButtonType.primary}
              style={styles.sellBtn}
              labelStyle={styles.sell}
              onPress={isPosition ? onActionButtonPress : onDeleteButtonPress}
              size={BaseButtonSize.small}
              label={String(position.action)}
              accessibilityValue={{
                text: position.accessibilityLabel
              }}
              accessibilityLabel={position.accessibilityLabel}
              accessible={true}
              testID={position.accessibilityLabel}
            />
          </View>
        )}
      </ScrollView>
      {isClosed || (
        <>
          <BottomSheetModal
            ref={DeleteBottomSheetRef}
            keyboardBehavior='interactive'
            keyboardBlurBehavior='restore'
            onChange={onOpen}
            onDismiss={onClose}
            handleIndicatorStyle={styles.indicator}
            backgroundStyle={styles.sheetBgStyle}
            enablePanDownToClose
            snapPoints={[210]}
            backdropComponent={SheetBackdrop}
          >
            <DeleteBottomSheetContent
              title={t('screens.position-info.delete-order', {
                action: deleteActionDesc,
                asset: getAssetName(position.symbol),
                price: position.priceOrder
              })}
              onDeletePressed={deletePendingOrderHandler}
              onCancelPressed={closeDeleteBottomSheet}
            />
          </BottomSheetModal>
          <BottomSheetModal
            ref={BottomSheetRef}
            keyboardBehavior='interactive'
            keyboardBlurBehavior='restore'
            onChange={onOpen}
            handleIndicatorStyle={styles.indicator}
            onDismiss={onClose}
            backgroundStyle={styles.sheetBgStyle}
            enablePanDownToClose
            snapPoints={[321]}
            backdropComponent={SheetBackdrop}
          >
            <ClosePositionContent
              symbol={position.symbol || ''}
              assetUnit={position.assetUnit || ''}
              volume={data?.Volume || data?.VolumeInitial}
              profit={data?.profit}
              contractSize={position.contractSize}
              positionValue={currentPositionValue}
              volumeStep={position.volumeStep}
              volumeMin={position.volumeMin}
              onSubmit={onConfirmButtonPress}
              assetUnitOfMeasureDigits={position.assetUnitOfMeasureDigits}
              priceOpen={position.priceOpen || 0}
              action={positionData?.action || 0}
              profitSymbol={profitSymbol || ''}
              profitSymbolDirect={profitSymbolDirect || false}
              livePnL={currentPnL || 0}
            />
          </BottomSheetModal>
          <BottomSheetModal
            ref={EditBottomSheetRef}
            keyboardBehavior='interactive'
            keyboardBlurBehavior='restore'
            onChange={editOnOpen}
            onDismiss={editOnClose}
            handleIndicatorStyle={styles.indicator}
            backgroundStyle={styles.sheetBgStyle}
            enablePanDownToClose
            enableDynamicSizing={!keyboardOpen}
            snapPoints={isPosition ? [500] : [700]}
            backdropComponent={SheetBackdrop}
          >
            <BottomSheetScrollView keyboardShouldPersistTaps='handled'>
              <EditPosition
                isPosition={isPosition}
                sheetRef={EditBottomSheetRef}
                action={position.actionNumber || 0}
                openPrice={isPosition ? position.priceOpen || 0 : position.priceOrder || 0}
                volume={(isPosition ? data?.Volume : data?.VolumeInitial) || 0}
                isVisible={isEditOpen}
                stopLevel={symbolConfigData?.stopsLevel || 0}
                title={title}
                navigation={navigation}
                contractSize={data?.contractSize || 0}
                timeExpiration={position.timeExpiration}
                onSubmit={handleEditPosition}
                stopLossValue={data?.priceSL}
                takeProfitValue={data?.priceTP}
                symbolConfigsData={symbolConfigData}
                getLimits={getLimits}
                profitSymbol={profitSymbol}
                profitSymbolDirect={profitSymbolDirect}
                averagePrice={
                  liveCurrencyAveragePrice ||
                  ((profitSymbolLastTickData?.bid || 0) + (profitSymbolLastTickData?.ask || 0)) / 2
                }
              />
            </BottomSheetScrollView>
          </BottomSheetModal>
          <BaseLoader
            active={
              isDeleteLoading ||
              closePositionResponse.isLoading ||
              editPositionResponse.isLoading ||
              loading ||
              editPendingOrderResponse.isLoading
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default PositionInfoScreen;

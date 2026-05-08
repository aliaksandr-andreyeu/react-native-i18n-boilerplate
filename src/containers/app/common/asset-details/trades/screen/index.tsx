import React, { Fragment, ReactNode, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, View, ViewToken } from 'react-native';
import {
  BaseImage,
  BaseLoader,
  BasePositionCard,
  BaseText,
  BaseTextVariant,
  ClosePositionContent,
  DeleteBottomSheetContent,
  SheetBackdrop
} from '@/components';
import { useFocusEffect, useIsFocused, useTheme, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import useStyles from './styles';
import { actions } from '@/store';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNetwork } from '@/providers';
import { useAppDispatch, useAppSelector, useRate } from '@/hooks';
import { DealsInfo, PendingOrder, PortfolioState, Position } from '@/store/slices/portfolio/types';
import getSymbolFromCurrency from 'currency-symbol-map';
import {
  useClosePositionMutation,
  useDeletePendingOrderQuery,
  useGetDealsAccountsQuery,
  useGetSymbolConfigMutation
} from '@/store/api';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { images } from '@/assets';
import SellBuyButtons from '../../components/SellBuyButtons';
import { getAssetName, jsonParse } from '@/helpers';
import { debounce } from 'throttle-debounce';
import { StackScreenProps } from '@react-navigation/stack';
import { testIDs } from '@/constants';

type AssetDetailsTradesScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.AssetDetails
>;

const {
  application: { openModal }
} = actions;

interface LastTick {
  symbol: string;
  bid: string;
  ask: string;
}

const defaultViewableAssets = new Array(4).fill(null).map((_, index) => ({ index })) as ViewToken[];
const AssetDetailsTradesScreen: React.FC<AssetDetailsTradesScreenProps> = ({ navigation, route }) => {
  const [viewableAssets, setViewableAssets] = useState<ViewToken[]>([] as ViewToken[]);
  const canRender = useRef<boolean>(false);
  const isFirst = useRef<boolean>(true);
  const DeleteBottomSheetRef = useRef<BottomSheetModal>(null);

  const [liveAsk, setLiveAsk] = useState<number | undefined>(undefined);
  const [liveBid, setLiveBid] = useState<number | undefined>(undefined);

  const { websocket, isReadyState } = useNetwork();

  const { requestReview } = useRate();

  const theme = useTheme();
  const styles = useStyles(theme);
  const {
    palette: { red, green }
  } = theme;

  const redColor = red['600'];
  const greenColor = '#159D55';

  const pageIsFocused = useIsFocused();
  const { t } = useTranslation();

  const enabledHandleMessage = pageIsFocused && isReadyState && websocket;

  const BottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetState = useRef<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<(Position & PendingOrder) | null>(null);
  const [selectedData, setSelectedData] = useState({ currencyProfitSymbol: '', currencyProfitSymbolDirect: false });

  const dispatch = useAppDispatch();

  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getSymbolConfig, symbolConfig] = useGetSymbolConfigMutation();
  const [closePosition, closePositionResponse] = useClosePositionMutation();
  const [deletePendingOrder, deleteResponse] = useDeletePendingOrderQuery();

  const portfolio = useAppSelector((state) => state.portfolio) as PortfolioState & {
    symbolLastTick: LastTick;
  };
  const {
    selectedAccount,
    dealsAccounts: accounts,
    tradingAssets,
    userInfo,
    assetSymbolData,
    symbolLastTick
  } = portfolio || {};
  const { id: userId } = userInfo || {};
  const { asset: assetSymbol, ask: assetAsk, bid: assetBid, digits: assetDigits = 0 } = assetSymbolData || {};
  const { symbol: lastTickSymbol, ask: lastTickAsk, bid: lastTickBid } = symbolLastTick || {};

  const wallet = useAppSelector((state) => state.wallet);
  const { tradingAccounts = [] } = wallet || {};

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
    },
    [enabledHandleMessage, setLiveBid, setLiveAsk]
  );

  const setData = debounce(250, debounceSetData);

  const asset = useMemo(() => {
    return assetSymbol || lastTickSymbol || '';
  }, [assetSymbol, lastTickSymbol]);

  const ask = useMemo(() => {
    return Number(liveAsk || lastTickAsk || assetAsk || 0);
  }, [assetAsk, lastTickAsk, liveAsk]);

  const bid = useMemo(() => {
    return Number(liveBid || lastTickBid || assetBid || 0);
  }, [assetBid, lastTickBid, liveBid]);

  const digits = useMemo(() => {
    return assetDigits || symbolConfig.data?.digits || 0;
  }, [assetDigits, symbolConfig.data?.digits]);

  const tradeMode = useMemo(() => symbolConfig.data?.tradeMode, [symbolConfig.data?.tradeMode]);

  const positionList = useMemo((): { data: Partial<DealsInfo & ParsedTradingAssets>[]; key: string } => {
    const positions = accounts.find((item) => item.accountId === selectedAccount)?.positions || [];

    const positionMap = new Map();

    positions
      .filter((i) => i.symbol === route.params?.asset)
      .forEach((position) => {
        const asset = tradingAssets.find((item) => item.systemName === position.symbol) || {
          assetUnitOfMeasure: '',
          assetUnitOfMeasureDigits: 2,
          ticket: 0,
          fullName: '',
          image: '',
          systemName: position.symbol,
          positions: []
        };

        const accountCurrency = 'USD'; /*** PROVIDE HERE SELECTED ACCOUNT CURRENCY ***/
        const currencyProfit = position.currencyProfit;

        const directPair = `${currencyProfit}${accountCurrency}`.toUpperCase();
        const reversePair = `${accountCurrency}${currencyProfit}`.toUpperCase();

        const currencyProfitDirectPair = tradingAssets.find((asset) => asset.systemName === directPair);
        const currencyProfitReversePair = tradingAssets.find((asset) => asset.systemName === reversePair);

        const currencyProfitSymbol = currencyProfitDirectPair?.systemName || currencyProfitReversePair?.systemName;
        const currencyProfitSymbolDirect = Boolean(currencyProfitDirectPair?.systemName);

        if (!positionMap.has(position.symbol)) {
          positionMap.set(position.symbol, {
            ...asset,
            symbol: position.symbol,
            currencyProfit,
            ...(currencyProfitSymbol && {
              currencyProfitSymbol,
              currencyProfitSymbolDirect
            }),
            positions: [position]
          });
        } else {
          const existingPosition = positionMap.get(position.symbol);
          existingPosition.positions.push(position);
        }
      });

    const updatedPositions = Array.from(positionMap.values());
    const positionLengths = updatedPositions.map((p: DealsInfo & ParsedTradingAssets) => p.positions.length) || [];
    const stringLengths = JSON.stringify(positionLengths);

    return {
      data: updatedPositions,
      key: stringLengths
    };
  }, [selectedAccount, accounts, tradingAssets.length]);

  const getAssetUnitOfMeasureDigits = useCallback(
    (asset: string) => {
      return (
        tradingAssets.find((item: ParsedTradingAssets) => item.systemName === asset)?.assetUnitOfMeasureDigits || 2
      );
    },
    [tradingAssets]
  );

  const pendingOrdersList = useMemo(() => {
    const orders = accounts.find((item) => item.accountId === selectedAccount)?.pendingOrders || [];

    const updatedOrdersMap = new Map();

    orders
      .filter((i) => i.symbol === route.params?.asset)
      .forEach((order) => {
        const asset = tradingAssets.find((item) => item.systemName === order.symbol) || {
          assetUnitOfMeasure: '',
          ticket: 0,
          fullName: '',
          image: '',
          systemName: order.symbol,
          positions: []
        };

        if (!updatedOrdersMap.has(order.symbol)) {
          updatedOrdersMap.set(order.symbol, {
            ...asset,
            ticket: order.ticket,
            symbol: order.symbol,
            positions: [order],
            isOrder: true
          });
        } else {
          const existingOrder = updatedOrdersMap.get(order.symbol);
          existingOrder.positions.push(order);
        }
      });

    const updatedOrders = Array.from(updatedOrdersMap.values());
    const positionLengths = updatedOrders.map((p: DealsInfo & ParsedTradingAssets) => p.positions.length) || [];
    const stringLengths = JSON.stringify(positionLengths);

    return {
      data: updatedOrders,
      key: stringLengths
    };
  }, [selectedAccount, accounts, tradingAssets]);

  const symbolsList = useMemo(() => {
    if (positionList === undefined) {
      return false;
    }

    const { data } = positionList || {};

    if (data === undefined) {
      return false;
    }

    const symbolsData = data.map((el) => el.symbol);
    const currencyProfitSymbolData = data
      .map((el: Partial<DealsInfo & ParsedTradingAssets & { currencyProfitSymbol: string }>) => el.currencyProfitSymbol)
      .filter(Boolean);

    const commonSymbolsData = [...symbolsData, ...currencyProfitSymbolData];
    const uniqCommonSymbolsData = [...new Set(commonSymbolsData), asset];

    return uniqCommonSymbolsData.join(' ');
  }, [positionList, asset]);

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || !symbolsList) {
      return;
    }

    websocket.send(`unsubscribe ALL`);

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const data = jsonParse(event?.data);
      if (!data) {
        return;
      }
      const { ask: dataAsk, bid: dataBid, symbol: dataSymbol } = data || {};
      if (dataAsk === undefined || dataBid === undefined || dataSymbol === undefined) {
        return;
      }

      if (dataSymbol !== asset) {
        return;
      }

      setData(dataAsk, dataBid);
    });

    websocket.send(`subscribe ${symbolsList}`);
  }, [enabledHandleMessage, symbolsList]);

  const unsubscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }
    websocket.send(`unsubscribe ALL`);
  }, [enabledHandleMessage]);

  useFocusEffect(
    useCallback(() => {
      subscribeWebsocket();
      return () => {
        unsubscribeWebsocket();
      };
    }, [navigation, route, enabledHandleMessage, symbolsList])
  );

  const _renderItem = useCallback(
    ({ item, index }: { item: DealsInfo & ParsedTradingAssets; index: number }) => {
      const onItemPress = (ticket: number) => {
        navigation.navigate(ROOT_ROUTE_NAMES.PositionInfo, {
          positionTicket: ticket,
          title: item.symbol,
          isPosition: !item.isOrder,
          isClosed: false
        });
      };

      const isViewable = viewableAssets.some((el) => el.index === index);

      return (
        <View>
          {!item.isOrder && index === 0 && item.positionId === positionList.data[0]?.positionId && (
            <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.asset-details.positions')}
            </BaseText>
          )}
          {item.isOrder && item.positionId === pendingOrdersList.data[0]?.positionId && (
            <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.asset-details.orders')}
            </BaseText>
          )}
          <BasePositionCard
            isOrder={item.isOrder}
            isViewable={isViewable}
            onItemPress={onItemPress}
            data={item}
            onClosePressed={item.isOrder ? handleOpenDeletePopUp : handleClosePressed}
          />
        </View>
      );
    },
    [viewableAssets, positionList.data, pendingOrdersList.data]
  );

  const handleClosePressed = useCallback(
    (position: Position & PendingOrder, currencyProfitSymbol: string, currencyProfitSymbolDirect: boolean) => {
      setSelectedItem(position);
      setSelectedData({ currencyProfitSymbol: currencyProfitSymbol, currencyProfitSymbolDirect });
      BottomSheetRef.current?.[sheetState.current ? 'close' : 'present']();
    },
    []
  );

  const handleOpenDeletePopUp = useCallback((position: Position & PendingOrder) => {
    setSelectedItem(position);
    DeleteBottomSheetRef.current?.[sheetState.current ? 'close' : 'present']();
  }, []);

  const _keyExtractor = useCallback(
    (_: Partial<DealsInfo & ParsedTradingAssets>, index: number) => `${index}-list-position`,
    []
  );

  const getDealsAccountsHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      await getDealsAccounts(userId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetState.current) {
        DeleteBottomSheetRef.current?.close();
        BottomSheetRef.current?.close();
      } else navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, []);

  useFocusEffect(
    useCallback(() => {
      getDealsAccountsHandler();
    }, [navigation, userId])
  );

  useEffect(() => {
    getSymbolConfig({ symbol: assetSymbol, accountId: selectedAccount });
  }, [selectedAccount, assetSymbol]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (canRender.current || isFirst.current) {
      isFirst.current = false;
      const indexes = viewableItems.map((item) => item.index);
      if (indexes.length === 1 && indexes[0] === 0) setViewableAssets(defaultViewableAssets);
      else setViewableAssets(viewableItems);
    }
  }, []);

  const onBegin = useCallback(() => (canRender.current = true), []);
  const onStop = useCallback(() => (canRender.current = false), []);

  const Seperator = useCallback(() => {
    return (
      <View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </View>
    );
  }, [theme.dark]);

  const onClose = useCallback(() => {
    sheetState.current = false;
    if (Keyboard.isVisible()) Keyboard.dismiss();
  }, []);
  const onOpen = useCallback(() => (sheetState.current = true), []);

  const assetUnit = useMemo(() => {
    return (
      tradingAssets.find((item: ParsedTradingAssets) => item.systemName === selectedItem?.symbol)?.assetUnitOfMeasure ||
      ''
    );
  }, [selectedItem?.symbol]);

  const goToIdeas = useCallback(() => {
    //@ts-ignore
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, []);

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
          testID,
          onClosed: async () => {
            await getDealsAccountsHandler();

            if (onClosed && typeof onClosed === 'function') {
              await onClosed();
            }
          },
          iconSize: {
            width: 115,
            height: 90
          },
          button: {
            text: t('screens.position-info.explore-ideas'),
            onPress: goToIdeas
          }
        })
      );
    },
    [t]
  );

  useEffect(() => {
    if (closePositionResponse.isError) {
      showErrorPopUp();
    }
  }, [closePositionResponse.isError]);

  const accountCurrency = useMemo(() => {
    const tradingAccount = tradingAccounts.find((el) => el?.login === String(selectedAccount));
    const { currency: accountCurrency = 'USD' } = tradingAccount || {};
    return accountCurrency;
  }, [tradingAccounts]);

  const onConfirmButtonPress = useCallback(
    async (volumeClose: number, isFullClose: boolean) => {
      BottomSheetRef.current?.close();
      if (closePositionResponse.isLoading) return;
      if (selectedItem?.ticket && selectedAccount)
        await closePosition({
          accountId: selectedAccount,
          partialClosingVolume: isFullClose ? undefined : volumeClose,
          positionId: selectedItem?.ticket
        })
          .unwrap()
          .then((data) => {
            if (data?.isSuccess) {
              const { price = 0, profit = 0 } = data || {};

              const profitRate = profit > 0 ? requestReview : undefined;
              const priceValue = price.toFixed(symbolConfig.data?.digits || 0);
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
                    {profitValue}
                  </BaseText>
                </Fragment>
              );

              showSuccessPopUp(
                t('screens.create-position-details.action-by-price-item', {
                  action: selectedItem.action === 0 ? 'sold' : 'bought',
                  volume: (volumeClose * (selectedItem?.contractSize || 0)).toFixed(
                    getAssetUnitOfMeasureDigits(selectedItem?.symbol)
                  ),
                  asset: getAssetName(selectedItem?.symbol),
                  assetUnit,
                  price: priceValue
                }),
                subTitle,
                profitRate,
                testIDs.assetDetails.trades.createPosition.successPopUp
              );
            } else {
              showErrorPopUp();
            }
          });
    },
    [
      requestReview,
      t,
      redColor,
      greenColor,
      accountCurrency,
      selectedAccount,
      selectedItem,
      closePositionResponse.isLoading,
      assetUnit,
      symbolConfig.data?.digits
    ]
  );

  const deletePendingOrderHandler = async () => {
    DeleteBottomSheetRef.current?.close();
    if (!selectedAccount || selectedItem?.ticket === undefined) {
      return;
    }

    try {
      const response = await deletePendingOrder({ accountId: selectedAccount, orderId: selectedItem?.ticket });
      if (response.isSuccess) {
        getDealsAccountsHandler();
        showSuccessPopUp(
          t('screens.position-info.delete-confirm', {
            action:
              selectedItem?.type && selectedItem?.type % 2 === 0
                ? t('screens.position-info.buy')
                : t('screens.position-info.sell'),
            asset: getAssetName(selectedItem?.symbol),
            price: selectedItem?.priceOrder
          })
        );
      } else {
        showErrorPopUp();
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const _renderEmpty = useCallback(() => {
    return (
      <View style={styles.emptyList}>
        <BaseImage resizeMode='contain' style={styles.searchImg} source={images.search} />
        <BaseText style={styles.emptyText} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.asset-details.empty-text', { asset: getAssetName(route.params?.asset) })}
        </BaseText>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        style={styles.list}
        data={[...positionList.data, ...pendingOrdersList.data]}
        snapToInterval={50}
        decelerationRate={'fast'}
        ItemSeparatorComponent={Seperator}
        maxToRenderPerBatch={30}
        updateCellsBatchingPeriod={100}
        windowSize={20}
        onMomentumScrollEnd={onStop}
        onScrollBeginDrag={onBegin}
        onViewableItemsChanged={onViewableItemsChanged}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
        ListEmptyComponent={_renderEmpty}
      />
      <SellBuyButtons bid={bid} ask={ask} digits={digits} useMode tradeMode={tradeMode} asset={asset} />
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
          symbol={selectedItem?.symbol || ''}
          assetUnit={assetUnit}
          volume={selectedItem?.Volume}
          profit={selectedItem?.profit}
          contractSize={selectedItem?.contractSize}
          positionValue={
            (selectedItem?.Volume || 0) * (selectedItem?.contractSize || 0) * (selectedItem?.priceCurrent || 0)
          }
          volumeStep={symbolConfig.data?.volumestepExt}
          volumeMin={symbolConfig.data?.volumeMinExt}
          onSubmit={onConfirmButtonPress}
          assetUnitOfMeasureDigits={selectedItem?.symbol ? getAssetUnitOfMeasureDigits(selectedItem?.symbol) : 2}
          priceOpen={selectedItem?.priceOpen || 0}
          action={selectedItem?.action || 0}
          profitSymbol={selectedData?.currencyProfitSymbol || ''}
          profitSymbolDirect={selectedData?.currencyProfitSymbolDirect || false}
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={DeleteBottomSheetRef}
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
            action:
              selectedItem?.type && selectedItem?.type % 2 === 0
                ? t('screens.position-info.buy')
                : t('screens.position-info.sell'),
            asset: getAssetName(selectedItem?.symbol),
            price: selectedItem?.priceOrder
          })}
          onDeletePressed={deletePendingOrderHandler}
          onCancelPressed={() => {
            DeleteBottomSheetRef.current?.close();
          }}
        />
      </BottomSheetModal>
      <BaseLoader active={closePositionResponse.isLoading || deleteResponse.isLoading} />
    </View>
  );
};

export default memo(AssetDetailsTradesScreen);

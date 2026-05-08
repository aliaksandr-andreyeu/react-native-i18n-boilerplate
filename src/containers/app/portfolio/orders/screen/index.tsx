import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, BackHandler, Keyboard, ViewToken } from 'react-native';
import { ParamListBase, useFocusEffect, useIsFocused } from '@react-navigation/native';
import {
  AUTH_ROUTE_NAMES,
  COMMON_ROUTE_NAMES,
  PORTFOLIO_ROUTE_NAMES,
  PortfolioRootParamsList,
  PULSEAI_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { StackScreenProps } from '@react-navigation/stack';
import { useStyles } from './styles';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { DealsInfo, PendingOrder, Position } from '@/store/slices/portfolio/types';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import {
  BaseButtonType,
  BaseLoader,
  BasePortfolioEmptyContainer,
  BasePositionCard,
  BaseTradingBanner,
  DeleteBottomSheetContent,
  SheetBackdrop
} from '@/components';
import { useTheme } from '@react-navigation/native';
import { useNetwork } from '@/providers';
import { useDeletePendingOrderQuery, useGetDealsAccountsQuery } from '@/store/api';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { actions } from '@/store';
import { images } from '@/assets';
import { useWelcomeBonusAvailability } from '@/hooks/custom';
import { getAssetName } from '@/helpers';
import { testIDs } from '@/constants';

type OrdersScreenProps = StackScreenProps<ParamListBase & PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Orders>;

const {
  application: { openModal }
} = actions;

const defaultViewableAssets = new Array(4).fill(null).map((_, index) => ({ index })) as ViewToken[];

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation, route }) => {
  const [viewableAssets, setViewableAssets] = useState<ViewToken[]>([] as ViewToken[]);
  const canRender = useRef<boolean>(false);
  const isFirst = useRef<boolean>(true);

  const { websocket, isReadyState } = useNetwork();

  const { isWelcomeBonusAvailable, promoBonus } = useWelcomeBonusAvailability();

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const theme = useTheme();
  const styles = useStyles(theme);

  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = pageIsFocused && isReadyState && websocket;

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [deletePendingOrder, { isLoading: isDeleteLoading }] = useDeletePendingOrderQuery();

  const application = useAppSelector((state) => state.application);
  const { promoWelcome } = application || {};
  const { welcomeAccountTypeId } = promoWelcome || {};

  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);
  const accounts = useAppSelector((store) => store.portfolio.dealsAccounts);
  const tradingAssets = useAppSelector((store) => store.portfolio.tradingAssets);
  const userInfo = useAppSelector((store) => store.portfolio.userInfo);
  const tradingAccounts = useAppSelector((state) => state.wallet.tradingAccounts);
  const { id: userId } = userInfo || {};

  const isDeposit = !!userInfo.firstDepositDate;
  const isFund = !!userInfo.lastTradedAt;
  const showGuideline = !isDeposit || !isFund;

  const emptyText = useMemo((): { title: string; subTitle: string; started: boolean } => {
    if (!isDeposit || !isFund)
      return {
        title: t('screens.portfolio.no-data.title'),
        subTitle: t('screens.portfolio.no-data.subTitle'),
        started: false
      };

    return { title: '', subTitle: '', started: true };
  }, [isDeposit, isFund, t]);

  const DeleteBottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetState = useRef<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<(Position & PendingOrder) | null>(null);
  const [balanceLive, setBalanceLive] = useState({ equity: 0 });

  const deleteActionDesc =
    selectedItem?.type && selectedItem?.type % 2 === 0
      ? t('screens.position-info.buy')
      : t('screens.position-info.sell');

  const pendingOrdersList = useMemo(() => {
    const orders = accounts.find((item) => item.accountId === selectedAccount)?.pendingOrders || [];

    const updatedOrdersMap = new Map();

    orders.forEach((order) => {
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
          positions: [order]
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
    if (pendingOrdersList === undefined) {
      return false;
    }

    const { data } = pendingOrdersList || {};

    if (data === undefined) {
      return false;
    }

    const symbolsData = data.map((el) => el.symbol);

    const uniqCommonSymbolsData = [...new Set(symbolsData)];

    return uniqCommonSymbolsData.join(' ');
  }, [pendingOrdersList]);

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || !symbolsList) {
      return;
    }

    websocket.send(`unsubscribe ALL`);
    websocket.send(`subscribe ${symbolsList}`);
  }, [enabledHandleMessage, symbolsList, selectedAccount]);

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

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (canRender.current || isFirst.current) {
      isFirst.current = false;
      const indexes = viewableItems.map((item) => item.index);
      if (indexes.length === 1 && indexes[0] === 0) setViewableAssets(defaultViewableAssets);
      else setViewableAssets(viewableItems);
    }
  }, []);

  const _renderItem = useCallback(
    ({ item, index }: { item: DealsInfo & ParsedTradingAssets; index: number }) => {
      const onItemPress = (ticket: number) => {
        navigation.navigate(ROOT_ROUTE_NAMES.PositionInfo, {
          positionTicket: ticket,
          title: item.symbol,
          isPosition: false
        });
      };

      const isViewable = viewableAssets.some((el) => el.index === index);

      return (
        <BasePositionCard
          testID={testIDs.portfolio.positions.positionCard(item.ticket)}
          isOrder
          onItemPress={onItemPress}
          isViewable={isViewable}
          data={item}
          onClosePressed={handleClosePressed}
        />
      );
    },
    [viewableAssets]
  );

  const handleClosePressed = useCallback((position: Position & PendingOrder) => {
    setSelectedItem(position);
    DeleteBottomSheetRef.current?.[sheetState.current ? 'close' : 'present']();
  }, []);

  const _keyExtractor = useCallback(
    (_: DealsInfo & ParsedTradingAssets, index: number) => `${index}-list-position`,
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

  useFocusEffect(
    useCallback(() => {
      getDealsAccountsHandler();
    }, [navigation, userId])
  );

  useLayoutEffect(() => {
    if (tradingAccounts && tradingAccounts.length === 0) {
      return;
    }

    const equity = tradingAccounts
      .filter((account) => account.typeId !== welcomeAccountTypeId)
      .reduce((acc, current) => {
        const { equity: currentEquity = 0 } = current || {};
        return acc + currentEquity;
      }, 0);

    setBalanceLive(() => ({ equity }));
  }, [tradingAccounts]);

  useEffect(() => {
    let backHandler;
    if (pageIsFocused) {
      backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (sheetState.current) DeleteBottomSheetRef.current?.dismiss();
        else navigation.goBack();

        return true;
      });
    }

    return backHandler?.remove;
  }, [pageIsFocused]);

  const onClose = useCallback(() => {
    sheetState.current = false;
    setSelectedItem(null);
    if (Keyboard.isVisible()) Keyboard.dismiss();
  }, []);
  const onOpen = useCallback(() => (sheetState.current = true), []);

  const Seperator = useCallback(() => {
    return (
      <View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </View>
    );
  }, [theme.dark]);

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
  }, []);

  const deletePendingOrderHandler = async () => {
    DeleteBottomSheetRef.current?.close();
    if (!selectedAccount || selectedItem?.ticket === undefined) {
      return;
    }

    try {
      const response = await deletePendingOrder({ accountId: selectedAccount, orderId: selectedItem?.ticket });
      if (response.isSuccess) {
        getDealsAccountsHandler();
        dispatch(
          openModal({
            title: t('screens.position-info.delete-confirm', {
              action: deleteActionDesc,
              asset: getAssetName(selectedItem?.symbol),
              price: (selectedItem?.priceOrder || 0).toFixed(selectedItem?.digits || 0)
            }),
            icon: images.done,
            iconSize: {
              width: 90,
              height: 90
            },
            button: {
              text: t('screens.position-info.explore-ideas')
            }
          })
        );
      } else {
        showErrorPopUp();
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const renderGuideline = useCallback(() => {
    let guidelineData = {
      bannerSubTitle: '',
      bannerButtonText: '',
      bannerImageStyle: {},
      bannerImage: images.safe,
      onPress: () => {}
    };
    if (!isAuthorized) {
      guidelineData = {
        bannerSubTitle: t('components.molecules.banner.create-account'),
        bannerButtonText: t('components.molecules.banner.sign-up'),
        bannerImageStyle: styles.idCardImage,
        bannerImage: images.idCard,
        onPress: () => {
          navigation.navigate<any>(ROOT_ROUTE_NAMES.Auth, {
            screen: AUTH_ROUTE_NAMES.BonusSignUp
          });
        }
      };
    } else if (!userInfo.isVerified) {
      guidelineData = {
        bannerSubTitle: isWelcomeBonusAvailable
          ? t('screens.portfolio.promo-bonus-baner', { amount: promoBonus })
          : t('components.molecules.banner.complete-verification-sub'),
        bannerButtonText: t('components.molecules.banner.complete-verification'),
        bannerImageStyle: styles.blackKeyImage,
        bannerImage: images.blackKey,
        onPress: () => {
          navigation.navigate<any>(ROOT_ROUTE_NAMES.Common, {
            screen: COMMON_ROUTE_NAMES.Verification
          });
        }
      };
    } else {
      if (!userInfo.firstDepositDate)
        guidelineData = {
          bannerSubTitle: t('screens.portfolio.deposit-now'),
          bannerButtonText: t('screens.portfolio.fund-now'),
          bannerImageStyle: styles.safeImage,
          bannerImage: images.safe,
          onPress: () => {
            navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
          }
        };
      else {
        if (!balanceLive.equity)
          guidelineData = {
            bannerSubTitle: t('screens.portfolio.transfer-funds-trading-account-dive-into-markets'),
            bannerButtonText: t('screens.portfolio.transfer-funds-now'),
            bannerImageStyle: styles.rocketImage,
            bannerImage: images.rocket,
            onPress: () => {
              navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
            }
          };
        else {
          guidelineData = {
            bannerSubTitle: t('screens.portfolio.deposit-now'),
            bannerButtonText: t('screens.portfolio.explore-trading-signals'),
            bannerImageStyle: styles.barchartImage,
            bannerImage: images.barChart,
            onPress: () => {
              navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
            }
          };
        }
      }
    }
    return (
      <BaseTradingBanner
        style={styles.guidelineBanner}
        title={`${t('screens.common.next-step')}:`}
        subTitle={guidelineData.bannerSubTitle}
        buttonText={guidelineData.bannerButtonText}
        imageSource={guidelineData.bannerImage}
        imageStyle={guidelineData.bannerImageStyle}
        leftSectionStyle={{ marginRight: 112 }}
        buttonType={BaseButtonType.primary}
        onPress={guidelineData?.onPress}
      />
    );
  }, [t, userInfo, balanceLive, isWelcomeBonusAvailable, promoBonus, isAuthorized]);

  const Empty = useCallback(() => {
    const goToSignals = () => navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
    return (
      <BasePortfolioEmptyContainer
        buttonText={t('screens.portfolio.no-data.explore')}
        subTitle={emptyText.subTitle || t('screens.portfolio.no-data.browse-signal')}
        showButton={emptyText.started ? true : false}
        title={emptyText.title || t('screens.portfolio.no-data.no-orders')}
        style={{ top: '40%' }}
        onPress={goToSignals}
        buttonStyle={{ marginTop: 60, backgroundColor: theme.palette.green[500] }}
      />
    );
  }, [emptyText, t]);

  const onBegin = useCallback(() => (canRender.current = true), []);
  const onStop = useCallback(() => (canRender.current = false), []);

  return (
    <View style={styles.container}>
      <FlatList
        testID={testIDs.portfolio.orders.flatList}
        style={styles.list}
        data={pendingOrdersList.data as (DealsInfo & ParsedTradingAssets)[]}
        key={pendingOrdersList.key}
        snapToInterval={50}
        decelerationRate={'fast'}
        maxToRenderPerBatch={30}
        ListEmptyComponent={Empty}
        ItemSeparatorComponent={Seperator}
        onViewableItemsChanged={onViewableItemsChanged}
        onMomentumScrollEnd={onStop}
        onScrollBeginDrag={onBegin}
        updateCellsBatchingPeriod={100}
        windowSize={20}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
      />
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
            action: deleteActionDesc,
            asset: getAssetName(selectedItem?.symbol),
            price: selectedItem?.priceOrder
          })}
          onDeletePressed={deletePendingOrderHandler}
          onCancelPressed={() => {
            DeleteBottomSheetRef.current?.close();
          }}
        />
      </BottomSheetModal>
      <BaseLoader active={isDeleteLoading} />
      {showGuideline && renderGuideline()}
    </View>
  );
};

export default OrdersScreen;

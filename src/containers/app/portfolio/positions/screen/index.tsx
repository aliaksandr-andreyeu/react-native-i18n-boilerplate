import React, { Fragment, ReactNode, useState, useCallback, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import {
  COMMON_ROUTE_NAMES,
  PORTFOLIO_ROUTE_NAMES,
  AUTH_ROUTE_NAMES,
  PortfolioRootParamsList,
  PULSEAI_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { useTheme, ParamListBase, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { View, ViewToken, Keyboard, BackHandler } from 'react-native';
import { useStyles } from './styles';
import { useAppDispatch, useAppSelector, useRate } from '@/hooks';
import { DealsInfo, Position } from '@/store/slices/portfolio/types';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import getSymbolFromCurrency from 'currency-symbol-map';
import {
  BaseButtonType,
  BaseLoader,
  BasePortfolioEmptyContainer,
  BasePositionCard,
  BaseTradingBanner,
  ClosePositionContent,
  SheetBackdrop,
  BaseTextVariant,
  BaseText,
  BaseButton,
  BaseButtonSize
} from '@/components';
import { useClosePositionMutation, useGetDealsAccountsQuery, useGetSymbolConfigMutation } from '@/store/api';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { useNetwork } from '@/providers';
import Animated from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { actions } from '@/store';
import { useTranslation } from 'react-i18next';
import { images } from '@/assets';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { useWelcomeBonusAvailability } from '@/hooks/custom';
import { testIDs } from '@/constants';
import { getAssetName } from '@/helpers';

type PositionsScreenProps = StackScreenProps<ParamListBase & PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Positions>;

const {
  application: { openModal }
} = actions;

const defaultViewableAssets = new Array(4).fill(null).map((_, index) => ({ index })) as ViewToken[];

const PositionsScreen: React.FC<PositionsScreenProps> = ({ navigation, route }) => {
  const [viewableAssets, setViewableAssets] = useState<ViewToken[]>([] as ViewToken[]);
  const canRender = useRef<boolean>(false);
  const isFirst = useRef<boolean>(true);
  const sheetIsOpen = useRef<boolean>(false);

  const onAnimate = useCallback(() => (sheetIsOpen.current = true), []);

  const { websocket, isReadyState } = useNetwork();

  const { requestReview } = useRate();

  const { isWelcomeBonusAvailable, promoBonus } = useWelcomeBonusAvailability();

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

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
  const [selectedItem, setSelectedItem] = useState<Position | null>(null);
  const [selectedData, setSelectedData] = useState({ currencyProfitSymbol: '', currencyProfitSymbolDirect: false });
  const [balanceLive, setBalanceLive] = useState({ equity: 0 });

  const dispatch = useAppDispatch();

  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getSymbolConfig, symbolConfig] = useGetSymbolConfigMutation();
  const [closePosition, closePositionResponse] = useClosePositionMutation();

  const application = useAppSelector((state) => state.application);
  const { promoWelcome } = application || {};
  const { welcomeAccountTypeId } = promoWelcome || {};

  const wallet = useAppSelector((state) => state.wallet);
  const { tradingAccounts = [] } = wallet || {};

  const portfolio = useAppSelector((state) => state.portfolio);
  const { selectedAccount, dealsAccounts: accounts, tradingAssets, userInfo } = portfolio || {};
  const { id: userId, firstDepositDate, lastTradedAt } = userInfo || {};

  const isDeposit = !!firstDepositDate;
  const isFund = !!lastTradedAt;
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

  useEffect(() => {
    let backHandler;
    if (pageIsFocused) {
      backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (sheetIsOpen.current) BottomSheetRef.current?.dismiss();
        else navigation.goBack();

        return true;
      });
    }

    return backHandler?.remove;
  }, [pageIsFocused]);

  const positionList = useMemo((): { data: Partial<DealsInfo & ParsedTradingAssets>[]; key: string } => {
    const positions = accounts.find((item) => item.accountId === selectedAccount)?.positions || [];

    const positionMap = new Map();

    positions.forEach((position) => {
      const asset = tradingAssets.find((item) => item.systemName === position.symbol) || {
        assetUnitOfMeasure: '',
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
    const uniqCommonSymbolsData = [...new Set(commonSymbolsData)];

    return uniqCommonSymbolsData.join(' ');
  }, [positionList]);

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
    }, [navigation, route, enabledHandleMessage, symbolsList, selectedAccount])
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

  const _renderItem = useCallback(
    ({ item, index }: { item: DealsInfo & ParsedTradingAssets; index: number }) => {
      const onItemPress = (ticket: number) => {
        navigation.navigate(ROOT_ROUTE_NAMES.PositionInfo, {
          positionTicket: ticket,
          title: item.symbol,
          isPosition: true
        });
      };

      const isViewable = viewableAssets.some((el) => el.index === index);

      return (
        <BasePositionCard
          testID={testIDs.portfolio.positions.positionCard(item.ticket)}
          isViewable={isViewable}
          onItemPress={onItemPress}
          data={item}
          onClosePressed={handleClosePressed}
        />
      );
    },
    [viewableAssets]
  );

  const handleClosePressed = useCallback(
    (position: Position, currencyProfitSymbol: string, currencyProfitSymbolDirect: boolean) => {
      setSelectedItem(position);
      setSelectedData({ currencyProfitSymbol, currencyProfitSymbolDirect });
      BottomSheetRef.current?.present();
    },
    []
  );

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
    }, [navigation, userId, selectedAccount])
  );

  useEffect(() => {
    if (selectedItem?.symbol) getSymbolConfig({ symbol: selectedItem?.symbol, accountId: selectedAccount });
  }, [selectedItem?.symbol, selectedAccount]);

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
    sheetIsOpen.current = false;
    if (Keyboard.isVisible()) Keyboard.dismiss();
  }, []);

  const assetUnit = useMemo(() => {
    return (
      tradingAssets.find((item: ParsedTradingAssets) => item.systemName === selectedItem?.symbol)?.assetUnitOfMeasure ||
      ''
    );
  }, [selectedItem?.symbol]);

  const goToIdeas = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

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
            await getDealsAccountsHandler();

            if (onClosed && typeof onClosed === 'function') {
              await onClosed();
            }
          },
          testID,
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
      const isVisibleKeyboard = Keyboard.isVisible();
      const timeout = isVisibleKeyboard ? 350 : 0;
      if (isVisibleKeyboard) Keyboard.dismiss();
      setTimeout(async () => {
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
                const profitValue = Math.abs(profit).toFixed(symbolConfig.data?.digits || 0);
                const profitStyle = { color: profit < 0 ? redColor : greenColor };
                const profitDesc =
                  profit < 0 ? t('screens.position-info.you-made-loss') : t('screens.position-info.you-made-profit');
                const profitCurrency = getSymbolFromCurrency(accountCurrency);

                const subTitle = (
                  <Fragment>
                    {profitDesc}
                    {` `}
                    <BaseText
                      testID={testIDs.portfolio.positions.subTitle}
                      style={profitStyle}
                      variant={BaseTextVariant.captionSemiBold}
                    >
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
                  testIDs.positions.createPosition.successPopUp
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
      selectedItem,
      closePositionResponse.isLoading,
      symbolConfig.data?.digits
    ]
  );

  const getAssetUnitOfMeasureDigits = useCallback(
    (asset: string) => {
      return (
        tradingAssets.find((item: ParsedTradingAssets) => item.systemName === asset)?.assetUnitOfMeasureDigits || 2
      );
    },
    [tradingAssets]
  );

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

  const goToPulse = useCallback(() => {
    navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
  }, [navigation]);

  const Empty = useCallback(() => {
    return (
      <BasePortfolioEmptyContainer
        buttonText={t('screens.portfolio.no-data.explore')}
        subTitle={emptyText.subTitle || t('screens.portfolio.no-data.browse-signal')}
        showButton={emptyText.started ? true : false}
        title={emptyText.title || t('screens.portfolio.no-data.no-position')}
        style={{ top: '40%' }}
        onPress={goToPulse}
        buttonStyle={{ marginTop: 60, backgroundColor: theme.palette.green[500] }}
      />
    );
  }, [emptyText, t, goToPulse]);

  const _renderFooter = useCallback(() => {
    return (
      <View style={styles.footer}>
        <BaseText variant={BaseTextVariant.captionSemiBold}>
          {t('screens.portfolio.no-data.looking-for-trading-signals')}
        </BaseText>
        <BaseButton
          label={t('screens.portfolio.no-data.explore')}
          size={BaseButtonSize.large}
          type={BaseButtonType.primary}
          style={styles.buttonFooter}
          labelStyle={styles.buttonLabel}
          onPress={goToPulse}
        />
      </View>
    );
  }, [t, goToPulse]);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        testID={testIDs.portfolio.positions.flatList}
        style={styles.list}
        data={positionList.data as (DealsInfo & ParsedTradingAssets)[]}
        key={positionList.key}
        snapToInterval={50}
        decelerationRate={'fast'}
        ItemSeparatorComponent={Seperator}
        maxToRenderPerBatch={30}
        updateCellsBatchingPeriod={100}
        windowSize={20}
        ListEmptyComponent={Empty}
        onMomentumScrollEnd={onStop}
        onScrollBeginDrag={onBegin}
        onViewableItemsChanged={onViewableItemsChanged}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
        ListFooterComponent={positionList.data?.length ? _renderFooter : null}
      />
      <BottomSheetModal
        ref={BottomSheetRef}
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        onDismiss={onClose}
        handleIndicatorStyle={styles.indicator}
        onAnimate={onAnimate}
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
      <BaseLoader active={closePositionResponse.isLoading} />
      {showGuideline && renderGuideline()}
    </View>
  );
};

export default PositionsScreen;

import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { Dimensions, FlatList, Insets, TouchableOpacity, View } from 'react-native';
import {
  BaseMarketTabs,
  BaseSignalCard,
  BaseText,
  BaseTradingBanner,
  BaseBackButton,
  OpenPosition
} from '@/components';
import { useTheme, ParamListBase, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { useAppSelector } from '@/hooks';
import { config } from '@/constants';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { Signals, Symbols } from '@/store/slices/market/types';
import { useNetwork } from '@/providers';
import {
  useGetTradingAccountsMutation,
  useGetDealsAccountsQuery,
  useProfileQuery,
  useGetSignalsQuery
} from '@/store/api';
import { TradeSource } from '@/helpers';

const {
  buttons: { activeOpacity }
} = config;

const ALL = 'All';
const LIVE = 'Live';

type SignalsListScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.SignalsList>;

const HIT_SLOP: Insets = { left: 8, right: 8, top: 8, bottom: 0 };

const { width, height } = Dimensions.get('window');

const SignalsListScreen: FC<SignalsListScreenProps> = ({ route, navigation }) => {
  const dataSeparatorIndex = useRef<number>(0);

  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [currentTab, setTab] = useState<string>(ALL);
  const [data, setData] = useState<Signals[]>([]);
  const [signalsCount, setSignalsCount] = useState({});

  const [selectedSignal, setSignal] = useState<Signals | null>(null);

  const { t, i18n } = useTranslation();

  const { websocket, isReadyState } = useNetwork();
  const [getSignals, signalsResponse] = useGetSignalsQuery();

  const [liveEquity, setLiveEquity] = useState<number>(0);

  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = pageIsFocused && isReadyState && websocket;

  const categorySymbols = useAppSelector((store) => store.market.symbols);
  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);
  const currentSignals = useAppSelector((store) => store.market.signals);
  const tradingAssets = useAppSelector((store) => store.portfolio.tradingAssets);
  const categories = useAppSelector((store) => store.market.categories);
  const allRelatedSymbols = useAppSelector((store) => store.market.allSymbols);

  const signals = useMemo(() => {
    const allAssetsMap = new Set(allRelatedSymbols.map((item) => item.name) || []);
    return (
      currentSignals?.filter((el) => !el.Disabled)?.filter((item: any) => allAssetsMap.has(item.Product.amegaName)) ||
      []
    );
  }, [currentSignals, allRelatedSymbols]);

  const application = useAppSelector((state) => state.application);
  const { promoWelcome } = application || {};
  const { welcomeAccountTypeId } = promoWelcome || {};

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const isAuthorized = Boolean(accessToken);

  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo } = portfolio || {};
  const { id: userId } = userInfo || {};

  const tradingAccounts = useAppSelector((state) => state.wallet.tradingAccounts);

  const [getProfile] = useProfileQuery();
  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getTradingAccounts] = useGetTradingAccountsMutation();

  const symbols = useMemo((): Symbols[] => {
    if (!tradingAssets) return [];
    return categorySymbols.map((symbol) => {
      const asset = tradingAssets.find((item) => item.systemName === symbol.name);
      return asset ? { ...symbol, image: asset.image, description: asset.fullName || symbol.description } : symbol;
    });
  }, [categorySymbols, tradingAssets]);

  const theme = useTheme();
  const styles = useStyles(theme);

  const getDealsHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      await getDealsAccounts(userId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getAccountsDataHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getProfile();
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDealsHandler();
    }, [route, navigation, userId])
  );

  useFocusEffect(
    useCallback(() => {
      getAccountsDataHandler();
    }, [route, navigation, isAuthorized])
  );

  const getLiveEquity = () => {
    if (tradingAccounts && tradingAccounts.length === 0) {
      return;
    }

    const equity = tradingAccounts
      .filter((account) => account.typeId !== welcomeAccountTypeId)
      .reduce((acc, current) => {
        const { equity: currentEquity = 0 } = current || {};
        return acc + currentEquity;
      }, 0);

    setLiveEquity(equity);
  };

  useLayoutEffect(() => {
    getLiveEquity();
  }, [tradingAccounts]);

  useEffect(() => {
    fetchSignals();
  }, [selectedAccount, userInfo.id, i18n.language]);

  useEffect(() => {
    const liveSignals = signals
      .filter((signal) => signal.Report?.status === 9)
      .sort((a, b) => b.Report?.confidence - a.Report?.confidence);
    if (currentTab === ALL) {
      setData(signals);
    } else if (currentTab === LIVE) {
      setData(liveSignals);
    } else {
      setData(signals.filter((signal) => signal.Product.assetGroup === currentTab));
    }

    let counts = { [LIVE]: liveSignals.length };

    categories.map((category) => {
      counts = { ...counts, [category]: signals.filter((signal) => signal.Product.assetGroup === category).length };
    });
    setSignalsCount(counts);
  }, [currentTab, categories, signals]);

  const fetchSignals = useCallback(() => {
    if (selectedAccount && userInfo.id) getSignals({ accountId: selectedAccount, language: i18n.language });
  }, [selectedAccount, userInfo.id, i18n.language]);

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }

    const symbolNames: string[] = [];

    signals.map((signal) => {
      const asset = getAsset(signal.Product.amegaName);
      if (asset?.systemName) symbolNames.push(asset.systemName);
    });

    websocket.send(`unsubscribe ALL`);
    websocket.send(`subscribe ${symbolNames.join(' ')}`);
  }, [enabledHandleMessage, signals]);

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
    }, [navigation, route, enabledHandleMessage, signals])
  );

  const HeaderRight = useMemo(() => {
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        activeOpacity={activeOpacity}
        style={styles.topIconWrapper}
        onPress={() => {
          requestAnimationFrame(() => setViewType(viewType === 'grid' ? 'list' : 'grid'));
        }}
      >
        {viewType === 'grid' ? (
          <SvgIcon name={SvgXmlIconNames.grid} size={IconSize.xsm} color={theme.palette.graphite['900']} />
        ) : (
          <SvgIcon name={SvgXmlIconNames.listView} size={IconSize.xsm} color={theme.palette.graphite['900']} />
        )}
      </TouchableOpacity>
    );
  }, [t, viewType, theme.dark]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: t('screens.signals-list.header'),
      headerTitleAlign: 'center',
      headerStyle: styles.headerStyle,
      headerRight: () => HeaderRight,
      headerLeft: () => <BaseBackButton isChevron={false} />
    });
    return () => {};
  }, [navigation.setOptions, route, viewType, t]);

  const getAsset = useCallback(
    (symbol: string) => {
      return tradingAssets.find((asset) => asset.systemName === symbol);
    },
    [tradingAssets]
  );

  const handleOpenSignalDetails = useCallback((data: Signals) => {
    navigation.navigate(ROOT_ROUTE_NAMES.SignalDetails, {
      data
    });
  }, []);

  const renderBanner = useMemo(() => {
    const { isVerified, firstDepositDate, lastTradedAt } = userInfo || {};

    if (isAuthorized && isVerified && !firstDepositDate)
      return (
        <BaseTradingBanner
          style={styles.banner}
          title={`${t('screens.common.next-step')}:`}
          subTitle={t('screens.wallet.main-wallet-prompt')}
          buttonText={t('screens.wallet.make-deposit')}
          imageSource={images.safe}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
          }}
        />
      );

    if (isAuthorized && isVerified && firstDepositDate && !liveEquity && !lastTradedAt)
      return (
        <BaseTradingBanner
          style={styles.banner}
          title={`${t('screens.common.next-step')}:`}
          subTitle={t('screens.wallet.top-up-trading-account')}
          buttonText={t('screens.wallet.transfer-funds-now')}
          imageSource={images.rocket}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
          }}
          imageStyle={{ right: -22 }}
        />
      );

    if (isAuthorized && isVerified && firstDepositDate && liveEquity && !lastTradedAt)
      return (
        <BaseTradingBanner
          style={styles.banner}
          leftSectionStyle={styles.bannerWoButton}
          title={t('screens.wallet.start-trading')}
          subTitle={t('screens.wallet.start-trading-now')}
          imageSource={images.barChart}
        />
      );

    return null;
  }, [t, styles, isAuthorized, userInfo, liveEquity]);

  const _renderItem = useCallback(
    ({ item, index }: { item: Signals; index: number }) => {
      const asset = getAsset(item.Product?.amegaName);
      dataSeparatorIndex.current = index;
      return (
        <BaseSignalCard
          isRowView={viewType === 'grid'}
          data={item}
          symbolName={asset?.systemName || item.Product.amegaName}
          style={viewType === 'grid' ? styles.card : undefined}
          image={asset?.image}
          digits={item.Product.lastTick?.digits || 0}
          onPress={() => {
            handleOpenSignalDetails(item);
          }}
          onActionButtonPressed={() => {
            setSignal(item);
          }}
        />
      );
    },
    [viewType]
  );

  const ItemSeparatorComponent = useCallback(() => {
    const index = dataSeparatorIndex.current + 1;
    const showBanner = (viewType === 'grid' && index === 4) || (viewType === 'list' && index === 3);
    if (!showBanner) {
      return null;
    }
    const banner = renderBanner;
    if (!banner) {
      return null;
    }
    return <View style={styles.bannerBox}>{banner}</View>;
  }, [styles, viewType, dataSeparatorIndex, renderBanner]);

  const ListEmptyComponent = useMemo(() => {
    if (symbols.length) return null;

    const rows = new Array(20).fill(null);

    const cardWidth = 180;
    const cardHeight = 236;

    if (signalsResponse.isLoading)
      return (
        <ContentLoader
          speed={2}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={theme.palette.graphite['050']}
        >
          {rows.map((_, index) => {
            const y = index * 8 + index * cardHeight;
            return <Rect key={`${index}-placeholder`} rx={8} ry={8} y={y} width={cardWidth} height={cardHeight} />;
          })}
        </ContentLoader>
      );

    return (
      <View style={styles.emptyView}>
        <BaseText>{t('screens.common.empty')}</BaseText>
      </View>
    );
  }, [theme.dark, symbols.length, signalsResponse.isLoading]);

  const onTabPressed = async (groupName: string) => {
    setTab(groupName);
    if (!selectedAccount) return;
    try {
      await getSignals({ accountId: selectedAccount, language: i18n.language });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const renderLiveIcon = useCallback(() => {
    return (
      <View style={styles.tabLive}>
        <SvgIcon name={SvgXmlIconNames.signal} size={IconSize.xs} />
      </View>
    );
  }, []);

  const customCategories = useMemo(() => [ALL, LIVE], []);

  const onClose = useCallback(() => {
    setSignal(null);
  }, [setSignal]);

  const _keyExtractor = useCallback((signal: Signals) => `${signal.id}`, []);

  return (
    <View style={styles.safe}>
      <View style={styles.tabsContainer}>
        <BaseMarketTabs
          additionalCategories={customCategories}
          onTabPressed={onTabPressed}
          counts={signalsCount}
          tabIcons={{ [LIVE]: renderLiveIcon() }}
        />
      </View>
      <View style={styles.screen}>
        <FlatList
          numColumns={viewType === 'grid' ? 2 : 1}
          windowSize={31}
          key={`signals-list-${viewType}`}
          data={data}
          style={styles.list}
          ListEmptyComponent={ListEmptyComponent}
          ItemSeparatorComponent={ItemSeparatorComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyExtractor={_keyExtractor}
          renderItem={_renderItem}
        />
      </View>
      <OpenPosition
        ask={selectedSignal?.Product?.lastTick?.ask}
        bid={selectedSignal?.Product?.lastTick?.bid}
        asset={selectedSignal?.Product?.amegaName}
        visible={!!selectedSignal?.Product.amegaName}
        setVisible={onClose}
        entry={selectedSignal?.Report?.action === 0}
        signalData={selectedSignal ?? undefined}
        tradeSource={TradeSource.Signals}
      />
    </View>
  );
};

export default SignalsListScreen;

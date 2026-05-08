import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { ArticleDisclaimer, BaseAssetCard, BaseBlackBanner, BaseText, BaseTextVariant, BlackBannerTypes } from '@/components';
import { UserTheme, config, testIDs } from '@/constants';
import { useAppSelector, useCommonStyles, useHasBalance } from '@/hooks';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import {
  useGetSymbolConfigMutation,
  useGetSymbolLastTickQuery,
  useInvestmentIdeaDetailsQuery,
  useWatchWidgetByIdQuery
} from '@/store/api';
import { WatchWidget } from '@/store/slices/ideas-hub/types';
import { ParamListBase, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  ViewStyle,
  ImageStyle,
  TextStyle,
  ImageBackground,
  Platform
} from 'react-native';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { IdeaData } from '@/types';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
import { useNetwork } from '@/providers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';

type WidgetArticleScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.WidgetArticle>;
interface Asset {
  ask: number;
  bid: number;
  digits: number;
  lastClosedPrice: number;
  systemName: string;
  tradeMode: number | undefined;
}
interface AssetsConfig {
  [key: string]: Asset;
}

const {
  screenHeight,
  buttons: { activeOpacity },
  isIOS,
  screenWidth
} = config;

const backLimit = isIOS ? 260 : 300;
const start = { x: 0.5, y: 1.0 };
const end = { x: 0.5, y: 0.0 };
const WidgetArticleScreen: React.FC<WidgetArticleScreenProps> = ({ navigation, route }) => {
  const [maxScroll, setMaxScroll] = useState(0);
  const [assetsConfig, setAssetsConfig] = useState<AssetsConfig>({});

  const isGoBack = useRef<boolean>(true);
  const scrollRef = useRef<ScrollView>(null);

  const { websocket, isReadyState } = useNetwork();
  const pageIsFocused = useIsFocused();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite }
  } = theme || {};

  const { t } = useTranslation();

  const id = route.params.id;
  const isInvestment = route.params?.isInvestment ?? false;

  const { top } = useSafeAreaInsets();

  const hasBalance = useHasBalance()

  const [getSymbolLastTick] = useGetSymbolLastTickQuery();
  const [getSymbolConfig] = useGetSymbolConfigMutation();
  const [getWatchWidget, { isFetching: isWatchLoading, data: watchData }] = useWatchWidgetByIdQuery();
  const [getIdeaWidget, { isFetching: isIdeaLoading, data: ideaData }] = useInvestmentIdeaDetailsQuery();

  const getWidget = useMemo(() => (isInvestment ? getIdeaWidget : getWatchWidget), [isInvestment]);

  const isFetching = useMemo(
    () => (isInvestment ? isIdeaLoading : isWatchLoading),
    [isInvestment, isIdeaLoading, isWatchLoading]
  );
  const data = useMemo(() => (isInvestment ? ideaData : watchData), [isInvestment, watchData, ideaData]);

  const userInfo = useAppSelector(store => store.portfolio.userInfo)
  const tradingAssets = useAppSelector((store) => store.portfolio.tradingAssets);
  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount) || 0;
  const allRelatedSymbols = useAppSelector((store) => store.market.allSymbols);
  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const translationY = useSharedValue(0);

  const article = useMemo((): WatchWidget & IdeaData => {
    if (!data) return {} as WatchWidget & IdeaData;
    return Array.isArray(data)
      ? data.find((item: WatchWidget | IdeaData) => item.id === id) || ({} as WatchWidget)
      : (data as (IdeaData & WatchWidget));
  }, [data, id]);

  const articleAssets = useMemo(() => {
    if (!allRelatedSymbols.length || !article?.assets?.length) return [];
    const allAssetsMap = new Set(allRelatedSymbols.map((item) => item.name));
    const finalAssets = article?.assets?.filter((item) => allAssetsMap.has(item.systemName));
    return finalAssets || [];
  }, [allRelatedSymbols, article?.assets]);

  const enabledHandleMessage = websocket && pageIsFocused && isReadyState && articleAssets.length > 0;

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }

    const symbolNames: string[] = [];

    articleAssets.map((asset) => {
      if (asset?.systemName) symbolNames.push(asset.systemName);
    });

    websocket.send(`unsubscribe ALL`);

    websocket.send(`subscribe ${symbolNames.join(' ')}`);
  }, [enabledHandleMessage]);

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
    }, [enabledHandleMessage])
  );

  useEffect(() => {
    getWidget(id);
  }, [id]);

  const handleValue = (val: number) => {
    if (val > backLimit) isGoBack.current = false;
    else isGoBack.current = true;
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    runOnJS(handleValue)(event.contentOffset.y);
    translationY.value = withSpring(event.contentOffset.y, { damping: 80, stiffness: 300 });
  });

  const scrollAnim = useAnimatedStyle(() => {
    const rotate = interpolate(translationY.value, [0, backLimit, backLimit + 40], [0, 0, 90], 'clamp');
    const bg = interpolateColor(
      translationY.value,
      [0, backLimit, backLimit + 40],
      ['transparent', 'transparent', theme.palette.purple[800]]
    );

    return {
      transform: [{ translateY: translationY.value }, { rotate: `${rotate}deg` }],
      backgroundColor: graphite['900']
    };
  }, [maxScroll, theme.dark, isIOS]);

  const rules: RenderRules = useMemo(
    () => ({
      heading1: (node, children, parent, styles) => (
        <BaseText key={node.key} style={[styles.heading, styles.heading1]} variant={BaseTextVariant.captionSemiBold}>
          {children}
        </BaseText>
      ),
      heading2: (node, children, parent, styles) => (
        <BaseText key={node.key} style={[styles.heading, styles.heading2]} variant={BaseTextVariant.titleXXS}>
          {children}
        </BaseText>
      ),
      heading3: (node, children, parent, styles) => (
        <BaseText key={node.key} style={[styles.heading, styles.heading3]} variant={BaseTextVariant.titleXXS}>
          {children}
        </BaseText>
      ),
      heading4: (node, children, parent, styles) => (
        <BaseText key={node.key} style={[styles.heading, styles.heading4]} variant={BaseTextVariant.titleXXS}>
          {children}
        </BaseText>
      ),
      heading5: (node, children, parent, styles) => (
        <BaseText key={node.key} style={[styles.heading, styles.heading5]} variant={BaseTextVariant.titleXXS}>
          {children}
        </BaseText>
      ),
      heading6: (node, children, parent, styles) => (
        <BaseText key={node.key} style={[styles.heading, styles.heading6]} variant={BaseTextVariant.titleXXS}>
          {children}
        </BaseText>
      )
    }),
    [theme.dark, article.description]
  );

  useEffect(() => {
    if (articleAssets) {
      articleAssets.map(
        (asset: {
          id: number;
          name: string;
          fullName: string;
          systemName: string;
          createdAt: string;
          locale: string;
        }) => {
          getSymbolLastTick({ accountId: selectedAccount, symbol: asset?.systemName })
            .unwrap()
            .then((response) => {
              if (response && response.symbol) {
                setAssetsConfig((config) => ({
                  ...config,
                  [response.symbol]: { ...config[response.symbol], ask: response.ask, bid: response.bid }
                }));
              }
            });

          getSymbolConfig({ accountId: selectedAccount, symbol: asset?.systemName })
            .unwrap()
            .then((response) => {
              if (response && response.symbol) {
                setAssetsConfig((config) => ({
                  ...config,
                  [response.symbol]: {
                    ...config[response.symbol],
                    digits: response.digits,
                    lastClosedPrice: response.lastClosedPrice,
                    tradeMode: response.tradeMode
                  }
                }));
              }
            });
        }
      );
    }
  }, [articleAssets, selectedAccount]);

  const onBackHandler = useCallback(() => {
    if (isGoBack.current && navigation.isFocused()) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate(ROOT_ROUTE_NAMES.WidgetList, { isInvestment });
      }
    } else {
      scrollRef.current?.scrollTo({ x: 0, y: 0 });
    }
  }, [navigation, isInvestment]);

  const onLayout = useCallback((l: LayoutChangeEvent) => {
    setMaxScroll(l.nativeEvent.layout.height);
  }, []);

  const assetsComponent = useMemo(() => {
    if (!articleAssets.length) {
      return null;
    }

    return (
      <View style={styles.assetsBox}>
        {articleAssets.map((item) => {
          const tradeMode = assetsConfig[item?.systemName]?.tradeMode;
          return (
            <BaseAssetCard
              useTradeMode={true}
              tradeMode={tradeMode}
              key={item.id + item.systemName}
              isViewable={true}
              fullName={item.fullName}
              title={item.systemName}
              image={tradingAssets.find((i) => i.systemName === item.systemName)?.image || ''}
              bid={assetsConfig[item.systemName] ? `${assetsConfig[item.systemName].bid}` : ''}
              ask={assetsConfig[item.systemName] ? `${assetsConfig[item.systemName].ask}` : ''}
              digits={assetsConfig[item.systemName]?.digits || 0}
              lastClosedPrice={assetsConfig[item.systemName]?.lastClosedPrice || 0}
            />
          );
        })}
      </View>
    );
  }, [t, styles, articleAssets, assetsConfig]);

  const Category = useCallback(({ category }: { category: string }) => {
    return (
      <View style={styles.categoryContainer}>
        <BaseText testID={testIDs.widgetArticle.category} >{category || 'sample'}</BaseText>
      </View>
    );
  }, []);

  const imageUrl = useMemo(() => ({ uri: article.image }), [article.image]);

  const markdownStyle = useMemo(
    () =>
      ({
        blockquote: styles.blockquote,
        body: styles.body,
        heading1: BaseTextVariant.captionSemiBold,
        heading2: BaseTextVariant.titleXXS,
        heading3: BaseTextVariant.text,
        heading4: BaseTextVariant.text,
        heading5: BaseTextVariant.text,
        heading6: BaseTextVariant.text
      }) as Record<string, ViewStyle | ImageStyle | TextStyle>,
    [theme.dark, article.id]
  );

  const gradientColors = useMemo(() => [theme.palette.graphite['900'], 'transparent'], [theme.dark]);

  const Loader = useCallback(() => {
    return (
      <Animated.View exiting={FadeOut.duration(200)}>
        <ContentLoader
          speed={2}
          width={screenWidth}
          height={screenHeight}
          viewBox={`0 0 ${screenWidth} ${screenHeight}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={theme.palette.graphite['050']}
        >
          <Rect x={0} y={0} width={screenWidth} height={340} />
          <Rect x={20} y={360} rx='4' ry='4' width={screenWidth - 40} height={screenHeight} />
        </ContentLoader>
      </Animated.View>
    );
  }, [theme.dark]);

  const Wrapper = useCallback(
    ({ children }: { children: ReactNode }) => {
      if (isInvestment) return <View style={styles.gradient}>{children}</View>;
      return (
        <LinearGradient colors={gradientColors} start={start} end={end} style={styles.gradient}>
          {children}
        </LinearGradient>
      );
    },
    [isInvestment, article]
  );

  const backButtonTop = useMemo(
    () =>
      Platform.select({
        ios: top,
        android: 10
      }),
    [top, Platform.OS]
  );



  const isAuthorized = Boolean(accessToken);

  const isVerified = userInfo?.isVerified || false;
  const isDeposit = !!userInfo.firstDepositDate;
  const isFund = !!userInfo.lastTradedAt;

  const goToVerification = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Common, {
        screen: COMMON_ROUTE_NAMES.Verification
      });
    });
  }, [navigation]);

  const goToSignUp = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
        screen: AUTH_ROUTE_NAMES.BonusSignUp
      });
    });
  }, [navigation]);

  const goToDeposit = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
  }, []);

  const goToTransfer = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
  }, []);

  const goToSignals = useCallback(() => {
    navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
  }, []);


  const banner = useMemo((): { type: BlackBannerTypes; goTo: () => void } => {
    if (!isAuthorized) return {
      goTo: goToSignUp,
      type: 'sign-up'
    };
    if (!isVerified) return { goTo: goToVerification, type: 'verification' };
    if (!isDeposit) return { goTo: goToDeposit, type: 'fund-now' };
    if (!isFund) {
      if (hasBalance) return { goTo: goToSignals, type: 'explore' };
      else return { goTo: goToTransfer, type: 'transfer' };
    }
    return { goTo: () => null, type: 'null' };
  }, [isAuthorized, isVerified, isDeposit, isFund, hasBalance, navigation]);


  if (isFetching) return <Loader />;


  return (
    <Animated.ScrollView
      testID={testIDs.widgetArticle.scrollView}
      onLayout={onLayout}
      showsVerticalScrollIndicator={false}
      ref={scrollRef}
      entering={FadeIn}
      onScroll={scrollHandler}
      style={styles.container}
    >
      {article?.image && article.image?.length > 0 && (
        <ImageBackground testID={testIDs.widgetArticle.imageBackground} style={styles.imgBg} source={imageUrl}>
          <Animated.View style={[styles.backContainer, { top: backButtonTop }, scrollAnim]}>
            <TouchableOpacity testID={testIDs.widgetArticle.backButton} onPress={onBackHandler} activeOpacity={activeOpacity} hitSlop={10}>
              <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} color={theme.palette.base.white} />
            </TouchableOpacity>
          </Animated.View>
          <Wrapper>
            <View style={styles.imageBottom}>
              {isInvestment && article.categories && article.categories?.[0]?.title?.length > 0 && (
                <Category category={article.categories?.[0]?.title} />
              )}
              <BaseText testID={testIDs.widgetArticle.articelTitle} style={styles.title} variant={BaseTextVariant.authSubTitle}>
                {article.title}
              </BaseText>
            </View>
          </Wrapper>
        </ImageBackground>
      )}
      <View style={styles.top}>
        {isInvestment && article?.shortDescription?.length > 0 && (
          <BaseText testID={testIDs.widgetArticle.shortDescription} style={styles.short} variant={BaseTextVariant.captionSemiBold}>
            {article.shortDescription}
          </BaseText>
        )}
        {article?.description?.length > 0 && (
          <Markdown rules={rules} style={markdownStyle}>
            {article.description}
          </Markdown>
        )}
      </View>
      {articleAssets.length > 0 && (
        <View style={styles.section}>
          <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.assetTitle}>
            {t('screens.ideas-hub.what-to-watch.related-assets')}
          </BaseText>
          {assetsComponent}
        </View>
      )}
      {banner.type !== 'null' && (
        <View style={styles.section} >
          <BaseBlackBanner type={banner.type} onPress={banner.goTo} />
        </View>
      )}
      <ArticleDisclaimer />
    </Animated.ScrollView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base, purple }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      backgroundColor: '#E1DFE5',
      flex: 1
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: graphite['050'],
      borderRadius: 16,
      marginVertical: 5
    },
    top: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 6,
      backgroundColor: graphite['050'],
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      marginBottom: 5,
      zIndex: 1
    },
    backContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      left: 10,
      zIndex: 1
    },
    assetsBox: {
      gap: 12
    },
    categoryContainer: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      backgroundColor: '#ecf0f1',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start'
    },
    imgBg: {
      width: '100%',
      height: 340,
      zIndex: 99
    },
    blockquote: {
      borderColor: purple[800],
      borderRadius: 16,
      borderTopLeftRadius: 0,
      backgroundColor: base.white,
      right: 5,
      width: '100%',
      paddingHorizontal: 16,
      marginTop: 10,
      ...shadow6Style
    },
    body: {
      ...BaseTextVariant.text,
      color: graphite['900'],
      lineHeight: 23.8,
      textAlign: 'left'
    },
    gradient: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      flex: 1,
      justifyContent: 'flex-end'
    },
    imageBottom: { gap: 16 },
    title: { color: base.white },
    short: {
      marginTop: 10,
      textAlign: 'left'
    },
    assetTitle: {
      marginBottom: 12
    }
  });
};

export default WidgetArticleScreen;

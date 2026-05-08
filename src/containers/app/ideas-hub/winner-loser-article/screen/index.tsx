import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { ArticleDisclaimer, BaseAssetCard, BaseBlackBanner, BaseText, BaseTextVariant, BlackBannerTypes } from '@/components';
import { UserTheme, config } from '@/constants';
import { useAppSelector, useCommonStyles, useHasBalance } from '@/hooks';
import { ParamListBase, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  ViewStyle,
  ImageStyle,
  TextStyle,
  View,
  Dimensions,
  Image
} from 'react-native';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import Animated, {
  FadeIn,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES, IDEASHUB_ROUTE_NAMES, IdeasHubRootParamsList, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { LineChart } from 'react-native-wagmi-charts';
import { Stop } from 'react-native-svg';
import { useNetwork } from '@/providers/network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';

type WinnerAndLosersArticleScreenProps = StackScreenProps<
  ParamListBase & IdeasHubRootParamsList,
  IDEASHUB_ROUTE_NAMES.WinnerAndLosersArticle
>;

const {
  buttons: { activeOpacity },
  isIOS
} = config;

const backLimit = 300;

const WinnerAndLosersArticleScreen: React.FC<WinnerAndLosersArticleScreenProps> = ({ navigation, route }) => {
  const { profit, config, lastTick, chartData, id, title, description, symbol, isProfitPlus, imageUrl, fullName } =
    route?.params;

  const isData = Boolean(chartData && Array.isArray(chartData) && chartData.length > 0);

  const [maxScroll, setMaxScroll] = useState(0);
  const isGoBack = useRef<boolean>(true);
  const scrollRef = useRef<ScrollView>(null);

  const { width } = Dimensions.get('window');
  const theme = useTheme();
  const styles = useStyles(theme);

  const hasBalance = useHasBalance()

  const {
    palette: { graphite }
  } = theme || {};

  const { websocket, isReadyState } = useNetwork();
  const pageIsFocused = useIsFocused();
  const enabledHandleMessage = websocket && pageIsFocused && isReadyState && symbol.length > 0;

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const userInfo = useAppSelector(store => store.portfolio.userInfo)

  const translationY = useSharedValue(0);

  const { top } = useSafeAreaInsets();

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
  }, [maxScroll, theme.dark]);

  const renderProfit = () =>
    profit !== undefined && config?.lastClosedPrice ? (
      <View style={[styles.profitContainer, isProfitPlus ? styles.profilePlus : styles.profileMinus]}>
        <BaseText variant={BaseTextVariant.small}>
          {isProfitPlus ? '+' : ''}
          {profit % 1 !== 0 ? profit.toFixed(2) : profit}%
        </BaseText>
      </View>
    ) : null;

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
    [theme.dark, description]
  );

  const onBackHandler = useCallback(() => {
    if (isGoBack.current && navigation.isFocused() && navigation.canGoBack()) navigation.goBack();
    else scrollRef.current?.scrollTo({ x: 0, y: 0 });
  }, []);

  const onLayout = useCallback((l: LayoutChangeEvent) => {
    setMaxScroll(l.nativeEvent.layout.height);
  }, []);

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }

    setTimeout(() => {
      websocket.send(`unsubscribe ALL`);
      websocket.send(`subscribe ${symbol}`);
    }, 0);
  }, [enabledHandleMessage, symbol, websocket, isReadyState, route]);

  const unsubscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }

    websocket.send(`unsubscribe ALL`);
  }, [enabledHandleMessage, symbol, websocket, isReadyState]);

  useFocusEffect(
    useCallback(() => {
      subscribeWebsocket();
      return () => {
        unsubscribeWebsocket();
      };
    }, [websocket, isReadyState, enabledHandleMessage, symbol])
  );

  const assetsComponent = useMemo(() => {
    return (
      <BaseAssetCard
        key={id + symbol}
        isViewable={true}
        fullName={fullName}
        title={symbol}
        image={imageUrl}
        bid={lastTick?.bid || ''}
        ask={lastTick?.ask || ''}
        digits={config?.digits || 0}
        lastClosedPrice={config?.lastClosedPrice || 0}
      />
    );
  }, [websocket, isReadyState, enabledHandleMessage, symbol]);

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
    [theme.dark]
  );

  const chartColor = useMemo(() => (isProfitPlus ? '#00C85E' : theme.palette.red['600']), [theme]);

  const renderDescription = useMemo(
    () =>
      description && (
        <View style={styles.section}>
          <Markdown rules={rules} style={markdownStyle}>
            {description}
          </Markdown>
        </View>
      ),
    [description, rules]
  );

  const renderChart = () =>
    isData ? (
      <View style={{ flex: 1 }}>
        <LineChart.Provider data={chartData}>
          <LineChart height={100} width={width}>
            <LineChart.Path color={isProfitPlus ? theme.palette.green['400'] : theme.palette.red['600']} width={3}>
              <LineChart.Gradient color={chartColor}>
                <Stop offset='0%' stopColor={chartColor} stopOpacity={0.7} />
                <Stop offset='90%' stopColor={chartColor} stopOpacity={0.3} />
              </LineChart.Gradient>
            </LineChart.Path>
          </LineChart>
        </LineChart.Provider>

        <LinearGradient
          colors={[`${chartColor}4D`, `${chartColor}33`, `${chartColor}1A`, `${chartColor}00`]}
          locations={[0, 0.3, 0.8, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ height: 86 }}
        />

        <View style={styles.titleContainer}>
          <BaseText>{renderProfit()}</BaseText>
          <BaseText variant={BaseTextVariant.authSubTitle} style={styles.title}>
            {title}
          </BaseText>
        </View>
      </View>
    ) : null;


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


  return (
    <Animated.ScrollView
      onLayout={onLayout}
      ref={scrollRef}
      entering={FadeIn}
      onScroll={scrollHandler}
      style={styles.container}
    >
      <Animated.View style={[styles.backContainer, { top: isIOS ? top : 20 }, scrollAnim]}>
        <TouchableOpacity onPress={onBackHandler} activeOpacity={activeOpacity} hitSlop={10}>
          <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} color={theme.palette.base.black} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.head}>
        {imageUrl && <Image resizeMode='contain' source={{ uri: imageUrl }} style={styles.img} />}
        {renderChart()}
      </View>
      {renderDescription}
      <View style={styles.section}>{assetsComponent}</View>
      {banner.type !== 'null' && (
        <View style={styles.section}>
          <BaseBlackBanner type={banner.type} onPress={banner.goTo} />
        </View>
      )}

      <ArticleDisclaimer />
    </Animated.ScrollView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base, purple, red }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E1DFE5'
    },
    head: {
      paddingBottom: 20,
      paddingTop: 10,
      backgroundColor: graphite['050'],
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      marginBottom: 5
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: graphite['050'],
      borderRadius: 16,
      marginVertical: 5
    },
    backContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99,
      left: 10,
      position: 'absolute'
    },
    blockquote: {
      borderColor: purple[800],
      borderRadius: 16,
      borderTopLeftRadius: 0,
      backgroundColor: base.white,
      right: 5,
      width: '100%',
      paddingHorizontal: 16,
      marginVertical: 15,
      ...shadow6Style
    },
    body: {
      ...BaseTextVariant.text,
      color: graphite['900'],
      lineHeight: 23.8,
      textAlign: 'left'
    },
    title: {
      marginTop: 12
    },
    short: {
      textAlign: 'left',
      marginBottom: 10
    },
    img: {
      height: 56,
      width: 56,
      alignSelf: 'flex-end',
      marginRight: 32,
      marginTop: 64,
      borderRadius: 100,
      marginBottom: 12
    },
    profitContainer: {
      padding: 5,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: base.white
    },
    profilePlus: { borderColor: '#00C85E' },
    profileMinus: { borderColor: red['600'] },
    titleContainer: {
      position: 'absolute',
      marginHorizontal: 20,
      marginRight: 50,
      bottom: 15
    }
  });
};

export default WinnerAndLosersArticleScreen;

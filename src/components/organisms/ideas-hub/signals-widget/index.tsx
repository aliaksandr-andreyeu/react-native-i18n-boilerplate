import React, { FC, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Modal, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  BaseText,
  BaseCaption,
  BaseTextVariant,
  BaseSignalCard,
  BaseGuideButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage
} from '@/components';
import { config, UserTheme, testIDs } from '@/constants';
import ContentLoader, { Rect } from 'react-content-loader/native';
import {
  NavigationProp,
  ParamListBase,
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useTheme
} from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { Signals } from '@/store/slices/market/types';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import { useAppSelector } from '@/hooks';
import { useNetwork } from '@/providers';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import useAsyncStorage from '@/hooks/asyncstorage';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';

const {
  components: {
    links: { activeOpacity, hitSlop }
  },
  headerBar: { height },
  screenWidth
} = config;

interface SignalsWidgetData {
  getSignals: () => void;
  signals: {
    loading: boolean;
    data: Signals[];
    error: string | null;
  };
  openCreatePosition: (signal: Signals) => void;
  testID?: string;
}

export const SignalBlurredContent = memo(
  ({
    isAuthorized,
    onSignUpPressed,
    onSignInPressed
  }: {
    isAuthorized: boolean;
    onSignUpPressed?: () => void;
    onSignInPressed?: () => void;
  }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const goToVerification = useCallback(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Common, {
        screen: COMMON_ROUTE_NAMES.Verification
      });
    }, [navigation]);

    const goToSignUpIntro = useCallback(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
        screen: AUTH_ROUTE_NAMES.BonusSignUp
      });
    }, [navigation]);

    const goToSignIn = useCallback(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
        screen: AUTH_ROUTE_NAMES.SignIn
      });
    }, [navigation]);

    return (
      <ImageBackground
        style={styles.bluredView}
        source={images.signalWidgetBg}
        resizeMode='stretch'
        testID={testIDs.components.organisms.signalsWidget.blurred.root}
      >
        <BaseImage
          style={styles.lockImage}
          resizeMode='contain'
          source={images.lock}
          testID={testIDs.components.organisms.signalsWidget.blurred.lockImage}
        />
        <BaseText variant={BaseTextVariant.titleXXS} testID={testIDs.components.organisms.signalsWidget.blurred.title}>
          {!isAuthorized
            ? t('screens.ideas-hub.signals.create-account-or-sign-in')
            : t('screens.ideas-hub.signals.verify-profile-access')}
        </BaseText>
        <BaseText
          variant={BaseTextVariant.extraSmall}
          style={styles.blurredSubTitle}
          testID={testIDs.components.organisms.signalsWidget.blurred.subtitle}
        >
          {t('screens.ideas-hub.signals.explore-daily-signals')}
        </BaseText>
        {!isAuthorized ? (
          <View style={styles.loginButtons}>
            <BaseButton
              label={t('screens.common.sign-up')}
              size={BaseButtonSize.small}
              type={BaseButtonType.primary}
              style={{ flex: 1 }}
              onPress={onSignUpPressed ?? goToSignUpIntro}
              testID={testIDs.components.organisms.signalsWidget.blurred.signUpBtn}
            />
            <BaseButton
              label={t('screens.common.sign-in')}
              size={BaseButtonSize.small}
              type={BaseButtonType.accent}
              style={{ marginLeft: 8, flex: 1 }}
              onPress={onSignInPressed ?? goToSignIn}
              testID={testIDs.components.organisms.signalsWidget.blurred.signInBtn}
            />
          </View>
        ) : (
          <BaseButton
            label={t('screens.ideas-hub.signals.complete-verification')}
            style={{ width: '100%' }}
            size={BaseButtonSize.small}
            type={BaseButtonType.primary}
            onPress={goToVerification}
            testID={testIDs.components.organisms.signalsWidget.blurred.verificationBtn}
          />
        )}
      </ImageBackground>
    );
  }
);

const SignalsWidget: FC<SignalsWidgetData> = ({ getSignals, signals, openCreatePosition, testID }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [visible, setVisible] = useState<boolean>(false);

  const { loading, data, error } = signals || {};
  const { websocket, isReadyState } = useNetwork();
  const pageIsFocused = useIsFocused();

  const { get, set, loading: storageLoading, storageValues } = useAsyncStorage<'signal-guide'>();

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const { userInfo } = useAppSelector((store) => store.portfolio);
  const isVerified = userInfo?.isVerified;

  const isAuthorized = Boolean(accessToken);

  useLayoutEffect(() => {
    get('signal-guide');
  }, []);

  const { width } = useWindowDimensions();
  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);
  const tradingAssets = useAppSelector((store) => store.portfolio.tradingAssets);

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite }
  } = theme;

  const isEmpty = Boolean(!(data && Array.isArray(data) && data.length > 0));
  const enabledHandleMessage = websocket && pageIsFocused && isReadyState && data.length > 0;

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }

    const symbolNames: string[] = [];

    data.map((signal) => {
      if (signal?.type === 'blur') return;
      const asset = getAsset(signal.Product.amegaName);
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
    }, [enabledHandleMessage, selectedAccount])
  );

  const signalsLoader = useMemo(() => {
    const cardWidth = 180;
    const startX = 20;
    const divider = 12;
    const count = Math.ceil(width / cardWidth);
    const items = [...Array(count).keys()];
    return (
      <ContentLoader
        speed={2}
        width={width}
        height={236}
        viewBox={`0 0 ${width} 236`}
        backgroundColor={'#E2E6F2'}
        foregroundColor={graphite['050']}
        testID={testIDs.components.organisms.signalsWidget.loader}
      >
        {items.map((_, index) => {
          const x = startX + index * (cardWidth + divider);
          return <Rect key={index} x={x} y='0' rx='8' ry='8' width={cardWidth} height='236' />;
        })}
      </ContentLoader>
    );
  }, [loading, styles, width]);

  const signalsError = useMemo(() => {
    if (!error) {
      return null;
    }
    const onPress = () => {
      getSignals && typeof getSignals === 'function' && getSignals();
    };
    return (
      <View style={styles.empty} testID={testIDs.components.organisms.signalsWidget.error.root}>
        <BaseText style={styles.noContentTitle} variant={BaseTextVariant.textSemiBold} testID={testIDs.components.organisms.signalsWidget.error.title}>
          {t('messages.problem-loading-data.title')}
        </BaseText>
        <BaseText style={styles.noContentDesc} variant={BaseTextVariant.small} testID={testIDs.components.organisms.signalsWidget.error.desc}>
          {t('messages.problem-loading-data.desc')}
        </BaseText>
        <TouchableOpacity
          style={styles.noContentLinkBox}
          hitSlop={hitSlop}
          activeOpacity={activeOpacity}
          onPress={onPress}
          testID={testIDs.components.organisms.signalsWidget.error.retryBtn}
        >
          <BaseText style={styles.noContentLink} testID={testIDs.components.organisms.signalsWidget.error.retryText}>
            {t('messages.problem-loading-data.link')}
          </BaseText>
        </TouchableOpacity>
      </View>
    );
  }, [t, styles, error, getSignals]);

  const getAsset = useCallback(
    (symbol: string) => {
      return tradingAssets.find((asset) => asset.systemName === symbol);
    },
    [tradingAssets]
  );

  const signalsEmpty = useMemo(() => {
    if (!isEmpty) {
      return null;
    }
    return (
      <View style={styles.empty} testID={testIDs.components.organisms.signalsWidget.empty.root}>
        <Image source={images.pause} resizeMode='contain' style={styles.img} testID={testIDs.components.organisms.signalsWidget.empty.img} />
        <BaseText style={styles.noContentTitle} variant={BaseTextVariant.captionSemiBold} testID={testIDs.components.organisms.signalsWidget.empty.title}>
          {t('screens.ideas-hub.signals.no-trading-signals-right-now')}
        </BaseText>
        <BaseText style={styles.noContentDesc} variant={BaseTextVariant.text} testID={testIDs.components.organisms.signalsWidget.empty.desc}>
          {t('screens.ideas-hub.signals.markets-closed-check-back-later')}
        </BaseText>
      </View>
    );
  }, [t, styles, isEmpty]);

  const handleOpenSignalDetails = useCallback((data: Signals) => {
    navigation.navigate(ROOT_ROUTE_NAMES.SignalDetails, {
      data
    });
  }, []);

  const handleOpenAllSignals = useCallback(() => {
    navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
  }, []);

  const list = useMemo(() => {
    if (!(data && Array.isArray(data))) {
      return [];
    }

    return data.map((signal, index) => {
      if (signal?.type === 'blur') {
        return (
          <TouchableOpacity
            key={`${index}-blur-signal`}
            onPress={() => openCreatePosition({ Product: { amegaName: 'test' } } as Signals)}
            activeOpacity={activeOpacity}
            testID={testIDs.components.organisms.signalsWidget.list.blurItem(index)}
          >
            <BaseImage style={styles.fakeImg} source={images.blurredSignal} />
          </TouchableOpacity>
        );
      }

      const asset = getAsset(signal.Product.amegaName);
      return (
        <BaseSignalCard
          isRowView
          maxWidth={180}
          rowWidth={180}
          key={signal.id}
          data={signal}
          symbolName={asset?.systemName || signal.Product.amegaName}
          image={asset?.image}
          digits={signal.Product.lastTick?.digits || 0}
          onPress={() => {
            if (!userInfo.isVerified) return openCreatePosition(signal);
            handleOpenSignalDetails(signal);
          }}
          onActionButtonPressed={() => {
            openCreatePosition(signal);
          }}
          testID={testIDs.components.organisms.signalsWidget.list.card(signal.id)}
        />
      );
    });
  }, [data, isReadyState]);

  const signalsComponent = useMemo(() => {
    if (!isAuthorized) {
      return <SignalBlurredContent isAuthorized={isAuthorized} />;
    }

    if (loading) {
      return signalsLoader;
    }
    if (error) {
      return signalsError;
    }
    if (isEmpty) {
      return signalsEmpty;
    }
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollBox}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        testID={testIDs.components.organisms.signalsWidget.list.scrollView}
      >
        {list}
      </ScrollView>
    );
  }, [styles, signalsLoader, signalsError, signalsEmpty, list, isReadyState, isAuthorized, isVerified]);

  const onGuidePress = useCallback(() => setVisible((p) => !p), []);

  const onDoNotShowPress = useCallback(() => {
    setVisible(false);
    set('signal-guide', 'true');
  }, []);

  const ShowGuide = useMemo(() => {
    if (storageLoading || storageValues['signal-guide'] || !isAuthorized || !isVerified) return null;

    return (
      <BaseGuideButton
        title={t('screens.ideas-hub.signals.guide-label')}
        onPress={onGuidePress}
        containerStyle={styles.guide}
        testID={testIDs.components.organisms.signalsWidget.guide.button}
      />
    );
  }, [isAuthorized, isVerified, storageLoading, storageValues, theme.dark, t]);

  const ShowPremiumSignals = useMemo(() => {
    if (isVerified) return null;

    return (
      <BaseGuideButton
        title={t('screens.ideas-hub.signals.signals-after-verification')}
        disabled
        leftIconColor={theme.palette.icon.base.strong}
        leftIcon={SvgXmlIconNames.diamondUnderline}
        variant={BaseTextVariant.extraSmall}
        hasRightIcon={false}
        containerStyle={styles.guide}
        testID={testIDs.components.organisms.signalsWidget.premium.button}
      />
    );
  }, [isVerified, theme.dark, t]);

  return (
    <View style={styles.container} testID={testID ?? testIDs.components.organisms.signalsWidget.container}>
      <Modal
        animationType='fade'
        visible={visible}
        transparent
        statusBarTranslucent
        testID={testIDs.components.organisms.signalsWidget.guide.modal}
      >
        <View style={styles.modal}>
          <View style={styles.closeContainer}>
            <TouchableOpacity onPress={onGuidePress} hitSlop={12} testID={testIDs.components.organisms.signalsWidget.guide.closeBtn}>
              <SvgIcon name={SvgXmlIconNames.close} color={theme.palette.base.white} size={IconSize.sm} />
            </TouchableOpacity>
          </View>
          <View style={styles.imgContainer}>
            <BaseImage
              resizeMode='contain'
              source={images.signalGuide}
              style={styles.guideImage}
              testID={testIDs.components.organisms.signalsWidget.guide.image}
            />
          </View>
          <BaseButton
            label={t('screens.ideas-hub.signals.dont-show-me-label')}
            onPress={onDoNotShowPress}
            size={BaseButtonSize.small}
            type={BaseButtonType.accent}
            style={styles.btn}
            testID={testIDs.components.organisms.signalsWidget.guide.doNotShowBtn}
          />
        </View>
      </Modal>
      <BaseCaption
        helpIcon={false}
        label={t('screens.ideas-hub.signals.title')}
        goTo={isEmpty || !isVerified ? undefined : handleOpenAllSignals}
        testID={testIDs.components.organisms.signalsWidget.caption}
      />
      {ShowGuide}
      {signalsComponent}
      {ShowPremiumSignals}
    </View>
  );
};

const useStyles = ({ palette: { purple } }: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 16
    },
    loaderBox: {
      paddingVertical: 0
    },
    empty: {
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    img: {
      width: 45,
      height: 45,
      marginBottom: 16
    },
    noContentTitle: {
      textAlign: 'center'
    },
    noContentDesc: {
      marginTop: 8,
      textAlign: 'center'
    },
    noContentLinkBox: {
      marginTop: 24
    },
    noContentLink: {
      textAlign: 'center',
      color: purple['500']
    },
    scrollContent: {
      paddingHorizontal: 20,
      flexGrow: 1,
      gap: 12
    },
    scrollBox: {
      flexGrow: 0
    },
    guideImage: {
      width: '100%',
      height: '100%'
    },
    closeContainer: {
      paddingTop: height,
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      zIndex: 2
    },
    btn: {
      marginTop: 20,
      marginBottom: 48,
      marginHorizontal: 20,
      alignSelf: 'center'
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)'
    },
    imgContainer: {
      flex: 1,
      zIndex: 0
    },
    guide: { marginHorizontal: 20 },
    bluredView: {
      height: 200,
      width: screenWidth - 32,
      alignSelf: 'center',
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 20
    },
    lockImage: {
      marginBottom: 12,
      width: 45,
      height: 45
    },
    blurredSubTitle: {
      marginTop: 8,
      marginBottom: 20
    },
    loginButtons: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center'
    },
    fakeImg: {
      width: 195,
      height: 241
    }
  });

export default SignalsWidget;

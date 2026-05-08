import React, { FC, useMemo, useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { AUTH_ROUTE_NAMES, AuthRootParamsList, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import {
  BaseBackButton,
  BaseButton,
  BaseButtonLoading,
  BaseButtonSize,
  BaseButtonType,
  BaseText,
  BaseTextVariant,
  SignInForm
} from '@/components';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { config, api, testIDs } from '@/constants';
import { useTheme, useFocusEffect, ParamListBase, StackActions } from '@react-navigation/native';
import {
  useAppDispatch,
  useAppSelector,
  useCreateAccountsIfNotExists,
  useFacebookSignIn,
  FacebookSignInFrom,
  useAuthState
} from '@/hooks';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  googleSignIn,
  setLoggedInBefore,
  identifyUser,
  identifyMixpanelUser,
  IdentifyMixpanelUserTypes,
  BranchEventTypes,
  trackBranchEvent,
  MixpanelEventTypes,
  appsFlyerLogEvent,
  AppsFlyerEventTypes,
  appsFlyerSetUserData,
  setStoredLastAuthAction,
  mixpanelSignInScreenOpenTracker,
  mixpanelSignInSuccessTracker
} from '@/helpers';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { SocialService } from '@/types';
import { actions } from '@/store';
import useAsyncStorage from '@/hooks/asyncstorage';
import firebaseAnalyticsInstance from '@/helpers/analytics/firebase';
import { FIREBASE_ANALYTICS_EVENTS } from '@/helpers/analytics/firebase/const';
import useCustomPostHog from '@/helpers/posthog';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { useScreenHistory } from '@/providers';

const {
  portfolio: { setUserInfo },
  auth: { setAccessToken, setRefreshToken, useSocialSignIn },
  application: { openModal },
  ideasHub: { setCustomerIO }
} = actions;

const {
  animation: { duration },
  isAndroid,
  isIOS,
  headerBar: {
    buttons: { activeOpacity }
  }
} = config;

type SignInScreenProps = StackScreenProps<AuthRootParamsList & ParamListBase, AUTH_ROUTE_NAMES.SignIn>;

const SignInScreen: FC<SignInScreenProps> = ({ route, navigation }) => {
  const { facebookSignIn, facebookData } = useFacebookSignIn({ from: FacebookSignInFrom.signIn, navigation });
  const { code: facebookCode } = facebookData || {};
  const { prev, current } = useScreenHistory();
  const seenIntro = useAppSelector((store) => store.auth.seenIntro);

  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (current === AUTH_ROUTE_NAMES.SignIn) {
      mixpanelSignInScreenOpenTracker(prev, !seenIntro);
    }
  }, [current, navigation, prev]);

  const [isGoogleLoading, setGoogleLoading] = useState<boolean>(false);
  const [isFacebookLoading, setFacebookLoading] = useState<boolean>(false);
  const [commonLoading, setCommonLoading] = useState<boolean>(false);

  const [fbCode, setFbCode] = useState<string | undefined>(undefined);

  const [socialSignIn] = useSocialSignIn();
  const { set, get } = useAsyncStorage<'last-social-click-page'>();

  const createAccountsIfNotExists = useCreateAccountsIfNotExists();
  const { reset } = useAuthState();

  const common = useAppSelector((store) => store.common);
  const { config } = common || {};
  const { socialAuth } = config || {};

  const auth = useAppSelector((state) => state.auth);
  const abTest = useAppSelector((store) => store.application.abTest);

  const isControl = useMemo(() => [undefined, 'control'].includes(abTest), [abTest]);

  const { accessToken } = auth || {};

  const isAuthorized = Boolean(accessToken);

  const { canGoBack } = navigation || {};
  const canBack = canGoBack();

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { trackSignInPostHog } = useCustomPostHog();

  useEffect(() => {
    reset();
  }, []);

  const isSocialAuthEnabled = useMemo(() => {
    if (isAndroid) return socialAuth.android;
    if (isIOS) return socialAuth.ios;
    return false;
  }, [isAndroid, isIOS, socialAuth]);

  const checkAccountsExists = async () => {
    if (!isAuthorized) {
      return setCommonLoading(false);
    }

    try {
      setCommonLoading(true);
      const hasAcc = await createAccountsIfNotExists();
      if (!hasAcc?.success) return;

      setGoogleLoading(false);
      setFacebookLoading(false);
    } catch (error: unknown) {
      console.error(error);

      setGoogleLoading(false);
      setFacebookLoading(false);
    } finally {
      setCommonLoading(false);
    }
  };

  const setInitialState = () => {
    setFacebookLoading(false);
    setGoogleLoading(false);
    setFbCode(undefined);
    setRememberMe(true);
    setError('');
  };

  const checkFacebookCode = useCallback(() => {
    if (!facebookCode) {
      setFacebookLoading(false);

      return;
    }

    setFacebookLoading(true);

    setFbCode(facebookCode);
  }, [facebookCode, setFbCode, setFacebookLoading]);

  const showErrorPopUp = useCallback(() => {
    dispatch(
      openModal({
        title: t('screens.sign-in.form.social-not-linked-title'),
        subTitle: t('screens.sign-in.form.social-not-linked-desc'),
        icon: images.depositError,
        iconSize: {
          width: 96,
          height: 90
        },
        button: {
          text: t('screens.sign-in.form.signin')
        }
      })
    );
  }, []);

  const googleSignInHandler = async () => {
    try {
      setStoredLastAuthAction('sign-in');
      const userInfo = await googleSignIn();

      const { serverAuthCode } = userInfo || {};

      console.log('@@@@@@@@@@@@@@@@@@ googleSignInHandler userInfo', userInfo);

      if (!serverAuthCode) {
        return;
      }

      setGoogleLoading(true);

      const response = await socialSignIn({
        service: SocialService.google,
        code: serverAuthCode
      }).unwrap();

      console.log('@@@@@@@@@@@@@@@@@@ googleSignInHandler response', response);

      const { accessToken: token, refreshToken, client } = response || {};

      const isClient = Boolean(client && Object.keys(client).length > 0);

      if (refreshToken) {
        dispatch(setRefreshToken(refreshToken));
      }

      if (token) {
        await setLoggedInBefore();
        dispatch(setAccessToken(token));
      }

      if (isClient) {
        const { id: userId, email } = client || {};
        await firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.SIGN_IN, {
          id: client?.id || '',
          firstName: client?.firstName || '',
          lastName: client?.lastName || '',
          email: client?.email || '',
          country: client?.country || '',
          type: 'google'
        });

        trackBranchEvent(BranchEventTypes.Login, {
          userId: String(userId || '')
        });

        await identifyMixpanelUser(client, MixpanelEventTypes.Login, IdentifyMixpanelUserTypes.social);
        await mixpanelSignInSuccessTracker('SSO', true, 'google');
        await appsFlyerLogEvent(AppsFlyerEventTypes.Login, { af_user_id: userId });

        appsFlyerSetUserData(userId, email);

        identifyUser(client);
        dispatch(setCustomerIO(true));

        dispatch(setUserInfo(client));

        trackSignInPostHog();
      }
    } catch (error: unknown) {
      console.log('@@@@@@@@@@@@@@@@@@ googleSignInHandler error', error);

      const { status, data } = (error || {}) as { status: number; data: { message: string; connectKey: string } };
      const { message, connectKey } = data || {};

      setGoogleLoading(false);

      if (message && connectKey && status === 401) {
        return showErrorPopUp();
      }
    }
  };

  const facebookSignInHandler = async () => {
    const lastClickedScreen = await get('last-social-click-page');

    if (!fbCode || lastClickedScreen !== 'sign-in') return;

    console.log('@@@@@@@@@@@@@@@@@@ fbCode', fbCode);

    try {
      setFacebookLoading(true);

      const response = await socialSignIn({
        service: SocialService.facebook,
        code: fbCode,
        redirect: api.auth.facebookLoginRedirect
      }).unwrap();

      console.log('@@@@@@@@@@@@@@@@@@ facebookSignInHandler response', response);

      const { accessToken: token, refreshToken, client } = response || {};

      const isClient = Boolean(client && Object.keys(client).length > 0);

      if (refreshToken) {
        dispatch(setRefreshToken(refreshToken));
      }

      if (token) {
        await setLoggedInBefore();
        dispatch(setAccessToken(token));
      }

      if (isClient) {
        const { id: userId, email } = client || {};
        await firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.SIGN_IN, {
          id: client?.id || '',
          firstName: client?.firstName || '',
          lastName: client?.lastName || '',
          email: client?.email || '',
          country: client?.country || '',
          type: 'facebook'
        });

        trackBranchEvent(BranchEventTypes.Login, {
          userId: String(userId || '')
        });

        await identifyMixpanelUser(client, MixpanelEventTypes.Login, IdentifyMixpanelUserTypes.social);
        await mixpanelSignInSuccessTracker('SSO', true, 'facebook');
        await appsFlyerLogEvent(AppsFlyerEventTypes.Login, { af_user_id: userId });

        appsFlyerSetUserData(userId, email);

        identifyUser(client);
        dispatch(setCustomerIO(true));

        dispatch(setUserInfo(client));

        trackSignInPostHog();
      }
    } catch (error: unknown) {
      console.log('@@@@@@@@@@@@@@@@@@ facebookSignInHandler error', error);

      const { status, data } = (error || {}) as { status: number; data: { message: string; connectKey: string } };
      const { message, connectKey } = data || {};

      setFacebookLoading(false);
      setFbCode(undefined);

      if (message && connectKey && status === 401) {
        return showErrorPopUp();
      }
    }
  };

  useLayoutEffect(() => {
    facebookSignInHandler();
  }, [fbCode]);

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
      };
    }, [route, navigation])
  );

  useFocusEffect(
    useCallback(() => {
      checkFacebookCode();
    }, [route, navigation, facebookCode])
  );

  useFocusEffect(
    useCallback(() => {
      checkAccountsExists();
    }, [route, navigation, isAuthorized, isControl])
  );

  const goToFacebookSignIn = useCallback(async () => {
    setFbCode(undefined);
    set('last-social-click-page', 'sign-in');
    setStoredLastAuthAction('sign-in');
    await facebookSignIn();
  }, [facebookSignIn, setFbCode]);

  const buttonsComponent = useMemo(() => {
    if (!isSocialAuthEnabled) return null;
    return (
      <Animated.View
        key={'signin-buttons-component'}
        entering={FadeIn.duration(duration)}
        exiting={FadeOut.duration(duration)}
        style={styles.buttonBox}
      >
        <BaseButton
          onPress={goToFacebookSignIn}
          icon={<SvgIcon name={SvgXmlIconNames.facebookColor} size={IconSize.sm} />}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.sign-in.form.facebook-signup')}
          loading={isFacebookLoading}
          loadingType={BaseButtonLoading.ellipsis}
          type={BaseButtonType.facebook}
          testID={testIDs.signin.facebookSignin}
        />
        <BaseButton
          onPress={googleSignInHandler}
          type={BaseButtonType.google}
          icon={<SvgIcon name={SvgXmlIconNames.googleColor} size={IconSize.sm} />}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.sign-in.form.google-signup')}
          loading={isGoogleLoading}
          loadingType={BaseButtonLoading.ellipsis}
          testID={testIDs.signin.googleSignin}
        />
      </Animated.View>
    );
  }, [styles, googleSignInHandler, goToFacebookSignIn, isGoogleLoading, isFacebookLoading, isSocialAuthEnabled, t]);

  const onGoBack = useCallback(() => {
    if (navigation.isFocused() && navigation.canGoBack()) navigation.goBack();
    else {
      navigation.dispatch(StackActions.replace(AUTH_ROUTE_NAMES.BonusSignUp));
    }
  }, [navigation]);

  const goToSignUp = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.Auth, { screen: AUTH_ROUTE_NAMES.SignUp });
  };

  const goToPulseAI = () => {
    requestAnimationFrame(() => {
      navigation.reset({
        index: 1,
        routes: [
          {
            name: ROOT_ROUTE_NAMES.App,
            params: {
              screen: APP_ROUTE_NAMES.Pulse,
              params: {
                screen: PULSEAI_ROUTE_NAMES.PulseAI
              }
            }
          }
        ]
      });
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <View style={styles.backContainer}>
          <BaseBackButton isChevron={false} customBack={onGoBack} isClose={!canBack} />
          <TouchableOpacity hitSlop={10} onPress={goToPulseAI}>
            <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={theme.palette.background.card.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
            <View style={styles.content}>
              <BaseText style={styles.header} variant={BaseTextVariant.header}>
                {t('screens.sign-in.welcome-back')}
              </BaseText>
              <SignInForm
                commonLoading={commonLoading}
                style={styles.form}
                rememberMe={rememberMe}
                error={error}
                setError={setError}
              />
              <View style={styles.orContainer}>
                <View style={styles.stick} />
                <BaseText style={styles.or}>{t('screens.bonus-signup.or')}</BaseText>
                <View style={styles.stick} />
              </View>
            </View>
            {buttonsComponent}
            <View style={styles.haveAccount}>
              <BaseText variant={BaseTextVariant.extraSmall} style={styles.haveAccountText}>
                {t('screens.sign-in.dont-have-account')}
              </BaseText>
              <TouchableOpacity onPress={goToSignUp} hitSlop={10} activeOpacity={activeOpacity}>
                <BaseText style={styles.signup} variant={BaseTextVariant.extraSmallSemiBold}>
                  {t('screens.sign-in.sign-up')}
                </BaseText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInScreen;

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  InteractionManager,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputChangeEventData
} from 'react-native';
import { useTheme, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { config, countries, UserTheme } from '@/constants';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BaseBackButton,
  BaseButton,
  BaseButtonLoading,
  BaseButtonSize,
  BaseButtonType,
  BaseCheckbox,
  BaseFormField,
  BaseRiskWarning,
  BaseText,
  BaseTextVariant
} from '@/components';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useTranslation } from 'react-i18next';
import {
  FacebookSignInFrom,
  useAppSelector,
  useAuthState,
  useCreateAccountsIfNotExists,
  useFacebookSignIn
} from '@/hooks';
import { FacebookData } from '@/hooks/auth/use-facebook-signin';
import {
  AppsFlyerEventTypes,
  appsFlyerLogEvent,
  appsFlyerSetUserData,
  branchLogout,
  googleSignIn,
  identifyMixpanelUser,
  IdentifyMixpanelUserTypes,
  MixpanelEventTypes,
  setStoredLastAuthAction,
  BranchEventTypes,
  trackBranchEvent,
  trackSignUpCustomerIO,
  mixpanelSignUpScreenOpenTracker
} from '@/helpers';
import { SocialService } from '@/types';
import useAsyncStorage from '@/hooks/asyncstorage';
import { actions } from '@/store';
import useCustomPostHog from '@/helpers/posthog';
import { useGetPartnerIDQuery } from '@/store/api';
import branch, { BranchEvent } from 'react-native-branch';
import { FIREBASE_ANALYTICS_EVENTS } from '@/helpers/analytics/firebase/const';
import firebaseAnalyticsInstance from '@/helpers/analytics/firebase';
import { getCountry } from '@/helpers/country';
import { getCountry as getLocalCountry } from 'react-native-localize';
import DeviceCountry from 'react-native-device-country';
import { Controller, useForm } from 'react-hook-form';
import { ToastType, useToast, useScreenHistory } from '@/providers';

const {
  isAndroid,
  isIOS,
  buttons: { activeOpacity },
  validation: { emailRegex },
  isProduction
} = config;

const {
  auth: { useSignUp, useSignIn },
  portfolio: { useProfileQuery }
} = actions;

type SignUpScreenProps = StackScreenProps<ParamListBase & AuthRootParamsList, AUTH_ROUTE_NAMES.SignUp>;

const generateSixDigitCode = () => {
  const num = Math.floor(Math.random() * 1000000);
  return `trader${num.toString().padStart(6, '0')}`;
};

interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
}

const upperCaseRegex = /[A-Z]/;
const lowerCaseRegex = /[a-z]/;
const numberRegex = /\d/;
const AlreadyRegisteredError = 'This email is already registered';

const SignUpScreen: React.FC<SignUpScreenProps> = ({ route, navigation }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);

  const [signUp] = useSignUp();
  const [signIn] = useSignIn();
  const [getProfile] = useProfileQuery();
  const { openToast, closeToast } = useToast();

  const { trackSignUpPostHog } = useCustomPostHog();
  const [getPartnerID] = useGetPartnerIDQuery();

  const createAccountsIfNotExists = useCreateAccountsIfNotExists();

  const auth = useAppSelector((state) => state.auth);
  const { accessToken, cellExpertId } = auth || {};

  const isAuthorized = Boolean(accessToken);

  const { facebookSignIn, facebookData } = useFacebookSignIn({ from: FacebookSignInFrom.signUp, navigation });
  const { prev, current } = useScreenHistory();

  const hasBonus = !!route?.params?.hasBonus;
  const goID = route.params?.goID;
  const { set, get } = useAsyncStorage<'last-social-click-page' | 'partner-id'>();
  const { reset } = useAuthState();

  const common = useAppSelector((store) => store.common);
  const { config } = common || {};
  const { socialAuth } = config || {};
  const seenIntro = useAppSelector((store) => store.auth.seenIntro);

  const isSocialAuthEnabled = useMemo(() => {
    if (isAndroid) return socialAuth.android;
    if (isIOS) return socialAuth.ios;
    return false;
  }, [isAndroid, isIOS, socialAuth]);

  const { goBack, canGoBack } = navigation || {};
  const canBack = canGoBack();

  const {
    t,
    i18n: { language }
  } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: generateSixDigitCode(),
      lastName: generateSixDigitCode(),
      country: '',
      email: '',
      password: '',
      clientType: 'Individual',
      document_group_2: true,
      customFields: {
        custom_app_registration: true
      }
    }
  });

  const { email, password } = watch();

  const goToSignIn = useCallback(() => {
    navigation.navigate(AUTH_ROUTE_NAMES.SignIn);
  }, [navigation]);

  const signUpWithFacebook = useCallback(async () => {
    setStoredLastAuthAction('sign-up');
    set('last-social-click-page', 'sign-up');
    facebookSignIn();
  }, []);

  const errorToastHandler = () => {
    if (!error) {
      closeToast();
      return;
    }

    openToast({
      desc: error,
      type: ToastType.error,
      onClose: () => {
        setError('');
      }
    });
  };

  useLayoutEffect(() => {
    errorToastHandler();
  }, [error]);

  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        reset();
      });
    }, [])
  );

  useLayoutEffect(() => {
    if (current === AUTH_ROUTE_NAMES.SignUp) {
      mixpanelSignUpScreenOpenTracker(prev, !seenIntro);
    }
  }, [current, navigation, prev]);

  const signUpWithGoogle = useCallback(async () => {
    try {
      setStoredLastAuthAction('sign-up');
      const userInfo = await googleSignIn();

      const { serverAuthCode, user } = userInfo || {};
      const { givenName = '', familyName = '', email = '' } = user || {};

      const firstName = givenName?.trim() || '';
      const lastName = familyName?.trim() || '';

      if (!serverAuthCode || !email) return;

      const routeData = {
        email,
        first_name: firstName,
        last_name: lastName,
        code: serverAuthCode,
        service: SocialService.google,
        goID
      };
      navigation.navigate(AUTH_ROUTE_NAMES.CompleteSignUp, routeData);
    } catch (error) {
      console.error(error);
    }
  }, [navigation, goID]);

  const handlePartnerID = async (id: number | undefined) => {
    try {
      if (!id) return;
      setLoading(true);
      const partnerRes = await getPartnerID(id).unwrap();
      const pId = partnerRes.partnerId;
      if (!pId) return setLoading(false);

      set('partner-id', pId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePartnerID(goID);
  }, [goID]);

  useEffect(() => {
    const handleFacebookData = async (fbData: FacebookData) => {
      try {
        const lastClickedScreen = await get('last-social-click-page');
        if (!fbData.code || lastClickedScreen !== 'sign-up') return;
        if (!fbData?.email)
          return navigation.navigate(AUTH_ROUTE_NAMES.EmailSignUp, {
            state: 0,
            code: fbData.code,
            service: SocialService.facebook,
            goID
          });
        fbData.last_name = fbData.last_name?.trim() || '';
        fbData.first_name = fbData.first_name?.trim() || '';
        const routeData = { ...fbData, service: SocialService.facebook };
        navigation.navigate(AUTH_ROUTE_NAMES.CompleteSignUp, routeData);
      } catch (error) {
        console.error(error);
      }
    };

    if (facebookData) handleFacebookData(facebookData);
  }, [facebookData, navigation, goID]);

  const goToIdeasHub = useCallback(() => {
    navigation.replace(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

  const customBack = () => {
    if (!canBack) {
      return goToIdeasHub();
    }
    goBack();
  };

  const buttonsComponent = useMemo(() => {
    if (!isSocialAuthEnabled) return null;
    return (
      <View style={styles.btnsContainer}>
        <BaseButton
          type={BaseButtonType.facebook}
          size={BaseButtonSize.large}
          label={t('screens.signup-intro.facebook-signup')}
          icon={<SvgIcon name={SvgXmlIconNames.facebookColor} size={IconSize.sm} />}
          onPress={signUpWithFacebook}
        />
        <BaseButton
          type={BaseButtonType.google}
          size={BaseButtonSize.large}
          onPress={signUpWithGoogle}
          label={t('screens.signup-intro.google-signup')}
          icon={<SvgIcon name={SvgXmlIconNames.googleColor} size={IconSize.sm} />}
        />
      </View>
    );
  }, [isSocialAuthEnabled, t, signUpWithFacebook, signUpWithGoogle, styles]);

  const handleCountry = async () => {
    try {
      let currentCountry = getCountry()?.trim?.();

      if (!currentCountry) {
        const countryCode = getLocalCountry()?.toLowerCase();

        currentCountry = countries.find((item) => item.alpha2 === countryCode)?.[language as never] || '';
        if (!currentCountry) {
          const deviceCountry = (await DeviceCountry.getCountryCode())?.code?.toLowerCase() || '';
          if (deviceCountry) {
            currentCountry = countries.find((item) => item.alpha2 === deviceCountry)?.[language as never] || '';
          }
        }
      }
      setValue('country', currentCountry || '');
    } catch (error) {
      console.error(error);
    }
  };

  const goToEmailVerification = () => navigation.navigate(ROOT_ROUTE_NAMES.EmailVerification, { autoVerify: true });

  const checkAccountsExists = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      if (!isProduction) {
        await createAccountsIfNotExists();
      }
      goToEmailVerification();
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAccountsExists();
    }, [route, navigation, isAuthorized])
  );

  useEffect(() => {
    handleCountry();
  }, [language, countries]);

  const onSignIn = async (data: any) => {
    if (!data) {
      return;
    }
    setError('');
    try {
      const client = (await signIn({
        ...data,
        rememberMe: true,
        fromLogin: false
      })) as any;

      if (client.data.client) {
        const { id: userId } = client?.data?.client || {};

        trackSignUpCustomerIO();
        await identifyMixpanelUser(client.data.client, MixpanelEventTypes.Register, IdentifyMixpanelUserTypes.normal);
        await appsFlyerLogEvent(AppsFlyerEventTypes.CompleteRegistration, {
          af_registration_method: 'Email'
        });
        appsFlyerSetUserData(userId, email);
        trackSignUpPostHog();
      }
    } catch (error: unknown) {
      console.error('onSignIn Error:', error);
    }
  };

  const onSignUp = async (data: SignUpRequest) => {
    const { email, password } = data;

    if (!email || !password || error) {
      return;
    }

    setError('');
    setLoading(true);

    const partnerId = await get('partner-id', true);

    const fName = data.firstName;
    const lName = data.lastName;
    const signUpData = {
      firstName: fName,
      lastName: lName,
      ...(Boolean(partnerId) && { partnerId }),
      ...(Boolean(cellExpertId) && { cellExpertId })
    };

    const signInData = {
      email,
      password,
      rememberMe: true,
      firstName: fName.trim(),
      lastName: lName.trim()
    };

    try {
      setStoredLastAuthAction('sign-up');
      const { token, id, firstName = '', lastName = '', email, country = '' } = await signUp(signUpData).unwrap();

      if (token && id) {
        branchLogout();
        branch.setIdentity(String(id));

        await firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.SIGN_UP, {
          id,
          firstName,
          lastName,
          email,
          country,
          type: 'regular'
        });

        trackBranchEvent(BranchEventTypes.CompleteRegistration, {
          userId: String(id || '')
        });

        await onSignIn(signInData);

        await getProfile().unwrap();
      }
    } catch (error: unknown) {
      console.error('onSignUp Error:', error);

      setError((error as Error)?.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BaseBackButton isChevron={false} customBack={customBack} isClose={!canBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBox}>
        <BaseText style={styles.header} variant={BaseTextVariant.header}>
          {t('screens.bonus-signup.create-your-account')}
        </BaseText>
        <View style={styles.inputs}>
          <Controller
            name='email'
            control={control}
            rules={{
              required: t('screens.email-signup.form.email-required'),
              pattern: {
                value: emailRegex,
                message: t('screens.email-signup.form.email-invalid')
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => {
              const onChangeEmail = (text: string) => {
                onChange(text);
                if (error && error.includes(AlreadyRegisteredError)) setError('');
              };

              return (
                <BaseFormField
                  style={styles.formField}
                  returnKeyType={'next'}
                  keyboardType={'email-address'}
                  error={errors.email?.message}
                  onBlur={onBlur}
                  onChange={onChangeEmail as never as (e: NativeSyntheticEvent<TextInputChangeEventData>) => void}
                  value={value}
                  title={t('screens.email-signup.form.email')}
                  placeholder='emailexample@domain.com'
                  required
                />
              );
            }}
          />
          <Controller
            name='password'
            control={control}
            rules={{
              required: t('screens.email-signup.form.password-required'),
              validate: (value) => {
                if (
                  !upperCaseRegex.test(value) ||
                  !lowerCaseRegex.test(value) ||
                  !numberRegex.test(value) ||
                  !(value.length >= 8 && value.length <= 32)
                ) {
                  return t('screens.email-signup.form.password-invalid');
                }
                return true;
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <BaseFormField
                style={styles.formField}
                returnKeyType={'send'}
                secureTextEntry={true}
                error={errors.password?.message}
                onBlur={onBlur}
                onChange={(changeValue) => {
                  onChange(changeValue);
                }}
                value={value}
                title={t('screens.email-signup.form.password-placeholder')}
                required
              />
            )}
          />
        </View>
        <BaseButton
          label={t('screens.bonus-signup.create-account')}
          type={BaseButtonType.primary}
          style={styles.createAccount}
          onPress={handleSubmit(onSignUp)}
          loading={isLoading}
          loadingType={BaseButtonLoading.ellipsis}
          disabled={isLoading || !!errors['email'] || !!errors['password'] || !email.length || !password?.length}
        />
        <View style={styles.orContainer}>
          <View style={styles.stick} />
          <BaseText style={styles.or}>{t('screens.bonus-signup.or')}</BaseText>
          <View style={styles.stick} />
        </View>
        {buttonsComponent}
        <BaseCheckbox
          label={t('screens.signup-intro.i-want-bonus')}
          hasCheck
          defaultValue={hasBonus}
          iconColor='#1FE07A'
          iconSize={IconSize.sm}
          checkedBgColor='transparent'
          textFont={styles.textFont}
          containerStyle={styles.checkBoxContainer}
          checkBoxStyle={styles.checkBox}
        />
        <View style={styles.haveAccount}>
          <BaseText variant={BaseTextVariant.extraSmall} style={styles.haveAccountText}>
            {t('screens.bonus-signup.already-have-account')}
          </BaseText>
          <TouchableOpacity onPress={goToSignIn} hitSlop={10} activeOpacity={activeOpacity}>
            <BaseText style={styles.login} variant={BaseTextVariant.extraSmall}>
              {t('screens.bonus-signup.login')}
            </BaseText>
          </TouchableOpacity>
        </View>
        <View style={styles.whiteBox} />
        <BaseRiskWarning warningTextStyle={styles.riskWarning} />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = (_: UserTheme) =>
  StyleSheet.create({
    whiteBox: {
      flexGrow: 1
    },
    safe: {
      flex: 1
    },
    btnsContainer: { gap: 16, marginTop: 17 },
    scrollBox: {
      paddingHorizontal: 20,
      flexGrow: 1,
      flex: 1,
      paddingBottom: 16
    },
    image: {
      height: 243,
      width: '100%',
      marginTop: 24
    },
    formField: { marginBottom: 0 },
    buttons: {
      flexGrow: 1,
      flex: 1,
      gap: 12,
      marginHorizontal: 20,
      marginTop: 85
    },
    header: { marginTop: 10 },
    inputs: {
      gap: 12,
      marginTop: 17
    },
    createAccount: {
      backgroundColor: '#8050F1',
      marginVertical: 34
    },
    stick: { flex: 1, height: 1, backgroundColor: '#D9E1E4' },
    or: { color: '#BDC3CF', bottom: 2 },
    textFont: {
      color: '#8890A1',
      ...BaseTextVariant.text
    },
    checkBoxContainer: {
      marginTop: 38,
      alignSelf: 'center'
    },
    checkBox: {
      width: 24,
      height: 24,
      borderWidth: 0.5,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: '#6E7783',
      backgroundColor: '#F0F2F5',
      borderRadius: 8
    },
    haveAccount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 14
    },
    haveAccountText: {
      color: '#8890A1'
    },
    login: {
      color: '#8050F1',
      ...BaseTextVariant.extraSmallSemiBold
    },
    orContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24
    },
    riskWarning: {
      color: '#BDC3CF',
      ...BaseTextVariant.extraSmall
    }
  });

export default SignUpScreen;

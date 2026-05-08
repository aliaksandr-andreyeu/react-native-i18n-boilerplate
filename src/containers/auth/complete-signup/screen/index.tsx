import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { api, countries, UserTheme } from '@/constants';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import {
  BaseBackButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseFormField,
  BaseRiskWarning,
  BaseRiskWarningVariant,
  BaseText,
  BaseTextVariant,
  KeyboardDismissButton
} from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAsyncStorage from '@/hooks/asyncstorage';
import {
  branchLogout,
  generatePassword,
  identifyMixpanelUser,
  IdentifyMixpanelUserTypes,
  MixpanelEventTypes,
  BranchEventTypes,
  trackBranchEvent,
  trackSignUpCustomerIO,
  appsFlyerLogEvent,
  AppsFlyerEventTypes,
  appsFlyerSetUserData,
  setStoredLastAuthAction,
  mixpanelSignUpSuccessTracker
} from '@/helpers';
import { useTranslation } from 'react-i18next';
import { IBaseOptionList } from '@/components/molecules/option-list';
import { getCountry } from '@/helpers/country';
import { getCountry as getLocalCountry } from 'react-native-localize';
import DeviceCountry from 'react-native-device-country';
import { SocialService } from '@/store/api';
import branch, { BranchEvent } from 'react-native-branch';
import { SignInRequest } from '../../email-signup/screen';
import { useAppSelector } from '@/hooks';
import useCustomPostHog from '@/helpers/posthog';
import { actions } from '@/store';
import { ToastType, useToast } from '@/providers';
import Animated, { BounceIn, FadeOut, useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import CountryFlagIcon from '@/assets/icons/countries-flags';
import { CountriesCode } from '@/assets/icons/countries-flags/types';
import libphoneNumber, {
  parsePhoneNumberFromString,
  CountryCode,
  getCountries,
  getCountryCallingCode
} from 'libphonenumber-js';
import Config from 'react-native-config';
import firebaseAnalyticsInstance from '@/helpers/analytics/firebase';
import { FIREBASE_ANALYTICS_EVENTS } from '@/helpers/analytics/firebase/const';

const {
  auth: { useSignIn, useSignUp, useUpdateUserEmailVerifyMutation },
  profile: { useSocialConnect, useUpdateCustomFields },
  portfolio: { useProfileQuery }
} = actions;

const { SERVER_API_TOKEN } = Config;

type CompleteSignUpScreenProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.CompleteSignUp>;

const getCountryFromCallingCode = (input: string) => {
  const numericCode = input.replace(/\D/g, '');

  return getCountries().find((country) => getCountryCallingCode(country) === numericCode) || '';
};

const isValidPhoneNumber = (phoneNumber: string) => {
  try {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);
    return parsedNumber && parsedNumber.isValid();
  } catch {
    return false;
  }
};

const generateSixDigitCode = () => {
  const num = Math.floor(Math.random() * 1000000);
  return `trader${num.toString().padStart(6, '0')}`;
};

let timeout: NodeJS.Timeout;
const CompleteSignUpScreen: React.FC<CompleteSignUpScreenProps> = ({ route, navigation }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [country, setCountry] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phoneCountry, setPhoneCountry] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const bottomSheetRef = useRef<IBaseOptionList>();
  const isFirst = useRef<boolean>(true);

  const [signUp] = useSignUp();
  const [signIn] = useSignIn();
  const [getProfile] = useProfileQuery();
  const [socialConnect] = useSocialConnect();
  const [updateCustomFields] = useUpdateCustomFields();
  const [updateUserEmailVerify] = useUpdateUserEmailVerifyMutation();

  const auth = useAppSelector((state) => state.auth);
  const { cellExpertId } = auth || {};

  const { openToast, closeToast } = useToast();
  const { trackSignUpPostHog } = useCustomPostHog();
  const { get } = useAsyncStorage<'partner-id'>();
  const {
    t,
    i18n: { language }
  } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const { state } = useAnimatedKeyboard();

  const socialData = useMemo(() => route.params, [route.params]);

  useEffect(() => {
    const backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (bottomSheetRef.current?.isOpen()) bottomSheetRef.current.close();
      else navigation.isFocused() && navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backhandler.remove;
  }, [navigation]);

  useLayoutEffect(() => {
    const handleCountry = async () => {
      try {
        let currentCountry = getCountry();

        if (!currentCountry) {
          const countryCode = getLocalCountry()?.toUpperCase();
          currentCountry = countryCode || '';
          if (!currentCountry) {
            const deviceCountry = (await DeviceCountry.getCountryCode())?.code?.toUpperCase() || '';
            if (deviceCountry) {
              currentCountry = deviceCountry;
            }
          }
        }
        setCountry(currentCountry || '');
      } catch (error) {
        console.error(error);
      }
    };

    handleCountry();
  }, [language, countries]);

  const onSignIn = async (data: SignInRequest) => {
    if (!data) {
      return;
    }
    try {
      const client = (await signIn({
        ...data,
        rememberMe: true,
        fromLogin: false
      })) as any;

      if (client.data) {
        const { id: userId, email } = client?.data?.client || {};

        trackSignUpCustomerIO();
        await identifyMixpanelUser(client.data.client, MixpanelEventTypes.Register, IdentifyMixpanelUserTypes.normal);
        await appsFlyerLogEvent(AppsFlyerEventTypes.CompleteRegistration, {
          af_registration_method: 'Email',
          af_user_id: userId
        });
        appsFlyerSetUserData(userId, email);
        trackSignUpPostHog();
      }
    } catch (error: unknown) {
      console.error('onSignIn Error:', error);
      const errTitle = (error as Error)?.message || 'Unknown error occurred';
      openToast({
        type: ToastType.error,
        title: errTitle
      });
    }
  };

  const checkCountry = (value: string) => {
    const detectedCountry = getCountryFromCallingCode(value);
    if (detectedCountry) {
      setCountry(detectedCountry?.toLowerCase?.());
    }
    return detectedCountry;
  };

  const checkNumber = (value: string) => {
    checkCountry(value);

    const valid = isValidPhoneNumber(value) || false;

    !valid && setPhoneError(t('screens.promo-details.phone-not-valid'));
    return valid;
  };

  const submitData = useCallback(async () => {
    try {
      const validPhone = checkNumber(phone);
      if (!validPhone) return;

      setLoading(true);

      const trimmedPhone = phone.trim().replaceAll(' ', '');

      setPhoneError('');

      const { email = '', first_name: firstNameFromData, last_name: lastNameFromData } = socialData || {};

      const firstName = firstNameFromData || generateSixDigitCode();
      const lastName = lastNameFromData || generateSixDigitCode();

      const partnerId = await get('partner-id', true);

      const password = generatePassword(10);

      const signUpData = {
        document_group_2: true,
        customFields: {
          custom_app_registration: true
        },
        clientType: 'Individual',
        firstName,
        lastName,
        email,
        password,
        phone: trimmedPhone,
        country: country?.toUpperCase?.(),
        emailVerified: true,
        ...(Boolean(partnerId) && { partnerId }),
        ...(Boolean(cellExpertId) && { cellExpertId })
      };

      const signInData = {
        email,
        password,
        rememberMe: true,
        firstName,
        lastName,
        phone: trimmedPhone
      };
      setStoredLastAuthAction('sign-up');

      const {
        token,
        id,
        firstName: userFirstName = '',
        lastName: userLastName = '',
        email: userEmail,
        country: userCountry = ''
      } = await signUp(signUpData).unwrap();

      if (token && id) {
        branchLogout();
        branch.setIdentity(String(id));

        await firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.SIGN_UP, {
          id,
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
          country: userCountry,
          type: socialData.service
        });

        mixpanelSignUpSuccessTracker('sso', true, socialData.service, false);

        trackBranchEvent(BranchEventTypes.CompleteRegistration, {
          userId: String(id || '')
        });

        await updateUserEmailVerify({ user: id, token: SERVER_API_TOKEN }).unwrap();
        await onSignIn(signInData);

        await socialConnect({
          service: socialData.service,
          code: socialData.code as string,
          redirect: api.auth.facebookConnectRedirect
        }).unwrap();

        const customField =
          socialData.service === SocialService.facebook
            ? 'custom_facebook_profile_connected'
            : 'custom_google_profile_connected';

        await updateCustomFields({
          customFields: {
            [customField]: 'true'
          }
        }).unwrap();

        await getProfile().unwrap();
      }
    } catch (error) {
      console.error(error);
      const errTitle = (error as Error)?.message || 'Unknown error occurred';
      if (errTitle?.includes?.('phone')) return setPhoneError(errTitle);
      else {
        openToast({
          type: ToastType.error,
          title: errTitle
        });
      }
    } finally {
      setLoading(false);
    }
  }, [socialData, country, countries, language, cellExpertId, phone, t, SERVER_API_TOKEN]);

  useEffect(() => {
    const countryPhoneCode = getCountryCallingCode((country?.toUpperCase?.() || 'US') as CountryCode);

    setPhoneCountry(country.toLowerCase() || '');
    setPhone(`+${countryPhoneCode}`);
    isFirst.current = true;
  }, [country]);

  const onChangePhone = useCallback(
    (value: string) => {
      if (isFirst.current) isFirst.current = false;
      const currentValue = `+${value.replaceAll('+', '')}`;
      setPhone(currentValue);
      if (phoneError) setPhoneError('');
      closeToast();
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const cCountry = checkCountry(currentValue);
        const resultCountry = libphoneNumber(currentValue)?.country || '';
        if (resultCountry && resultCountry !== cCountry) setPhoneCountry(resultCountry?.toLowerCase?.());
      }, 200);
    },
    [phoneError]
  );

  const riskStyle = useAnimatedStyle(() => {
    return {
      display: [0, 3, 4].includes(state.value) ? 'none' : 'flex'
    };
  }, []);

  const renderIcon = useMemo(() => {
    return phoneCountry && phone.length > 2;
  }, [phoneCountry, phone]);

  const rightIcon = useMemo(() => {
    return (
      renderIcon && (
        <CountryFlagIcon
          key={phoneCountry}
          entering={BounceIn.delay(200)}
          exiting={FadeOut.duration(200)}
          style={styles.iconStyle}
          name={phoneCountry as CountriesCode}
          width={20}
          height={20}
        />
      )
    );
  }, [renderIcon, phoneCountry, theme.dark]);

  const onPhoneBlur = useCallback(() => {
    const valid = checkNumber(phone);
    if (!valid) setPhoneError(t('screens.promo-details.phone-not-valid'));
  }, [t, phone]);

  return (
    <SafeAreaView style={styles.safe}>
      <BaseBackButton isChevron={false} />
      <View style={styles.header}>
        <View style={styles.title}>
          <BaseText variant={BaseTextVariant.authSubTitle}>{t('screens.complete-signup.title')}</BaseText>
        </View>
        <BaseFormField
          returnKeyType={'done'}
          hideClearButton
          error={phoneError}
          onBlur={onPhoneBlur}
          enableButtonsAnimation={phone?.length > 1}
          onChange={onChangePhone as any}
          keyboardType='phone-pad'
          dataDetectorTypes='phoneNumber'
          textContentType='telephoneNumber'
          rightIcon={rightIcon}
          value={phone}
          title={t('screens.email-signup.form.phone')}
          placeholder='000 000 000'
          required
        />
        <Animated.View style={riskStyle}>
          <BaseRiskWarning variant={BaseRiskWarningVariant.signup} />
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <BaseButton
          type={BaseButtonType.primary}
          size={BaseButtonSize.large}
          disabled={loading || !!phoneError.length}
          loading={loading}
          onPress={submitData}
          label={t('screens.complete-signup.proceed')}
        />
        <BaseRiskWarning variant={BaseRiskWarningVariant.signup} />
      </View>
      <KeyboardDismissButton disabled={loading || !!phoneError.length} onPress={submitData} />
    </SafeAreaView>
  );
};

const useStyles = ({ palette: {} }: UserTheme) =>
  StyleSheet.create({
    safe: {
      flex: 1
    },
    header: {
      marginHorizontal: 20,
      gap: 16,
      flex: 1
    },
    title: {
      paddingVertical: 12
    },
    footer: {
      paddingTop: 12,
      marginHorizontal: 20,
      marginBottom: 20,
      gap: 20
    },
    iconStyle: {
      marginTop: 11,
      marginRight: 12,
      width: 20,
      height: 20
    }
  });

export default CompleteSignUpScreen;

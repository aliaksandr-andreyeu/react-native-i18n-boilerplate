import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, NativeSyntheticEvent, ScrollView, TextInputChangeEventData, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import { useForm, Controller } from 'react-hook-form';
import {
  BaseButton,
  BaseButtonLoading,
  BaseButtonSize,
  BaseButtonType,
  BaseFormField,
  BaseRiskWarning,
  BaseRiskWarningVariant,
  BaseText,
  BaseTextVariant,
  KeyboardDismissButton,
  ProgressHeader
} from '@/components';
import useStyles from './styles';
import { api, config, countries } from '@/constants';
import { actions } from '@/store';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useAppSelector, useAuthState, useCreateAccountsIfNotExists } from '@/hooks';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import {
  identifyMixpanelUser,
  MixpanelEventTypes,
  IdentifyMixpanelUserTypes,
  trackBranchEvent,
  BranchEventTypes,
  branchLogout,
  trackSignUpCustomerIO,
  appsFlyerLogEvent,
  AppsFlyerEventTypes,
  appsFlyerSetUserData,
  setStoredLastAuthAction,
  mixpanelCreateAccountButtonPressTracker,
  mixpanelSignUpSuccessTracker,
  mixpanelSignInSuccessTracker,
  mixpanelScreenOpenTracker
} from '@/helpers';
import { BounceIn, FadeOut } from 'react-native-reanimated';
import branch, { BranchEvent } from 'react-native-branch';
import { getCountry } from '@/helpers/country';
import { getCountry as getLocalCountry } from 'react-native-localize';
import DeviceCountry from 'react-native-device-country';
import useCustomPostHog from '@/helpers/posthog';
import useAsyncStorage from '@/hooks/asyncstorage';
import { SocialService, useGetPartnerIDQuery } from '@/store/api';
import { ToastType, useToast } from '@/providers';
import libphoneNumber, {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString
} from 'libphonenumber-js';
import CountryFlagIcon from '@/assets/icons/countries-flags';
import { CountriesCode } from '@/assets/icons/countries-flags/types';
import { StateTypes } from '@/hooks/authState';
import Config from 'react-native-config';
import firebaseAnalyticsInstance from '@/helpers/analytics/firebase';
import { FIREBASE_ANALYTICS_EVENTS } from '@/helpers/analytics/firebase/const';
import { useScreenHistory } from '@/providers';

type EmailSignUpScreenProps = StackScreenProps<AuthRootParamsList & RootRootParamsList, AUTH_ROUTE_NAMES.EmailSignUp>;

const {
  auth: { useSignUp, useSignIn, useUpdateUserEmailVerifyMutation },
  portfolio: { useProfileQuery },
  profile: { useSocialConnect, useUpdateCustomFields }
} = actions;

const {
  isProduction,
  validation: { emailRegex }
} = config;

const { SERVER_API_TOKEN } = Config;

interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

const upperCaseRegex = /[A-Z]/;
const lowerCaseRegex = /[a-z]/;
const numberRegex = /\d/;

const AlreadyRegisteredError = 'This email is already registered';

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

let timeout: NodeJS.Timeout | undefined = undefined;

const generateSixDigitCode = () => {
  const num = Math.floor(Math.random() * 1000000);
  return `trader${num.toString().padStart(6, '0')}`;
};

const EmailSignUpScreen: FC<EmailSignUpScreenProps> = ({ route, navigation }) => {
  const {
    t,
    i18n: { language }
  } = useTranslation();
  const { params } = route || {};
  const { goID, state, code = undefined, service = undefined } = params || {};

  const { openToast, closeToast } = useToast();
  const { change } = useAuthState();

  const userState = useAppSelector((store) => store.auth.userState);
  const { prev } = useScreenHistory();

  const [signUp] = useSignUp();
  const [signIn] = useSignIn();
  const [getProfile] = useProfileQuery();
  const [socialConnect] = useSocialConnect();
  const [updateCustomFields] = useUpdateCustomFields();
  const [updateUserEmailVerify] = useUpdateUserEmailVerifyMutation();

  const { set, get } = useAsyncStorage<'partner-id'>();

  const { trackSignUpPostHog } = useCustomPostHog();

  const [getPartnerID] = useGetPartnerIDQuery();

  const createAccountsIfNotExists = useCreateAccountsIfNotExists();

  const [currentStep, setStep] = React.useState<number>(state || 0);
  const [error, setError] = React.useState<string>('');
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
  const [phoneCountry, setPhoneCountry] = useState<string>('');
  const isFirst = useRef<boolean>(true);

  const auth = useAppSelector((state) => state.auth);
  const { accessToken, cellExpertId } = auth || {};

  const isAuthorized = Boolean(accessToken);

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError: setControlError,
    clearErrors: clearControlError,
    formState: { errors },
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: generateSixDigitCode(),
      lastName: generateSixDigitCode(),
      phone: '',
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

  const { email, password, firstName, lastName, country, phone } = watch();

  useEffect(() => {
    const values = userState;
    if (!values) return;
    const keys = Object.keys(values);
    keys.forEach((key: any) => {
      const value = values[key as StateTypes];
      if (key && value) {
        setValue(key.replace('user-', ''), value?.trim?.());
        trigger(key);
      }
    });
  }, [userState]);

  useEffect(() => {
    change('user-code', code || '');
    change('user-service', service || '');
  }, [code, service]);

  useEffect(() => {
    const countryPhoneCode = getCountryCallingCode((country?.toUpperCase?.() || 'US') as CountryCode);

    if (userState?.['user-phone']?.trim?.() && userState?.['user-phone']?.trim?.() !== '+') {
      setValue('phone', userState?.['user-phone']);
      trigger('phone');
      const cCountry = checkCountry(userState?.['user-phone']);
      const resultCountry = libphoneNumber(userState?.['user-phone'])?.country || '';
      if (resultCountry && resultCountry !== cCountry) setPhoneCountry(resultCountry?.toLowerCase?.());
    } else {
      setPhoneCountry(country.toLowerCase() || '');
      setValue('phone', `+${countryPhoneCode}`);
    }
    isFirst.current = true;
  }, [country, userState?.['user-phone']]);

  const checkCountry = (value: string) => {
    const detectedCountry = getCountryFromCallingCode(value);
    if (detectedCountry) {
      setPhoneCountry(detectedCountry?.toLowerCase?.());
    }
    return detectedCountry;
  };

  const checkNumber = (value: string) => {
    checkCountry(value);

    const valid = isValidPhoneNumber(value) || false;

    !valid && setControlError('phone', { message: t('screens.promo-details.phone-not-valid') });
    return valid;
  };

  const onChangePhone = useCallback(
    (value: string, onChange: (value: string) => void) => {
      change('user-phone', value);
      onChange(value);
      if (isFirst.current) isFirst.current = false;
      const currentValue = `+${value.replaceAll('+', '')}`;
      setValue('phone', currentValue);
      if (errors.phone?.message) clearControlError('phone');
      if (error) setError('');
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const cCountry = checkCountry(currentValue);
        const resultCountry = libphoneNumber(currentValue)?.country || '';
        if (resultCountry && resultCountry !== cCountry) setPhoneCountry(resultCountry?.toLowerCase?.());
      }, 200);
    },
    [errors?.phone?.message, error]
  );

  const renderIcon = useMemo(() => {
    return phoneCountry && phone.length > 2;
  }, [phoneCountry, phone]);

  const onPhoneBlur = useCallback(
    (value: string, blur: any) => {
      blur && blur();
      const valid = checkNumber(value);
      if (!valid) setControlError('phone', { message: t('screens.promo-details.phone-not-valid') });
    },
    [t]
  );

  const setInitialState = () => {
    setError('');
  };

  useEffect(() => {
    change('last-auth-screen', `${currentStep}`);
  }, [currentStep]);

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
      };
    }, [route, navigation])
  );

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

  useEffect(() => {
    handleCountry();
  }, [language, countries]);

  useFocusEffect(
    useCallback(() => {
      checkAccountsExists();
    }, [route, navigation, isAuthorized])
  );

  const isDisabled = () => {
    if (currentStep === 0) {
      return !!errors['firstName'] || !firstName || !!errors['lastName'] || !lastName;
    } else if (currentStep === 1) {
      return !!errors['country'] || !country.length || !!errors.phone?.message;
    } else {
      return !!errors['email'] || !!errors['password'] || !email;
    }
  };

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

  const onSignIn = async (data: SignInRequest) => {
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
          af_registration_method: 'Email',
          af_user_id: userId
        });
        mixpanelSignInSuccessTracker('ordinary', false, 'app');
        appsFlyerSetUserData(userId, email);
        trackSignUpPostHog();
      }
    } catch (error: unknown) {
      console.error('onSignIn Error:', error);
    }
  };

  const onSignUp = async (data: SignUpRequest) => {
    if (!data) {
      return;
    }

    setStoredLastAuthAction('sign-up');
    if (currentStep === 0) {
      const testEmailUser = {
        ...data,
        firstName: 'test',
        lastName: 'test',
        country: 'US',
        email: data.email,
        phone: '+994505036800' //DO NOT CHANGE OR REMOVE PHONE NUMBER!!!
      };

      try {
        setLoading(true);
        await signUp(testEmailUser).unwrap();
        setStep(1);
      } catch (error: any) {
        const emailError = error?.fields?.email?.errors?.[0];
        if (emailError) return setError(emailError);
        else {
          setStep(1);
        }
      } finally {
        return setLoading(false);
      }
    } else if (currentStep === 1) {
      const validPhone = checkNumber(data.phone);
      if (!validPhone) return;

      try {
        setLoading(true);

        const testPhoneUser = {
          ...data,
          firstName: 'test',
          lastName: 'test',
          country: 'US',
          email: 'check-phone@amegafx.com'
        };
        await signUp(testPhoneUser).unwrap();
      } catch (error: any) {
        const checkPhoneError = (error as Error)?.message;
        if (checkPhoneError?.includes?.('phone')) return setError(checkPhoneError);
      } finally {
        setLoading(false);
      }
      setStep(2);
      return;
    } else if (error && !error.includes(AlreadyRegisteredError)) {
      goToInitialState();
      return;
    }

    if (currentStep === 2) {
      mixpanelCreateAccountButtonPressTracker(prev);
    }

    const { email, password, firstName, lastName, country, phone } = data || {};

    setError('');
    setLoading(true);

    const partnerId = await get('partner-id', true);

    const signUpData = {
      ...data,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      country,
      phone: phone.trim().replaceAll(' ', ''),
      ...(Boolean(partnerId) && { partnerId }),
      ...(Boolean(cellExpertId) && { cellExpertId })
    };

    const signInData = {
      email,
      password,
      rememberMe: true,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim().replaceAll(' ', '')
    };

    try {
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

        mixpanelSignUpSuccessTracker('ordinary', false, 'app', false);

        trackBranchEvent(BranchEventTypes.CompleteRegistration, {
          userId: String(id || '')
        });

        if (service && code) await updateUserEmailVerify({ user: id, token: SERVER_API_TOKEN }).unwrap();
        await onSignIn(signInData);

        if (service && code) {
          await socialConnect({
            service: service,
            code: code,
            redirect: api.auth.facebookConnectRedirect
          }).unwrap();

          const customField =
            service === SocialService.facebook
              ? 'custom_facebook_profile_connected'
              : 'custom_google_profile_connected';

          await updateCustomFields({
            customFields: {
              [customField]: 'true'
            }
          }).unwrap();
        }

        await getProfile().unwrap();
      }
    } catch (error: unknown) {
      console.error('onSignUp Error:', error);

      setError((error as Error)?.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleBackPress = () => {
      if (currentStep === 0) {
        return false;
      } else {
        goToInitialState();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    switch (currentStep) {
      case 0:
        mixpanelScreenOpenTracker(MixpanelEventTypes.SignUpStep1);
        break;
      case 1:
        mixpanelScreenOpenTracker(MixpanelEventTypes.SignUpStep2);
        break;
      case 2:
        mixpanelScreenOpenTracker(MixpanelEventTypes.SignUpStep3);
        break;
      default:
        break;
    }

    return backHandler.remove;
  }, [currentStep]);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const goToInitialState = () => {
    setStep((prev) => (prev > 0 ? prev - 1 : 0));
    setError('');
  };

  const goBackToSignUp = useCallback(() => {
    change('last-auth-screen', '');
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.dispatch(StackActions.replace(AUTH_ROUTE_NAMES.SignUp));
  }, [navigation]);

  const renderCriteria = useCallback((label: string, isActive: boolean) => {
    return (
      <View style={styles.criteriaWrapper}>
        <View style={isActive ? styles.activeCheckIcon : styles.unActiveCheckIcon}>
          {isActive && (
            <SvgIcon name={SvgXmlIconNames.check} size={IconSize.xs} color={theme.palette.graphite['900']} />
          )}
        </View>
        <BaseText style={styles.criteria} variant={isActive ? BaseTextVariant.text : BaseTextVariant.small}>
          {label}
        </BaseText>
      </View>
    );
  }, []);

  const goToSignIn = () => {
    change('last-auth-screen', '');
    navigation.dispatch(StackActions.replace(AUTH_ROUTE_NAMES.SignIn));
  };

  const title = useMemo(() => {
    switch (currentStep) {
      case 0:
        return t('screens.email-signup.form.enter-email');
      case 1:
        return t('screens.email-signup.form.enter-phone');
      case 2:
        return t('screens.email-signup.form.set-password');
      default:
        return '';
    }
  }, [currentStep, t]);

  const desc = useMemo(() => {
    switch (currentStep) {
      case 0:
        return t('screens.email-signup.form.enter-email-desc');
      case 1:
        return t('screens.email-signup.form.enter-phone-desc');
      case 2:
        return t('screens.email-signup.form.set-password-desc');
      default:
        return '';
    }
  }, [currentStep, t]);

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

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader
        currentStep={currentStep + 1}
        stepsCount={3}
        progress={100 / (3 - currentStep)}
        onBackPressed={currentStep === 0 ? goBackToSignUp : goToInitialState}
        buttonStyle={{ marginRight: 20 }}
        leftIconType={currentStep === 0 ? SvgXmlIconNames.close : SvgXmlIconNames.arrowLeft}
      />
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, !isKeyboardVisible && { justifyContent: 'space-between' }]}
          style={styles.scrollBox}
        >
          <View>
            <BaseText style={styles.title}>{title}</BaseText>
            <BaseText style={styles.subTitle} variant={BaseTextVariant.small}>
              {desc}
            </BaseText>
            <View style={styles.inputWrapper}>
              {currentStep === 0 && (
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
                      change('user-email', text);
                      onChange(text);
                      if (error && error.includes(AlreadyRegisteredError)) setError('');
                    };

                    return (
                      <BaseFormField
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
              )}
              {currentStep === 1 && (
                <>
                  <Controller
                    name='phone'
                    control={control}
                    rules={{
                      required: t('errors.required')
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <BaseFormField
                        returnKeyType={'next'}
                        hideClearButton
                        error={errors.phone?.message}
                        onBlur={() => onPhoneBlur(value, onBlur)}
                        enableButtonsAnimation={value?.length > 1}
                        onChange={(changeValue) => onChangePhone(changeValue as never as string, onChange) as any}
                        keyboardType='phone-pad'
                        dataDetectorTypes='phoneNumber'
                        rightIcon={rightIcon}
                        value={value}
                        title={t('screens.email-signup.form.phone')}
                        placeholder='000 000 000'
                        required
                      />
                    )}
                  />
                </>
              )}
              <View style={styles.inputWrapper}>
                {currentStep === 2 && (
                  <>
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
                          returnKeyType={'send'}
                          secureTextEntry={true}
                          error={errors.password?.message}
                          onBlur={onBlur}
                          onChange={(changeValue) => {
                            change('user-password', changeValue as never as string);
                            onChange(changeValue);
                          }}
                          value={value}
                          title={t('screens.email-signup.form.password-placeholder')}
                          required
                        />
                      )}
                    />
                    {renderCriteria(
                      t('screens.email-signup.form.password-length'),
                      password.length >= 8 && password.length <= 32
                    )}
                    {renderCriteria(t('screens.email-signup.form.password-uppercase'), upperCaseRegex.test(password))}
                    {renderCriteria(t('screens.email-signup.form.password-lowercase'), lowerCaseRegex.test(password))}
                    {renderCriteria(t('screens.email-signup.form.password-number'), numberRegex.test(password))}
                  </>
                )}
              </View>
            </View>
          </View>
          <View>
            {isKeyboardVisible ? null : (
              <BaseButton
                loading={isLoading}
                loadingType={BaseButtonLoading.ellipsis}
                disabled={isDisabled()}
                onPress={handleSubmit(onSignUp)}
                type={BaseButtonType.primary}
                style={styles.button}
                fullWidth={true}
                size={BaseButtonSize.large}
                label={
                  error && currentStep === 2
                    ? t('screens.email-signup.form.signup-another-email')
                    : currentStep === 2
                      ? t('screens.email-signup.form.create-account')
                      : t('screens.email-signup.form.continue')
                }
              />
            )}
            <BaseButton
              type={BaseButtonType.link}
              style={styles.button}
              fullWidth={true}
              size={BaseButtonSize.large}
              label={t('screens.email-signup.have-an-account')}
              onPress={goToSignIn}
            />
            <View style={styles.buttonBox}>
              {currentStep === 2 && <BaseRiskWarning variant={BaseRiskWarningVariant.signup} />}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <KeyboardDismissButton disabled={isDisabled()} onPress={handleSubmit(onSignUp)} />
    </SafeAreaView>
  );
};

export default EmailSignUpScreen;

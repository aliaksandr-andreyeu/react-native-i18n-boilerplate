import React, { Dispatch, SetStateAction, FC, useEffect, useLayoutEffect, useState } from 'react';
import { View, ViewProps, TouchableOpacity } from 'react-native';
import {
  BaseButton,
  BaseButtonLoading,
  BaseButtonType,
  BaseButtonSize,
  BaseFormField,
  BaseText,
  BaseCheckbox
} from '@/components';
import { useTheme } from '@react-navigation/native';
import { AUTH_ROUTE_NAMES, AuthRootParamsList, IdeasHubRootParamsList } from '@/navigation/app/stacks';
import { useTranslation } from 'react-i18next';
import { config } from '@/constants';
import { actions } from '@/store';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import useStyles from './styles';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { ToastType, useToast } from '@/providers';
import {
  identifyMixpanelUser,
  IdentifyMixpanelUserTypes,
  MixpanelEventTypes,
  BranchEventTypes,
  trackBranchEvent,
  setLoggedInBefore,
  appsFlyerLogEvent,
  AppsFlyerEventTypes,
  appsFlyerSetUserData,
  setStoredLastAuthAction,
  mixpanelSignInSuccessTracker
} from '@/helpers';
import { BaseError } from '@/store/slices';
import { ClientData } from '@/store/api';
import { testIDs } from '@/constants';
import firebaseAnalyticsInstance from '@/helpers/analytics/firebase';
import { FIREBASE_ANALYTICS_EVENTS } from '@/helpers/analytics/firebase/const';

const {
  validation: { emailRegex },
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

interface SignInRequest {
  email: string;
  password: string;
  rememberMe: boolean;
  fromLogin: boolean;
}

const {
  auth: { useSignIn }
} = actions;

interface SignInFormProps extends ViewProps {
  error: string;
  rememberMe: boolean;
  setError: Dispatch<SetStateAction<string>>;
  commonLoading: boolean;
}

const SignInForm: FC<SignInFormProps> = ({ style, error, rememberMe, setError, commonLoading }) => {
  const { openToast, closeToast } = useToast();

  const { t } = useTranslation();

  const navigation = useNavigation<NavigationProp<IdeasHubRootParamsList & AuthRootParamsList & ParamListBase>>();

  const [isCommonLoading, setIsCommonLoading] = useState<boolean>(false);
  const [signIn, signInResponse] = useSignIn();
  const { isLoading, isSuccess, isError } = signInResponse || {};

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe,
      fromLogin: true
    }
  });

  const isFormErrors = Boolean(errors && Object.keys(errors).length > 0);
  const { email, password } = watch();

  useEffect(() => {
    setValue('rememberMe', rememberMe);
  }, [rememberMe]);

  const errorResponseHandler = () => {
    if (!isError) {
      return;
    }
    const err = signInResponse.error as BaseError;

    const { data, status } = err || {};

    if (!data) {
      return null;
    }
    if (status === 401) {
      setError(t('screens.sign-in.form.error-message'));
      return;
    }
    const { message } = data || {};
    setError(message || t('errors.common'));
  };

  const successResponseHandler = () => {
    if (!isSuccess) {
      return;
    }
    const { data } = signInResponse || {};

    const { login, complete } = (data || {}) as { login: boolean; complete: boolean };
    if (!data) {
      setError(t('errors.common'));
      return;
    }

    if (login === true && complete === false) {
      navigation.navigate(AUTH_ROUTE_NAMES.TwoFactorAuth);
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
    errorResponseHandler();
  }, [isError]);

  useLayoutEffect(() => {
    if (!isCommonLoading) successResponseHandler();
  }, [signInResponse, isCommonLoading]);

  useLayoutEffect(() => {
    errorToastHandler();
  }, [error]);

  const goToForgotPassword = () => {
    navigation.navigate(AUTH_ROUTE_NAMES.ForgotPassword);
  };

  const onSignIn = async (data: SignInRequest) => {
    if (!data) {
      return;
    }
    setError('');
    try {
      setStoredLastAuthAction('sign-in');
      setIsCommonLoading(true);
      const client = (await signIn(data)) as { data: { client: ClientData } };

      if (client.data) {
        const { id: userId, email } = client?.data?.client || {};

        await firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.SIGN_IN, {
          id: client.data?.client?.id || '',
          firstName: client.data?.client?.firstName || '',
          lastName: client.data?.client?.lastName || '',
          email: client.data?.client?.email || '',
          country: client.data?.client?.country || '',
          type: 'regular'
        });

        trackBranchEvent(BranchEventTypes.Login, {
          userId: String(userId || '')
        });

        await setLoggedInBefore();

        await identifyMixpanelUser(
          client?.data?.client || {},
          MixpanelEventTypes.Login,
          IdentifyMixpanelUserTypes.normal
        );
        mixpanelSignInSuccessTracker('ordinary', false, 'app');
        await appsFlyerLogEvent(AppsFlyerEventTypes.Login, { af_user_id: userId });

        appsFlyerSetUserData(userId, email);
      }
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsCommonLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.formFieldBox}>
        <Controller
          name='email'
          control={control}
          rules={{
            required: t('screens.sign-in.form.email-required'),
            pattern: {
              value: emailRegex,
              message: t('screens.sign-in.form.email-invalid')
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <BaseFormField
              style={styles.formField}
              returnKeyType={'next'}
              keyboardType={'email-address'}
              error={errors.email?.message}
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              title={t('screens.sign-in.form.email')}
              placeholder='emailexample@domain.com'
              required
              testID={testIDs.signin.email}
            />
          )}
        />
        <Controller
          name='password'
          control={control}
          rules={{
            required: t('screens.sign-in.form.password-required')
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <BaseFormField
              autoComplete='off'
              autoCapitalize='none'
              style={styles.formField}
              returnKeyType={'send'}
              secureTextEntry={true}
              error={errors.password?.message}
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              title={t('screens.sign-in.form.password')}
              placeholder='••••••••'
              required
              autoCorrect={false}
              testID={testIDs.signin.password}
            />
          )}
        />
      </View>
      <View style={styles.rememberMeContainer}>
        <Controller
          name='rememberMe'
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <BaseCheckbox
                onChange={onChange}
                testID={testIDs.signin.rememberMe}
                defaultValue={value}
                label={t('screens.sign-in.form.remember-me')}
                hasCheck
                iconColor='#1FE07A'
                iconSize={IconSize.sm}
                checkedBgColor='transparent'
                textFont={styles.textFont}
                checkBoxStyle={styles.checkBox}
              />
            );
          }}
        />
        <TouchableOpacity onPress={goToForgotPassword} hitSlop={hitSlop} activeOpacity={activeOpacity}>
          <BaseText style={styles.forgot}>{t('screens.sign-in.forgot-password')}</BaseText>
        </TouchableOpacity>
      </View>
      <BaseButton
        testID={testIDs.signin.submit}
        type={BaseButtonType.primary}
        fullWidth={true}
        size={BaseButtonSize.large}
        label={t('screens.sign-in.login')}
        onPress={handleSubmit(onSignIn)}
        loading={isLoading || isCommonLoading || commonLoading}
        loadingType={BaseButtonLoading.ellipsis}
        disabled={isFormErrors || !email || !password}
        style={styles.loginBtn}
      />
    </View>
  );
};

export default SignInForm;

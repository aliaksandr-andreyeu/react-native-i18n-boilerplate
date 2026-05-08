import React, { Fragment, Dispatch, useState, useMemo, useCallback, SetStateAction, FC, useLayoutEffect } from 'react';
import { ViewProps, ScrollView, View, TouchableOpacity } from 'react-native';
import {
  BaseFormField,
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseButtonLoading,
  BaseText,
  BaseTextVariant,
  BaseImage,
  KeyboardDismissButton
} from '@/components';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { config, testIDs } from '@/constants';
import { actions } from '@/store';
import { useTheme } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import { useForm, Controller } from 'react-hook-form';
import useStyles from './styles';

const {
  headerBar: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const upperCaseRegex = /[A-Z]/;
const lowerCaseRegex = /[a-z]/;
const numberRegex = /\d/;

const {
  auth: { useResetPassword, useForgotPassword }
} = actions;

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordData {
  pin: string;
  password: string;
  confirm: string;
}

interface ResetPasswordRequest {
  password: string;
  pin: string;
  email: string;
}

interface ForgotPasswordFormProps extends ViewProps {
  email: string;
  setResetPassword: Dispatch<SetStateAction<boolean>>;
}

let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

const ResetPasswordForm: FC<ForgotPasswordFormProps> = ({ email, style, setResetPassword }) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isRetry, setRetry] = useState<boolean>(false);
  const [isResetSuccess, setResetSuccess] = useState<boolean>(false);

  const { t } = useTranslation();

  const navigation = useNavigation<NavigationProp<AuthRootParamsList & ParamListBase>>();

  const [resetPassword, resetPasswordResponse] = useResetPassword();
  const {
    isLoading: isResetPasswordLoading,
    isSuccess: isResetPasswordSuccess,
    isError: isResetPasswordError
  } = resetPasswordResponse || {};

  const [forgotPassword, forgotPasswordResponse] = useForgotPassword();
  const {
    isLoading: isForgotPasswordLoading,
    isSuccess: isForgotPasswordSuccess,
    isError: isForgotPasswordError
  } = forgotPasswordResponse || {};

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      pin: '',
      password: '',
      confirm: ''
    }
  });

  const pin = watch('pin');
  const password = watch('password');

  const isPasswordValid = Boolean(
    password.length >= 8 &&
      password.length <= 32 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
  );
  const isFormErrors = Boolean(errors && Object.keys(errors).length > 0) || error || !isPasswordValid;
  const isForgotPasswordErrors = Boolean(!email || remainingSeconds > 0);

  const resetPasswordHandler = async (data: ResetPasswordData) => {
    if (!data || !isPasswordValid) {
      return;
    }

    const { pin, password } = data || {};

    const body: ResetPasswordRequest = {
      password,
      pin,
      email
    };

    setError('');

    try {
      await resetPassword(body);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const forgotPasswordHandler = async () => {
    if (isForgotPasswordErrors) {
      return;
    }

    const body: ForgotPasswordRequest = {
      email
    };

    try {
      await forgotPassword(body);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const errorResponseHandler = () => {
    if (!isResetPasswordError) {
      return;
    }
    const { error } = resetPasswordResponse || {};
    if (!error) {
      return null;
    }
    setError(t('screens.forgot-password.form.pin-invalid'));
    setRetry(true);
  };

  const successResponseHandler = () => {
    if (!isResetPasswordSuccess) {
      return;
    }
    const { data } = resetPasswordResponse || {};

    if (!data || !data.success) {
      setError(t('screens.forgot-password.form.pin-invalid'));
      setRetry(true);
      return;
    }

    setResetSuccess(true);
  };

  useLayoutEffect(() => {
    setError('');
  }, [pin]);

  useLayoutEffect(() => {
    errorResponseHandler();
  }, [isResetPasswordError]);

  useLayoutEffect(() => {
    successResponseHandler();
  }, [isResetPasswordSuccess]);

  const loadTimer = () => {
    if (remainingSeconds === 0) {
      return;
    }
    intervalId && clearInterval(intervalId);

    intervalId = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
  };

  const startTimer = () => {
    setRemainingSeconds(60);

    intervalId && clearInterval(intervalId);

    intervalId = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
  };

  const resetTimer = () => {
    if (remainingSeconds > 0) {
      return;
    }

    intervalId && clearInterval(intervalId);

    setRemainingSeconds(0);
  };

  useLayoutEffect(() => {
    loadTimer();
    resetTimer();
    return () => {
      intervalId && clearInterval(intervalId);
    };
  }, [remainingSeconds]);

  const forgotPasswordErrorHandler = () => {
    if (!isForgotPasswordError) {
      return;
    }
    const { error } = forgotPasswordResponse || {};
    if (!error) {
      return null;
    }
    const { message } = (error as { message: string }) || {};
    setError(message || t('errors.common'));
  };

  const forgotPasswordSuccessHandler = () => {
    if (!isForgotPasswordSuccess) {
      return;
    }
    startTimer();
  };

  useLayoutEffect(() => {
    forgotPasswordErrorHandler();
  }, [isForgotPasswordError]);

  useLayoutEffect(() => {
    forgotPasswordSuccessHandler();
  }, [isForgotPasswordSuccess]);

  const onGoBack = () => {
    if (isResetSuccess) {
      return;
    }
    setResetPassword(false);
  };

  const goSignIn = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
      screen: AUTH_ROUTE_NAMES.SignIn
    });
  };

  const backButton = useMemo(() => {
    if (isResetSuccess) {
      return null;
    }
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        hitSlop={hitSlop}
        onPress={onGoBack}
        style={styles.backButton}
        testID={testIDs.resetPassword.backButton}
      >
        <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
      </TouchableOpacity>
    );
  }, [styles, onGoBack, isResetSuccess]);

  const title = useMemo(() => {
    if (isResetSuccess) {
      return t('screens.forgot-password.title-success');
    }
    return t('screens.forgot-password.title-reset');
  }, [t, isResetSuccess]);

  const desc = useMemo(() => {
    if (isResetSuccess) {
      return t('screens.forgot-password.desc-success');
    }
    return t('screens.forgot-password.desc-reset', { email });
  }, [t, email, isResetSuccess]);

  const buttons = useMemo(() => {
    if (isResetSuccess) {
      return (
        <BaseButton
          onPress={goSignIn}
          type={BaseButtonType.primary}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.forgot-password.form.sign-in')}
        />
      );
    }

    return (
      <Fragment>
        <KeyboardDismissButton disabled={Boolean(isFormErrors)} onPress={handleSubmit(resetPasswordHandler)} />
        <BaseButton
          loading={isResetPasswordLoading}
          loadingType={BaseButtonLoading.ellipsis}
          disabled={Boolean(isFormErrors)}
          onPress={handleSubmit(resetPasswordHandler)}
          type={BaseButtonType.primary}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.forgot-password.form.set-new-password')}
          testID={testIDs.resetPassword.submitButton}
        />
        {isRetry ? (
          <BaseButton
            testID={testIDs.resetPassword.resendButton}
            loading={isForgotPasswordLoading}
            loadingType={BaseButtonLoading.ellipsis}
            disabled={isForgotPasswordErrors}
            onPress={forgotPasswordHandler}
            type={BaseButtonType.accent}
            fullWidth={true}
            size={BaseButtonSize.large}
            label={
              Boolean(remainingSeconds > 0)
                ? t('screens.forgot-password.form.resend-pin-countdown', { countdown: remainingSeconds })
                : t('screens.forgot-password.form.resend-pin')
            }
          />
        ) : null}
      </Fragment>
    );
  }, [
    t,
    isResetSuccess,
    goSignIn,
    isResetPasswordLoading,
    isFormErrors,
    resetPasswordHandler,
    handleSubmit,
    isRetry,
    forgotPasswordHandler,
    remainingSeconds,
    isForgotPasswordLoading,
    email
  ]);

  const renderCriteria = useCallback((label: string, isActive: boolean) => {
    return (
      <View style={styles.rule}>
        <View style={isActive ? styles.activeCheckIcon : styles.unActiveCheckIcon}>
          {isActive && (
            <SvgIcon name={SvgXmlIconNames.check} size={IconSize.xs} color={theme.palette?.graphite['900']} />
          )}
        </View>
        <BaseText style={styles.criteriaText} variant={isActive ? BaseTextVariant.textSemiBold : BaseTextVariant.small}>
          {label}
        </BaseText>
      </View>
    );
  }, []);

  return (
    <View style={[styles.container, style]}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <View style={styles.header}>{backButton}</View>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
            <View style={styles.titleBox}>
              <BaseText testID={testIDs.resetPassword.title} variant={BaseTextVariant.authSubTitle}>
                {title}
              </BaseText>
              <BaseText testID={testIDs.resetPassword.desc} variant={BaseTextVariant.authSmall}>
                {desc}
              </BaseText>
            </View>
            <View style={styles.formBox}>
              {isResetSuccess ? (
                <View style={styles.imgBox}>
                  <BaseImage style={styles.img} resizeMode='contain' source={images.cloudSurprised} />
                </View>
              ) : (
                <Fragment>
                  <Controller
                    name='pin'
                    control={control}
                    rules={{
                      required: t('screens.forgot-password.form.pin-required')
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <BaseFormField
                        style={styles.formField}
                        returnKeyType={'next'}
                        error={errors.pin?.message || error}
                        onBlur={onBlur}
                        onChange={onChange}
                        value={value}
                        title={t('screens.forgot-password.form.pin')}
                        testID={testIDs.resetPassword.pinInput}
                      />
                    )}
                  />
                  <View style={styles.inBox}>
                    <Controller
                      name='password'
                      control={control}
                      rules={{
                        required: t('screens.forgot-password.form.new-password-required'),
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
                          returnKeyType={'next'}
                          secureTextEntry={true}
                          error={errors.password?.message}
                          onBlur={onBlur}
                          onChange={onChange}
                          value={value}
                          title={t('screens.forgot-password.form.new-password')}
                          testID={testIDs.resetPassword.passwordInput}
                        />
                      )}
                    />
                    <Controller
                      name='confirm'
                      control={control}
                      rules={{
                        required: t('screens.forgot-password.form.confirm-password-required'),
                        validate: (value) =>
                          value === password || t('screens.forgot-password.form.confirm-password-invalid')
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <BaseFormField
                          style={styles.formField}
                          returnKeyType={'next'}
                          secureTextEntry={true}
                          error={errors.confirm?.message}
                          onBlur={onBlur}
                          onChange={onChange}
                          value={value}
                          title={t('screens.forgot-password.form.confirm-password')}
                          testID={testIDs.resetPassword.confirmPasswordInput}
                        />
                      )}
                    />
                    <View style={styles.rules}>
                      {renderCriteria(
                        t('screens.forgot-password.form.password-length'),
                        password.length >= 8 && password.length <= 32
                      )}
                      {renderCriteria(
                        t('screens.forgot-password.form.password-uppercase'),
                        upperCaseRegex.test(password)
                      )}
                      {renderCriteria(
                        t('screens.forgot-password.form.password-lowercase'),
                        lowerCaseRegex.test(password)
                      )}
                      {renderCriteria(t('screens.forgot-password.form.password-number'), numberRegex.test(password))}
                    </View>
                  </View>
                </Fragment>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.buttonBox}>{buttons}</View>
    </View>
  );
};

export default ResetPasswordForm;

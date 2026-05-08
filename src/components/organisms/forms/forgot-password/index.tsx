import React, { Dispatch, useState, useCallback, SetStateAction, FC, useLayoutEffect } from 'react';
import { ViewProps, ScrollView, View, TouchableOpacity } from 'react-native';
import {
  BaseFormField,
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseButtonLoading,
  BaseText,
  BaseTextVariant,
  KeyboardDismissButton
} from '@/components';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { config, testIDs } from '@/constants';
import { actions } from '@/store';
import { useTheme } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { AuthRootParamsList } from '@/navigation/app/stacks';
import { useTranslation } from 'react-i18next';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  ParamListBase,
  NavigationProp,
  RouteProp
} from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { ToastType, useToast } from '@/providers';
import useStyles from './styles';

const {
  validation: { emailRegex },
  headerBar: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const {
  auth: { useForgotPassword }
} = actions;

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordFormProps extends ViewProps {
  setResetPassword: Dispatch<SetStateAction<boolean>>;
  setEmail: Dispatch<SetStateAction<string>>;
}

const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({ style, setEmail, setResetPassword }) => {
  const { openToast, closeToast } = useToast();

  const [error, setError] = useState<string>('');

  const { t } = useTranslation();

  const navigation = useNavigation<NavigationProp<AuthRootParamsList>>();
  const route = useRoute<RouteProp<ParamListBase>>();

  const { goBack, canGoBack } = navigation || {};
  const canBack = canGoBack();

  const [forgotPassword, forgotPasswordResponse] = useForgotPassword();
  const { isLoading, isSuccess, isError } = forgotPasswordResponse || {};

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
      email: ''
    }
  });

  const email = watch('email');

  useLayoutEffect(() => {
    setEmail(email || '');
  }, [email]);

  const isFormErrors = Boolean(errors && Object.keys(errors).length > 0) || !email;

  const setInitialState = () => {
    setError('');
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
      };
    }, [route, navigation])
  );

  const forgotPasswordHandler = async (data: ForgotPasswordRequest) => {
    if (!data) {
      return;
    }
    setError('');
    try {
      await forgotPassword(data);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const errorResponseHandler = () => {
    if (!isError) {
      return;
    }
    const { error } = forgotPasswordResponse || {};
    if (!error) {
      return null;
    }
    const { message } = (error as { message: string }) || {};
    setError(message || t('errors.common'));
  };

  const successResponseHandler = () => {
    if (!isSuccess) {
      return;
    }
    const { data } = forgotPasswordResponse || {};

    if (!data) {
      setError(t('errors.common'));
      return;
    }

    setResetPassword(true);
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
    successResponseHandler();
  }, [isSuccess]);

  useLayoutEffect(() => {
    errorToastHandler();
  }, [error]);

  const onGoBack = () => {
    if (!canBack) {
      return;
    }
    goBack();
  };

  return (
    <View style={[styles.container, style]}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={activeOpacity}
            hitSlop={hitSlop}
            onPress={onGoBack}
            style={styles.backButton}
            testID={testIDs.forgotPassword.backButton}
          >
            <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
            <View style={styles.titleBox}>
              <BaseText variant={BaseTextVariant.authSubTitle}>{t('screens.forgot-password.title')}</BaseText>
              <BaseText variant={BaseTextVariant.authSmall}>{t('screens.forgot-password.desc')}</BaseText>
            </View>
            <View style={styles.formBox}>
              <Controller
                name='email'
                control={control}
                rules={{
                  required: t('screens.forgot-password.form.email-required'),
                  pattern: {
                    value: emailRegex,
                    message: t('screens.forgot-password.form.email-invalid')
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
                    title={t('screens.forgot-password.form.email')}
                    testID={testIDs.forgotPassword.emailInput}
                  />
                )}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.buttonBox}>
        <BaseButton
          loading={isLoading}
          loadingType={BaseButtonLoading.ellipsis}
          disabled={isFormErrors}
          onPress={handleSubmit(forgotPasswordHandler)}
          type={BaseButtonType.primary}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.forgot-password.form.continue')}
          testID={testIDs.forgotPassword.continueButton}
        />
      </View>
      <KeyboardDismissButton disabled={isFormErrors} onPress={handleSubmit(forgotPasswordHandler)} />
    </View>
  );
};

export default ForgotPasswordForm;

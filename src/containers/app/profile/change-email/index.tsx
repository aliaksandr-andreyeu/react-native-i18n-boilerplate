import React, { Fragment, useMemo, useEffect, useState, useLayoutEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BaseFormField,
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseButtonLoading,
  BaseText,
  BaseTextVariant,
  KeyboardDismissButton,
  ProgressHeader
} from '@/components';
import { SvgXmlIconNames, images } from '@/assets';
import { useTheme } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';
import { ParamListBase } from '@react-navigation/native';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { useForm, Controller } from 'react-hook-form';
import useStyles from './styles';
import { StackScreenProps } from '@react-navigation/stack';
import { ActionType, useChangeEmail, usePinSend } from '@/store/api';
import { useAppDispatch, useAppSelector, useBackHandler } from '@/hooks';
import { actions } from '@/store';
import { config } from '@/constants';

const {
  application: { openModal },
  portfolio: { setUserInfo }
} = actions;

const {
  validation: { emailRegex }
} = config;

interface ChangeEmailData {
  pin: string;
  email: string;
}

type ChangeEmailScreenProps = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.ChangeEmail>;

let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

const ChangeEmailScreen: React.FC<ChangeEmailScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  useBackHandler();

  const [pinError, setPinError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isFormShown, showForm] = useState<boolean>(false);

  const theme = useTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();

  const [changeEmail, changeEmailResponse] = useChangeEmail();
  const [sendPin, sendPinResponse] = usePinSend();

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      pin: ''
    }
  });

  const pin = watch('pin');
  const email = watch('email');

  useEffect(() => {
    if (pin) setPinError('');
  }, [pin]);

  useEffect(() => {
    if (email && userInfo.email) {
      const normalizedCurrentEmail = userInfo.email.trim().toLowerCase();
      const normalizedNewEmail = email.trim().toLowerCase();
      if (normalizedCurrentEmail === normalizedNewEmail) setEmailError(t('screens.change-email.email-is-same'));
      else setEmailError('');
    }
  }, [email]);

  const isFormErrors = Boolean(errors && Object.keys(errors).length > 0) || pinError || emailError;

  const loadTimer = () => {
    if (remainingSeconds === 0) {
      return;
    }
    intervalId && clearInterval(intervalId);

    intervalId = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
  };

  const sendPinHandler = async () => {
    try {
      await sendPin({ method: 'email', action: ActionType.EMAIL });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    if (sendPinResponse.isSuccess) {
      startTimer();
      showForm(true);
    }
  }, [sendPinResponse.isSuccess]);

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

  const changeEmailHandler = async (data: ChangeEmailData) => {
    if (!isFormShown) {
      sendPinHandler();
      return;
    }
    if (!data) {
      return;
    }

    try {
      await changeEmail({ email: data.email, pin: data.pin, reason: 'User request via mobile application.' })
        .unwrap()
        .then(() => {
          dispatch(
            openModal({
              title: t('screens.change-email.email-updated'),
              onClosed: () => {
                dispatch(
                  setUserInfo({
                    ...userInfo,
                    email: data.email
                  })
                );
                showForm(false);
              },
              closeTime: 5,
              icon: images.depositSuccess,
              iconSize: {
                width: 90,
                height: 90
              }
            })
          );
        })
        .catch((errors) => {
          Object.keys(errors).map((key) => {
            const messages = errors[key]?.errors || [];
            if (key === 'pin' && messages[0]) setPinError(t('screens.change-email.pin-invalid'));
            if (key === 'email' && messages[0]) setEmailError(messages[0]);
          });
        });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const buttons = useMemo(() => {
    return (
      <Fragment>
        <KeyboardDismissButton disabled={Boolean(isFormErrors)} onPress={handleSubmit(changeEmailHandler)} />
        <BaseButton
          onPress={handleSubmit(changeEmailHandler)}
          loading={isFormShown ? changeEmailResponse.isLoading : sendPinResponse.isLoading}
          loadingType={BaseButtonLoading.ellipsis}
          disabled={Boolean(isFormErrors)}
          type={BaseButtonType.primary}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.change-email.action-button')}
        />
        {isFormShown && (
          <BaseButton
            onPress={sendPinHandler}
            loading={sendPinResponse.isLoading}
            loadingType={BaseButtonLoading.ellipsis}
            disabled={Boolean(remainingSeconds > 0)}
            type={BaseButtonType.accent}
            fullWidth={true}
            size={BaseButtonSize.large}
            label={
              Boolean(remainingSeconds > 0)
                ? t('screens.change-email.resend-pin-countdown', { countdown: remainingSeconds })
                : t('screens.change-email.resend-PIN')
            }
          />
        )}
      </Fragment>
    );
  }, [
    t,
    isFormErrors,
    handleSubmit,
    changeEmailHandler,
    sendPinResponse.isLoading,
    changeEmailResponse.isLoading,
    sendPinHandler
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <ProgressHeader
          hideProgressBar
          leftIconType={SvgXmlIconNames.arrowLeft}
          stepsCount={0}
          currentStep={0}
          title={isFormShown ? undefined : t('screens.change-email.title')}
        />
        <View style={styles.content}>
          {isFormShown ? (
            <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
              <View style={styles.titleBox}>
                <BaseText variant={BaseTextVariant.authSubTitle}>{t('screens.change-email.title')}</BaseText>
                <BaseText variant={BaseTextVariant.authSmall}>
                  {t('screens.change-email.desc', { email: userInfo.email })}
                </BaseText>
              </View>
              <View style={styles.formBox}>
                <Controller
                  name='pin'
                  control={control}
                  rules={{
                    required: t('screens.change-email.pin-required')
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <BaseFormField
                      style={styles.formField}
                      returnKeyType={'next'}
                      error={errors.pin?.message || pinError}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      title={t('screens.change-email.pin-field-title')}
                      required
                    />
                  )}
                />
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: t('screens.change-email.email-required'),
                    pattern: {
                      value: emailRegex,
                      message: t('screens.change-email.email-invalid')
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <BaseFormField
                      style={styles.formField}
                      returnKeyType={'next'}
                      keyboardType={'email-address'}
                      error={errors.email?.message || emailError}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      title={t('screens.change-email.new-email')}
                      required
                    />
                  )}
                />
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emailBox}>
              <BaseText variant={BaseTextVariant.tiny} style={styles.currentEmail}>
                {t('screens.profile.current-email')}
              </BaseText>
              <BaseText variant={BaseTextVariant.tag}>{userInfo.email}</BaseText>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <View style={styles.buttonBox}>{buttons}</View>
    </SafeAreaView>
  );
};

export default ChangeEmailScreen;

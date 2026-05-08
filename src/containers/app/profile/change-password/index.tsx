import React, { Fragment, useMemo, useCallback, useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { config } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';
import { ParamListBase } from '@react-navigation/native';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { useForm, Controller } from 'react-hook-form';
import useStyles from './styles';
import { StackScreenProps } from '@react-navigation/stack';
import { useChangePassword } from '@/store/api';
import { useAppDispatch, useBackHandler } from '@/hooks';
import { actions } from '@/store';

const {
  headerBar: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const {
  application: { openModal }
} = actions;

const upperCaseRegex = /[A-Z]/;
const lowerCaseRegex = /[a-z]/;
const numberRegex = /\d/;

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

type ChangePasswordScreenProps = StackScreenProps<
  ParamListBase & CommonRootParamsList,
  COMMON_ROUTE_NAMES.ChangePassword
>;

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const [error, setError] = useState<string>('');
  const [oldPassworderror, setOldPasswordError] = useState<string>('');
  const { t } = useTranslation();

  useBackHandler();

  const theme = useTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();

  const [changePassword, changePasswordResponse] = useChangePassword();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirm: ''
    }
  });

  const password = watch('newPassword');
  const oldPassword = watch('oldPassword');
  const confirm = watch('confirm');

  useEffect(() => {
    if (password && confirm) trigger('confirm');
  }, [password]);

  useEffect(() => {
    if (error) setError('');
  }, [confirm, password]);

  useEffect(() => {
    if (oldPassworderror) setOldPasswordError('');
  }, [oldPassword]);

  const isPasswordValid = Boolean(
    password.length >= 8 &&
      password.length <= 32 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
  );
  const isFormErrors = Boolean(errors && Object.keys(errors).length > 0) || !isPasswordValid;

  const goSignIn = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: ROOT_ROUTE_NAMES.Auth,
      params: {
        screen: AUTH_ROUTE_NAMES.SignIn
      }
    });
  };

  const backButton = useMemo(() => {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        hitSlop={hitSlop}
        onPress={navigation.goBack}
        style={styles.backButton}
      >
        <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
      </TouchableOpacity>
    );
  }, [styles]);

  const changePasswordHandler = async (data: ChangePasswordData) => {
    if (!data || !isPasswordValid) {
      return;
    }

    try {
      await changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword })
        .unwrap()
        .then(() => {
          dispatch(
            openModal({
              title: t('screens.change-password.password-updated'),
              onClosed: navigation.goBack,
              closeTime: 5,
              icon: images.depositSuccess,
              iconSize: {
                width: 90,
                height: 90
              }
            })
          );
        })
        .catch(({ message, fieldName }) => {
          if (fieldName === 'oldPassword') {
            setOldPasswordError(message);
          } else if (message) setError(message);
        });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const buttons = useMemo(() => {
    return (
      <Fragment>
        <KeyboardDismissButton disabled={Boolean(isFormErrors)} onPress={handleSubmit(changePasswordHandler)} />
        <BaseButton
          onPress={handleSubmit(changePasswordHandler)}
          loading={changePasswordResponse.isLoading}
          loadingType={BaseButtonLoading.ellipsis}
          disabled={Boolean(isFormErrors)}
          type={BaseButtonType.primary}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.change-password.action-button')}
        />
      </Fragment>
    );
  }, [t, goSignIn, isFormErrors, handleSubmit, changePasswordHandler, changePasswordResponse.isLoading]);

  const renderCriteria = useCallback((label: string, isActive: boolean) => {
    return (
      <View style={styles.rule}>
        <View style={isActive ? styles.activeCheckIcon : styles.unActiveCheckIcon}>
          {isActive && (
            <SvgIcon name={SvgXmlIconNames.check} size={IconSize.xs} color={theme.palette.graphite['900']} />
          )}
        </View>
        <BaseText style={styles.criteriaText} variant={isActive ? BaseTextVariant.textSemiBold : BaseTextVariant.small}>
          {label}
        </BaseText>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <View style={styles.header}>{backButton}</View>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
            <View style={styles.titleBox}>
              <BaseText variant={BaseTextVariant.authSubTitle}>{t('screens.change-password.title')}</BaseText>
            </View>
            <View style={styles.formBox}>
              <Controller
                name='oldPassword'
                control={control}
                rules={{
                  required: t('screens.change-password.password-required')
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <BaseFormField
                    style={styles.formField}
                    returnKeyType={'next'}
                    secureTextEntry={true}
                    error={errors.oldPassword?.message || oldPassworderror}
                    onBlur={onBlur}
                    onChange={onChange}
                    value={value}
                    title={t('screens.change-password.current-password')}
                    required
                  />
                )}
              />
              <View style={styles.inBox}>
                <Controller
                  name='newPassword'
                  control={control}
                  rules={{
                    required: t('screens.change-password.new-password-required'),
                    validate: (value) => {
                      if (
                        !upperCaseRegex.test(value) ||
                        !lowerCaseRegex.test(value) ||
                        !numberRegex.test(value) ||
                        !(value.length >= 8 && value.length <= 32)
                      ) {
                        return t('screens.change-password.password-invalid');
                      }
                      return true;
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <BaseFormField
                      style={styles.formField}
                      returnKeyType={'next'}
                      secureTextEntry={true}
                      error={errors.newPassword?.message}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      title={t('screens.change-password.new-password')}
                      required
                    />
                  )}
                />
                <Controller
                  name='confirm'
                  control={control}
                  rules={{
                    required: t('screens.change-password.confirm-password-required'),
                    validate: (value) => value === password || t('screens.change-password.confirm-password-invalid')
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <BaseFormField
                      style={styles.formField}
                      returnKeyType={'next'}
                      secureTextEntry={true}
                      error={errors.confirm?.message || error}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                      title={t('screens.change-password.confirm-password')}
                      required
                    />
                  )}
                />
                <View style={styles.rules}>
                  {renderCriteria(
                    t('screens.change-password.password-length'),
                    password.length >= 8 && password.length <= 32
                  )}
                  {renderCriteria(t('screens.change-password.password-uppercase'), upperCaseRegex.test(password))}
                  {renderCriteria(t('screens.change-password.password-lowercase'), lowerCaseRegex.test(password))}
                  {renderCriteria(t('screens.change-password.password-number'), numberRegex.test(password))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.buttonBox}>{buttons}</View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

import React, { FC, useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { NavigationProp, ParamListBase, useNavigation, useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseActivityLoader, BaseRiskWarning, BaseText, BaseTextVariant, KeyboardDismissButton } from '@/components';
import {
  AUTH_ROUTE_NAMES,
  AuthRootParamsList,
  IDEASHUB_ROUTE_NAMES,
  IdeasHubRootParamsList,
  PULSEAI_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { config } from '@/constants';
import { actions } from '@/store';
import useStyles from './styles';
import { OtpInput } from 'react-native-otp-entry';

const {
  headerBar: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const code_length = 6;

type TwoFactorAuthProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.TwoFactorAuth>;

const TwoFactorAuthScreen: FC<TwoFactorAuthProps> = ({ route }) => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  const navigation = useNavigation<NavigationProp<IdeasHubRootParamsList & AuthRootParamsList & ParamListBase>>();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    auth: { useTwoFACheck }
  } = actions;

  const [twoFACheck, twoFACheckResponse] = useTwoFACheck();

  const { isLoading } = twoFACheckResponse || {};

  const onTwoFACheck = async (code: string) => {
    twoFACheck({
      _auth_code: code,
      _trusted: 'on',
      rememberMe: true
    })
      .unwrap()
      .then((data) => {
        if (!data.complete) {
          setError(data.message);
        }
        if (data.accessToken) {
          goToIdeasHub();
        }
      })
      .catch((error) => {
        console.log('ERROR_catch_2fa', error);
      });
  };

  useEffect(() => {
    if (code.length === code_length) {
      onTwoFACheck(code);
    }
  }, [code]);

  const onButtonPressed = useCallback(() => {
    if (code.length === code_length) {
      onTwoFACheck(code);
    }
  }, [code, code_length]);

  const goToIdeasHub = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.keyboardContent}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
          <View style={styles.titleBox}>
            <BaseText variant={BaseTextVariant.authSubTitle}>{t('screens.2fa.title')}</BaseText>
            <BaseText variant={BaseTextVariant.authSmall}>{t('screens.2fa.desc')}</BaseText>
          </View>
          <OtpInput
            numberOfDigits={code_length}
            focusColor={theme.palette.graphite['900']}
            onTextChange={(text) => {
              setCode(text);
            }}
            onFilled={(text) => {
              setCode(text);
            }}
            textInputProps={{
              accessibilityLabel: 'One-Time Password'
            }}
            theme={{
              containerStyle: { paddingHorizontal: 20 },
              pinCodeContainerStyle: !!error && code.length === code_length ? styles.error : styles.codeInput,
              pinCodeTextStyle: styles.pinCodeText,
              focusedPinCodeContainerStyle: styles.focusedCodeInput
            }}
          />
          {error && code.length === code_length && (
            <BaseText variant={BaseTextVariant.extraSmall} style={styles.errorText}>
              {error}
            </BaseText>
          )}

          <BaseRiskWarning warningTextStyle={styles.warning} />
        </ScrollView>
        <KeyboardDismissButton disabled={code.length !== code_length} onPress={onButtonPressed} />
      </KeyboardAvoidingView>
      {isLoading && (
        <View style={styles.emptyScreen}>
          <BaseActivityLoader animating={true} activeColor={'#ecf0f1'} color={theme.palette.green['400']} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default TwoFactorAuthScreen;

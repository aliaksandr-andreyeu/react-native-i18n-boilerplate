import React, { useCallback } from 'react';
import { ImageStyle, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation, useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseRiskWarning,
  BaseText,
  BaseTextVariant
} from '@/components';
import { images } from '@/assets';
import { useTranslation } from 'react-i18next';
import { AUTH_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const { screenWidth } = config;

const LoginContent = ({ onPress }: { onPress?: () => void }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const goToSignUp = useCallback(() => {
    onPress?.();
    navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
      screen: AUTH_ROUTE_NAMES.BonusSignUp
    });
  }, [navigation]);

  const goToSignIn = useCallback(() => {
    onPress?.();
    navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
      screen: AUTH_ROUTE_NAMES.SignIn
    });
  }, [navigation]);

  return (
    <BottomSheetScrollView>
      <View style={styles.container}>
        <BaseImage style={styles.guidanceImage} resizeMode='stretch' source={images.signupImage} />
        <View style={styles.buttonsWrap}>
          <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.title}>
            {t('screens.create-position.create-your-account')}
          </BaseText>
          {/* <BaseButton
            style={styles.button}
            fullWidth={true}
            icon={<SvgIcon name={SvgXmlIconNames.facebookColor} size={IconSize.sm} />}
            size={BaseButtonSize.large}
            label={t('screens.signup-intro.facebook-signup')}
          />
          <BaseButton
            style={styles.button}
            fullWidth={true}
            icon={<SvgIcon name={SvgXmlIconNames.googleColor} size={IconSize.sm} />}
            size={BaseButtonSize.large}
            label={t('screens.signup-intro.google-signup')}
          /> */}
          <BaseButton
            type={BaseButtonType.link}
            style={styles.button}
            fullWidth={true}
            size={BaseButtonSize.large}
            label={t('screens.signup-intro.email-signup')}
            labelStyle={styles.emailSignupText}
            onPress={goToSignUp}
          />
          <BaseButton
            type={BaseButtonType.link}
            style={styles.button}
            fullWidth={true}
            size={BaseButtonSize.large}
            label={t('screens.intro.signin')}
            onPress={goToSignIn}
          />
          <BaseRiskWarning warningTextStyle={styles.warning} />
        </View>
      </View>
    </BottomSheetScrollView>
  );
};

interface Styles {
  container: ViewStyle;
  button: ViewStyle;
  guidanceImage: ImageStyle;
  emailSignupText: TextStyle;
  title: TextStyle;
  buttonsWrap: ViewStyle;
  warning: TextStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      marginTop: 20,
      alignItems: 'center',
      marginBottom: 12
    },
    title: {
      alignSelf: 'center',
      textAlign: 'center',
      width: '90%',
      marginTop: 16,
      marginBottom: 40
    },
    button: {
      marginTop: 12
    },
    emailSignupText: {
      color: palette.graphite['900']
    },
    guidanceImage: {
      width: screenWidth,
      height: 260
    },
    buttonsWrap: {
      width: '90%'
    },
    warning: {
      marginTop: 12
    }
  });

export default LoginContent;

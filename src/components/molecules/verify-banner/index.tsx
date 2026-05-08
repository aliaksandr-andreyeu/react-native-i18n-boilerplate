import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components/atoms';
import { images } from '@/assets';
import { useAppSelector, useCommonStyles } from '@/hooks';
import { COMMON_ROUTE_NAMES } from '@/navigation/app/stacks';
import { StackNavigationProp } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useTranslation } from 'react-i18next';

interface IBaseVerifyBanner {
  style?: ViewStyle;
  testID?: string;
}

const BaseVerifyBanner: React.FC<IBaseVerifyBanner> = ({ style, testID }) => {
  const navigation = useNavigation<StackNavigationProp<RootRootParamsList>>();

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const auth = useAppSelector((store) => store.auth);
  const { accessToken } = auth || {};

  const isAuthorized = useMemo(() => Boolean(accessToken), [accessToken]);

  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified } = userInfo || {};

  const isVisible = useMemo(() => {
    return Boolean(isAuthorized && !isVerified);
  }, [isAuthorized, isVerified]);

  const goToVerification = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Common, {
        screen: COMMON_ROUTE_NAMES.Verification
      });
    });
  }, [navigation]);

  if (!isVisible) return null;

  return (
    <View
      testID={testID || testIDs.components.molecules.verificationBanner.container}
      style={[styles.container, style]}
    >
      <BaseImage
        testID={testIDs.components.molecules.verificationBanner.image}
        style={styles.image}
        source={images.verifyBanner}
      />
      <View style={styles.right}>
        <BaseText
          testID={testIDs.components.molecules.verificationBanner.title}
          style={styles.verify}
          variant={BaseTextVariant.titleXXS}
        >
          {t('components.molecules.verify-banner.verify-and-trade')}
        </BaseText>
        <BaseButton
          testID={testIDs.components.molecules.verificationBanner.button}
          type={BaseButtonType.primary}
          hitSlop={10}
          style={styles.btn}
          labelStyle={styles.label}
          onPress={goToVerification}
          size={BaseButtonSize.extraSmall}
          label={t('screens.verification.continue')}
        />
      </View>
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { background, text }
  } = theme;
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      backgroundColor: background.card.secondary,
      paddingHorizontal: 20,
      paddingVertical: 24,
      height: 79,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadow6Style
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 26,
      paddingLeft: 64,
      flexGrow: 1,
      justifyContent: 'space-between'
    },
    image: {
      height: 79,
      position: 'absolute',
      width: 90,
      left: 0
    },
    verify: {
      color: text.title.inverted
    },
    btn: {
      backgroundColor: background.interaction.positive.default,
      paddingVertical: 8,
      paddingHorizontal: 12
    },
    label: {
      color: text.interaction.basic.tertiary.default
    }
  });
};

export default BaseVerifyBanner;

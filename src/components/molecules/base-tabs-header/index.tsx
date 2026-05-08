import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseGradientText,
  BaseText,
  BaseTextVariant
} from '@/components/atoms';
import { config } from '@/constants';
import { useAppSelector } from '@/hooks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES } from '@/navigation/app/stacks';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const {
  headerBar: {
    buttons: { activeOpacity, hitSlop },
    height: headerHeight
  }
} = config;

export interface IBaseTabsHeaderProps {
  title?: string | ReactNode;
  isPulse?: boolean;
  testIDsProps?: {
    signInButton?: string;
    signUpButton?: string;
    profileButton?: string;
  };
}

const defaultTestIDsProps = {
  signInButton: '',
  signUpButton: '',
  profileButton: ''
};

const BaseTabsHeader: FC<IBaseTabsHeaderProps> = ({ title, isPulse = false, testIDsProps = defaultTestIDsProps }) => {
  const styles = useStyles();
  const theme = useTheme();

  const {
    palette: { graphite }
  } = theme;

  const insets = useSafeAreaInsets();
  const { top = 0 } = insets || {};

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.95);

  const isLoggedInBefore = Boolean(useAppSelector((state) => state.common.loggedInBefore));
  const auth = useAppSelector((state) => state.auth);

  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const { t } = useTranslation();

  const goProfile = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.Common, {
      screen: COMMON_ROUTE_NAMES.Profile
    });
  };

  const onHeaderButtonPress = () => {
    requestAnimationFrame(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
        screen: isLoggedInBefore ? AUTH_ROUTE_NAMES.SignIn : AUTH_ROUTE_NAMES.SignUp
      });
    });
  };

  const HeaderRight = useMemo(() => {
    if (isAuthorized) {
      return (
        <TouchableOpacity
          hitSlop={hitSlop}
          activeOpacity={activeOpacity}
          testID={testIDsProps.profileButton}
          style={styles.profileIcon}
          onPress={goProfile}
        >
          <SvgIcon name={SvgXmlIconNames.user} size={IconSize.md} color={graphite['900']} />
        </TouchableOpacity>
      );
    }
    return (
      <BaseButton
        style={styles.signButton}
        type={BaseButtonType.primary}
        onPress={onHeaderButtonPress}
        size={BaseButtonSize.small}
        label={isLoggedInBefore ? t('screens.common.sign-in') : t('screens.common.sign-up')}
        testID={isLoggedInBefore ? testIDsProps.signInButton : testIDsProps.signUpButton}
      />
    );
  }, [isAuthorized, onHeaderButtonPress, t, goProfile, graphite, isLoggedInBefore]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    }),
    []
  );

  useFocusEffect(
    useCallback(() => {
      if (!isPulse) return;
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withTiming(1.0, { duration: 140, easing: Easing.inOut(Easing.cubic) }),
          withDelay(250, withTiming(1.05, { duration: 100, easing: Easing.out(Easing.cubic) })),
          withTiming(1.0, { duration: 120, easing: Easing.inOut(Easing.cubic) }),
          withDelay(800, withTiming(1.0, { duration: 0 }))
        ),
        -1,
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 120 }),
          withTiming(0.92, { duration: 140 }),
          withDelay(250, withTiming(1.0, { duration: 100 })),
          withTiming(0.94, { duration: 120 }),
          withDelay(800, withTiming(0.95, { duration: 0 }))
        ),
        -1,
        false
      );

      return () => {
        cancelAnimation(scale);
        cancelAnimation(opacity);
        scale.value = 1;
        opacity.value = 0.95;
      };
    }, [])
  );

  return (
    <View style={[styles.header, { paddingTop: top, height: headerHeight + top }]}>
      <SvgIcon style={styles.logoIcon} name={SvgXmlIconNames.logo} size={IconSize.lg} color={theme.colors.accent} />
      {title ||
        (isPulse && (
          <View style={[styles.pulseLogo, { top }]}>
            <View style={styles.headerPulse}>
              <Animated.View style={animatedStyle}>
                <SvgIcon name={SvgXmlIconNames.pulseAIIcon} color='#1DBF73' size={{ width: 38, height: 22 }} />
              </Animated.View>
              <BaseGradientText variant={BaseTextVariant.subTitleSemiBold} colors={['#1B1F24', '#1DBF73']}>
                {t('screens.pulse.pulse')}
              </BaseGradientText>
              <BaseText style={styles.aiColor} variant={BaseTextVariant.tiny}>
                {t('screens.pulse.ai')}
              </BaseText>
            </View>
          </View>
        ))}
      {HeaderRight}
    </View>
  );
};

const useStyles = () => {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    profileIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      width: headerHeight,
      height: headerHeight
    },
    headerPulse: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center'
    },
    pulseLogo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    aiColor: { color: '#269B56' },
    signButton: {
      marginRight: 20
    },
    logoIcon: {
      marginLeft: 20
    }
  });
};

export default BaseTabsHeader;

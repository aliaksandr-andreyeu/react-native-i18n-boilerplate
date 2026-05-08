import React, { useCallback } from 'react';
import { StyleSheet, ViewStyle, View, TouchableOpacity, Image, ImageStyle } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase, useTheme } from '@react-navigation/native';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { config, UserTheme } from '@/constants';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { BaseText, BaseTextVariant } from '@/components';

const {
  components: {
    buttons: { activeOpacity }
  }
} = config;

interface ProgressHeaderProps {
  onBackPressed?: () => void;
  progress?: number;
  stepsCount: number;
  currentStep: number;
  title?: string;
  hideProgressBar?: boolean;
  leftIconType?: SvgXmlIconNames.close | SvgXmlIconNames.arrowLeft;
  image?: string | undefined;
  style?: ViewStyle[] | ViewStyle;
  buttonStyle?: ViewStyle;
}

const ProgressHeader = ({
  onBackPressed,
  progress,
  title,
  leftIconType,
  hideProgressBar,
  stepsCount,
  currentStep,
  image,
  style,
  buttonStyle
}: ProgressHeaderProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { colors } = theme;

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { goBack, canGoBack, isFocused } = navigation || {};

  const stepsArray = Array.from({ length: stepsCount }, (_, index) => index + 1);

  const canBack = canGoBack();

  const goToIdeasHub = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

  const onPress = () => {
    if (!canBack) {
      goToIdeasHub();
      return;
    }
    if (!isFocused()) {
      return;
    }
    goBack();
  };

  const renderProgressBar = useCallback(() => {
    return stepsArray.map((i) => {
      let width = 0;

      if (currentStep > i) {
        width = 100;
      }

      if (currentStep === i) {
        width = progress || 0;
      }

      return (
        <View style={styles.progressBar} key={i}>
          <View style={[styles.progressFilledPart, { width: `${width}%` }]} />
        </View>
      );
    });
  }, [stepsArray, progress, currentStep]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.top}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={[styles.button, buttonStyle]}
          onPress={onBackPressed || onPress}
        >
          <SvgIcon
            name={leftIconType ?? SvgXmlIconNames.close}
            size={leftIconType === SvgXmlIconNames.arrowLeft ? IconSize.lg : IconSize.sm}
            color={colors.primary}
          />
        </TouchableOpacity>
        {title && (
          <View style={styles.titleWrap}>
            {!!image && image?.length > 0 && <Image source={{ uri: image }} resizeMode='cover' style={styles.img} />}
            <BaseText variant={BaseTextVariant.caption}>{title}</BaseText>
          </View>
        )}
        {!title && !hideProgressBar && <>{renderProgressBar()}</>}
      </View>
      {title && !hideProgressBar && <View style={styles.bottom}>{renderProgressBar()}</View>}
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  top: ViewStyle;
  bottom: ViewStyle;
  button: ViewStyle;
  progressBar: ViewStyle;
  progressFilledPart: ViewStyle;
  titleWrap: ViewStyle;
  img: ImageStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { icon, graphite } = palette || {};

  return StyleSheet.create<Styles>({
    container: {},
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'center'
    },
    button: {
      padding: 0,
      marginRight: 44,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center'
    },
    progressBar: {
      width: 88,
      height: 4,
      backgroundColor: icon?.base?.tertiary,
      marginRight: 8,
      borderRadius: 30
    },
    progressFilledPart: {
      borderRadius: 30,
      flex: 1,
      width: '0%',
      backgroundColor: graphite['900']
    },
    titleWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: -1,
      left: 0,
      right: 0,
      position: 'absolute',
      flexDirection: 'row',
      gap: 4
    },
    img: {
      width: 28,
      height: 28,
      borderRadius: 20
    }
  });
};

export default ProgressHeader;

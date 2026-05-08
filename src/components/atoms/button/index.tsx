import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacityProps,
  TextStyle,
  ActivityIndicator,
  ViewStyle,
  GestureResponderEvent,
  TouchableOpacity
} from 'react-native';
import { BaseActivityLoader, BaseActivityLoaderSize, BaseText } from '@/components';
import { useCommonStyles } from '@/hooks';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { rgba } from '@/helpers';

const {
  fonts: { generalSans }
} = config;

export enum BaseButtonType {
  primary = 'primary',
  secondary = 'secondary',
  accent = 'accent',
  apple = 'apple',
  facebook = 'facebook',
  google = 'google',
  link = 'link'
}

export enum BaseButtonVariant {
  square = 'square',
  round = 'round'
}

export enum BaseButtonSize {
  tiny = 24,
  extraSmall = 30,
  small = 34,
  medium = 38,
  large = 42
}

export enum BaseButtonLoading {
  spinner = 'spinner',
  ellipsis = 'ellipsis'
}

export interface BaseButtonProps extends TouchableOpacityProps {
  icon?: React.JSX.Element;
  labelStyle?: TextStyle | TextStyle[];
  iconFirst?: boolean;
  label?: string;
  type?: BaseButtonType;
  variant?: BaseButtonVariant;
  size?: BaseButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  bold?: boolean;
  loading?: boolean;
  loadingType?: BaseButtonLoading;
  loadingSize?: BaseActivityLoaderSize;
  disableOpacity?: boolean;
  adjustsFontSizeToFit?: boolean;
  numberOfLines?: number;
}

const BaseButton = ({
  style,
  icon,
  labelStyle,
  iconFirst = true,
  label,
  type,
  variant = BaseButtonVariant.square,
  size = BaseButtonSize.medium,
  disabled,
  fullWidth,
  bold,
  loading,
  loadingType = BaseButtonLoading.spinner,
  loadingSize = BaseActivityLoaderSize.normal,
  onPress,
  testID = 'base-button',
  disableOpacity,
  numberOfLines,
  adjustsFontSizeToFit,
  ...rest
}: BaseButtonProps) => {
  if (!label && !icon) return null;

  const theme = useTheme();
  const styles = useStyles(theme);

  const { shadow6Style } = useCommonStyles(theme);

  const { palette } = theme;

  const isDisabled = Boolean(disabled || loading);

  const containerCompositeStyles = useMemo(() => {
    const { base, graphite, purple } = palette;

    let sizeStyle = {};
    let variantStyle = {};
    let typeStyle = {};

    const opacity = disabled ? (disableOpacity ? 100 : 20) : 100;

    if (variant === BaseButtonVariant.square) {
      variantStyle = {
        borderRadius: 8
      };
    }

    switch (size) {
      case BaseButtonSize.tiny:
        sizeStyle = {
          paddingHorizontal: 8,
          borderRadius: 24
        };
        break;
      case BaseButtonSize.extraSmall:
        sizeStyle = {
          paddingHorizontal: 10,
          borderRadius: 30
        };
        break;
      case BaseButtonSize.small:
        sizeStyle = {
          paddingHorizontal: 12,
          borderRadius: 34
        };
        break;
      case BaseButtonSize.large:
        sizeStyle = {
          paddingHorizontal: 20,
          borderRadius: 42
        };
        break;
      default:
        sizeStyle = {
          paddingHorizontal: 16,
          borderRadius: 38
        };
        break;
    }

    switch (type) {
      case BaseButtonType.primary:
        typeStyle = {
          backgroundColor: disabled
            ? theme.palette.background.interaction.basic.primary.disabled
            : rgba(graphite['900'], opacity)
        };
        break;
      case BaseButtonType.secondary:
        typeStyle = {
          backgroundColor: rgba(graphite['100'], opacity)
        };
        break;
      case BaseButtonType.accent:
        typeStyle = {
          backgroundColor: rgba(purple['100'], opacity)
        };
        break;
      case BaseButtonType.apple:
        typeStyle = {
          backgroundColor: rgba(base.white, opacity)
        };
        break;
      case BaseButtonType.facebook:
        typeStyle = {
          backgroundColor: rgba(base.white, opacity),
          ...shadow6Style
        };
        break;
      case BaseButtonType.google:
        typeStyle = {
          backgroundColor: rgba(base.white, opacity),
          ...shadow6Style
        };
        break;
      case BaseButtonType.link:
        typeStyle = {
          backgroundColor: 'transparent'
        };
        break;
      default:
        typeStyle = {
          backgroundColor: rgba(base.white, opacity),
          ...shadow6Style
        };
        break;
    }

    return {
      height: size,
      ...(fullWidth && styles.fullWidth),
      ...sizeStyle,
      ...variantStyle,
      ...typeStyle
    };
  }, [styles, palette, size, variant, type, disabled, fullWidth, disableOpacity]);

  const labelCompositeStyles = useMemo(() => {
    const { base, purple, graphite } = palette;

    let sizeStyle = {};
    let typeStyle = {};

    switch (size) {
      case BaseButtonSize.tiny:
        sizeStyle = {
          fontSize: 13
        };
        break;
      default:
        sizeStyle = {
          fontSize: 14
        };
        break;
    }

    switch (type) {
      case BaseButtonType.primary:
        typeStyle = {
          color: base.white
        };
        break;
      case BaseButtonType.link:
        typeStyle = {
          color: purple['500'],
          fontFamily: generalSans.semiBold
        };
        break;
      default:
        typeStyle = {
          color: graphite['900']
        };
        break;
    }

    return {
      ...(bold && styles.bold),
      ...sizeStyle,
      ...typeStyle
    };
  }, [styles, size, bold, type, palette]);

  const spinnerSize = 'small';

  const loadingColor = useMemo(() => {
    const checkColor = (): undefined | string | 'no-style' => {
      if (style && typeof style === 'object') {
        const isArr = Array.isArray(style);
        if (isArr && style.length) {
          const last = style[style?.length - 1] as ViewStyle;
          const lastLowerCase = last?.backgroundColor?.toString?.().toLowerCase?.();
          return lastLowerCase;
        } else {
          const lastLowerCase = (style as ViewStyle)?.backgroundColor?.toString?.().toLowerCase?.();
          return lastLowerCase;
        }
      }
      return 'no-style';
    };

    const dark = palette.graphite['900'];
    const white = palette.base.white;

    const givenColor = checkColor();

    if (['no-style', undefined].includes(givenColor)) {
      switch (type) {
        case BaseButtonType.primary:
          return white;
        case BaseButtonType.apple:
        case BaseButtonType.facebook:
        case BaseButtonType.google:
          return dark;
      }
      return dark;
    } else {
      switch (givenColor) {
        case palette.graphite['900']?.toLowerCase():
          return white;

        case palette.green['400']?.toLowerCase():
          return white;
      }
      return dark;
    }
  }, [type, palette, style]);

  const onPressHandler = (event: GestureResponderEvent) => {
    if (isDisabled) {
      return;
    }
    onPress && onPress(event);
  };

  const loadingComponent = useMemo(() => {
    if (!loading) {
      return null;
    }
    const { graphite } = palette;

    const color = graphite['200'];

    switch (loadingType) {
      case BaseButtonLoading.ellipsis:
        return <BaseActivityLoader animating={loading} activeColor={loadingColor} color={color} size={loadingSize} />;
      default:
        return (
          <ActivityIndicator testID='loading-spinner' animating={loading} color={loadingColor} size={spinnerSize} />
        );
    }
  }, [loading, loadingType, loadingColor, spinnerSize, loadingSize, palette, type]);

  const Label = useCallback(() => {
    if (!label) {
      return null;
    }
    if (loading) {
      return loadingComponent;
    }
    return (
      <BaseText
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        numberOfLines={numberOfLines}
        style={[styles.label, labelCompositeStyles, labelStyle]}
      >
        {label}
      </BaseText>
    );
  }, [loading, loadingComponent, styles, labelCompositeStyles, labelStyle, label, adjustsFontSizeToFit, numberOfLines]);

  const Icon = useCallback(() => {
    if (loading) {
      return null;
    }
    if (!icon) {
      return null;
    }
    return icon;
  }, [icon, loading]);

  // const underlayColor = useMemo(() => {
  //   const { palette } = theme;

  //   const checkColor = (): undefined | string | 'no-style' => {
  //     if (style && typeof style === 'object') {
  //       const isArr = Array.isArray(style);
  //       if (isArr && style.length) {
  //         const last = style.findLast((item: any) => item.backgroundColor) || {};
  //         const lastLowerCase = (last as any)?.backgroundColor?.toString?.().toLowerCase?.();
  //         return lastLowerCase;
  //       } else {
  //         const lastLowerCase = (style as ViewStyle)?.backgroundColor?.toString?.().toLowerCase?.();
  //         return lastLowerCase;
  //       }
  //     }
  //     return 'no-style';
  //   };

  //   const givenColor = checkColor();

  //   if (['no-style', undefined].includes(givenColor)) {
  //     switch (type) {
  //       case BaseButtonType.primary:
  //         return palette.graphite[700];

  //       case BaseButtonType.accent:
  //         return '#D5C2FF';
  //       case BaseButtonType.apple:
  //       case BaseButtonType.facebook:
  //       case BaseButtonType.google:
  //         return '#ecf0f1';
  //     }
  //   } else {
  //     const bgs = [palette.graphite['900'], palette.graphite['900']?.toLowerCase()];
  //     const purples = [palette.purple['100']?.toLowerCase(), palette.purple['100']];
  //     const greens = [palette.green['400']?.toLowerCase(), palette.green['400']];
  //     const whites = [palette.base.white, palette.base.white.toLowerCase()];

  //     const currentColor = givenColor || '';

  //     if (bgs.includes(currentColor)) return palette.graphite[700];
  //     else if (purples.includes(currentColor)) return '#D5C2FF';
  //     else if (greens.includes(currentColor)) return palette.green[500];
  //     else if (whites.includes(currentColor)) return '#ecf0f1';
  //   }

  //   return `rgba(255,255,255,0.1)`;
  // }, [type, theme.dark, style]);

  const lastBgDisabledColor = useMemo((): ViewStyle | null => {
    if (!style) return null;
    const lastBg = Array.isArray(style)
      ? (style?.[style.length - 1] as ViewStyle)?.backgroundColor
      : (style as ViewStyle)?.backgroundColor;
    if (!isDisabled) return null;
    if (!lastBg) return null;
    return { backgroundColor: rgba(lastBg as string, disableOpacity ? 100 : 20) };
  }, [style, isDisabled, disableOpacity]);

  return (
    <TouchableOpacity
      style={[styles.container, containerCompositeStyles, style]}
      onPress={onPressHandler}
      activeOpacity={0.8}
      disabled={disabled}
      testID={testID}
      {...rest}
    >
      <>
        {iconFirst ? <Icon /> : null}
        <Label />
        {iconFirst ? null : <Icon />}
      </>
    </TouchableOpacity>
  );
};

interface Styles {
  container: ViewStyle;
  fullWidth: ViewStyle;
  label: TextStyle;
  bold: TextStyle;
}

const useStyles = ({ palette: { base, graphite } }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      flexDirection: 'row',
      gap: 8,
      height: BaseButtonSize.medium,
      paddingVertical: 1,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: base.white,
      alignItems: 'center',
      justifyContent: 'center',
      width: 'auto',
      minWidth: 40
    },
    fullWidth: {
      width: '100%'
    },
    label: {
      color: graphite['900'],
      textAlign: 'center',
      lineHeight: 16
    },
    bold: {
      fontFamily: generalSans.semiBold
    }
  });

export default BaseButton;

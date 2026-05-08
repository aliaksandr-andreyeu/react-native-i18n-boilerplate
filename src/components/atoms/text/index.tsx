import React, { forwardRef } from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { theme } from '@/constants';

const { lightTheme } = theme;

const {
  fonts: { generalSans, unbounded, inter, spaceGrotesk }
} = config;

export interface BaseTextVariantValue {
  fontSize: TextStyle['fontSize'];
  fontFamily: TextStyle['fontFamily'];
  fontWeight?: TextStyle['fontWeight'];
  color?: TextStyle['color'];
}

interface BaseTextVariantKey {
  amountTitle: BaseTextVariantValue;
  amountSubTitle: BaseTextVariantValue;
  amountExtraSmall: BaseTextVariantValue;
  amountTiny: BaseTextVariantValue;
  amountExtraTiny: BaseTextVariantValue;

  authTitle: BaseTextVariantValue; //TEMP
  authSubTitle: BaseTextVariantValue; //TEMP
  authLink: BaseTextVariantValue; //TEMP
  authSmall: BaseTextVariantValue; //TEMP

  h1: BaseTextVariantValue;
  h1__SG: BaseTextVariantValue;
  statsNumber: BaseTextVariantValue;
  widgetTitle: BaseTextVariantValue;
  title: BaseTextVariantValue;
  subTitle: BaseTextVariantValue;
  subTitleSemiBold: BaseTextVariantValue;
  caption: BaseTextVariantValue;
  captionSemiBold: BaseTextVariantValue;
  tag: BaseTextVariantValue;
  text: BaseTextVariantValue;
  textLight: BaseTextVariantValue;
  textSemiBold: BaseTextVariantValue;
  small: BaseTextVariantValue;
  extraSmallSemiBold: BaseTextVariantValue;
  extraSmall: BaseTextVariantValue;
  section: BaseTextVariantValue;
  titleXXS: BaseTextVariantValue;
  prefix: BaseTextVariantValue;
  tiny: BaseTextVariantValue;
  header: BaseTextVariantValue;
  rewardExtraSmall: BaseTextVariantValue;
  referralEarnings: BaseTextVariantValue;
  captionSmall: BaseTextVariantValue;
  widgetH1: BaseTextVariantValue;
  h1Bold: BaseTextVariantValue;
  priceRegular: BaseTextVariantValue;
  pageTitle: BaseTextVariantValue;
  mini: BaseTextVariantValue;
  prefixSans: BaseTextVariantValue;
  tinySpace: BaseTextVariantValue;
  extraTiny: BaseTextVariantValue;
  countdown: BaseTextVariantValue;
  tinySemiBold: BaseTextVariantValue;
  smallSpace: BaseTextVariantValue;
  smallRegular: BaseTextVariantValue;
}

export const BaseTextVariant: BaseTextVariantKey = {
  amountTitle: {
    fontSize: 28,
    fontFamily: spaceGrotesk.bold,
    fontWeight: '600',
    color: lightTheme.palette.text.title.primary
  },
  amountSubTitle: {
    fontSize: 22,
    fontFamily: spaceGrotesk.bold,
    fontWeight: '600',
    color: lightTheme.palette.text.title.primary
  },
  amountExtraSmall: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: spaceGrotesk.regular
  },
  amountTiny: {
    fontSize: 10,
    fontWeight: '400',
    fontFamily: spaceGrotesk.regular
  },
  amountExtraTiny: {
    fontSize: 9,
    fontWeight: '400',
    fontFamily: spaceGrotesk.regular
  },
  countdown: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: spaceGrotesk.medium
  },

  rewardExtraSmall: {
    fontSize: 12,
    fontFamily: spaceGrotesk.regular,
    fontWeight: '400'
  },
  referralEarnings: {
    fontSize: 15,
    fontFamily: generalSans.medium,
    fontWeight: '500'
  },

  authTitle: {
    fontSize: 24,
    fontFamily: unbounded.medium,
    color: lightTheme.palette.graphite['900']
  },
  authSubTitle: {
    fontSize: 20,
    fontFamily: unbounded.medium,
    color: lightTheme.palette.graphite['900']
  },
  authLink: {
    fontSize: 14,
    fontFamily: generalSans.semiBold,
    color: lightTheme.palette.purple['500']
  },
  authSmall: {
    fontSize: 13,
    fontFamily: generalSans.medium,
    color: '#5D7278'
  },
  widgetTitle: {
    fontSize: 12,
    fontFamily: unbounded.medium,
    color: lightTheme.palette.base.white
  },
  widgetH1: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: spaceGrotesk.bold
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: spaceGrotesk.bold
  },
  h1Bold: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: spaceGrotesk.bold
  },
  h1: {
    fontSize: 28,
    fontFamily: generalSans.semiBold
  },
  h1__SG: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: spaceGrotesk.bold
  },
  title: {
    fontSize: 24,
    fontFamily: generalSans.semiBold
  },
  header: {
    fontFamily: generalSans.semiBold,
    fontSize: 23
  },
  section: {
    fontSize: 22,
    fontFamily: generalSans.semiBold
  },
  subTitle: {
    fontSize: 20,
    fontFamily: generalSans.medium
  },
  subTitleSemiBold: {
    fontSize: 20,
    fontFamily: generalSans.semiBold
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: generalSans.semiBold
  },
  caption: {
    fontSize: 16,
    fontFamily: generalSans.medium
  },
  captionSmall: {
    fontSize: 15,
    fontFamily: generalSans.semiBold
  },
  captionSemiBold: {
    fontSize: 16,
    fontFamily: generalSans.semiBold
  },
  titleXXS: {
    fontSize: 14,
    fontFamily: generalSans.semiBold
  },
  tag: {
    fontSize: 14,
    fontFamily: generalSans.medium
  },
  text: {
    fontSize: 14,
    fontFamily: generalSans.medium
  },
  textLight: {
    fontSize: 14,
    fontFamily: generalSans.regular
  },
  priceRegular: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: spaceGrotesk.regular
  },
  textSemiBold: {
    fontSize: 14,
    fontFamily: generalSans.semiBold
  },
  smallSpace: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: spaceGrotesk.medium
  },
  small: {
    fontSize: 13,
    fontFamily: generalSans.medium
  },
  smallRegular: {
    fontSize: 13,
    fontFamily: generalSans.regular
  },
  extraSmallSemiBold: {
    fontSize: 12,
    fontFamily: generalSans.semiBold
  },
  extraSmall: {
    fontSize: 12,
    fontFamily: generalSans.medium
  },
  prefixSans: {
    fontSize: 12,
    fontFamily: generalSans.regular
  },
  prefix: {
    fontSize: 12,
    fontFamily: inter.regular
  },
  mini: {
    fontSize: 11,
    fontFamily: generalSans.medium
  },
  tinySpace: {
    fontSize: 10,
    fontFamily: generalSans.regular
  },
  tinySemiBold: {
    fontSize: 10,
    fontFamily: generalSans.semiBold
  },
  tiny: {
    fontSize: 10,
    fontFamily: generalSans.medium
  },
  extraTiny: {
    fontSize: 8,
    fontFamily: generalSans.medium
  }
};

export interface BaseTextProps extends TextProps {
  variant?: BaseTextVariantValue;
  italic?: boolean;
}

const BaseText = forwardRef<Text, BaseTextProps>(
  ({ children, variant = BaseTextVariant.text, italic = false, style, ...rest }, ref) => {
    const theme = useTheme();
    const styles = useStyles(theme);

    return (
      <Text
        ref={ref}
        style={[
          styles.baseStyle,
          { ...(variant && variant) },
          {
            ...(italic && { fontStyle: 'italic' })
          },
          style
        ]}
        {...rest}
      >
        {children}
      </Text>
    );
  }
);

interface Styles {
  baseStyle: TextStyle;
}

const useStyles = ({ palette }: UserTheme) => {
  const { text } = palette || {};

  return StyleSheet.create<Styles>({
    baseStyle: {
      ...BaseTextVariant.text,
      color: text.base.primary,
      textAlignVertical: 'top',
      textAlign: 'left'
    }
  });
};

export default BaseText;

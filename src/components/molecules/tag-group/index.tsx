import React from 'react';
import { StyleSheet, TouchableOpacity, Text, TextProps, TextStyle, ViewStyle } from 'react-native';
import { BaseText } from '@/components';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';

const {
  isRTL,
  fonts: { generalSans },
  components: { buttons }
} = config;

export enum BaseButtonSize {
  small = 32,
  medium = 38
}

interface BaseButtonProps {
  style: ViewStyle;
  title: string;
  size?: BaseButtonSize;
}

const BaseButton = ({ style, size, title, ...rest }: BaseButtonProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity
      activeOpacity={buttons.activeOpacity}
      style={[styles.btn, { ...(size && { minHeight: size }) }, style]}
      {...rest}
    >
      <BaseText style={styles.title}>{title}</BaseText>
    </TouchableOpacity>
  );
};

interface Styles {
  btn: ViewStyle;
  title: TextStyle;
}

const useStyles = ({ colors, palette: { base } }: UserTheme) =>
  StyleSheet.create<Styles>({
    btn: {
      minHeight: BaseButtonSize.medium,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: base.white,
      textAlign: 'center'
    }
  });

export default BaseButton;

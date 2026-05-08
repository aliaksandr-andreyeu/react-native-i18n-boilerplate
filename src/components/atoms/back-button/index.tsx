import React, { FC, useCallback } from 'react';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { config, UserTheme } from '@/constants';

const {
  headerBar: { height: headerBarSize },
  components: {
    buttons: { activeOpacity }
  }
} = config;

interface BackButton {
  isChevron?: boolean;
  isClose?: boolean;
  containerStyle?: ViewStyle;
  customBack?(): void;
  color?: string;
}

const BaseBackButton: FC<BackButton> = ({ isChevron = true, isClose = false, containerStyle, customBack, color }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const { goBack, canGoBack } = useNavigation<NavigationProp<ParamListBase>>();

  const canBack = canGoBack();

  const { colors } = theme;

  if (!canBack && !customBack) {
    return null;
  }

  const onPress = () => {
    if (customBack) return customBack();
    if (!canBack) {
      return;
    }
    goBack();
  };

  const Button = useCallback(() => {
    if (isClose) return <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xsm} color={color || colors.primary} />;
    else if (isChevron)
      return <SvgIcon name={SvgXmlIconNames.chevronLeft} size={IconSize.lg} color={color || colors.primary} />;
    return <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} color={color || colors.primary} />;
  }, [isChevron, isClose, color]);

  return (
    <TouchableOpacity testID='base-back-button' activeOpacity={activeOpacity} style={[styles.container, containerStyle]} onPress={onPress}>
      <Button />
    </TouchableOpacity>
  );
};

interface Styles {
  container: ViewStyle;
}

const useStyles = ({ palette, colors }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
      width: headerBarSize,
      height: headerBarSize
    }
  });

export default BaseBackButton;

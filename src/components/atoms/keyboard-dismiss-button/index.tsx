import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { config } from '@/constants';
import { rgba } from '@/helpers';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const {
  components: {
    buttons: { activeOpacity }
  }
} = config;

interface KeyboardDismissButtonProps {
  disabled?: boolean;
  onPress?: () => void;
}
const KeyboardDismissButton = ({ disabled, onPress }: KeyboardDismissButtonProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    palette: { base, graphite }
  } = theme;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (!isKeyboardVisible) {
    return null;
  }

  const handleOnPress = () => {
    Keyboard.dismiss();
    onPress?.();
  };

  return (
    <TouchableOpacity
      testID='KeyboardDismissButton'
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={[
        styles.container,
        { bottom: keyboardHeight + 20, backgroundColor: rgba(graphite['900'], disabled ? 20 : 100) }
      ]}
      onPress={handleOnPress}
    >
      <SvgIcon name={SvgXmlIconNames.arrowAngle} size={IconSize.sm} color={base.white} />
    </TouchableOpacity>

  );
};

interface Styles {
  container: ViewStyle;
}

const useStyles = () =>
  StyleSheet.create<Styles>({
    container: {
      zIndex: 1,
      width: 50,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      right: 20
    }
  });

export default KeyboardDismissButton;

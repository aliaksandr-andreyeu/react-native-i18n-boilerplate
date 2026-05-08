import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { config, UserTheme } from '@/constants';
import { rgba } from '@/helpers';
import { useCommonStyles } from '@/hooks';

const {
  components: {
    buttons: { hitSlop }
  }
} = config;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BaseSwitchProps extends PressableProps {
  value: boolean;
  onChange?: (value: boolean) => void;
  disable?: boolean;
}

const BaseSwitch = ({ onChange, value = false, style, disable = false, ...rest }: BaseSwitchProps) => {
  const [checked, setChecked] = useState<boolean>(value);

  const theme = useTheme();
  const styles = useStyles(theme as UserTheme);

  const { palette } = theme || {};
  const { green, background, border } = palette || {};

  const progress = useSharedValue(value ? 1 : 0);
  const didMount = useRef(false);

  useLayoutEffect(() => {
    if (value === undefined) return;
    setChecked(value);
  }, [value]);

  useEffect(() => {
    if (didMount.current) {
      progress.value = withTiming(checked ? 1 : 0, {
        duration: 300
      });
    } else {
      progress.value = checked ? 1 : 0;
      didMount.current = true;
    }
  }, [checked, progress]);

  const toggleSwitch = useCallback(() => {
    if (disable) return;
    onChange?.(!checked);
    setChecked(prev => !prev);
  }, [disable, checked, onChange]);

  const offColor = rgba(border.base['progress-bar'], 80);
  const onColor = rest?.disabled || disable ? green['200'] : background.interaction.basic.accent.pressed;

  const animatedToggleStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(progress.value, [0, 1], [offColor, onColor])
    }),
    [offColor, onColor]
  );

  const animatedThumbStyle = useAnimatedStyle(() => {
    const width = interpolate(progress.value, [0, 0.5, 1], [20, 25, 20]);
    const translateX = interpolate(progress.value, [0, 1], [0, 16]);

    return {
      width,
      transform: [{ translateX }]
    };
  }, []);

  return (
    <AnimatedPressable
      testID="base-switch"
      {...rest}
      style={[styles.toggle, animatedToggleStyle, style as StyleProp<ViewStyle>]}
      onPress={toggleSwitch}
      hitSlop={hitSlop}
    >
      <Animated.View style={[styles.thumb, animatedThumbStyle]} />
    </AnimatedPressable>
  );
};

interface Styles {
  toggle: ViewStyle;
  thumb: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, border }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    toggle: {
      width: 40,
      height: 24,
      backgroundColor: rgba(border.base['progress-bar'], 80),
      borderRadius: 100,
      padding: 2
    },
    thumb: {
      height: 20,
      width: 20,
      borderRadius: 100,
      backgroundColor: base.white,
      ...shadow6Style
    }
  });
};

export default BaseSwitch;
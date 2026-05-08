import { testIDs } from '@/constants';
import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { interpolate, interpolateColor, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

interface IDot {
  scroll: SharedValue<number>;
  inputRange: number[];
  outputRange: string[];
  dotStyle?: ViewStyle;
  maxWidth?: number;
  useWidthAnim?: boolean;
  minDotWidth?: number;
  maxDotWidth?: number;
  testID?: string
}

const AnimatedDot: React.FC<IDot> = ({
  scroll,
  inputRange,
  outputRange,
  dotStyle,
  maxWidth = 1,
  maxDotWidth,
  minDotWidth,
  useWidthAnim,
  testID
}) => {
  const style = useAnimatedStyle(() => {
    const bg = interpolateColor(scroll.value / maxWidth, inputRange, outputRange);
    const size = interpolate(
      scroll.value / maxWidth,
      inputRange,
      [minDotWidth || 5, maxDotWidth || 7, minDotWidth || 5],
      'clamp'
    );

    return {
      backgroundColor: bg,
      ...(useWidthAnim && {
        width: size,
        height: size
      })
    };
  }, [maxWidth, minDotWidth, maxDotWidth, useWidthAnim]);

  return <Animated.View testID={testID || testIDs.components.molecules.animatedDot.container} style={[dotStyle, style]} />;
};

export default memo(AnimatedDot);

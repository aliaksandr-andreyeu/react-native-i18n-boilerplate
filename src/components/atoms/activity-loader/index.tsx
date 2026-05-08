import React, { useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import Animated, { useAnimatedStyle, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';

const {
  animation: { duration }
} = config;

const dots = [...Array(3).keys()];

let interval: ReturnType<typeof setInterval> | undefined;

export enum BaseActivityLoaderSize {
  small = 4,
  normal = 8
}

export interface BaseActivityLoaderProps extends ViewProps {
  animating?: boolean;
  color?: string;
  activeColor?: string;
  size?: BaseActivityLoaderSize;
}

const BaseActivityLoader = ({
  style,
  size = BaseActivityLoaderSize.normal,
  animating = false,
  color,
  activeColor
}: BaseActivityLoaderProps) => {
  if (!animating) {
    return null;
  }

  const [active, setActive] = useState<number>(0);

  const isSmall = size === BaseActivityLoaderSize.small;

  const clearAnimationInterval = () => {
    interval && clearInterval(interval);
  };

  const setAnimationInterval = () => {
    clearAnimationInterval();
    interval = setInterval(() => {
      setActive((prev: number) => (prev > 1 ? 0 : prev + 1));
    }, duration);
  };

  useLayoutEffect(() => {
    setAnimationInterval();
    return () => {
      clearAnimationInterval();
    };
  }, []);

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { base, icon }
  } = theme;

  const backgroundColor = color || icon?.base?.tertiary;
  const backgroundColorActive = activeColor || base.white;

  const Dot = useCallback(
    ({ active }: { active: boolean }) => {
      const animatedStyle = useAnimatedStyle(() => {
        return {
          backgroundColor: withTiming(active ? backgroundColorActive : backgroundColor, {
            duration
          }),
          transform: [
            {
              scale: withTiming(active ? 1.25 : 1, {
                duration
              })
            }
          ]
        };
      });
      return (
        <Animated.View
          style={[
            styles.dot,
            {
              ...(isSmall && styles.smallDot)
            },
            { backgroundColor },
            animatedStyle
          ]}
        />
      );
    },
    [backgroundColorActive, backgroundColor]
  );

  const loader = useMemo(
    () => dots.map((dot: number, index: number) => <Dot key={`${index}`} active={index === active} />),
    [dots, active, Dot]
  );

  return (
    <Animated.View
      key={'base-activity-loader'}
      testID="base-activity-loader"
      entering={FadeIn.duration(duration)}
      exiting={FadeOut.duration(duration)}
      style={[styles.container, { ...(isSmall && styles.smallContainer) }, style]}
    >
      {loader}
    </Animated.View>
  );
};

interface Styles {
  container: ViewStyle;
  smallContainer: ViewStyle;
  dot: ViewStyle;
  smallDot: ViewStyle;
}

const useStyles = ({ palette: { base } }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      flexDirection: 'row',
      gap: 8
    },
    smallContainer: {
      gap: 4
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 8,
      backgroundColor: base.white,
      transform: [
        {
          scale: 1
        }
      ]
    },
    smallDot: {
      width: 4,
      height: 4,
      borderRadius: 4
    }
  });

export default BaseActivityLoader;

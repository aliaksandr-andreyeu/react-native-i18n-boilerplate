import React, { useEffect } from 'react';
import { StyleSheet, Pressable, PressableProps } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ITabBarItem extends PressableProps {
  name: string;
  index: number;
  label: string;
  selected?: number;
}

const HIT_SLOP = { bottom: 4, left: 8, right: 8, top: 4 };
const TabBarItem: React.FC<ITabBarItem> = ({ label, index, selected, ...props }) => {
  const anim = useSharedValue(0);

  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(anim.value, [0, 1], ['black', 'white']);

    return {
      color
    };
  }, []);

  useEffect(() => {
    const isSelected = selected === index;
    anim.value = withTiming(isSelected ? 1 : 0, { duration: 700 });
  }, [selected]);

  return (
    <Pressable style={styles.btn} hitSlop={HIT_SLOP} {...props}>
      <Animated.Text style={textStyle}>{label || ''}</Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    zIndex: 99
  }
});

export default TabBarItem;

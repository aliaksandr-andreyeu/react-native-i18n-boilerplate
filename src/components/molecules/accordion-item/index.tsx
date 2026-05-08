import React, { memo, useCallback } from 'react';
import { StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

interface IAccordion {
  isExpanded: SharedValue<boolean>;
  children: React.ReactNode | React.ReactNode[];
  viewKey?: string;
  style?: ViewStyle;
  duration?: number;
}

const AccordionItem: React.FC<IAccordion> = ({ isExpanded, children, viewKey, style, duration = 350 }) => {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() => withTiming(height.value * Number(isExpanded.value), { duration }), []);

  const bodyStyle = useAnimatedStyle(() => ({ height: derivedHeight.value }), []);

  const onLayout = useCallback((e: LayoutChangeEvent) => (height.value = e.nativeEvent.layout.height), []);

  return (
    <Animated.View key={`accordionItem_${viewKey}`} style={[styles.animatedView, bodyStyle, style]}>
      <Animated.View onLayout={onLayout} style={styles.wrapper}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedView: {
    width: '100%',
    overflow: 'hidden'
  },
  wrapper: {
    position: 'absolute'
  }
});

export default memo(AccordionItem);

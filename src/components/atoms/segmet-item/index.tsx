import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import BaseText from '../text';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';

interface ISegmentItem {
  item: string;
  onPress(index: number): void;
  selected: boolean;
  index: number;
  disabled: boolean;
  testID?: string;
}

const INPUT_RANGE = [0, 1];

const SegmentItem: React.FC<ISegmentItem> = ({ selected = false, item, onPress, index, disabled = false, testID }) => {
  const anim = useSharedValue(0);

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    if (!disabled) anim.value = withTiming(selected ? 1 : 0);
  }, [selected, disabled]);

  const progressStyle = useAnimatedStyle(() => {
    const widthAsNum = interpolate(anim.value, INPUT_RANGE, [0, 100]);

    return {
      width: `${widthAsNum}%`
    };
  }, []);

  const onItemPress = () => onPress(index);

  return (
    <Pressable testID={testID} disabled={disabled} onPress={onItemPress} style={[styles.container, disabled && { opacity: 0.2 }]}>
      <View style={styles.bar}>
        <Animated.View style={[progressStyle, styles.progress]} />
      </View>
      <BaseText testID={testID + "_percentage"} >{item}</BaseText>
    </Pressable>
  );
};

const useStyles = ({
  palette: {
    base: { white },
    purple
  }
}: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 4,
      alignItems: 'center'
    },
    bar: {
      width: 42,
      borderRadius: 2,
      overflow: 'hidden',
      backgroundColor: white,
      height: 5
    },
    progress: {
      backgroundColor: purple[800],
      height: '100%',
      borderRadius: 2
    }
  });

export default memo(SegmentItem);

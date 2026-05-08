import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ImageSourcePropType, LayoutChangeEvent } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import BaseImage from '../image';
import BaseText from '../text';
import { TestimonialElement } from '@/store/slices/ideas-hub/types';
import { useCommonStyles } from '@/hooks';
import { images } from '@/assets';
import Animated, {
  runOnUI,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface ITestimonial extends TestimonialElement {
  image: string | undefined;
  anim: SharedValue<number>;
  index: number;
  testID: string;
}

const { screenWidth } = config;

const AnimatedLinear = Animated.createAnimatedComponent(LinearGradient);

const colors = [
  'rgba(255,255,255,0.2)',
  'rgba(255,255,255,0.9)',
  'rgba(255,255,255,1)',
  'rgba(255,255,255,1)',
  'rgba(255,255,255,1)'
];
const Testimonial: React.FC<ITestimonial> = ({ description, title, image = '', anim, index, testID }) => {
  const height = useSharedValue(0);
  const layout = useSharedValue(0);

  useEffect(() => {
    if (index % 30 === 0) height.value = withDelay(0, withTiming(layout.value || 500, { duration: 2000 }));
    const add = () => {
      anim?.addListener?.(index, (value) => {
        if (index !== 0 && value > (screenWidth - 80) * index)
          height.value = withTiming(layout.value, { duration: 2000 });
      });
    };

    const removeListener = () => {
      anim?.removeListener?.(index);
    };

    runOnUI(add)();

    return runOnUI(removeListener);
  }, [index, anim, layout.value]);

  const theme = useTheme();
  const styles = useStyles(theme);

  const source = useMemo((): ImageSourcePropType => {
    if (image) return { uri: image };
    return images.userImage;
  }, [image]);

  const linearStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      transform: [{ translateY: height.value }],
      bottom: 0
    };
  }, []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    layout.value = event.nativeEvent.layout.height;
  }, []);

  return (
    <View testID={testID} onLayout={onLayout} style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.top}>
          <BaseImage testID="testimonial-image" resizeMode='cover' style={styles.image} source={source} />
          <BaseText testID="testimonial-title" >{title}</BaseText>
        </View>
        <View>
          <BaseText testID="testimonial-description" style={styles.desc}>{description}</BaseText>
          <AnimatedLinear testID="testimonial-gradient" colors={colors} style={linearStyle} />
        </View>
      </View>
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    wrapper: {
      width: screenWidth - 48,
      alignItems: 'center',
      height: '100%'
    },
    container: {
      width: screenWidth - 64,
      height: '100%',
      borderLeftColor: graphite[300],
      borderLeftWidth: 4,
      backgroundColor: base.white,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderTopLeftRadius: 2,
      borderBottomLeftRadius: 2,
      paddingVertical: 20,
      paddingHorizontal: 16,
      overflow: 'hidden',
      gap: 8,
      minHeight: 208,
      ...shadow6Style
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    image: {
      width: 32,
      height: 32,
      borderRadius: 17
    },
    desc: {
      textAlign: 'left',
      color: graphite['600']
    }
  });
};

export default memo(Testimonial);

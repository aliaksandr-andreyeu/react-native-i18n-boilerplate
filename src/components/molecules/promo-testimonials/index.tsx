import React, { memo, useCallback, useEffect } from 'react';
import { View, StyleSheet, ListRenderItemInfo } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { TestimonialElement, TestimonialIcon } from '@/store/slices/ideas-hub/types';
import { BaseText, BaseTextVariant, Testimonial } from '@/components/atoms';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import AnimatedDot from '../animated-dot';

interface IPromoTestimonials {
  title: string;
  testimonials: TestimonialElement[];
  icons: TestimonialIcon[];
}

const { screenWidth } = config;

const snapToInterval = screenWidth - 48;
const PromoTestimonials: React.FC<IPromoTestimonials> = ({ testimonials = [], title = '', icons = [] }) => {
  const offsetX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetX.value = event.contentOffset.x;
  });

  const theme = useTheme();
  const styles = useStyles(theme);

  const _keyExtractor = useCallback((item: TestimonialElement) => `${item.id}-testimonial`, []);

  useEffect(() => {
    offsetX.value = 0;
  }, [testimonials.length]);

  const AnimatedScrollDots = useCallback(() => {
    return (
      <View style={styles.dotContainer}>
        {testimonials.map((_, index) => {
          return (
            <AnimatedDot
              testID={testIDs.components.molecules.animatedDot.container}
              key={`${index}-dot`}
              inputRange={[index - 1, index, index + 1]}
              outputRange={[theme.palette.graphite[200], theme.palette.graphite['900'], theme.palette.graphite[200]]}
              useWidthAnim
              minDotWidth={5}
              maxDotWidth={7}
              maxWidth={screenWidth - 48}
              dotStyle={styles.dotStyle}
              scroll={offsetX}
            />
          );
        })}
      </View>
    );
  }, [testimonials.length, theme.dark]);

  const _renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<TestimonialElement>) => {
      const image = icons.find((el) => el.testimonialElementId === item.id)?.url || '';
      return <Testimonial testID={testIDs.components.molecules.promoTestimonials.testimonial(item.id)} index={index} anim={offsetX} image={image} {...item} />;
    },
    [icons]
  );

  return (
    <View style={styles.container}>
      {!!title.length && (
        <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
          {title}
        </BaseText>
      )}
      <Animated.FlatList
        testID={testIDs.components.molecules.promoTestimonials.list}
        data={testimonials}
        keyExtractor={_keyExtractor}
        windowSize={61}
        horizontal
        onScroll={scrollHandler}
        snapToInterval={snapToInterval}
        decelerationRate={'fast'}
        contentContainerStyle={styles.content}
        showsHorizontalScrollIndicator={false}
        renderItem={_renderItem}
      />
      <AnimatedScrollDots />
    </View>
  );
};

const useStyles = ({ palette: { } }: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 16,
      flex: 1
    },
    title: {
      paddingHorizontal: 20
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 10
    },
    dotStyle: {
      borderRadius: 4
    },
    dotContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'center',
      minHeight: 7
    }
  });

export default memo(PromoTestimonials);

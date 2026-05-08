import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { config } from '@/constants';
import Animated, { FadeIn, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { BaseImage } from '@/components';

interface IBaseCarouselImage {
    index: number;
    width: number;
    height: number;
    image: ImageSourcePropType;
    gap: number;
    translateX: SharedValue<number>;
};

const BaseCarouselImage: React.FC<IBaseCarouselImage> = ({
    height,
    image,
    index,
    width,
    gap,
    translateX
}) => {

    const animatedStyle = useAnimatedStyle(() => {
        const centerIndex = translateX.value / -(width + gap);

        const scale = interpolate(
            Math.abs(index - centerIndex),
            [0, 1],
            [1, 0.9],
            'clamp'
        );

        return {
            transform: [{ scale }],
        };
    });

    return (
        <Animated.View style={animatedStyle} entering={FadeIn}>
            <BaseImage fadeDuration={0} style={{ height, width }} source={image} />
        </Animated.View>
    )
};

export default BaseCarouselImage;
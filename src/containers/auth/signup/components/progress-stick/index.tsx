import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

interface IBaseProgressStick {
    progress: SharedValue<number>;
    index: number;
};

const BaseProgressStick: React.FC<IBaseProgressStick> = ({
    index,
    progress
}) => {

    const theme = useTheme();
    const styles = useStyles(theme);


    const stickStyle = useAnimatedStyle(() => {
        const stickProgress = interpolate(
            progress.value,
            [index, index + 1],
            [0, 1],
            'clamp'
        );

        return {
            width: `${stickProgress * 100}%`,
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.inside, stickStyle]} />
        </View>
    )
};

const useStyles = ({
    palette: { graphite, icon }
}: UserTheme) => StyleSheet.create({
    container: {
        flex: 1,
        height: 4,
        backgroundColor: graphite[100],
        borderRadius: 3,
        overflow: 'hidden',
    },
    inside: {
        height: '100%',
        backgroundColor: icon.base.contrast,
    }
});

export default BaseProgressStick;
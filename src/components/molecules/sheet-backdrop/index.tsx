import React, { memo, useCallback } from 'react';
import { StyleSheet, Pressable, InteractionManager } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { BottomSheetBackdropProps, useBottomSheet } from '@gorhom/bottom-sheet';

interface ISheetBackdrop extends BottomSheetBackdropProps { };

const SheetBackdrop: React.FC<ISheetBackdrop> = ({ animatedIndex }) => {

    const { close } = useBottomSheet()

    const containerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animatedIndex.value, [0, -1], [1, 0]);
        return {
            opacity,
            display: animatedIndex.value === -1 ? 'none' : 'flex'
        }
    }, [])

    const theme = useTheme();
    const styles = useStyles(theme);

    const onPress = useCallback(() => {
        InteractionManager.runAfterInteractions(close)
    }, []);

    return (
        <Animated.View style={[containerStyle, styles.container]}>
            <Pressable onPress={onPress} style={styles.flex} />
        </Animated.View>
    )
};

const useStyles = ({
    palette: { }
}: UserTheme) => StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1
    },
    flex: {
        flex: 1,
    }
});

export default memo(SheetBackdrop);
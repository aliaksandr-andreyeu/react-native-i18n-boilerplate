import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Config from 'react-native-config';
import NetworkLogger, { startNetworkLogging } from 'react-native-network-logger';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { APP_ENV } = Config;

type DevNetworkLoggerOverlayProps = {
    positionStyle?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };

    enabled?: boolean;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FAB_SIZE = 52;
const EDGE_MARGIN = 12;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const DevNetworkLoggerOverlay: React.FC<DevNetworkLoggerOverlayProps> = ({
    positionStyle,
    enabled = true,
}) => {
    const [visible, setVisible] = useState(false);
    const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();


    const shouldRender = enabled && APP_ENV !== 'production';


    useEffect(() => {
        if (shouldRender) {
            startNetworkLogging({
                ignoredPatterns: [/symbolicate|posthog\.com|__sentry|\/ping|clients3.google/]
            });
        };
    }, [shouldRender]);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const totalDX = useSharedValue(0);
    const totalDY = useSharedValue(0);

    useEffect(() => {
        const defaultBottomOffset = 200;
        const defaultRightOffset = 24;

        const initialX =
            positionStyle?.left ??
            (SCREEN_WIDTH - FAB_SIZE - (positionStyle?.right ?? defaultRightOffset));

        const initialY =
            positionStyle?.top ??
            (SCREEN_HEIGHT - FAB_SIZE - (positionStyle?.bottom ?? defaultBottomOffset));

        translateX.value = initialX;
        translateY.value = initialY;
        startX.value = initialX;
        startY.value = initialY;
    }, [positionStyle, SCREEN_WIDTH, SCREEN_HEIGHT]);

    const openLogger = useCallback(() => setVisible(true), []);
    const closeLogger = useCallback(() => setVisible(false), []);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            startX.value = translateX.value;
            startY.value = translateY.value;

            totalDX.value = 0;
            totalDY.value = 0;
        })
        .onUpdate((event) => {
            totalDX.value = event.translationX;
            totalDY.value = event.translationY;

            translateX.value = startX.value + event.translationX;
            translateY.value = startY.value + event.translationY;
        })
        .onEnd(() => {
            let newX = startX.value + totalDX.value;
            let newY = startY.value + totalDY.value;

            const minX = EDGE_MARGIN;
            const maxX = SCREEN_WIDTH - FAB_SIZE - EDGE_MARGIN;
            const minY = safeTop + EDGE_MARGIN;
            const maxY = SCREEN_HEIGHT - FAB_SIZE - (safeBottom + 100) - EDGE_MARGIN;

            if (newX < minX) newX = minX;
            if (newX > maxX) newX = maxX;
            if (newY < minY) newY = minY;
            if (newY > maxY) newY = maxY;

            translateX.value = withSpring(newX, { damping: 15, stiffness: 200 });
            translateY.value = withSpring(newY, { damping: 15, stiffness: 200 });

            startX.value = newX;
            startY.value = newY;

        });

    const fabStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }), []);

    if (!shouldRender) {
        return null;
    }


    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                onRequestClose={closeLogger}
            >
                <View style={[
                    styles.modalContainer,
                    {
                        paddingTop: safeTop,
                        paddingBottom: safeBottom,
                    },
                ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Network Logger</Text>
                        <TouchableOpacity onPress={closeLogger} hitSlop={10}>
                            <Text style={styles.closeText}>Close Logger</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalContent}>
                        <NetworkLogger />
                    </View>
                </View>
            </Modal>
            <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.zindex]}>
                <GestureDetector gesture={panGesture}>
                    <AnimatedPressable onPress={openLogger} style={[styles.fab, fabStyle]}>
                        <Text style={styles.fabText}>Net</Text>
                    </AnimatedPressable>
                </GestureDetector>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeText: {
        fontSize: 16,
        color: '#007AFF',
    },
    modalContent: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
        opacity: 0.6
    },
    fabText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    zindex: {
        zIndex: 99999999999999
    }
});

export default memo(DevNetworkLoggerOverlay);
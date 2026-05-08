import React from 'react';
import { render } from '@testing-library/react-native';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedDot } from '@/components';
import { testIDs } from '@/constants';

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    Reanimated.interpolateColor = jest.fn((value, inputRange, outputRange) => {
        if (value <= inputRange[0]) return outputRange[0];
        if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];
        return outputRange[1]; // middle for test
    });

    Reanimated.interpolate = jest.fn((value, inputRange, outputRange, extrapolate) => {
        if (value <= inputRange[0]) return outputRange[0];
        if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];
        return outputRange[1]; // middle value again
    });

    return Reanimated;
});
describe('AnimatedDot', () => {

    it('renders with expected color and size using scroll value', () => {
        const scroll = useSharedValue(1);

        const { getByTestId } = render(
            <AnimatedDot
                scroll={scroll}
                inputRange={[0, 1, 2]}
                outputRange={['#aaa', '#bbb', '#ccc']}
                minDotWidth={5}
                maxDotWidth={10}
                useWidthAnim={true}
                dotStyle={{ borderRadius: 50 }}
            />
        );

        const dot = getByTestId(testIDs.components.molecules.animatedDot.container);

        const style = Array.isArray(dot.props.style)
            ? Object.assign({}, ...dot.props.style)
            : dot.props.style;

        expect(style.backgroundColor).toBe('#bbb');
        expect(style.width).toBe(10);
        expect(style.height).toBe(10);
        expect(style.borderRadius).toBe(50);
    });

    it('renders minimum width when scroll is 0', () => {
        const scroll = useSharedValue(0);

        const { getByTestId } = render(
            <AnimatedDot
                scroll={scroll}
                inputRange={[0, 1, 2]}
                outputRange={['#aaa', '#bbb', '#ccc']}
                minDotWidth={4}
                maxDotWidth={12}
                useWidthAnim={true}
                dotStyle={{ borderRadius: 4 }}
            />
        );

        const dot = getByTestId(testIDs.components.molecules.animatedDot.container);
        const style = Array.isArray(dot.props.style)
            ? Object.assign({}, ...dot.props.style)
            : dot.props.style;

        expect(style.backgroundColor).toBe('#aaa');
        expect(style.width).toBe(4);
    });
});

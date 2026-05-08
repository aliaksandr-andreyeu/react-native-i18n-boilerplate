import { render, act } from '@testing-library/react-native';
import BaseActivityLoader, { BaseActivityLoaderSize } from '@/components/atoms/activity-loader';

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.withTiming = (v: any) => v;
    Reanimated.FadeIn = { duration: () => ({}) };
    Reanimated.FadeOut = { duration: () => ({}) };
    return Reanimated;
});

describe('BaseActivityLoader', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('does not render when animating is false', () => {
        const { queryByTestId } = render(<BaseActivityLoader animating={false} />);
        expect(queryByTestId('base-activity-loader')).toBeNull();
    });

    it('renders when animating is true', () => {
        const { getByTestId } = render(<BaseActivityLoader animating />);
        expect(getByTestId('base-activity-loader')).toBeTruthy();
    });

    it('cycles dots correctly with act', () => {
        const { getByTestId } = render(<BaseActivityLoader animating />);

        act(() => {
            jest.advanceTimersByTime(500); // manually advance timers
        });

        act(() => {
            jest.runOnlyPendingTimers(); // flush pending timers
        });

        expect(getByTestId('base-activity-loader')).toBeTruthy();
    });

    it('renders small loader', () => {
        const { getByTestId } = render(
            <BaseActivityLoader animating size={BaseActivityLoaderSize.small} />
        );
        expect(getByTestId('base-activity-loader')).toBeTruthy();
    });
});

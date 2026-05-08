import React from 'react';
import { render } from '@testing-library/react-native';
import { BaseAssetLineChart } from '@/components';

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    return {
        ...Reanimated,
        runOnJS: (fn: any) => fn
    };
});

jest.mock('react-native-wagmi-charts', () => {
    const LineChart = ({ children }: any) => <>{children}</>;

    LineChart.Provider = ({ children }: any) => <>{children}</>;
    LineChart.Path = ({ children, color }: any) => (
        <>
            <>{children}</>
        </>
    );
    LineChart.Gradient = () => <></>;
    LineChart.HorizontalLine = () => <></>;
    LineChart.CursorLine = () => <></>;
    LineChart.CursorCrosshair = ({ children }: any) => <>{children}</>;
    LineChart.DatetimeText = ({ format }: any) => {
        if (format) format({ value: 123456 });
        return null;
    };
    LineChart.Tooltip = ({ children }: any) => <>{children}</>;

    return { LineChart };
});

const mockData = [
    { timestamp: 123456, value: 100 },
    { timestamp: 123457, value: 150 }
];

describe('BaseAssetLineChart', () => {
    const mockSetShowDate = jest.fn();
    const mockSetChartDate = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('renders chart successfully when valid data is provided', () => {
        const { toJSON } = render(
            <BaseAssetLineChart
                data={mockData}
                width={300}
                height={200}
                digits={2}
                minMaxValues={{ min: 0, max: 200 }}
                setShowDate={mockSetShowDate}
                setChartDate={mockSetChartDate}
            />
        );

        expect(toJSON()).not.toBeNull();
    });

    it('calls setShowDate and setChartDate when datetime changes', () => {
        render(
            <BaseAssetLineChart
                data={mockData}
                width={300}
                height={200}
                digits={2}
                minMaxValues={{ min: 0, max: 200 }}
                setShowDate={mockSetShowDate}
                setChartDate={mockSetChartDate}
            />
        );

        expect(mockSetChartDate).toHaveBeenCalledWith(123456);
        expect(mockSetShowDate).toHaveBeenCalledWith(true);
    });

    it('renders null when data is empty', () => {
        const { toJSON } = render(
            <BaseAssetLineChart
                data={[]}
                width={300}
                height={200}
                digits={2}
                minMaxValues={{ min: 0, max: 200 }}
                setShowDate={mockSetShowDate}
                setChartDate={mockSetChartDate}
            />
        );

        expect(toJSON()).toBeNull();
    });

    it('renders null when width or height is 0', () => {
        const { toJSON } = render(
            <BaseAssetLineChart
                data={mockData}
                width={0}
                height={0}
                digits={2}
                minMaxValues={{ min: 0, max: 200 }}
                setShowDate={mockSetShowDate}
                setChartDate={mockSetChartDate}
            />
        );

        expect(toJSON()).toBeNull();
    });

    it('renders horizontal lines if provided', () => {
        const { toJSON } = render(
            <BaseAssetLineChart
                data={mockData}
                width={300}
                height={200}
                digits={2}
                minMaxValues={{ min: 0, max: 200 }}
                horizontalLines={[{ value: 100, color: 'red' }]}
                setShowDate={mockSetShowDate}
                setChartDate={mockSetChartDate}
            />
        );

        expect(toJSON()).not.toBeNull();
    });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { BaseAssetCandlestickChart } from '@/components';


jest.mock('react-native-wagmi-charts', () => {
    const CandlestickChart = ({ children }: any) => <>{children}</>;

    CandlestickChart.Provider = ({ children }: any) => <>{children}</>;
    CandlestickChart.Candles = () => <></>;
    CandlestickChart.Crosshair = ({ children }: any) => <>{children}</>;
    CandlestickChart.Tooltip = ({ children }: any) => <>{children}</>;
    CandlestickChart.DatetimeText = ({ format }: any) => {
        if (format) {
            format({ value: 111111 });
        }
        return null;
    };

    return { CandlestickChart };
});

const mockData = [
    {
        timestamp: 111111,
        open: 100,
        high: 120,
        low: 90,
        close: 110,
    },
];

describe('BaseAssetCandlestickChart', () => {
    const mockSetShowDate = jest.fn();
    const mockSetChartDate = jest.fn();

    afterEach(() => {
        jest.clearAllTimers();
    });

    beforeEach(() => {
        jest.useFakeTimers();
    });

    it('renders correctly with chart and tooltip content', async () => {
        const { getByText } = render(
            <BaseAssetCandlestickChart
                digits={2}
                width={300}
                height={200}
                data={mockData}
                setShowDate={mockSetShowDate}
                setChartDate={mockSetChartDate}
            />
        );

        expect(getByText('open:')).toBeTruthy();
        expect(getByText('100.00')).toBeTruthy();

        expect(getByText('high:')).toBeTruthy();
        expect(getByText('120.00')).toBeTruthy();

        expect(getByText('low:')).toBeTruthy();
        expect(getByText('90.00')).toBeTruthy();

        expect(getByText('close:')).toBeTruthy();
        expect(getByText('110.00')).toBeTruthy();
    });

    it('calls setShowDate and setChartDate when datetime is selected', () => {
        render(
            <BaseAssetCandlestickChart
                digits={2}
                width={300}
                height={200}
                data={mockData}
                setShowDate={mockSetShowDate}
                setChartDate={mockSetChartDate}
            />
        );

        jest.runAllTimers();

        expect(mockSetShowDate).toHaveBeenCalledWith(true);
        expect(mockSetChartDate).toHaveBeenCalledWith(111111);
    });

    it('renders null if data is empty', () => {
        const { toJSON } = render(
            <BaseAssetCandlestickChart
                digits={2}
                width={300}
                height={200}
                data={[]}
                setShowDate={jest.fn()}
                setChartDate={jest.fn()}
            />
        );

        expect(toJSON()).toBeNull();
    });

    it('renders null if width or height is 0', () => {
        const { toJSON } = render(
            <BaseAssetCandlestickChart
                digits={2}
                width={0}
                height={0}
                data={mockData}
                setShowDate={jest.fn()}
                setChartDate={jest.fn()}
            />
        );

        expect(toJSON()).toBeNull();
    });
});

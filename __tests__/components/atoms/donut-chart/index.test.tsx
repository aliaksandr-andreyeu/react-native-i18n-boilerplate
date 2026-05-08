import { render } from '@testing-library/react-native';
import { BaseDonutChart } from '@/components';

describe('BaseDonutChart', () => {
    const mockSeries = [
        { percentage: 50, color: '#FF0000' },
        { percentage: 30, color: '#00FF00' },
        { percentage: 20, color: '#0000FF' },
    ];

    it('renders all segments based on series', () => {
        const { getAllByTestId } = render(
            <BaseDonutChart series={mockSeries} size={120} selected={undefined} />
        );

        const segments = getAllByTestId(/donut-segment-/);
        expect(segments.length).toBeGreaterThan(0);
    });

    it('renders a placeholder when series is empty', () => {
        const { getByTestId } = render(
            <BaseDonutChart series={[]} size={120} selected={undefined} />
        );

        expect(getByTestId('donut-placeholder')).toBeTruthy();
    });
});

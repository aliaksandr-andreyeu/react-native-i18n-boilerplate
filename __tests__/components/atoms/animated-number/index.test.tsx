import { render, act } from '@testing-library/react-native';
import { AnimatedNumber } from '@/components';


describe('AnimatedNumber', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('renders initial number correctly', () => {
        const { getByText } = render(<AnimatedNumber value={0} />);
        expect(getByText('0.00')).toBeTruthy();
    });

    it('renders updated number correctly after duration', () => {
        const { getByText } = render(<AnimatedNumber value={42} />);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(getByText('42.00')).toBeTruthy();
    });

    it('applies formatting function if provided', () => {
        const formatter = (val: string) => `$${val}`;
        const { getByText } = render(<AnimatedNumber value={10} format={formatter} />);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(getByText('$10.00')).toBeTruthy();
    });

    it('respects fixed precision', () => {
        const { getByText } = render(<AnimatedNumber value={5.12345} fixed={3} />);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(getByText('5.123')).toBeTruthy();
    });

    it('applies tabular font style by default', async () => {
        const { getByText } = render(<AnimatedNumber value={12} />);

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        const element = getByText('12.00');

        expect(element.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining([{ fontVariant: ['tabular-nums'] }]),
            ])
        );
    });
});

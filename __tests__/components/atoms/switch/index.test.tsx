import { BaseSwitch } from '@/components';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks', () => ({
    useCommonStyles: () => ({
        shadow6Style: {},
    }),
}));

describe('BaseSwitch', () => {
    it('renders correctly', () => {
        const { getByTestId } = render(<BaseSwitch value={false} />);
        expect(getByTestId('base-switch')).toBeTruthy();
    });

    it('calls onChange when pressed if not disabled', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<BaseSwitch value={false} onChange={onChange} />);
        fireEvent.press(getByTestId('base-switch'));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('does not call onChange when disabled', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<BaseSwitch value={false} onChange={onChange} disable={true} />);
        fireEvent.press(getByTestId('base-switch'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('updates when value changes', () => {
        const { getByTestId, rerender } = render(<BaseSwitch value={false} />);
        rerender(<BaseSwitch value={true} />);
        expect(getByTestId('base-switch')).toBeTruthy();
    });
});

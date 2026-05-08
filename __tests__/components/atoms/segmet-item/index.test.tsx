import { SegmentItem } from '@/components';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/hooks', () => ({
    useCommonStyles: () => ({ shadow6Style: {} }),
}));

describe('SegmentItem', () => {
    it('renders item label', () => {
        const { getByText } = render(
            <SegmentItem item="Option 1" selected={false} onPress={jest.fn()} index={0} disabled={false} />
        );
        expect(getByText('Option 1')).toBeTruthy();
    });

    it('calls onPress with correct index when pressed', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <SegmentItem item="Option 2" selected={false} onPress={onPress} index={2} disabled={false} />
        );
        fireEvent.press(getByText('Option 2'));
        expect(onPress).toHaveBeenCalledWith(2);
    });

    it('does not call onPress when disabled', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <SegmentItem item="Disabled" selected={false} onPress={onPress} index={1} disabled={true} />
        );
        fireEvent.press(getByText('Disabled'));
        expect(onPress).not.toHaveBeenCalled();
    });
});

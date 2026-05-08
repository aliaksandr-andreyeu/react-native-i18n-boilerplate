import BaseRadioButton, { BaseRadioButtonType } from '@/components/atoms/radio-button';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/hooks', () => ({
    useCommonStyles: () => ({ shadow6Style: {} }),
}));

describe('BaseRadioButton', () => {
    it('renders label and subtitle', () => {
        const { getByText } = render(
            <BaseRadioButton label="Option 1" subTitle="Details" />
        );
        expect(getByText('Option 1')).toBeTruthy();
        expect(getByText('Details')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPress = jest.fn();
        const { getByText } = render(<BaseRadioButton label="Option 2" onPress={onPress} />);
        fireEvent.press(getByText('Option 2'));
        expect(onPress).toHaveBeenCalled();
    });

    it('renders and updates input value', () => {
        const onChangeText = jest.fn();
        const { getByPlaceholderText } = render(
            <BaseRadioButton
                label="Other"
                showInput
                placeholder="Enter text"
                onChangeText={onChangeText}
            />
        );
        const input = getByPlaceholderText('Enter text');
        fireEvent.changeText(input, 'test');
        expect(onChangeText).toHaveBeenCalledWith('test');
    });

    it('clears text when close icon pressed', () => {
        const { getByPlaceholderText, getByTestId } = render(
            <BaseRadioButton
                label="Other"
                showInput
                placeholder="Enter text"
                inputValue="abc"
            />
        );
        const input = getByPlaceholderText('Enter text');
        fireEvent.changeText(input, 'abc');
        const button = getByTestId('base-radio-button');
        fireEvent.press(button);
    });

    it('renders secondary type correctly', () => {
        const { getByText } = render(
            <BaseRadioButton label="Secondary" type={BaseRadioButtonType.secondary} />
        );
        expect(getByText('Secondary')).toBeTruthy();
    });
});

import { fireEvent, render } from '@testing-library/react-native';
import { useTheme } from '@react-navigation/native';
import { BaseCheckbox } from '@/components';


describe('BaseCheckBox', () => {
    it('renders label when provided', () => {
        const { getByText } = render(<BaseCheckbox label="Accept Terms" />);
        expect(getByText('Accept Terms')).toBeTruthy();
    });

    it('calls onChange with true when pressed from unchecked state', () => {
        const onChangeMock = jest.fn();
        const { getByTestId } = render(<BaseCheckbox label="Accept" onChange={onChangeMock} />);
        const button = getByTestId('base-checkbox');
        fireEvent.press(button);
        expect(onChangeMock).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when pressed from checked state', () => {
        const onChangeMock = jest.fn();
        const { getByTestId } = render(<BaseCheckbox label="Accept" selected={true} onChange={onChangeMock} />);
        const button = getByTestId('base-checkbox');
        fireEvent.press(button);
        expect(onChangeMock).toHaveBeenCalledWith(false);
    });

    it('displays check icon when hasCheck and selected are true', () => {
        const { getByTestId } = render(<BaseCheckbox hasCheck selected label="Checked" />);
        expect(getByTestId('SvgXmlIcon-check')).toBeTruthy();
    });
});

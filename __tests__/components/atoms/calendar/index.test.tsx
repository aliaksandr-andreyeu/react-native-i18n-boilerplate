import { fireEvent, render } from '@testing-library/react-native';
import { BaseCalendarButton } from '@/components';


describe('BaseCalendarButton', () => {
    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(<BaseCalendarButton onPress={onPressMock} />);
        const button = getByTestId('calendar-button');
        fireEvent.press(button);
        expect(onPressMock).toHaveBeenCalled();
    });

    it('renders the calendar icon', () => {
        const { getByTestId } = render(<BaseCalendarButton onPress={() => { }} />);
        expect(getByTestId('SvgXmlIcon-calendar')).toBeTruthy();
    });
});

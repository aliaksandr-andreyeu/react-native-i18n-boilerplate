import { render, fireEvent, act } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { KeyboardDismissButton } from '@/components';

describe('KeyboardDismissButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows on keyboard show and triggers dismiss + onPress', () => {
        const onPress = jest.fn();
        const dismissSpy = jest.spyOn(Keyboard, 'dismiss');

        let showCallback: (e: any) => void = () => { };
        let hideCallback: (e: any) => void = () => { };

        jest.spyOn(Keyboard, 'addListener').mockImplementation((event, cb): any => {
            if (event === 'keyboardDidShow') showCallback = cb;
            if (event === 'keyboardDidHide') hideCallback = cb;
            return { remove: jest.fn() };
        });

        const { queryByTestId, rerender } = render(<KeyboardDismissButton onPress={onPress} />);

        act(() => {
            showCallback({ endCoordinates: { height: 200 } });
        });

        const button = queryByTestId('KeyboardDismissButton');
        expect(button).toBeTruthy();

        fireEvent.press(button!);
        expect(dismissSpy).toHaveBeenCalled();
        expect(onPress).toHaveBeenCalled();

        act(() => {
            hideCallback(undefined);
        });

        rerender(<KeyboardDismissButton onPress={onPress} />);
        expect(queryByTestId('KeyboardDismissButton')).toBeNull();
    });
});

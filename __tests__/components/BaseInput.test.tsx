import React, { ForwardedRef } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { BaseInput } from '@/components';
import { TextInput, ViewStyle } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
import { coreToken } from '@/constants/theme/tokens';


jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    Reanimated.withTiming = (value: number) => value;

    return Reanimated;
});

jest.mock('@gorhom/bottom-sheet', () => {
    const React = require('react');
    const { TextInput } = require('react-native');
    const { forwardRef } = React;

    return {
        BottomSheetModalProvider: ({ children }: { children: React.ReactNode[] }) => <>{children}</>,
        BottomSheetTextInput: forwardRef((props: BottomSheetTextInputProps, ref: ForwardedRef<TextInput>) => <TextInput {...props} ref={ref} testID="base-input-field-bottom-sheet" />),
        useBottomSheetInternal: () => ({
            close: jest.fn(),
            expand: jest.fn(),
        }),
    };
});

describe('BaseInput Component', () => {

    it('renders correctly', () => {
        const { getByTestId } = render(<BaseInput />);
        const input = getByTestId('base-input');
        expect(input).toBeTruthy();
    });

    it('handles focus and blur events correctly', () => {
        const { getByTestId } = render(
            <BaseInput placeholder="Enter text" />
        );

        const input = getByTestId('base-input-field');

        expect(input.props.placeholder).toEqual('');

        fireEvent(input, 'focus');
        expect(input.props.placeholder).toEqual('Enter text');

        fireEvent(input, 'blur');
        expect(input.props.placeholder).toEqual('');
    });

    it('clears text when clear button is pressed', () => {
        const mockOnChange = jest.fn();
        const { getByTestId } = render(
            <BaseInput
                placeholder="Enter text"
                value="Test"
                onChange={mockOnChange}
            />
        );
        const clearButton = getByTestId('base-input-clear-button');

        fireEvent.press(clearButton);
        expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('toggles secure text visibility', () => {
        const { getByTestId } = render(
            <BaseInput testID='input-toggle' secureTextEntry />
        );

        const input = getByTestId('input-toggle');
        const toggleButton = getByTestId('toggle-secure-text');

        expect(input.props.secureTextEntry).toBe(true);

        fireEvent.press(toggleButton);
        expect(input.props.secureTextEntry).toBe(false);
    });

    it('renders dropdown button when dropdown is true', () => {
        const { getByTestId } = render(<BaseInput dropdown />);
        const dropdownButton = getByTestId('base-input-dropdown');
        expect(dropdownButton).toBeTruthy();
    });

    it('renders multiline correctly', () => {
        const { getByTestId } = render(<BaseInput multiline />);
        const input = getByTestId('base-input-field');
        expect(input.props.multiline).toBeTruthy();
    });

    it('should have the correct accessibility label', () => {
        const { getByLabelText } = render(<BaseInput accessibilityLabel='input' />);
        const input = getByLabelText('input');
        expect(input).toBeTruthy();
    });

    it('renders correct style when error is true', () => {
        const { getByTestId } = render(<BaseInput error />)
        const parentContainer = getByTestId('base-input');
        const input = getByTestId('base-input-field');

        expect(parentContainer).toHaveStyle({ borderColor: coreToken.color.red[600] });
        expect(input).toHaveStyle({ color: coreToken.color.red[600] })
    })

    it('renders correctly when hideClearButton is false', () => {
        const { getByTestId } = render(<BaseInput value='test' hideClearButton={false} />)
        const clearButton = getByTestId('base-input-clear-button');

        expect(clearButton).toBeTruthy();
    });

    it('applies additional styles passed via the style prop', () => {
        const containerStyle: ViewStyle = { backgroundColor: 'green', width: 100 }
        const { getByTestId } = render(<BaseInput inputContainerStyle={containerStyle} />)
        const input = getByTestId('base-input');

        expect(input).toHaveStyle(containerStyle)
    });

    it('renders title correctly', () => {
        const { getByTestId } = render(<BaseInput title='Test' />)
        const input = getByTestId('base-input-title');

        expect(input).toBeTruthy();
    });

    it('renders correctly when focusedBorderColor is not empty string', async () => {
        const { getByTestId } = render(<BaseInput focusedBorderColor='red' />)
        const input = getByTestId('base-input-field');
        const parentContainer = getByTestId('base-input');

        expect(parentContainer).toHaveStyle({ borderColor: '#ffffff' });
        fireEvent(input, 'focus');
        expect(parentContainer).toHaveStyle({ borderColor: 'red' });
    });

    it('renders correctly when isBottomSheet is true', () => {
        const { getByTestId } = render(
            <BottomSheetModalProvider >
                <BaseInput isBottomSheet />
            </BottomSheetModalProvider>
        )
        const input = getByTestId('base-input-field-bottom-sheet');

        expect(input).toBeTruthy();
    })

    it('renders correctly when required is true', () => {
        const { getByTestId } = render(<BaseInput title='Test' required />);
        const input = getByTestId('base-input-required');

        expect(input).toBeTruthy();
    });
});
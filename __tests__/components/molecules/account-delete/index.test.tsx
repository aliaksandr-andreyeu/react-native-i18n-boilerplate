import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AccountDelete from '@/components/molecules/account-delete';
import { BottomSheetModal } from '@gorhom/bottom-sheet';


jest.mock('@gorhom/bottom-sheet', () => {
    const React = require('react');

    const MockComponent = React.forwardRef((props: any, ref: any) => {
        return <>{props.children}</>;
    });

    return {
        BottomSheetModal: React.forwardRef((props: any, ref: any) => {
            React.useImperativeHandle(ref, () => ({
                present: jest.fn(),
                dismiss: jest.fn()
            }));
            return <>{props.children}</>;
        }),
        BottomSheetView: (props: any) => <>{props.children}</>,
        BottomSheetTextInput: MockComponent,
        BottomSheetBackdrop: MockComponent,
        BottomSheetScrollView: MockComponent,
        BottomSheetFlatList: MockComponent
    };
});


jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0 })
}));


describe('AccountDelete', () => {

    const mockNavigation: any = {
        canGoBack: jest.fn(() => true),
        isFocused: jest.fn(() => true),
        goBack: jest.fn()
    };

    const mockOnPress = jest.fn();
    const mockOnSheetPress = jest.fn();

    it('renders and triggers onPress when tapped', () => {
        const { getByText } = render(
            <AccountDelete
                type="delete_profile"
                navigation={mockNavigation}
                onPress={mockOnPress}
            />
        );

        expect(getByText('delete-my-account')).toBeTruthy();

        fireEvent.press(getByText('delete-my-account'));
        expect(mockOnPress).toHaveBeenCalled();
    });

    it('renders cancel info when type is cancel_delete_profile', () => {
        const { getByText } = render(
            <AccountDelete
                type="cancel_delete_profile"
                navigation={mockNavigation}
            />
        );

        expect(getByText('cancel-deletion')).toBeTruthy();
        expect(getByText('delete-request-process')).toBeTruthy();
    });

    it('calls onSheetPress and dismiss on button press inside modal', () => {
        const ref = React.createRef<BottomSheetModal>();

        const { getByText } = render(
            <AccountDelete
                ref={ref}
                type="delete_profile"
                navigation={mockNavigation}
                onSheetPress={mockOnSheetPress}
            />
        );

        fireEvent.press(getByText('yes-delete'));
        fireEvent.press(getByText('go-back'));

        expect(mockOnSheetPress).toHaveBeenCalled();
    });
});

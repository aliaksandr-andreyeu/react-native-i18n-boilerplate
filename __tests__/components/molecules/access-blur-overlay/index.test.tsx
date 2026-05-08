import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BaseAccessGuidelinesOverlay from '@/components/molecules/access-blur-overlay';
import { testIDs } from '@/constants';

jest.mock('@react-native-community/blur', () => {
    const { View } = require('react-native');
    return {
        BlurView: View
    };
});


jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    let didRun = false;
    return {
        ...actualNav,
        useFocusEffect: (cb: any) => {
            if (!didRun) {
                didRun = true;
                cb();
            }
        },
        useTheme: () => {
            const theme = require('@/constants/theme').default;
            return theme.lightTheme;
        },
    }
})

describe('BaseAccessGuidelinesOverlay', () => {

    const mockFirstPress = jest.fn();
    const mockSecondPress = jest.fn();

    const defaultProps = {
        title: 'Test Title',
        subTitle: 'Test Subtitle',
        firstButton: {
            text: 'Confirm',
            onPress: mockFirstPress,
            testID: testIDs.components.molecules.accessBlurOverlay.firstButton
        },
        secondButton: {
            text: 'Cancel',
            onPress: mockSecondPress,
            testID: testIDs.components.molecules.accessBlurOverlay.secondButton
        }
    };

    it('renders title, subtitle, and both buttons', () => {
        const { getByText, getByTestId, toJSON } = render(<BaseAccessGuidelinesOverlay {...defaultProps} />);

        expect(getByText('Test Title')).toBeTruthy();
        expect(getByText('Test Subtitle')).toBeTruthy();
        expect(getByTestId(testIDs.components.molecules.accessBlurOverlay.firstButton)).toBeTruthy();
        expect(getByTestId(testIDs.components.molecules.accessBlurOverlay.secondButton)).toBeTruthy();
    });

    it('calls onPress handlers when buttons are pressed', () => {
        const { getByTestId } = render(<BaseAccessGuidelinesOverlay {...defaultProps} />);

        fireEvent.press(getByTestId(testIDs.components.molecules.accessBlurOverlay.firstButton));
        fireEvent.press(getByTestId(testIDs.components.molecules.accessBlurOverlay.secondButton));

        expect(mockFirstPress).toHaveBeenCalled();
        expect(mockSecondPress).toHaveBeenCalled();
    });

    it('renders without second button if not provided', () => {
        const { queryByTestId } = render(
            <BaseAccessGuidelinesOverlay {...defaultProps} secondButton={undefined} />
        );

        expect(queryByTestId(testIDs.components.molecules.accessBlurOverlay.secondButton)).toBeNull();
    });
});

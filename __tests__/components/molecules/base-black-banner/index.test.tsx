import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BaseBlackBanner, BlackBannerTypes } from '@/components';
import { testIDs } from '@/constants';


jest.mock('@/assets', () => ({
    images: {
        idCard: 'mock-id-card',
        verificationKey: 'mock-verification-key',
        safe: 'mock-safe',
        rocket: 'mock-rocket',
        barChart: 'mock-bar-chart',
    },
}));


describe('BaseBlackBanner with testIDs', () => {
    const renderBanner = (type: BlackBannerTypes, onPress = jest.fn()) =>
        render(<BaseBlackBanner type={type} onPress={onPress} />);

    it('renders title and button with correct testIDs', () => {
        const { getByTestId } = renderBanner('sign-up');
        expect(getByTestId(testIDs.components.molecules.baseBlackBanner.bannerTitle).props.children).toBe('next-step');
        expect(getByTestId(testIDs.components.molecules.baseBlackBanner.bannerButton)).toBeTruthy();
    });

    it('renders the image for each banner type', () => {
        const typesWithImages: BlackBannerTypes[] = ['sign-up', 'verification', 'fund-now', 'transfer', 'explore'];
        typesWithImages.forEach((type) => {
            const { getByTestId, unmount } = renderBanner(type);
            expect(getByTestId(testIDs.components.molecules.baseBlackBanner.bannerImage)).toBeTruthy();
            unmount();
        });
    });

    it('fires onPress when banner button is pressed', () => {
        const mockPress = jest.fn();
        const { getByTestId } = renderBanner('sign-up', mockPress);
        fireEvent.press(getByTestId(testIDs.components.molecules.baseBlackBanner.bannerButton));
        expect(mockPress).toHaveBeenCalled();
    });

    it('does not render anything if type is "null"', () => {
        const { toJSON } = renderBanner('null');
        expect(toJSON()).toBeNull();
    });
});

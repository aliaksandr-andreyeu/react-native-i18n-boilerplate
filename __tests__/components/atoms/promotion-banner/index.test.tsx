import { BasePromoBanner } from '@/components';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

jest.mock('@/hooks', () => ({
    useCommonStyles: () => ({ shadow6Style: {} }),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
    canOpenURL: jest.fn().mockResolvedValue(true),
}));

describe('BasePromotionBanner', () => {
    const baseProps = {
        id: 1,
        title: 'Promo Title',
        subTitle: 'Promo Subtitle',
        tagLine: 'Tag Text',
        buttonLabel: 'Click Me',
        bgColor: '#ffffff',
        bgImage: 'https://image.url/image.png',
        bannerTextColor: '#000000',
        bannerButtonColor: '#ff0000',
        bannerButtonLabelColor: '#ffffff',
        onCardPress: jest.fn(),
    };

    it('renders title, subtitle and tag line', () => {
        const { getByText } = render(<BasePromoBanner {...baseProps} />);
        expect(getByText('Promo Title')).toBeTruthy();
        expect(getByText('Promo Subtitle')).toBeTruthy();
        expect(getByText('Tag Text')).toBeTruthy();
    });

    it('calls onCardPress when button is pressed', () => {
        const onCardPress = jest.fn();
        const { getByText } = render(<BasePromoBanner {...baseProps} onCardPress={onCardPress} />);
        fireEvent.press(getByText('Click Me'));
        expect(onCardPress).toHaveBeenCalledWith(1);
    });

    it('calls Linking.openURL when terms pressed', async () => {
        const { getByText } = render(
            <BasePromoBanner
                {...baseProps}
                isHero
                termsAndConditionsLabel="Terms"
                termsAndConditionsLink="https://example.com"
            />
        );
        fireEvent.press(getByText('Terms'));
        await waitFor(() => {
            expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
        });
    });
});

import { render, fireEvent } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseBackButton } from '@/components';


describe('BaseBackButton', () => {
    const goBackMock = jest.fn();

    beforeEach(() => {
        goBackMock.mockClear();
    });

    it('renders with chevron icon when isChevron is true', () => {
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: goBackMock,
            canGoBack: () => true,
        });

        const { getByTestId } = render(<BaseBackButton isChevron={true} />);
        expect(getByTestId('SvgXmlIcon-chevron-left')).toBeTruthy();
    });

    it('renders with close icon when isClose is true', () => {
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: goBackMock,
            canGoBack: () => true,
        });

        const { getByTestId } = render(<BaseBackButton isClose={true} />);
        expect(getByTestId('SvgXmlIcon-close')).toBeTruthy();
    });

    it('calls customBack when provided', () => {
        const customBackMock = jest.fn();
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: goBackMock,
            canGoBack: () => false,
        });

        const { getByTestId } = render(<BaseBackButton customBack={customBackMock} />);
        fireEvent.press(getByTestId('base-back-button'));
        expect(customBackMock).toHaveBeenCalled();
    });

    it('calls goBack when canGoBack is true and no customBack', () => {
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: goBackMock,
            canGoBack: () => true,
        });

        const { getByTestId } = render(<BaseBackButton />);
        fireEvent.press(getByTestId('base-back-button'));
        expect(goBackMock).toHaveBeenCalled();
    });

    it('returns null when cannot go back and no customBack', () => {
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: goBackMock,
            canGoBack: () => false,
        });

        const { toJSON } = render(<BaseBackButton />);
        expect(toJSON()).toBeNull();
    });
});

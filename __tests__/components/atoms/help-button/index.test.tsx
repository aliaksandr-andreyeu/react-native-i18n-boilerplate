import { render, fireEvent } from '@testing-library/react-native';
import { SvgXmlIconNames } from '@/assets';
import { BaseHelpButton } from '@/components';

jest.mock('react-native-walkthrough-tooltip', () => {
    return ({ children, content }: any) => (
        <>
            {children}
            {content}
        </>
    );
});

describe('BaseHelpButton', () => {
    it('renders with help icon', () => {
        const { getByTestId } = render(
            <BaseHelpButton
                text="Some help text"
                title="Help Title"
                icon={SvgXmlIconNames.settings}
            />
        );
        expect(getByTestId('BaseHelpButton')).toBeTruthy();
    });

    it('triggers onCloseTip when closed', () => {
        const onClose = jest.fn();
        const { getByTestId } = render(
            <BaseHelpButton
                text="Info"
                isAutoVisible
                onCloseTip={onClose}
            />
        );
        fireEvent.press(getByTestId('BaseHelpButton_Close'));
        expect(onClose).toHaveBeenCalled();
    });

    it('renders step buttons and triggers callbacks', () => {
        const onBack = jest.fn();
        const onNext = jest.fn();

        const { getByText } = render(
            <BaseHelpButton
                text="Step content"
                title="Step"
                showStepButtons
                showBack
                showNext
                onBackButtonPress={onBack}
                onNextButtonPress={onNext}
                isAutoVisible
            />
        );

        fireEvent.press(getByText('back'));
        fireEvent.press(getByText('next'));

        expect(onBack).toHaveBeenCalled();
        expect(onNext).toHaveBeenCalled();
    });
});

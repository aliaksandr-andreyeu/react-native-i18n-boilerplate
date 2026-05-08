import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleDisclaimer } from '@/components';
import { testIDs } from '@/constants';



describe('ArticleDisclaimer', () => {
    it('renders translated disclaimer text', () => {
        const { getByText } = render(<ArticleDisclaimer />);
        expect(getByText('disclaimer')).toBeTruthy();
    });

    it('applies custom text and container styles', () => {
        const { getByTestId } = render(
            <ArticleDisclaimer
                textStyle={{ fontSize: 18 }}
                containerStyle={{ backgroundColor: 'red' }}
            />
        );

        const viewComponent = getByTestId(testIDs.components.molecules.articleDisclaimer.container);

        const containerStyles = Array.isArray(viewComponent.props.style)
            ? Object.assign({}, ...viewComponent.props.style)
            : viewComponent.props.style;

        expect(containerStyles.backgroundColor).toBe('red');
    });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BaseCaption } from '@/components';
import { testIDs } from '@/constants';

jest.mock('@/assets', () => ({
    SvgIcon: ({ name }: any) => <>{name}</>,
    SvgXmlIconNames: { chevronRight: 'chevronRight' },
    IconSize: { xs: 16 },
    images: {
        one: 'one',
        two: 'two',
        three: 'three',
    },
}));



describe('BaseCaption', () => {
    it('renders label correctly', () => {
        const { getByTestId } = render(<BaseCaption label="My Label" />);
        expect(getByTestId(testIDs.components.molecules.caption.label).props.children).toBe('My Label');
    });

    it('renders help button if help is provided', () => {
        const { getByTestId } = render(<BaseCaption label="Label" help="This is help text" />);
        expect(getByTestId(testIDs.components.molecules.caption.helpButton)).toBeTruthy();
    });

    it('does not render help button if help is not provided', () => {
        const { queryByTestId } = render(<BaseCaption label="Label" />);
        expect(queryByTestId(testIDs.components.molecules.caption.helpButton)).toBeNull();
    });

    it('renders goTo button and triggers callback', () => {
        const mockGoTo = jest.fn();
        const { getByTestId } = render(<BaseCaption label="Label" goTo={mockGoTo} />);
        fireEvent.press(getByTestId(testIDs.components.molecules.caption.goToButton));
        expect(mockGoTo).toHaveBeenCalled();
    });

    it('does not render goTo button if goTo is not provided', () => {
        const { queryByTestId } = render(<BaseCaption label="Label" />);
        expect(queryByTestId(testIDs.components.molecules.caption.goToButton)).toBeNull();
    });

    it('renders nothing if label is not provided', () => {
        const { toJSON } = render(<BaseCaption label="" />);
        expect(toJSON()).toBeNull();
    });
});

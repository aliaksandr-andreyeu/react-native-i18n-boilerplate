import React from 'react';
import { render } from '@testing-library/react-native';
import Reanimated, { useSharedValue } from 'react-native-reanimated';
import { AccordionItem } from '@/components';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

describe('AccordionItem', () => {

    it('renders collapsed when isExpanded is false', () => {
        const Wrapper = () => {
            const isExpanded = useSharedValue(false);
            return (
                <AccordionItem isExpanded={isExpanded} viewKey="collapsed">
                    <Reanimated.Text>Collapsed Content</Reanimated.Text>
                </AccordionItem>
            );
        };

        const { getByText, toJSON } = render(<Wrapper />);
        expect(getByText('Collapsed Content')).toBeTruthy();
        expect(toJSON()).toMatchSnapshot();
    });

    it('renders expanded when isExpanded is true', () => {
        const Wrapper = () => {
            const isExpanded = useSharedValue(true);
            return (
                <AccordionItem isExpanded={isExpanded} viewKey="expanded">
                    <Reanimated.Text>Expanded Content</Reanimated.Text>
                </AccordionItem>
            );
        };

        const { getByText } = render(<Wrapper />);
        expect(getByText('Expanded Content')).toBeTruthy();
    });
});

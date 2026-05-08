import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { BaseAssetDetailsTabs } from '@/components';

const mockNavigation = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    dispatch: jest.fn()
};

const mockState = {
    index: 0,
    key: 'tabs-key',
    routes: [
        { key: 'tab-1', name: 'Overview' },
        { key: 'tab-2', name: 'Details' }
    ]
} as any;

describe('BaseAssetDetailsTabs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all tabs correctly', () => {
        const { getByText } = render(
            <BaseAssetDetailsTabs navigation={mockNavigation as any} state={mockState} />
        );

        expect(getByText('Overview')).toBeTruthy();
        expect(getByText('Details')).toBeTruthy();
    });

    it('dispatches navigation when non-focused tab is pressed', () => {
        const { getByText } = render(
            <BaseAssetDetailsTabs navigation={mockNavigation as any} state={mockState} />
        );

        const detailsTab = getByText('Details');
        fireEvent.press(detailsTab);

        expect(mockNavigation.emit).toHaveBeenCalledWith({
            type: 'tabPress',
            target: 'tab-2',
            canPreventDefault: true
        });

        expect(mockNavigation.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'NAVIGATE',
                payload: expect.objectContaining({ name: 'Details', merge: true }),
                target: 'tabs-key'
            })
        );
    });

    it('does not dispatch if tab is already focused', () => {
        const focusedState = { ...mockState, index: 1 };

        const { getByText } = render(
            <BaseAssetDetailsTabs navigation={mockNavigation as any} state={focusedState} />
        );

        const detailsTab = getByText('Details');
        fireEvent.press(detailsTab);

        expect(mockNavigation.dispatch).not.toHaveBeenCalled();
    });
});

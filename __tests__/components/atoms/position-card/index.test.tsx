import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BasePositionCard } from '@/components';

const mockData = {
    symbol: 'EURUSD',
    fullName: 'Euro / US Dollar',
    image: 'https://image.png',
    assetUnitOfMeasure: 'lots',
    assetUnitOfMeasureDigits: 2,
    positions: [
        {
            ticket: 123456,
            Volume: 1,
            VolumeInitial: 1,
            contractSize: 100000,
            priceOpen: 1.1000,
            priceOrder: 1.1000,
            priceSL: 0,
            priceTP: 0,
            digits: 5,
            profit: 50,
            action: 0,
            type: 0,
            priceCurrent: 1.1050,
        }
    ]
};

describe('BasePositionCard', () => {
    it('renders card with basic info', () => {
        const { getByText } = render(
            <BasePositionCard
                data={mockData as any}
                isOrder={false}
                onItemPress={jest.fn()}
                onClosePressed={jest.fn()}
            />
        );

        expect(getByText('EURUSD')).toBeTruthy();
        expect(getByText('Euro / US Dollar')).toBeTruthy();
    });

    it('calls onClosePressed when close is clicked', () => {
        const onClosePressed = jest.fn();

        const { getByTestId } = render(
            <BasePositionCard
                data={mockData as any}
                isOrder={false}
                onItemPress={jest.fn()}
                onClosePressed={onClosePressed}
            />
        );

        const closeButton = getByTestId('position-card-close-button');
        fireEvent.press(closeButton);

        expect(onClosePressed).toHaveBeenCalled();
    });
});

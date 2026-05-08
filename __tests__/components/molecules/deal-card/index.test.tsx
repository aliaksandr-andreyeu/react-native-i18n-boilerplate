import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BaseDealActivityCard } from '@/components';
import { HistoryDataItem } from '@/containers/app/wallet/recent-activity';
import { testIDs } from '@/constants';

jest.mock('@/helpers', () => {
  const actual = jest.requireActual('@/helpers');
  return {
    ...actual,
    localTime: jest.fn(() => '12:00'),
    formatNumberToAmount: jest.fn((n: number) => `${n.toFixed(2)}`),
    formatTwoDecimals: jest.fn((val: string | number) => val.toString()),
    getAssetName: jest.fn((symbol: string) => symbol)
  };
});

const mockData: HistoryDataItem = {
  id: '123',
  type: 'withdrawal', // or 'deposit' etc.
  status: 'completed',
  declineReason: '',
  createdAt: '2025-07-26T10:00:00Z',
  amount: '123.45',
  symbol: 'AAPL.us',
  logo: 'https://example.com/logo.png',
  currency: 'USD'
};

describe('BaseDealActivityCard', () => {
  it('renders asset name, time, and value', () => {
    const { getByTestId } = render(<BaseDealActivityCard data={mockData} onPress={jest.fn()} />);

    expect(getByTestId(testIDs.components.molecules.dealCard.activityTime)).toBeTruthy();
    expect(getByTestId(testIDs.components.molecules.dealCard.activityTime)).toBeTruthy();
    expect(getByTestId(testIDs.components.molecules.dealCard.activityValue)).toBeTruthy();
  });

  it('displays correct sign for positive amount', () => {
    const { getByTestId } = render(<BaseDealActivityCard data={{ ...mockData, amount: '100' }} onPress={jest.fn()} />);

    expect(getByTestId(testIDs.components.molecules.dealCard.activityValue).props.children).toContain('+');
  });

  it('displays correct sign for negative amount', () => {
    const { getByTestId } = render(<BaseDealActivityCard data={{ ...mockData, amount: '-50' }} onPress={jest.fn()} />);

    expect(getByTestId(testIDs.components.molecules.dealCard.activityValue).props.children).toContain('-');
  });

  it('calls onPress when touched', () => {
    const mockPress = jest.fn();

    const { getByRole } = render(<BaseDealActivityCard data={mockData} onPress={mockPress} />);

    fireEvent.press(getByRole('button'));
    expect(mockPress).toHaveBeenCalled();
  });
});

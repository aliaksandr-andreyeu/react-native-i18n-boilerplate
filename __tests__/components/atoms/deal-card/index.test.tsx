import { render, fireEvent } from '@testing-library/react-native';
import { BaseDealCard } from '@/components';
import { testIDs } from '@/constants';

const mockData = {
  ticket: 12345,
  action: 1,
  profit: 120.5,
  VolumeClosed: 1,
  price: 1.234,
  priceSL: 1.1,
  priceTP: 1.3,
  pricePosition: 1.2,
  digits: 2,
  symbol: 'EURUSD',
  fullName: 'Euro vs US Dollar',
  image: 'https://fakeimage.url/img.png',
  contractSize: 100000,
  assetUnitOfMeasure: 'lots',
  assetUnitOfMeasureDigits: 2
} as any;

jest.unmock('@/helpers');

describe('BaseDealCard', () => {
  it('renders correctly and triggers onPress', () => {
    const onDealPress = jest.fn();

    const { getByText, getByTestId } = render(<BaseDealCard testID={testIDs.portfolio.history.dealCard('BaseDealButton')} data={mockData} onDealPress={onDealPress} />);

    expect(getByText('EURUSD')).toBeTruthy();
    expect(getByText('+$120.50')).toBeTruthy();
    expect(getByText('Euro vs US Dollar')).toBeTruthy();

    fireEvent.press(getByTestId(testIDs.portfolio.history.dealCard('BaseDealButton')));
    expect(onDealPress).toHaveBeenCalledWith(12345);
  });
});

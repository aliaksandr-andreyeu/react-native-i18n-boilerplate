import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { BasePositionItem } from '@/components';

describe('BasePositionItem', () => {
  const mockItem: any = {
    ticket: 123,
    VolumeInitial: 1,
    Volume: 1,
    contractSize: 100,
    priceOrder: 1.25,
    priceOpen: 1.2,
    priceSL: 1.1,
    priceTP: 1.3,
    digits: 2,
    profit: 50,
    action: 0,
    type: 0,
    login: 0,
    symbol: 'EURUSD',
    digitsCurrency: 2,
    externalId: '',
    priceCurrent: 1.2,
    commission: 0,
    taxes: 0,
    storage: 0,
    time: 0,
    timeSetup: 0,
    timeUpdate: 0,
    magic: 0,
    comment: '',
    group: '',
    gateway: '',
    sl: 0,
    tp: 0,
    volumeExt: 0,
    volumeExtInitial: 0,
    expiration: 0,
    reason: '',
    fillingMode: 0,
    reasonDesc: '',
    slippage: 0,
    balance: 0
  };

  const props = {
    items: [mockItem],
    onItemPress: jest.fn(),
    onClosePressed: jest.fn(),
    assetUnit: 'USD',
    assetUnitOfMeasureDigits: 2,
    isOrder: false,
    liveAsk: 1.28,
    liveBid: 1.22,
    liveCurrencyAveragePrice: 1,
    currencyProfitSymbol: 'USD',
    currencyProfitSymbolDirect: true
  };

  it('renders position item and handles press', () => {
    const { getByTestId } = render(<BasePositionItem {...props} />);

    const item = getByTestId(`position-touchable-${mockItem.ticket}`);
    expect(item).toBeTruthy();

    fireEvent.press(item);
    expect(props.onItemPress).toHaveBeenCalledWith(mockItem.ticket);
  });

  it('shows profit correctly', () => {
    const { getByTestId } = render(<BasePositionItem {...props} />);

    const profitText = getByTestId(`position-profit-${mockItem.ticket}`);
    expect(profitText.props.children).toContain('$');
  });
});

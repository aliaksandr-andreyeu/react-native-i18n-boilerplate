jest.mock('@/hooks', () => ({
  useAppSelector: jest.fn(),
  useCommonStyles: jest.fn(() => ({ shadow6Style: {} }))
}));

jest.mock('@/providers', () => ({
  useNetwork: jest.fn()
}));

jest.mock('@/store/api', () => ({
  useGetSymbolConfigMutation: jest.fn(),

  authApi: {
    reducerPath: 'authApi',
    reducer: jest.fn(),
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {}
  },
  customerApi: {
    reducerPath: 'customerApi',
    reducer: jest.fn(),
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {}
  },
  ideasHubApi: {
    reducerPath: 'ideasHubApi',
    reducer: jest.fn(),
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {}
  },
  ideasHubClientApi: {
    reducerPath: 'ideasHubClientApi',
    reducer: jest.fn(),
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {}
  }
}));

jest.mock('@/store/api', () => ({
  useGetSymbolConfigMutation: jest.fn()
}));

jest.mock('@/store/slices/auth', () => ({
  authSlice: {
    reducer: jest.fn(),
    actions: {
      logOut: jest.fn(),
      setAccessToken: jest.fn(),
      setRefreshToken: jest.fn(),
      setIntercomLoggedIn: jest.fn()
    }
  }
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useAppSelector } from '@/hooks';
import { useNavigation } from '@react-navigation/native';
import { useNetwork } from '@/providers';
import { useGetSymbolConfigMutation } from '@/store/api';
import { BaseAssetCard } from '@/components';
import { withStoreProvider } from '../../../../__mocks__/utils/mockStore';

describe('BaseAssetCard', () => {
  const mockNavigate = jest.fn();
  const mockOnMessage = jest.fn();

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    (useAppSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (selectorFn.toString().includes('store.market.signals')) {
        return [];
      }
      if (selectorFn.toString().includes('store.portfolio.selectedAccount')) {
        return 'test-account-id';
      }
      return undefined;
    });
    (useNetwork as jest.Mock).mockReturnValue({
      websocket: { onMessage: mockOnMessage },
      isReadyState: true
    });
    (useGetSymbolConfigMutation as jest.Mock).mockReturnValue([
      jest.fn(), // getSymbolConfig
      { data: { tradeMode: 0 } } // fake response
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    isViewable: true,
    title: 'BTCUSD',
    fullName: 'Bitcoin / US Dollar',
    bid: '30000',
    ask: '31000',
    image: 'https://example.com/image.png',
    lastClosedPrice: 29000,
    digits: 2,
    useTradeMode: true
  };

  const renderComponent = () => render(withStoreProvider(<BaseAssetCard {...defaultProps} />));

  it('renders title and full name', () => {
    const { getByText } = renderComponent();
    expect(getByText('BTCUSD')).toBeTruthy();
    expect(getByText('Bitcoin / US Dollar')).toBeTruthy();
  });

  it('navigates to AssetDetails on press', () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId('asset-card-button');
    fireEvent.press(button);
    expect(mockNavigate).toHaveBeenCalledWith(
      'AssetDetails',
      expect.objectContaining({
        asset: 'BTCUSD'
      })
    );
  });

  it('renders correct average price', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(getByText('30500.00')).toBeTruthy();
    });
  });

  it('renders profit percentage', async () => {
    const { getByText } = renderComponent();
    const profitText = await waitFor(() => getByText('+5.17%'));
    expect(profitText).toBeTruthy();
  });

  it('calls websocket onMessage on mount', () => {
    renderComponent();
    expect(mockOnMessage).toHaveBeenCalled();
  });
});

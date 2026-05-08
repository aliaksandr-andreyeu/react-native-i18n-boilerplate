import { BaseMarketTabs } from '@/components';
import { act, fireEvent, render } from '@testing-library/react-native';
import { withStoreProvider } from '../../../../__mocks__/utils/mockStore';
import { EmitterSubscription, Linking } from 'react-native';

jest.mock('@/store/api', () => ({
  ...jest.requireActual('@/store/api'),
  useGetDealsAccountsQuery: () => [jest.fn(), { data: [], isLoading: false }]
}));

jest.mock('@/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) =>
    selector({
      market: { categories: ['Stocks', 'Crypto'] },
      portfolio: {
        userInfo: { id: 1 },
        selectedAccount: 1,
        tradingAssets: []
      },
      wallet: {
        stateaccountTypeId: 199
      }
    }),
  useIOSConfig: () => false,
  useCommonStyles: () => ({
    shadow6Style: {}
  })
}));

beforeAll(() => {
  jest.spyOn(Linking, 'addEventListener').mockImplementation((_type, _handler) => {
    return {
      remove: jest.fn()
    } as unknown as EmitterSubscription;
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('BaseMarketTabs', () => {
  it('renders tabs and handles press', async () => {
    const onTabPressed = jest.fn();
    const { getByText } = render(
      withStoreProvider(
        <BaseMarketTabs assetCategory='Stocks' onTabPressed={onTabPressed} additionalCategories={['ETFs']} />
      )
    );

    const tab = getByText('ETFs');
    fireEvent.press(tab);

    await act(async () => {
      fireEvent.press(getByText('Stocks'));
    });
  });

  it('does not call onTabPressed when same tab is pressed', async () => {
    const onTabPressed = jest.fn();
    const { getByText } = render(
      withStoreProvider(<BaseMarketTabs assetCategory='Stocks' onTabPressed={onTabPressed} />)
    );

    const tab = getByText('Stocks');

    onTabPressed.mockClear();

    fireEvent.press(tab);

    expect(onTabPressed).not.toHaveBeenCalled();
  });
});

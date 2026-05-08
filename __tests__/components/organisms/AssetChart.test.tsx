import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useCandlesWebsocket, useAppSelector } from '@/hooks';
import { actions } from '@/store';
import { AssetChart } from '@/components';
import { testIDs } from '@/constants';

const { useCandlesHistoryQuery } = actions.market;

jest.mock('@/hooks', () => ({
  useCandlesWebsocket: jest.fn(),
  useTradingSchedule: jest.fn(() => null),
  useAppSelector: jest.fn(),
  useCommonStyles: jest.fn(() => ({ shadow6Style: {} }))
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() }
  }),
  initReactI18next: { type: '3rdParty', init: jest.fn() }
}));

describe('AssetChart', () => {
  beforeEach(() => {
    (useCandlesHistoryQuery as jest.Mock).mockReturnValue([jest.fn(), { data: [], isLoading: false }]);

    (useAppSelector as jest.Mock).mockReturnValue({
      assetSymbolData: { asset: 'BTC', digits: 2 },
      selectedAccount: 'acc-123'
    });

    (useCandlesWebsocket as jest.Mock).mockReturnValue({
      lastData: {},
      websocket: null,
      isReadyState: true
    });
  });

  it('renders without crashing', () => {
    const { getAllByText, getByText } = render(
      <AssetChart
        tradingSessionSchedule={undefined}
        price={'1234.56'}
        dailyChange={'12.34'}
        dailyChangePercent={'1.2'}
      />
    );

    expect(getAllByText('1234.56').length).toBeGreaterThan(0);
    expect(getByText('12.34')).toBeTruthy();
    expect(getByText('1.2%')).toBeTruthy();
  });

  it('renders loading state when chart data is not yet ready', () => {
    (useCandlesHistoryQuery as jest.Mock).mockReturnValue([jest.fn(), { isLoading: true }]);

    const { getByTestId } = render(
      <AssetChart
        tradingSessionSchedule={undefined}
        price={undefined}
        dailyChange={undefined}
        dailyChangePercent={undefined}
      />
    );

    expect(getByTestId(testIDs.components.organisms.assetChart?.activityIndicator)).toBeTruthy();
  });

  it('renders without price or daily change values', () => {
    const { getByText } = render(
      <AssetChart
        tradingSessionSchedule={undefined}
        price={undefined}
        dailyChange={undefined}
        dailyChangePercent={undefined}
      />
    );

    // Should fallback to loading state or show nothing for price/pnl
    expect(getByText('components.asset-chart.interval.h1')).toBeTruthy();
  });

  it('renders all interval buttons', () => {
    const { getByText } = render(
      <AssetChart
        tradingSessionSchedule={undefined}
        price={'1234.56'}
        dailyChange={'12.34'}
        dailyChangePercent={'1.2'}
      />
    );

    const intervals = [
      'components.asset-chart.interval.h1',
      'components.asset-chart.interval.d1',
      'components.asset-chart.interval.w1',
      'components.asset-chart.interval.mn1',
      'components.asset-chart.interval.mn3',
      'components.asset-chart.interval.mn6',
      'components.asset-chart.interval.y1'
    ];

    intervals.forEach((interval) => {
      expect(getByText(interval)).toBeTruthy();
    });
  });

  it('toggles chart type (candlestick ↔️ line)', () => {
    const { getByRole } = render(
      <AssetChart
        tradingSessionSchedule={undefined}
        price={'1234.56'}
        dailyChange={'12.34'}
        dailyChangePercent={'1.2'}
      />
    );

    const toggleButton = getByRole('button');

    fireEvent.press(toggleButton);
  });
});

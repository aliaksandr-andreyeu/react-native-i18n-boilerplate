import { render } from '@testing-library/react-native';
import { Signals } from '@/store/slices/market/types';
import { SignalInfoPrices } from '@/components';

jest.mock('@/hooks', () => ({
  useCommonStyles: () => ({ shadow6Style: {} })
}));

const mockData: Signals = {
  Report: {
    expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    confidence: 85,
    action: 0,
    buy_entry_target_1: 1.2345,
    buy_target_1: 1.3456,
    sell_entry_target_1: 1.1111,
    sell_target_1: 1.2222,
    stop: 1.1111
  },
  Product: {
    lastTick: {
      digits: 4
    }
  }
} as any;

describe('SignalInfoPrices', () => {
  it('renders signal values and labels', () => {
    const { getByText } = render(<SignalInfoPrices data={mockData} potentialLoss='100' expectedProfit='300' />);

    expect(getByText('roi')).toBeTruthy();
    expect(getByText('from')).toBeTruthy();
    expect(getByText('to')).toBeTruthy();
    expect(getByText('expires-in')).toBeTruthy();
    expect(getByText('confidence')).toBeTruthy();
    expect(getByText('high')).toBeTruthy();
    expect(getByText('potential-loss, USD')).toBeTruthy();
    expect(getByText('expected-profit, USD')).toBeTruthy();
    expect(getByText('100.00')).toBeTruthy();
    expect(getByText('300.00')).toBeTruthy();
  });

  it('does not render pnl section if hide is true and props are empty', () => {
    const { queryByText } = render(<SignalInfoPrices data={mockData} hide />);
    expect(queryByText('potential-loss, USD')).toBeNull();
    expect(queryByText('expected-profit, USD')).toBeNull();
  });

  it('renders pnl section if hide is true but props exist', () => {
    const { getByText } = render(<SignalInfoPrices data={mockData} hide potentialLoss='50' expectedProfit='150' />);
    expect(getByText('potential-loss, USD')).toBeTruthy();
    expect(getByText('expected-profit, USD')).toBeTruthy();
    expect(getByText('50.00')).toBeTruthy();
    expect(getByText('150.00')).toBeTruthy();
  });
});

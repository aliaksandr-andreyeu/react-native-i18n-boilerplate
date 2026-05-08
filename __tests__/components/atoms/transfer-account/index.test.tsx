import { BaseTransferAccount } from '@/components';
import { render, fireEvent } from '@testing-library/react-native';

const defaultProps = {
  id: '123',
  title: 'Primary Wallet',
  balance: '1000.00',
  color: '#00FF00',
  isDropDown: false,
  isSelected: true,
  selectable: true,
  onPress: jest.fn()
};

describe('BaseTransferAccount', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, id, and balance correctly', () => {
    const { getByTestId } = render(<BaseTransferAccount {...defaultProps} />);

    expect(getByTestId('transfer-account-title')).toBeTruthy();
    expect(getByTestId('transfer-account-balance')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(<BaseTransferAccount {...defaultProps} />);

    fireEvent.press(getByTestId('transfer-account-touchable'));
    expect(defaultProps.onPress).toHaveBeenCalled();
  });

  it('does not call onPress when disabled', () => {
    const { getByTestId } = render(<BaseTransferAccount {...defaultProps} disable />);

    fireEvent.press(getByTestId('transfer-account-touchable'));
    expect(defaultProps.onPress).not.toHaveBeenCalled();
  });

  it('renders checkmark when selectable and selected', () => {
    const { getByTestId } = render(<BaseTransferAccount {...defaultProps} />);

    expect(getByTestId('transfer-account-checkmark')).toBeTruthy();
  });

  it('does not render checkmark when not selected', () => {
    const { queryByTestId } = render(<BaseTransferAccount {...defaultProps} isSelected={false} />);

    expect(queryByTestId('transfer-account-checkmark')).toBeNull();
  });

  it('does not render checkmark when not selectable', () => {
    const { queryByTestId } = render(<BaseTransferAccount {...defaultProps} selectable={false} />);

    expect(queryByTestId('transfer-account-checkmark')).toBeNull();
  });
});

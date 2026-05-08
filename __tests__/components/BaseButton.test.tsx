import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { BaseButton, BaseButtonType, BaseButtonSize } from '@/components';

const mock_label = 'Click Me';

describe('BaseButton Component', () => {
  const mockOnPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with a label', () => {
    const { getByText } = render(<BaseButton label={mock_label} onPress={mockOnPress} />);
    expect(getByText(mock_label)).toBeTruthy();
  });

  it('calls onPress when not loading', () => {
    const { getByText } = render(<BaseButton label={mock_label} onPress={mockOnPress} />);
    fireEvent.press(getByText(mock_label));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const { getByTestId } = render(<BaseButton label={mock_label} loading={true} onPress={mockOnPress} />);
    fireEvent.press(getByTestId('base-button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders a loading spinner when loading', () => {
    const { getByTestId } = render(<BaseButton label={mock_label} loading={true} />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('applies fullWidth style when fullWidth prop is true', () => {
    const { getByTestId } = render(<BaseButton label={mock_label} fullWidth={true} />);
    expect(getByTestId('base-button')).toHaveStyle({ width: '100%' });
  });

  it('renders correctly with different button types', () => {
    const { getByTestId } = render(<BaseButton label='Primary' type={BaseButtonType.primary} />);
    expect(getByTestId('base-button')).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('renders correctly with different sizes', () => {
    const { getByTestId } = render(<BaseButton label='Large Button' size={BaseButtonSize.large} />);
    expect(getByTestId('base-button')).toHaveStyle({ height: BaseButtonSize.large });
  });
});

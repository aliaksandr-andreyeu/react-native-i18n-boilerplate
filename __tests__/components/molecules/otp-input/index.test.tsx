import React, { createRef } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OtpInput, { OtpInputRefMethods } from '@/components/molecules/otp-input';
import { useTheme } from '@react-navigation/native';

describe('OtpInput', () => {
  it('renders six input fields', () => {
    const { getByTestId } = render(<OtpInput hasError={false} />);
    for (let i = 0; i < 6; i++) {
      expect(getByTestId(`otp-input-${i}`)).toBeTruthy();
    }
  });

  it('calls onChange with correct value', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<OtpInput hasError={false} onChange={onChange} />);

    fireEvent.changeText(getByTestId('otp-input-0'), '1');
    fireEvent.changeText(getByTestId('otp-input-1'), '2');

    expect(onChange).toHaveBeenCalledWith('12');
  });

  it('supports clearing and setting value via ref', () => {
    const ref = createRef<OtpInputRefMethods>();
    const { getByTestId } = render(<OtpInput hasError={false} ref={ref} />);

    // Set value
    ref.current?.setValue('123456');
    expect(ref.current?.getValue()).toBe('123456');

    // Clear value
    ref.current?.clear();
    expect(ref.current?.getValue()).toBe('');
  });

  it('applies error border color when hasError is true', () => {
    const { getByTestId } = render(<OtpInput hasError />);
    const input = getByTestId('otp-input-0');

    const inputStyle = Array.isArray(input.props.style) ? Object.assign({}, ...input.props.style) : input.props.style;

    const theme = useTheme();
    expect(inputStyle.borderColor).toBe(theme.palette.red['600']);
  });
});

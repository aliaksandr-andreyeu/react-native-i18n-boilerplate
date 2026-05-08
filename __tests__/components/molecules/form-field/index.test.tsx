import React from 'react';
import { render } from '@testing-library/react-native';
import BaseFormField from '../../../../src/components/molecules/form-field';

jest.mock('@/components', () => {
  const { TextInput, Text } = require('react-native');
  return {
    BaseInput: (props: any) => <TextInput testID='base-input' {...props} />,
    BaseText: ({ children, style }: any) => <Text style={style}>{children}</Text>
  };
});

const label = 'Email Address';
const error = 'Invalid email';

describe('BaseFormField', () => {
  it('renders label when provided', () => {
    const { getByText } = render(<BaseFormField label={label} />);
    expect(getByText(label)).toBeTruthy();
  });

  it('renders error message when provided', () => {
    const { getByText } = render(<BaseFormField error={error} />);
    expect(getByText(error)).toBeTruthy();
  });

  it('renders BaseInput with passed props', () => {
    const { getByTestId } = render(<BaseFormField value='test@example.com' />);
    const input = getByTestId('base-input');
    expect(input.props.value).toBe('test@example.com');
  });
});

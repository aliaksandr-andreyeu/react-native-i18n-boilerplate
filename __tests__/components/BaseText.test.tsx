import React from 'react';
import { BaseText, BaseTextVariant } from '@/components';
import { render } from '@testing-library/react-native';

describe('BaseText Component', () => {
  it('renders correctly with default props', () => {
    const mock_text = 'Default Text';
    const { getByText } = render(<BaseText>{mock_text}</BaseText>);
    const textElement = getByText(mock_text);
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toContainEqual(BaseTextVariant.text);
  });

  it('renders correctly with a specific variant', () => {
    const mock_text = 'Title Text';
    const { getByText } = render(<BaseText variant={BaseTextVariant.title}>{mock_text}</BaseText>);
    const textElement = getByText(mock_text);
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toContainEqual(BaseTextVariant.title);
  });

  it('renders correctly with the italic prop', () => {
    const mock_text = 'Italic Text';
    const { getByText } = render(<BaseText italic>{mock_text}</BaseText>);
    const textElement = getByText(mock_text);
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toContainEqual({ fontStyle: 'italic' });
  });

  it('applies additional styles passed via the style prop', () => {
    const additionalStyle = { color: 'red' };
    const mock_text = 'Styled Text';
    const { getByText } = render(<BaseText style={additionalStyle}>{mock_text}</BaseText>);
    const textElement = getByText(mock_text);
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toContainEqual(additionalStyle);
  });
});

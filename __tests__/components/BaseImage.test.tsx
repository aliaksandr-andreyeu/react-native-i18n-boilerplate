import React from 'react';
import { BaseImage } from '@/components';
import { ImageStyle } from 'react-native';
import { render } from '@testing-library/react-native';

// ✅ Mock FastImage as regular Image
jest.mock('react-native-fast-image', () => {
  const { Image } = require('react-native');
  return {
    __esModule: true,
    default: Image
  };
});

describe('BaseImage Component', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<BaseImage testID='default-image-props' />);
    const image = getByTestId('default-image-props');
    expect(image).toBeTruthy();
  });

  it('applies additional styles passed via the style prop', () => {
    const customStyle: ImageStyle = { width: 100, height: 100, backgroundColor: 'red' };
    const { getByTestId } = render(<BaseImage testID='custom-style-image' style={customStyle} />);
    const image = getByTestId('custom-style-image');
    expect(image.props.style).toMatchObject(customStyle);
  });

  it('should render the BaseImage component with correct source', () => {
    const source = { uri: 'example source' };
    const { getByTestId } = render(<BaseImage testID='example-source-image' source={source} />);
    const image = getByTestId('example-source-image');
    expect(image.props.source?.uri).toBe('example source');
  });

  it('should have the correct accessibility label', () => {
    const { getByLabelText } = render(<BaseImage accessibilityLabel='Image' />);
    const image = getByLabelText('Image');
    expect(image).toBeTruthy();
  });
});

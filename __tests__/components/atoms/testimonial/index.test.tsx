import { render } from '@testing-library/react-native';
import { SharedValue } from 'react-native-reanimated';
import { Testimonial } from '@/components';
import { images } from '@/assets';

const mockAnim: Partial<SharedValue<number>> = {
  addListener: jest.fn(),
  removeListener: jest.fn()
};

const props = {
  description: 'This is a testimonial description.',
  title: 'Jane Doe',
  image: '',
  anim: mockAnim as SharedValue<number>,
  index: 0,
  id: 1
};

jest.mock('@/components/atoms/image', () => {
  const React = require('react');
  const { Image } = require('react-native');

  return ({ testID, source, style }: { testID: string; source: any; style?: any }) => (
    <Image testID={testID} source={source} style={style} />
  );
});

describe('Testimonial', () => {
  it('renders title, description and gradient', () => {
    const { getByTestId } = render(<Testimonial {...props} />);

    expect(getByTestId('testimonial-title').props.children).toBe('Jane Doe');
    expect(getByTestId('testimonial-description').props.children).toBe('This is a testimonial description.');
    expect(getByTestId('testimonial-gradient')).toBeTruthy();
  });

  it('renders fallback image when no image is provided', () => {
    const { getByTestId } = render(<Testimonial {...props} />);
    const source = getByTestId('testimonial-image').props.source;

    expect(source).toEqual(images.userImage);
  });

  it('renders custom image when image prop is provided', () => {
    const customProps = {
      ...props,
      image: 'https://example.com/avatar.jpg'
    };

    const { getByTestId } = render(<Testimonial {...customProps} />);
    const source = getByTestId('testimonial-image').props.source;

    expect(source).toEqual({ uri: 'https://example.com/avatar.jpg' });
  });
});

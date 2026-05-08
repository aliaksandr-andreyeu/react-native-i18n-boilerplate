import React from 'react';
import { render } from '@testing-library/react-native';
import { InfoBlockElement, InfoBlockIcon } from '@/store/slices/ideas-hub/types';
import { BaseInfoBlock } from '@/components';

// Mock BaseText and BaseImage
jest.mock('@/components/atoms', () => {
  const React = require('react');
  const { Text, Image } = require('react-native');
  return {
    BaseText: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    BaseImage: (props: any) => <Image {...props} />,
    BaseTextVariant: {}
  };
});

// Mock common style hooks
jest.mock('@/hooks', () => ({
  useCommonStyles: () => ({ shadow6Style: {} })
}));

// Mock useTheme
jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    palette: {
      base: { white: '#FFFFFF' },
      graphite: { '900': '#000000' }
    },
    dark: false
  })
}));

describe('BaseInfoBlock', () => {
  const blockElements: InfoBlockElement[] = [
    {
      id: 1,
      primaryText: 'Step 1 Title',
      secondaryText: 'Step 1 Description'
    },
    {
      id: 2,
      primaryText: '',
      secondaryText: 'Step 2 Only Description'
    }
  ];

  const promoIcons: InfoBlockIcon[] = [
    {
      infoBlockElementId: 1,
      url: 'https://example.com/icon.png'
    }
  ];

  it('renders title and elements with numbers', () => {
    const { getByText } = render(
      <BaseInfoBlock
        bgColor='#F0F0F0'
        blockElements={blockElements}
        bulletPointStyle='numbers'
        type='simple'
        title='Test Block Title'
        promoIcons={[]}
      />
    );

    expect(getByText('Test Block Title')).toBeTruthy();
    expect(getByText('Step 1 Title')).toBeTruthy();
    expect(getByText('Step 1 Description')).toBeTruthy();
    expect(getByText('Step 2 Only Description')).toBeTruthy();
  });

  it('renders icons instead of numbers when bulletPointStyle is "icons"', () => {
    const { getByText, getByTestId } = render(
      <BaseInfoBlock
        bgColor='#F0F0F0'
        blockElements={blockElements}
        bulletPointStyle='icons'
        type='with-border'
        borderColor='blue'
        title='Test With Icons'
        promoIcons={promoIcons}
      />
    );

    expect(getByText('Test With Icons')).toBeTruthy();
    expect(getByText('Step 1 Title')).toBeTruthy();
    expect(getByText('Step 1 Description')).toBeTruthy();
    expect(getByText('Step 2 Only Description')).toBeTruthy();

    expect(getByTestId('info-block-image-1')).toBeTruthy();
  });
});

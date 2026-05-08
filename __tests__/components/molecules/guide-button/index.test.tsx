import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BaseGuideButton from '../../../../src/components/molecules/guide-button';
import { SvgXmlIconNames } from '@/assets';

jest.mock('@/components/atoms', () => {
  const { Text } = require('react-native');
  return {
    BaseText: ({ children }: any) => <Text>{children}</Text>,
    BaseTextVariant: { titleXXS: 'titleXXS' }
  };
});

jest.mock('@/assets', () => {
  const { Text } = require('react-native');
  return {
    SvgIcon: ({ name }: any) => <Text>{name}</Text>,
    SvgXmlIconNames: {
      glasses: 'glasses',
      questionCircle: 'questionCircle',
      star: 'star'
    },
    IconSize: { md: 24, sm: 16 }
  };
});

jest.mock('@/hooks', () => ({
  useCommonStyles: () => ({
    shadow6Style: {}
  })
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    palette: {
      base: { white: '#fff' },
      purple: { 800: '#800080' },
      graphite: { 900: '#111' }
    }
  })
}));

describe('BaseGuideButton', () => {
  it('renders title and icons', () => {
    const { getByText } = render(<BaseGuideButton title='Learn More' onPress={jest.fn()} />);
    expect(getByText('Learn More')).toBeTruthy();
    expect(getByText('glasses')).toBeTruthy();
    expect(getByText('questionCircle')).toBeTruthy();
  });

  it('renders custom icons when passed', () => {
    const { getAllByText, getByText } = render(
      <BaseGuideButton
        title='Help'
        onPress={jest.fn()}
        leftIcon={'star' as SvgXmlIconNames}
        rightIcon={'star' as SvgXmlIconNames}
      />
    );
    expect(getByText('Help')).toBeTruthy();
    expect(getAllByText('star')).toHaveLength(2); // both icons are 'star'
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(<BaseGuideButton title='Click me' onPress={mockPress} />);
    fireEvent.press(getByText('Click me'));
    expect(mockPress).toHaveBeenCalled();
  });
});

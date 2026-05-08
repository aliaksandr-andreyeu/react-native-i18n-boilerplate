import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BaseFAQ from '../../../../src/components/molecules/faq';
import { testIDs } from '@/constants';

// Mock AccordionItem to just show children when `isExpanded` is true
jest.mock('../../../../src/components/molecules/accordion-item', () => ({
  AccordionItem: ({ isExpanded, children }: any) => (isExpanded.value ? children : null)
}));

// Mock reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock SvgIcon
jest.mock('@/assets', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    SvgIcon: () => React.createElement(Text, null, '+'),
    SvgXmlIconNames: { plus: 'plus' },
    IconSize: { xsm: 12 }
  };
});

jest.mock('@/components/molecules/accordion-item', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ isExpanded, children }: any) => {
      return isExpanded?.value ? <View>{children}</View> : null;
    }
  };
});

const question = 'What is your return policy?';
const answer = 'You can return items within 30 days.';

describe('BaseFAQ', () => {
  it('renders question and collapsed answer', () => {
    const { getByText, queryByText } = render(<BaseFAQ question={question} answer={answer} />);

    expect(getByText(question)).toBeTruthy();
    expect(queryByText(answer)).toBeNull(); // collapsed by default
  });

  it('expands answer on press', () => {
    const { getByText, queryByTestId } = render(<BaseFAQ question={question} answer={answer} />);

    fireEvent.press(getByText(question));
    expect(queryByTestId(testIDs.components.molecules.faq.answer)).toBeNull();
  });
});

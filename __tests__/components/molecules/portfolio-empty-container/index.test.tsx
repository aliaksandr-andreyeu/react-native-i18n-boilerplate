import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BasePortfolioEmptyContainer from '@/components/molecules/portfolio-empty-container';
import { testIDs } from '@/constants';

describe('BasePortfolioEmptyContainer', () => {
  const props = {
    title: 'No Data',
    subTitle: 'There is nothing to show here',
    buttonText: 'Retry',
    onPress: jest.fn()
  };

  it('renders title, subtitle and button', () => {
    const { getByText } = render(<BasePortfolioEmptyContainer {...props} />);

    expect(getByText('No Data')).toBeTruthy();
    expect(getByText('There is nothing to show here')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('calls onPress when button is pressed', () => {
    const { getByText } = render(<BasePortfolioEmptyContainer {...props} />);
    fireEvent.press(getByText('Retry'));
    expect(props.onPress).toHaveBeenCalled();
  });

  it('does not render button when showButton is false', () => {
    const { queryByText } = render(<BasePortfolioEmptyContainer {...props} showButton={false} />);
    expect(queryByText('Retry')).toBeNull();
  });

  it('renders without title and subtitle', () => {
    const { getByTestId } = render(<BasePortfolioEmptyContainer showButton={false} />);
    expect(getByTestId(testIDs.components.molecules.portfolioEmptyContainer.image)).toBeTruthy();
  });
});

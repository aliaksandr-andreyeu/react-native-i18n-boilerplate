import React from 'react';
import { render } from '@testing-library/react-native';
import { PlaceBar } from '@/components';

describe('PlaceBar', () => {
  it('renders place, price, and performance', () => {
    const { getByText } = render(<PlaceBar place={4} price={1000} performance={12.5} width={200} />);

    expect(getByText('4')).toBeTruthy();
    expect(getByText('$1000.00')).toBeTruthy();
    expect(getByText('12.50%')).toBeTruthy();
  });

  it('renders image for top 3 places', () => {
    const { getByTestId } = render(<PlaceBar place={1} price={5000} performance={20} width={200} isMe />);
    expect(getByTestId('PlaceBaseImage')).toBeTruthy();
  });

  it('shows "you" badge when isMe is true', () => {
    const { getByText } = render(<PlaceBar place={5} price={1200} performance={8} width={200} isMe />);
    expect(getByText(/you/i)).toBeTruthy();
  });
});

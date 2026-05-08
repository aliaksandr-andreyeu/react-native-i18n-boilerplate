import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { WelcomeBanner } from '@/components';

describe('WelcomeBanner', () => {
  const onUnlockPress = jest.fn();

  it('renders welcome message and unlock button', () => {
    const { getByText, getByTestId } = render(<WelcomeBanner bonus={25} onUnlockPress={onUnlockPress} />);

    expect(getByText('welcome-account')).toBeTruthy();
    expect(getByText('complete')).toBeTruthy();
    expect(getByText('unlock')).toBeTruthy();

    // help-text is passed to BaseHelpButton, but not rendered visibly
    expect(getByTestId('BaseHelpButton')).toBeTruthy();
    expect(getByTestId('base-button')).toBeTruthy();
  });

  it('triggers onUnlockPress when button is pressed', () => {
    const { getByText } = render(<WelcomeBanner bonus={25} onUnlockPress={onUnlockPress} />);

    fireEvent.press(getByText('unlock'));
    expect(onUnlockPress).toHaveBeenCalled();
  });
});

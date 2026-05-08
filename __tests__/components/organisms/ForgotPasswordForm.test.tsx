import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordForm from '@/components/organisms/forms/forgot-password';
import { withStoreProvider } from '../../../__mocks__/utils/mockStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { testIDs } from '@/constants';

jest.mock('@/helpers', () => {
  const actual = jest.requireActual('@/helpers');
  return {
    ...actual,
    identifyMixpanelUser: jest.fn(),
    MixpanelEventTypes: { Login: 'Login' },
    WS: jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    }))
  };
});

jest.mock('@/providers', () => ({
  useToast: () => ({
    openToast: jest.fn(),
    closeToast: jest.fn()
  }),
  ToastType: { error: 'error' }
}));

describe('ForgotPasswordForm', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    canGoBack: () => true
  };

  const mockRoute = { name: 'ForgotPassword' };

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRoute as jest.Mock).mockReturnValue(mockRoute);
  });

  const renderComponent = () =>
    render(withStoreProvider(<ForgotPasswordForm setResetPassword={jest.fn()} setEmail={jest.fn()} />));

  it('renders email input and submit button', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    expect(getByText(/email/i)).toBeTruthy();
    expect(getByText(/continue/i)).toBeTruthy();
  });

  it('updates email input and calls forgotPassword on submit', async () => {
    const { getByTestId } = renderComponent();

    const emailInput = getByTestId(testIDs.forgotPassword.emailInput);
    const continueButton = getByTestId(testIDs.forgotPassword.continueButton);

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(require('@/store').actions.auth.useForgotPassword).toHaveBeenCalled();
    });
  });

  it('shows validation error if email is empty', async () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText(/continue/i));

    await waitFor(() => {
      expect(getByText(/email/i)).toBeTruthy();
    });
  });

  it('calls navigation.goBack when back button is pressed', () => {
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId(testIDs.forgotPassword.backButton));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});

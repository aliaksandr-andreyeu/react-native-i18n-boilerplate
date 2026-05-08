import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { testIDs } from '@/constants';
import { withStoreProvider } from '../../../__mocks__/utils/mockStore';
import { ResetPasswordForm } from '@/components';

const mockSetResetPassword = jest.fn();

describe('ResetPasswordForm', () => {
  const email = 'user@example.com';

  const renderComponent = () =>
    render(withStoreProvider(<ResetPasswordForm email={email} setResetPassword={mockSetResetPassword} />));

  it('renders title and description', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId(testIDs.resetPassword.title)).toBeTruthy();
    expect(getByTestId(testIDs.resetPassword.desc)).toBeTruthy();
  });

  it('shows validation errors when fields are empty and submit is pressed', async () => {
    const { getByTestId, getByText } = renderComponent();
    fireEvent.press(getByTestId(testIDs.resetPassword.submitButton));

    await waitFor(() => {
      expect(getByText(/pin/i)).toBeTruthy();
    });
  });

  it('renders all required input fields and submit button', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId(testIDs.resetPassword.pinInput)).toBeTruthy();
    expect(getByTestId(testIDs.resetPassword.passwordInput)).toBeTruthy();
    expect(getByTestId(testIDs.resetPassword.confirmPasswordInput)).toBeTruthy();
    expect(getByTestId(testIDs.resetPassword.submitButton)).toBeTruthy();
  });

  it('calls setResetPassword(false) when back button is pressed', () => {
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId(testIDs.resetPassword.backButton));
    expect(mockSetResetPassword).toHaveBeenCalledWith(false);
  });
});

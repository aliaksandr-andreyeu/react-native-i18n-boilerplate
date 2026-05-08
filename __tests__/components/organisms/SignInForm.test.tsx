import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { testIDs } from '@/constants';
import { withStoreProvider } from '../../../__mocks__/utils/mockStore';
import { useNavigation } from '@react-navigation/native';
import SignInForm from '@/components/organisms/forms/signin';

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

describe('SignInForm', () => {
  const mockNavigate = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  const renderComponent = (props = {}) =>
    render(
      withStoreProvider(
        <SignInForm error='' rememberMe={false} setError={mockSetError} commonLoading={false} {...props} />
      )
    );

  it('renders email and password fields', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId(testIDs.signin.email)).toBeTruthy();
    expect(getByTestId(testIDs.signin.password)).toBeTruthy();
    expect(getByTestId(testIDs.signin.rememberMe)).toBeTruthy();
    expect(getByTestId(testIDs.signin.submit)).toBeTruthy();
  });

  it('toggles the rememberMe checkbox', () => {
    const { getByTestId } = renderComponent();

    const checkbox = getByTestId(testIDs.signin.rememberMe);
    fireEvent.press(checkbox);
  });
  it('calls signIn with form data', async () => {
    const { getByTestId } = renderComponent();

    fireEvent.changeText(getByTestId(testIDs.signin.email), 'test@mail.com');
    fireEvent.changeText(getByTestId(testIDs.signin.password), '12345678');
    fireEvent.press(getByTestId(testIDs.signin.submit));

    await waitFor(() => {
      expect(require('@/store').actions.auth.useSignIn).toHaveBeenCalled();
    });
  });

  it('shows validation errors if email is empty', async () => {
    const { getByTestId, getByText } = renderComponent();

    fireEvent.changeText(getByTestId(testIDs.signin.password), '12345678');
    fireEvent.press(getByTestId(testIDs.signin.submit));

    await waitFor(() => {
      expect(getByText(/email/i)).toBeTruthy(); // i18n text
    });
  });
});

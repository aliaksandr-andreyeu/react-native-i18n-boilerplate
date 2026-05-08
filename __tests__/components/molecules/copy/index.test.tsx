import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { BaseCopy } from '@/components';
import { testIDs } from '@/constants';

jest.useFakeTimers();
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

describe('BaseCopy', () => {
  const mockCopyText = 'Hello World!';
  const mockToastText = 'Copied!';
  const mockText = testIDs.components.molecules.copy.button('Copy this');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if `copy` is empty', () => {
    const { toJSON } = render(<BaseCopy copy='' text='Some text' toastText='Copied' />);
    expect(toJSON()).toBeNull();
  });

  it('renders copy button with text', () => {
    const { getByText } = render(<BaseCopy copy={mockCopyText} text={mockText} toastText={mockToastText} />);
    expect(getByText(mockText)).toBeTruthy();
  });

  it('copies text to clipboard on press', () => {
    const { getByText } = render(<BaseCopy copy={mockCopyText} text={mockText} toastText={mockToastText} />);

    fireEvent.press(getByText(mockText));
    expect(Clipboard.setString).toHaveBeenCalledWith(mockCopyText);
  });

  it('displays toast when copied and dismisses on toast press', () => {
    const { getByText } = render(<BaseCopy copy={mockCopyText} text={mockText} toastText={mockToastText} />);

    act(() => {
      fireEvent.press(getByText(mockText));
      jest.advanceTimersByTime(100); // simulate animation start
    });

    const toast = getByText(mockText);
    expect(toast).toBeTruthy();

    act(() => {
      fireEvent.press(toast);
    });
  });
});

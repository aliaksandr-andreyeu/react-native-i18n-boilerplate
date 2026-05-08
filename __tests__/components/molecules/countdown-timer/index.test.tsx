import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import dayjs from 'dayjs';
import { CountdownTimer } from '@/components';

jest.useFakeTimers();
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

describe('CountdownTimer', () => {
  it('renders hours, minutes, and seconds blocks when less than 1 day left', () => {
    const futureTime = dayjs().add(1, 'minute');
    const { getByTestId } = render(<CountdownTimer time={futureTime} />);

    expect(getByTestId('timeblock-hours')).toBeTruthy();
    expect(getByTestId('timeblock-minutes')).toBeTruthy();
    expect(getByTestId('timeblock-seconds')).toBeTruthy();
  });

  it('renders days block when more than 1 day left', () => {
    const futureTime = dayjs().add(2, 'day');
    const { getByTestId } = render(<CountdownTimer time={futureTime} />);

    expect(getByTestId('timeblock-days')).toBeTruthy();
  });

  it('calls onFinished when countdown ends', async () => {
    const onFinished = jest.fn();
    const futureTime = dayjs().add(1, 'second');

    render(<CountdownTimer time={futureTime} onFinished={onFinished} />);

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onFinished).toHaveBeenCalled();
    });
  });
});

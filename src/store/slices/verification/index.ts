import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  remainingSeconds: 0
};

export const verificationSlice = createSlice({
  initialState,
  name: 'verification',
  reducers: {
    decrementRemainingSeconds: (state) => {
      const seconds = state.remainingSeconds;
      state.remainingSeconds = seconds > 0 ? seconds - 1 : 0;
    },
    startCountdown: (state) => {
      state.remainingSeconds = 60;
    },
    resetCountdown: (state) => {
      state.remainingSeconds = 0;
    },
    setCountdown: (state, { payload }) => {
      state.remainingSeconds = payload;
    }
  }
});

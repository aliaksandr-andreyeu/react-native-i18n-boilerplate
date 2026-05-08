import { createSlice } from '@reduxjs/toolkit';
import { InitialState } from './types';

const initialState: InitialState = {
  lastBackupCodes: []
};
export const profileSlice = createSlice({
  initialState,
  name: 'profile',
  reducers: {
    setLastBackUpCodes: (state, { payload }) => {
      state.lastBackupCodes = payload;
    }
  }
});

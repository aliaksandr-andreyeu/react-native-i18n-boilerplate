import { createSlice } from '@reduxjs/toolkit';
import { InitialState } from './types';

const initialState: InitialState = {
  topSignalKeys: [],
  topPerformerKeys: []
};
export const pulseSlice = createSlice({
  initialState,
  name: 'pulse',
  reducers: {
    setTopPerformerKeys: (state, { payload }) => {
      state.topPerformerKeys = payload;
    },
    setTopSignalKeys: (state, { payload }) => {
      state.topSignalKeys = payload;
    }
  }
});

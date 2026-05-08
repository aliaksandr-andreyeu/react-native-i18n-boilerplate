import { createSlice } from '@reduxjs/toolkit';
import { InitialState } from './types';

const initialState: InitialState = {
  referralCode: ''
};
export const amegaSlice = createSlice({
  initialState,
  name: 'amega',
  reducers: {
    setProfileReferralCode: (state, { payload }) => {
      state.referralCode = payload;
    }
  }
});

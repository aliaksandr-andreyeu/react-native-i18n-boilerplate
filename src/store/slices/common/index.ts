import { createSlice } from '@reduxjs/toolkit';
import { CommonState } from './types';
import Config from 'react-native-config';

const {
  MIN_INVESTMENT_AMOUNT,
  WALLET_TYPE_ID,
  LIVE_TYPE_ID,
  PRIMARY_TYPE_ID,
  CASHBACK_TYPE_ID,
  PRIMARY_ACCOUNT_LEVERAGE,
  WALLET_LEVERAGE
} = Config || {};

const initialState: CommonState = {
  config: {
    trading: {
      minInvestmentAmount: Number(MIN_INVESTMENT_AMOUNT),
      walletTypeIds: [Number(WALLET_TYPE_ID)],
      accountTypeIds: [Number(LIVE_TYPE_ID)],
      primaryAccount: Number(PRIMARY_TYPE_ID),
      primaryAccountLeverage: Number(PRIMARY_ACCOUNT_LEVERAGE),
      walletLeverage: Number(WALLET_LEVERAGE)
    },
    cashback: Number(CASHBACK_TYPE_ID),
    socialAuth: {
      android: false,
      ios: false
    },
    skipPhoneVerification: []
  },
  loggedInBefore: false,
  fbInitialUrlChecked: false
};

export const commonSlice = createSlice({
  initialState,
  name: 'common',
  reducers: {
    setFbInitialUrlCheck: (state, { payload }) => {
      state.fbInitialUrlChecked = payload;
    },
    setConfig: (state, { payload }) => {
      state.config = payload || {};
    },
    setUserLoggedInBefore: (state, { payload }) => {
      state.loggedInBefore = Boolean(payload);
    }
  }
});

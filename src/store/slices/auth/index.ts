import { createSlice } from '@reduxjs/toolkit';
import { AuthState } from './types';
import {
  remove2FaCookie,
  setStoredRefreshToken,
  removeStoredRefreshToken,
  removeSawWelcome,
  mixpanel,
  clearUserIdentification,
  branchLogout
} from '@/helpers';

const initialState: AuthState = {
  accessToken: undefined,
  cellExpertId: undefined,
  intercomLoggedIn: false,
  fromLogin: false,
  userState: null,
  seenIntro: false
};

export const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    setSeenIntro: (state, { payload }) => {
      state.seenIntro = payload;
    },
    setUserState: (state, { payload }) => {
      state.userState = payload;
    },
    setCellExpertId: (state, { payload }) => {
      state.cellExpertId = payload;
    },
    setAccessToken: (state, { payload }) => {
      const token = payload || null;

      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ accessToken ', token);

      state.accessToken = token;
    },
    setRefreshToken: (state, { payload }) => {
      const refreshToken = payload || null;

      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ refreshToken ', refreshToken);

      if (refreshToken) {
        setStoredRefreshToken(refreshToken);
      }
    },
    setIntercomLoggedIn: (state, { payload }) => {
      state.intercomLoggedIn = payload;
    },
    logOut: (state) => {
      state.accessToken = null;

      mixpanel.reset();
      removeSawWelcome();
      // removeAuthKeys();
      clearUserIdentification();
      branchLogout();
      removeStoredRefreshToken();
      remove2FaCookie();
    },
    setFromLogin: (state, { payload }) => {
      state.fromLogin = payload;
    }
  }
});

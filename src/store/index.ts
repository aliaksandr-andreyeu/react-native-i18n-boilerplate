import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  authApi,
  customerApi,
  customerTrackApi,
  authActions,
  ideasHubApi,
  ideasHubActions,
  portfolioApi,
  portfolioActions,
  verificationApi,
  verificationActions,
  applicationApi,
  applicationActions,
  sumSubApi,
  sumSubActions,
  portfolioCaApi,
  portfolioCsmApi,
  portfoliomt5Api,
  walletActions,
  walletApi,
  walletMt5Api,
  walletCmsApi,
  marketActions,
  marketMT5Api,
  commonCmsApi,
  commonActions,
  legalDocumentsApi,
  legalDocumentsActions,
  ideasHubClientApi,
  ideasHubPromoApi,
  authMT5Api,
  amegaApi,
  pulseApi,
  pulseActions
} from './api';
import {
  authSlice,
  ideasHubSlice,
  portfolioSlice,
  verificationSlice,
  applicationSlice,
  walletSlice,
  marketSlice,
  commonSlice,
  legalDocumentsSlice,
  profileSlice,
  amegaSlice,
  pulseSlice
} from './slices';
import { profileActions, profileApi } from './api/profile';

const combinedReducer = combineReducers({
  auth: authSlice.reducer,
  ideasHub: ideasHubSlice.reducer,
  portfolio: portfolioSlice.reducer,
  verification: verificationSlice.reducer,
  application: applicationSlice.reducer,
  market: marketSlice.reducer,
  wallet: walletSlice.reducer,
  common: commonSlice.reducer,
  legalDocuments: legalDocumentsSlice.reducer,
  profile: profileSlice.reducer,
  amega: amegaSlice.reducer,
  pulse: pulseSlice.reducer,
  [authMT5Api.reducerPath]: authMT5Api.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [customerTrackApi.reducerPath]: customerTrackApi.reducer,
  [ideasHubApi.reducerPath]: ideasHubApi.reducer,
  [ideasHubClientApi.reducerPath]: ideasHubClientApi.reducer,
  [portfolioApi.reducerPath]: portfolioApi.reducer,
  [portfolioCaApi.reducerPath]: portfolioCaApi.reducer,
  [portfoliomt5Api.reducerPath]: portfoliomt5Api.reducer,
  [verificationApi.reducerPath]: verificationApi.reducer,
  [applicationApi.reducerPath]: applicationApi.reducer,
  [sumSubApi.reducerPath]: sumSubApi.reducer,
  [portfolioCsmApi.reducerPath]: portfolioCsmApi.reducer,
  [marketMT5Api.reducerPath]: marketMT5Api.reducer,
  [walletApi.reducerPath]: walletApi.reducer,
  [walletMt5Api.reducerPath]: walletMt5Api.reducer,
  [walletCmsApi.reducerPath]: walletCmsApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [amegaApi.reducerPath]: amegaApi.reducer,
  [commonCmsApi.reducerPath]: commonCmsApi.reducer,
  [legalDocumentsApi.reducerPath]: legalDocumentsApi.reducer,
  [ideasHubPromoApi.reducerPath]: ideasHubPromoApi.reducer,
  [pulseApi.reducerPath]: pulseApi.reducer
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logOut') {
    /* ****  DON'T ADD "common" STATE ON LOGOUT **** */
    state = {
      ...state,
      auth: undefined,
      application: undefined,
      portfolio: undefined,
      market: undefined,
      ideasHub: undefined,
      verification: undefined,
      wallet: undefined,
      legalDocuments: undefined
    };
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      customerApi.middleware,
      customerTrackApi.middleware,
      ideasHubApi.middleware,
      ideasHubClientApi.middleware,
      verificationApi.middleware,
      portfolioApi.middleware,
      applicationApi.middleware,
      sumSubApi.middleware,
      portfolioCsmApi.middleware,
      portfolioCaApi.middleware,
      portfoliomt5Api.middleware,
      marketMT5Api.middleware,
      walletApi.middleware,
      walletMt5Api.middleware,
      walletCmsApi.middleware,
      profileApi.middleware,
      commonCmsApi.middleware,
      legalDocumentsApi.middleware,
      ideasHubPromoApi.middleware,
      authMT5Api.middleware,
      amegaApi.middleware,
      pulseApi.middleware
    )
});

export const actions = {
  auth: {
    ...authActions,
    ...authSlice.actions
  },
  ideasHub: {
    ...ideasHubActions,
    ...ideasHubSlice.actions
  },
  portfolio: {
    ...portfolioActions,
    ...portfolioSlice.actions
  },
  verification: {
    ...verificationActions,
    ...verificationSlice.actions
  },
  application: {
    ...applicationActions,
    ...applicationSlice.actions
  },
  sumSub: {
    ...sumSubActions
  },
  market: {
    ...marketActions,
    ...marketSlice.actions
  },
  wallet: {
    ...walletActions,
    ...walletSlice.actions
  },
  profile: {
    ...profileActions,
    ...profileSlice.actions
  },
  common: {
    ...commonActions,
    ...commonSlice.actions
  },
  legalDocuments: {
    ...legalDocumentsActions,
    ...legalDocumentsSlice.actions
  },
  pulse: {
    ...pulseActions,
    ...pulseSlice.actions
  }
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

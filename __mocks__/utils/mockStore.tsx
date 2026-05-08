import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';


export const createMockStore = (initialState = {}) =>
  configureStore({
    reducer: {
      market: (state = { signals: [], categories: [] }) => state,
      portfolio: (state = { userInfo: { id: 1 }, selectedAccount: 123 }) => state,
    },
    preloadedState: initialState,
  });

export const withStoreProvider = (component: React.ReactElement, store = createMockStore()) => {
  return <Provider store={store}>{component}</Provider>;
};

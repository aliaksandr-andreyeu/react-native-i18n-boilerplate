import { createSlice } from '@reduxjs/toolkit';
import { IdeaData } from '@/types';
import { IdeasHubState } from './types';

const initialState: IdeasHubState = {
  categoryIdeas: {} as Record<string, IdeaData[]>,
  watchWidgets: [],
  customerIO: false,
  promotions: []
};

export const ideasHubSlice = createSlice({
  initialState,
  name: 'ideasHub',
  reducers: {
    setCategoryIdeas: (state, { payload }) => {
      const { id, ideas } = payload || {};
      state.categoryIdeas = {
        ...state.categoryIdeas,
        [id]: ideas
      };
    },
    setWatchWidgets: (state, { payload }) => {
      state.watchWidgets = [...state.watchWidgets, ...payload];
    },
    resetWathWidgets: (state) => {
      state.watchWidgets = [];
    },
    setCustomerIO: (state, { payload }) => {
      state.customerIO = payload;
    },
    setPromotions: (state, { payload }) => {
      state.promotions = payload;
    }
  }
});

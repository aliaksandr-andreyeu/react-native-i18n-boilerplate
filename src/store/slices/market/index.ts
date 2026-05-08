import { createSlice } from '@reduxjs/toolkit';
import { InitialState, Signals } from './types';

const initialState: InitialState = {
  categories: [],
  allSymbols: [],
  symbols: [],
  signals: [],
  isLoading: false,
  activeTab: ''
};

export const marketSlice = createSlice({
  initialState,
  name: 'market',
  reducers: {
    setCategories: (state, { payload }) => {
      state.categories = payload;
    },
    setAllSymbols: (state, { payload }) => {
      state.allSymbols = payload;
    },
    setSymbols: (state, { payload }) => {
      state.symbols = payload;
    },
    setSignals: (state, { payload }) => {
      const tempNames = new Set();
      const temp = [...payload].filter((signal: Signals) => {
        const name = signal?.Product?.amegaName;
        const hasName = !!name?.length;
        if (!hasName) return false;
        const hasTempName = tempNames.has(name);
        if (hasTempName) return false;
        tempNames.add(name);
        return true;
      });
      temp
        .filter((el) => !el.Disabled)
        .sort((a, b) => {
          // Sort by confidence in descending order
          if (a.Report.confidence > b.Report.confidence) return -1;
          if (a.Report.confidence < b.Report.confidence) return 1;

          // If confidence is the same, prioritize live signals
          const isLiveA = a.Report.status === 9 ? 1 : 0;
          const isLiveB = b.Report.status === 9 ? 1 : 0;
          return isLiveB - isLiveA; // Prioritize live signals
        });
      state.signals = temp;
    },
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setActiveTab: (state, { payload }) => {
      state.activeTab = payload;
    }
  }
});

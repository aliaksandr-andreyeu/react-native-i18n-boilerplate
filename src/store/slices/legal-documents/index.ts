import { createSlice } from '@reduxjs/toolkit';
import { InitialState } from './types';

const initialState: InitialState = {
  legalDocuments: [],
  termsOfUseURL: '',
  sampleDocuments: []
};

export const legalDocumentsSlice = createSlice({
  initialState,
  name: 'legalDocuments',
  reducers: {
    setLegalDocuments: (state, { payload }) => {
      state.legalDocuments = payload;
    },
    setTermsOfUse: (state, { payload }) => {
      if (payload.length === 0) {
        state.termsOfUseURL = '';
      } else {
        const data = payload.filter((item: any) => item?.attributes?.title?.toLowerCase() === 'terms of use');

        const mostRecentItem = data.reduce((latest: any, item: any) => {
          const currentDate = new Date(item.attributes?.publishedAt);
          const latestDate = new Date(latest.attributes?.publishedAt);
          return currentDate > latestDate ? item : latest;
        });
        state.termsOfUseURL = mostRecentItem?.attributes?.documentFile?.data?.attributes?.url || '';
      }
    },
    setSampleDocuments: (state, { payload }) => {
      state.sampleDocuments = payload || [];
    }
  }
});

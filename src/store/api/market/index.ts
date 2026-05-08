import { api } from '@/constants';
import i18n from 'i18next';
import { mt5BaseQueryWithLogger } from '@/helpers';
import { marketSlice } from '@/store/slices/market';
import { Symbols } from '@/store/slices/market/types';
import { createApi } from '@reduxjs/toolkit/query/react';

const {
  actions: { setCategories, setSymbols, setAllSymbols, setSignals }
} = marketSlice;

export const marketMT5Api = createApi({
  reducerPath: 'marketMT5Api',
  baseQuery: mt5BaseQueryWithLogger,
  endpoints: (builder) => ({
    getAllSymbols: builder.query<any, { accountId: number }>({
      query: ({ accountId }) => ({
        url: api.market.getAllSymbols(accountId),
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || [];

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) {
            return;
          }

          dispatch(setAllSymbols(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    candlesHistory: builder.query<any, any>({
      query: (args) => ({
        url: api.market.getCandlesHistory(args),
        method: 'GET'
      })
    }),
    getCategories: builder.query<string[], number>({
      query: (args: number) => ({
        url: api.market.getCategories(args),
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || [];

          const isData = Boolean(data && data?.length);

          if (!isData) {
            return;
          }

          const sorted = [...data].sort((a) => (a === 'Forex' ? -1 : 1));
          dispatch(setCategories(sorted));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    getSymbols: builder.query<any, { accountId: number; groupName: string }>({
      query: ({ accountId, groupName }) => ({
        url: api.market.getSymbols(accountId, groupName),
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || [];

          const isData = Boolean(data && data?.length);

          if (!isData) {
            return;
          }

          dispatch(setSymbols(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    getSignals: builder.query<any, { accountId?: number; language?: string }>({
      query: ({ accountId, language }) => {
        return {
          url: api.market.getSignals(accountId, language),
          method: 'POST'
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || [];

          const isData = Boolean(data && data?.length);

          if (!isData) {
            return;
          }

          dispatch(setSignals(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    getRecentActivities: builder.mutation<
      any,
      { accountId: number | null; count?: number; from?: number; to?: number }
    >({
      query: ({ accountId, count = 10, from = 0, to = 0 }) => ({
        url: api.market.getRecentActivities({ accountId, count, from, to }),
        method: 'GET'
      })
    })
  })
});

export const {
  useLazyGetAllSymbolsQuery: useGetAllSymbolsQuery,
  useLazyCandlesHistoryQuery: useCandlesHistoryQuery,
  useLazyGetCategoriesQuery: useGetCategoriesQuery,
  useLazyGetSymbolsQuery: useGetSymbolsQuery,
  useLazyGetSignalsQuery: useGetSignalsQuery,
  useGetRecentActivitiesMutation
} = marketMT5Api;

export const marketActions = {
  useGetRecentActivitiesMutation,
  useGetAllSymbolsQuery,
  useGetCategoriesQuery,
  useGetSymbolsQuery,
  useCandlesHistoryQuery
};

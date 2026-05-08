import { createApi } from '@reduxjs/toolkit/query/react';
import { pulseBaseQueryWithLogger } from '@/helpers';
import { api } from '@/constants';
import { ParsedTopPerformerResponse, ParsedTopSignalResponse, TopPerformerResponse, TopSignalResponse } from './types';
import { topPerformerParser, topSignalParser } from './parsers';
import { actions } from '@/store';

export const pulseApi = createApi({
  reducerPath: 'pulseApi',
  baseQuery: pulseBaseQueryWithLogger,
  endpoints: (builder) => ({
    getTopPerformers: builder.query<ParsedTopPerformerResponse, void>({
      query: () => ({
        url: api.pulse.topPerformers,
        method: 'GET'
      }),
      transformResponse: (response: TopPerformerResponse) => topPerformerParser(response),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};
          dispatch(actions.pulse.setTopPerformerKeys(data?.keys ?? []));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    getTopSignals: builder.query<ParsedTopSignalResponse, void>({
      query: () => ({
        url: api.pulse.topSignals,
        method: 'GET'
      }),
      transformResponse: (response: TopSignalResponse) => topSignalParser(response),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};
          dispatch(actions.pulse.setTopSignalKeys(data?.keys ?? []));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    })
  })
});

export const {
  useLazyGetTopPerformersQuery: useGetTopPerformersQuery,
  useLazyGetTopSignalsQuery: useGetTopSignalsQuery
} = pulseApi;

export const pulseActions = {
  useGetTopPerformersQuery,
  useGetTopSignalsQuery
};

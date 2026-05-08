import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQueryWithLogger } from '@/helpers';
import { api } from '@/constants';
import { applicationSlice } from '@/store/slices';

const {
  actions: { setApplicationConfigs, setSupportedLanguages }
} = applicationSlice;

export const applicationApi = createApi({
  reducerPath: 'applicationApi',
  baseQuery: apiBaseQueryWithLogger,
  endpoints: (builder) => ({
    getApplicationConfigs: builder.mutation<any, any>({
      query: ({ language }) => {
        return {
          url: `${api.application.applicationConfigs}?_locale=${language}`,
          method: 'GET'
        };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          dispatch(setApplicationConfigs(response.data));
        } catch (error: unknown) {
          console.error(error);
        }
      },
      transformErrorResponse: (response) => {
        const { data } = response as { data: any };
        return data || {};
      }
    }),
    getSupportedLanguages: builder.query<any, void>({
      query: () => ({
        url: api.application.languages,
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};
          const isData = Boolean(data && Object.keys(data).length > 0);

          if (!isData) {
            return;
          }

          dispatch(setSupportedLanguages(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    })
  })
});

export const {
  useGetApplicationConfigsMutation: useGetApplicationConfigs,
  useLazyGetSupportedLanguagesQuery: useGetSupportedLanguagesQuery
} = applicationApi;

export const applicationActions = { useGetApplicationConfigs, useGetSupportedLanguagesQuery };

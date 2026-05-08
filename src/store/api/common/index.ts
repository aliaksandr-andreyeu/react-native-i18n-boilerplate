import { createApi } from '@reduxjs/toolkit/query/react';
import { commonSlice } from '@/store/slices';
import { cmsBaseQueryWithLogger } from '@/helpers';
import { api } from '@/constants';
import { commonConfigParser } from './parsers';
import { CommonConfigData } from './types';

const {
  actions: { setConfig }
} = commonSlice;

export const commonCmsApi = createApi({
  reducerPath: 'commonCmsApi',
  baseQuery: cmsBaseQueryWithLogger,
  endpoints: (builder) => ({
    getConfig: builder.query<any, any>({
      query: () => {
        return {
          url: api.common.config,
          method: 'GET'
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};
          const isData = Boolean(data && Object.keys(data).length > 0);

          if (isData) {
            dispatch(setConfig(data));
          }
        } catch (error: unknown) {
          console.error(error);
        }
      },
      transformResponse: (response: { data: CommonConfigData }) => {
        const { data } = response || {};
        return commonConfigParser(data);
      }
    })
  })
});

export const { useLazyGetConfigQuery: useGetConfigQuery } = commonCmsApi;

export const commonActions = {
  useGetConfigQuery
};

import { createApi, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { cmsBaseQueryWithLogger } from '@/helpers';
import { api } from '@/constants';
import { applicationSlice, legalDocumentsSlice } from '@/store/slices';
import { groupItemsByGroupingKey } from './parser';
import { legalDocument } from '@/store/slices/legal-documents/types';
import { LANG } from '@/localization';
import { SampleDocumentsResponse } from './types';

const {
  actions: { setLegalDocuments, setTermsOfUse, setSampleDocuments }
} = legalDocumentsSlice;

const {
  actions: { setPromoWelcome }
} = applicationSlice;

const transformErrorResponse = (response: FetchBaseQueryError) => {
  const { data } = (response || {}) as { data: { error: any } };
  const { error } = data;
  return error;
};

export const legalDocumentsApi = createApi({
  reducerPath: 'legalDocumentsApi',
  baseQuery: cmsBaseQueryWithLogger,
  endpoints: (builder) => ({
    getLegalDocuments: builder.query<any, LANG>({
      query: (arg) => {
        return {
          url:
            api.application.legalDocuments +
            `?pagination[limit]=-1&filters[visibilityByJurisdiction][stlucia][$eq]=true&populate=*&locale=${arg}`, // no pagination is needed here

          method: 'GET'
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};

          dispatch(setLegalDocuments(data));
        } catch (error: unknown) {
          console.error(error);
        }
      },
      transformResponse: (response: { data: legalDocument[] }) => groupItemsByGroupingKey(response?.data || []),
      transformErrorResponse
    }),
    getTermsAndConditions: builder.mutation<any, void>({
      query: () => {
        return {
          url:
            api.application.legalDocuments +
            '?filters[visibilityByJurisdiction][stlucia][$eq]=true&filters[generalTermsAndConditions][$eq]=true&populate=*', // filter terms and conditions
          method: 'GET'
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;

          dispatch(setTermsOfUse(response?.data?.data || []));
        } catch (error: unknown) {
          console.error(error);
        }
      },
      transformErrorResponse
    }),
    getPromoWelcomeInfo: builder.mutation<any, void>({
      query: () => {
        return {
          url: api.application.getPromoWelcomeInfo,
          method: 'GET'
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data: responseData } = response || {};
          const { data } = responseData || {};
          const { attributes = {} } = data || {};

          dispatch(setPromoWelcome(attributes));
        } catch (error: unknown) {
          console.error(error);
        }
      },
      transformErrorResponse
    }),
    getSampleDocuments: builder.mutation<SampleDocumentsResponse, { country: string; locale: string }>({
      query: (args) => ({
        url: api.application.sampleDocumentation(args),
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data: responseData } = response || {};
          const { data } = responseData || {};
          const attributes = data?.[0]?.attributes;
          if (attributes) {
            const { documentSample } = attributes;
            dispatch(setSampleDocuments(documentSample));
          }
        } catch (error: unknown) {
          console.error(error);
        }
      },
      transformErrorResponse
    })
  })
});

export const {
  useLazyGetLegalDocumentsQuery: useLegalDocumentsQuery,
  useGetTermsAndConditionsMutation,
  useGetPromoWelcomeInfoMutation: useGetPromoWelcomeInfo,
  useGetSampleDocumentsMutation
} = legalDocumentsApi;

export const legalDocumentsActions = { useLegalDocumentsQuery, useGetPromoWelcomeInfo, useGetSampleDocumentsMutation };

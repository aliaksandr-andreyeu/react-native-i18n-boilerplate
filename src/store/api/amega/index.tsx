import { apiAmegaBaseQuery } from '@/helpers';
import { createApi } from '@reduxjs/toolkit/query/react';
import { api } from '@/constants';
import { amegaSlice } from '@/store/slices';

const {
  actions: { setProfileReferralCode }
} = amegaSlice;

export const amegaApi = createApi({
  reducerPath: 'amegaApi',
  baseQuery: apiAmegaBaseQuery,
  endpoints: (builder) => ({
    getProfile: builder.query<any, void>({
      query: () => ({
        url: api.amega.profile,
        method: 'GET'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};

          dispatch(setProfileReferralCode(data?.payload?.referralCode || ''));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    })
  })
});

export const { useLazyGetProfileQuery: useGetProfileQuery } = amegaApi;

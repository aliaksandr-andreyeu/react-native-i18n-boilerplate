import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQueryWithLogger } from '@/helpers';
import { api } from '@/constants';

export interface ChangePhoneResponse {
  result: boolean;
  message: string;
  data: any[];
}

export interface ChangePhoneBody {
  pin: string;
  phone: string;
}

export const verificationApi = createApi({
  reducerPath: 'verificationApi',
  baseQuery: apiBaseQueryWithLogger,
  endpoints: (builder) => ({
    verifyEmail: builder.mutation<any, any>({
      query: () => ({
        url: api.portfolio.verifyEmail,
        method: 'POST',
        body: {
          useRefererHost: true
        }
      }),
      transformErrorResponse: (response) => {
        const { data } = response as { data: any };
        return data || {};
      }
    }),
    verifyPhone: builder.mutation<{ success: boolean }, { pin: string }>({
      query: (body) => ({
        url: api.portfolio.verifyPhone,
        method: 'POST',
        body
      })
    }),
    changePhone: builder.mutation<ChangePhoneResponse, ChangePhoneBody>({
      query: (body) => ({
        url: api.portfolio.changePhone,
        method: 'POST',
        body: {
          reason: '',
          ...body
        }
      })
    }),
    verifyEmailValidate: builder.mutation<any, any>({
      query: (hash: string) => ({
        url: api.portfolio.verifyEmailValidate(hash),
        method: 'POST'
      }),
      transformErrorResponse: (response) => {
        const { data } = response as { data: any };
        return data || {};
      }
    })
  })
});

export const {
  useVerifyEmailMutation: useVerifyEmail,
  useVerifyEmailValidateMutation: useVerifyEmailValidate,
  useVerifyPhoneMutation,
  useChangePhoneMutation
} = verificationApi;

export const verificationActions = {
  useVerifyEmail,
  useVerifyEmailValidate,
  useVerifyPhoneMutation,
  useChangePhoneMutation
};

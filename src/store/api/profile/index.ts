import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQueryWithLogger } from '@/helpers';
import { api } from '@/constants';
import { SocialService } from '@/types';
import { EnableTwoFactorArgs, GetBackupCodesResponse, GetManualCodeResponse } from '@/store/slices/profile/types';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: apiBaseQueryWithLogger,
  endpoints: (builder) => ({
    getTwoFactorManualCode: builder.mutation<GetManualCodeResponse, void>({
      query: () => ({
        url: api.profile.manualCode,
        method: 'POST'
      })
    }),
    enableTwoFactor: builder.mutation<GetBackupCodesResponse, EnableTwoFactorArgs>({
      query: (body) => ({
        url: api.profile.enableTwoFactor,
        method: 'PUT',
        body
      })
    }),
    generateTwoFactorBackupCodes: builder.mutation<GetBackupCodesResponse, void>({
      query: () => ({
        url: api.profile.twoFactorBackupCodes,
        method: 'POST'
      })
    }),
    disableTwoFactor: builder.mutation<boolean, { method: string; pin: string }>({
      query: (args) => ({
        url: api.profile.disableTwoFactor,
        method: 'DELETE',
        body: args
      })
    }),
    socialConnect: builder.mutation({
      query: ({ service, code, redirect }: { service: SocialService; code: string; redirect?: string }) => {
        const redirectUrl = service === SocialService.google ? api.auth.googleRedirect : redirect;

        return {
          url: api.profile.socialConnect(service),
          method: 'POST',
          body: {
            redirectUrl,
            parameters: {
              code
            }
          }
        };
      }
    }),
    socialDisconnect: builder.mutation({
      query: ({ service }: { service: SocialService }) => {
        return {
          url: api.profile.socialDisconnect(service),
          method: 'POST'
        };
      }
    }),
    updateCustomFields: builder.mutation({
      query: ({ customFields }: { [key: string]: any }) => {
        return {
          url: api.profile.updateCustomFields,
          method: 'POST',
          body: {
            customFields
          }
        };
      }
    })
  })
});

export const {
  useSocialConnectMutation: useSocialConnect,
  useSocialDisconnectMutation: useSocialDisconnect,
  useUpdateCustomFieldsMutation: useUpdateCustomFields,
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useGenerateTwoFactorBackupCodesMutation,
  useGetTwoFactorManualCodeMutation
} = profileApi;

export const profileActions = {
  useSocialConnect,
  useSocialDisconnect,
  useUpdateCustomFields,
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useGenerateTwoFactorBackupCodesMutation,
  useGetTwoFactorManualCodeMutation
};

import { createApi } from '@reduxjs/toolkit/query/react';
import { authSlice, ideasHubSlice } from '@/store/slices';
import { api } from '@/constants';
import {
  identifyUser,
  customerBaseQueryWithLogger,
  customerTrackBaseQueryWithLogger,
  apiAuthBaseQueryWithLogger,
  googleSignOut,
  mt5BaseQueryWithLogger
} from '@/helpers';
import { RootState } from '@/store';
import Intercom from '@intercom/intercom-react-native';

import {
  ideasHubApi,
  portfolioApi,
  verificationApi,
  applicationApi,
  sumSubApi,
  portfolioCsmApi,
  portfoliomt5Api,
  marketMT5Api,
  profileApi,
  walletApi
} from '@/store/api';

const {
  actions: { logOut, setAccessToken, setRefreshToken, setIntercomLoggedIn }
} = authSlice;

const {
  actions: { setCustomerIO }
} = ideasHubSlice;

export enum SocialService {
  google = 'google',
  facebook = 'facebook'
}

export interface PartnerIDResponse {
  partnerId: number;
  redirectUrl: string;
}

export interface ResetPasswordArgs {
  password: string;
  pin: string;
  email: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
  errors: {
    [key: string]: any;
  };
}

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe: boolean;
  fromLogin: boolean;
}

export interface TwoFARequest {
  _auth_code: string;
  _trusted: string;
  rememberMe: boolean;
}

export interface ClientData {
  id: number;
  cid: number;
  token: string;
  isIb: boolean;
  canRequestIb: boolean;
  ibLinksRestricted: boolean;
  canCreateIbLinks: boolean;
  clientType: string;
  title: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  language: string;
  email: string;
  password: string;
  isVerified: boolean;
  notificationPreferences: string[];
  birthDate: Date;
  customFields: {}[];
  financialPermissions: string[];
  smsNotificationEnabled: boolean;
  twoFactorAuthEnabled: boolean;
  referralLinkId: number;
  firstDepositDate: Date;
  firstDepositId: number;
  lastDepositId: number;
  lastDepositDate: Date;
  lastTradedAt: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  registrationDate: Date;
  marketingLinkId: number;
}

export interface SignInResponse {
  accessToken: string;
  exp: number;
  expDate: Date;
  client: ClientData;
  complete: boolean;
  message: string;
  refreshToken: string;
  refreshTokenExpDate: Date;
}

export interface SignIn2FAResponse {
  login: boolean;
  complete: boolean;
  error: string;
  message: string;
}

export enum ActionType {
  EMAIL = 'changeEmail',
  PHONE = 'changePhone',
  PASSWORD_ACCOUNT = 'changeAccountPassword',
  DISABLE_2FA = 'disable_2fa',
  VERIFY_PHONE = 'verifyPhone'
}

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Token'],
  baseQuery: apiAuthBaseQueryWithLogger,
  endpoints: (builder) => ({
    refreshToken: builder.mutation({
      query: ({ token }: { token: string }) => {
        return {
          url: api.auth.refreshToken,
          method: 'POST',
          body: {
            refreshToken: token
          }
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = (response || {}) as {
            data: { accessToken: string; refreshToken: string };
          };
          const { accessToken, refreshToken } = data || {};

          if (accessToken) {
            dispatch(setAccessToken(accessToken));
          }
          if (refreshToken) {
            dispatch(setRefreshToken(refreshToken));
          }
        } catch (error: unknown) {
          console.error(error);
          dispatch(logOut());
        }
      }
    }),
    socialSignIn: builder.mutation({
      query: ({ service, code, redirect }: { service: SocialService; code: string; redirect?: string }) => {
        const redirectUrl = service === SocialService.google ? api.auth.googleRedirect : redirect;

        return {
          url: api.auth.socialSignIn(service),
          method: 'POST',
          body: {
            redirectUrl,
            parameters: {
              code
            },
            rememberMe: true
          }
        };
      }
    }),
    forgotPassword: builder.mutation({
      query: (body) => {
        return {
          url: api.auth.forgotPassword,
          method: 'POST',
          body
        };
      },
      transformErrorResponse: (response, meta, arg) => {
        const { data } = (response || {}) as {
          status: number;
          data: { code: number; message: string; errors: string[] };
        };
        const { message, errors } = (data || {}) as ErrorResponse;

        const errorFields = errors?.children || {};
        const errorKey = Object.keys(errorFields)?.find((el) => Boolean(errorFields[el]?.errors));
        const errorValue = errorKey ? errorFields[errorKey] : undefined;
        const errorMsg = errorValue?.errors?.find((el: string) => typeof el === 'string') || message;

        const errorResponse = {
          message: errorMsg
        };

        return errorResponse;
      }
    }),
    resetPassword: builder.mutation<any, ResetPasswordArgs>({
      query: (body) => {
        return {
          url: api.auth.resetPassword,
          method: 'POST',
          body
        };
      },
      transformErrorResponse: (response) => {
        const { data } = (response || {}) as { data: ErrorResponse };
        const { message, errors } = data || {};

        const errorFields = errors?.children || {};
        const errorKey = Object.keys(errorFields)?.find((el) => Boolean(errorFields[el]?.errors));
        const errorValue = errorKey ? errorFields[errorKey] : undefined;
        const errorMsg = errorValue?.errors?.find((el: string) => typeof el === 'string') || message;

        const errorResponse = {
          message: errorMsg
        };

        return errorResponse;
      }
    }),
    changePassword: builder.mutation({
      query: (body) => {
        return {
          url: api.auth.changePassword,
          method: 'POST',
          body
        };
      },
      transformErrorResponse: (response) => {
        const { data } = (response || {}) as { data: ErrorResponse };
        const { message, errors } = data || {};

        const errorFields = errors?.children || {};
        const errorKey = Object.keys(errorFields)?.find((el) => Boolean(errorFields[el]?.errors));
        const errorValue = errorKey ? errorFields[errorKey] : undefined;
        const errorMsg = errorValue?.errors?.find((el: string) => typeof el === 'string') || message;

        const errorResponse = {
          fieldName: errorKey,
          message: errorMsg
        };

        return errorResponse;
      }
    }),
    changeEmail: builder.mutation({
      query: (body) => {
        return {
          url: api.auth.changeEmail,
          method: 'POST',
          body
        };
      },
      transformErrorResponse: (response) => {
        const { data } = (response || {}) as { data: ErrorResponse };
        const { errors } = data || {};

        return errors?.children;
      }
    }),
    pinSend: builder.mutation({
      query: (body: { action: ActionType; method: string }) => {
        return {
          url: api.auth.pinSend,
          method: 'POST',
          body
        };
      }
    }),
    signUp: builder.mutation({
      query: (body) => {
        return {
          url: api.auth.signUp,
          method: 'PUT',
          body
        };
      },
      transformErrorResponse: (response, meta, arg) => {
        const { data } = (response || {}) as { data: ErrorResponse };
        const { message, errors } = data || {};

        const errorFields = errors?.children || {};
        const errorKey = Object.keys(errorFields)?.find((el) => Boolean(errorFields[el]?.errors));
        const errorValue = errorKey ? errorFields[errorKey] : undefined;
        const errorMsg = errorValue?.errors?.find((el: string) => typeof el === 'string') || message;

        const errorResponse = {
          message: errorMsg,
          fields: errorFields
        };

        return errorResponse;
      }
    }),
    signIn: builder.mutation<SignInResponse | SignIn2FAResponse, SignInRequest>({
      query: (body) => {
        const { fromLogin, ...restBody } = body;

        return {
          url: api.auth.signIn,
          method: 'POST',
          body: restBody
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = (response || {}) as {
            data: { accessToken: string; refreshToken: string; client: ClientData };
          };
          const { accessToken, client, refreshToken } = data || {};

          if (refreshToken) {
            dispatch(setRefreshToken(refreshToken));
          }
          if (accessToken) {
            dispatch(setAccessToken(accessToken));
            if (client && !client?.isVerified && client?.id) {
              identifyUser(client);
              dispatch(setCustomerIO(true));
            }
          } else dispatch(setCustomerIO(false));
        } catch (error: unknown) {
          dispatch(setCustomerIO(false));
          console.error(error);
        }
      },
      transformErrorResponse: (response, meta, arg) => {
        return response;
      }
    }),
    twoFACheck: builder.mutation<SignInResponse, TwoFARequest>({
      query: (body) => {
        return {
          url: api.auth.check2FA,
          method: 'POST',
          body
        };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};
          const { accessToken, client, refreshToken } = data || {};

          if (accessToken) {
            dispatch(setAccessToken(accessToken));

            if (data?.client && !data?.client?.isVerified && client?.id) {
              identifyUser(client);
              dispatch(setCustomerIO(true));
            }
          } else dispatch(setCustomerIO(false));

          if (refreshToken) {
            dispatch(setRefreshToken(refreshToken));
          }
        } catch (error: unknown) {
          dispatch(setCustomerIO(false));
          console.error(error);
        }
      },
      transformErrorResponse: (response, meta, arg) => {
        const { data } = response as { data: SignInResponse };

        return data;
      }
    }),
    signOut: builder.mutation<any, void>({
      query: () => ({
        url: api.auth.signOut,
        method: 'POST'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;
          const { data: responseData } = response || {};

          const store = getState() as RootState;
          const { auth } = store || {};
          const { intercomLoggedIn } = auth || {};

          if (intercomLoggedIn) {
            Intercom.logout();

            dispatch(setIntercomLoggedIn(false));
          }

          await googleSignOut();

          dispatch(applicationApi.util.resetApiState());
          dispatch(ideasHubApi.util.resetApiState());
          dispatch(marketMT5Api.util.resetApiState());

          dispatch(portfolioApi.util.resetApiState());
          dispatch(portfolioCsmApi.util.resetApiState());
          dispatch(portfoliomt5Api.util.resetApiState());

          dispatch(profileApi.util.resetApiState());
          dispatch(sumSubApi.util.resetApiState());
          dispatch(verificationApi.util.resetApiState());
          dispatch(walletApi.util.resetApiState());
          dispatch(setCustomerIO(false));

          dispatch(logOut());
        } catch (error: unknown) {
          console.error(error);

          await googleSignOut();

          dispatch(setCustomerIO(false));
          dispatch(applicationApi.util.resetApiState());
          dispatch(ideasHubApi.util.resetApiState());
          dispatch(marketMT5Api.util.resetApiState());

          dispatch(portfolioApi.util.resetApiState());
          dispatch(portfolioCsmApi.util.resetApiState());
          dispatch(portfoliomt5Api.util.resetApiState());

          dispatch(profileApi.util.resetApiState());
          dispatch(sumSubApi.util.resetApiState());
          dispatch(verificationApi.util.resetApiState());
          dispatch(walletApi.util.resetApiState());

          dispatch(logOut());
        }
      },
      transformErrorResponse: (response, meta, arg) => {
        const { data } = response as { data: any };

        return data || {};
      }
    }),
    ping: builder.query<any, any>({
      query: () => ({
        url: api.auth.ping,
        method: 'GET'
      })
    }),
    getPartnerID: builder.query<PartnerIDResponse, number>({
      query: (arg) => ({
        url: api.auth.partnerId(arg),
        method: 'GET'
      })
    })
  })
});

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: customerBaseQueryWithLogger,
  endpoints: (builder) => ({
    customerEmailPreferences: builder.mutation({
      query: ({ email }: { email: string }) => {
        return {
          url: api.customer.getPreferences(email),
          method: 'GET'
        };
      }
    })
  })
});

export const customerTrackApi = createApi({
  reducerPath: 'customerTrackApi',
  baseQuery: customerTrackBaseQueryWithLogger,
  endpoints: (builder) => ({
    setCustomerSettings: builder.mutation({
      query: (body) => {
        return {
          url: api.customer.setCustomerSettings,
          method: 'POST',
          body
        };
      }
    })
  })
});

export const authMT5Api = createApi({
  reducerPath: 'authMT5Api',
  baseQuery: mt5BaseQueryWithLogger,
  endpoints: (builder) => ({
    updateUserEmailVerify: builder.mutation({
      query: ({ user, token }: { token?: string; user: string | number }) => ({
        url: api.auth.updateUser,
        method: 'POST',
        body: {
          user,
          emailVerified: true
        },
        ...(!!token?.length && {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      })
    })
  })
});

export const { useUpdateUserEmailVerifyMutation } = authMT5Api;

export const {
  useRefreshTokenMutation: useRefreshToken,
  useSocialSignInMutation: useSocialSignIn,
  useForgotPasswordMutation: useForgotPassword,
  useResetPasswordMutation: useResetPassword,
  useSignUpMutation: useSignUp,
  useSignInMutation: useSignIn,
  useSignOutMutation: useSignOut,
  useLazyPingQuery: usePing,
  useTwoFACheckMutation: useTwoFACheck,
  useChangePasswordMutation: useChangePassword,
  usePinSendMutation: usePinSend,
  useChangeEmailMutation: useChangeEmail,
  useLazyGetPartnerIDQuery: useGetPartnerIDQuery
} = authApi;

export const { useCustomerEmailPreferencesMutation: useCustomerEmailPreferences } = customerApi;
export const { useSetCustomerSettingsMutation: useSetCustomerSettings } = customerTrackApi;

export const authActions = {
  useRefreshToken,
  useSocialSignIn,
  useResetPassword,
  useForgotPassword,
  useSignUp,
  useSignIn,
  useSignOut,
  usePing,
  useTwoFACheck,
  useCustomerEmailPreferences,
  useSetCustomerSettings,
  useGetPartnerIDQuery,
  useUpdateUserEmailVerifyMutation
};

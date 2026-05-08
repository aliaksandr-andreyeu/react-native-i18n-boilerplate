import {
  retry,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
  MaybePromise
} from '@reduxjs/toolkit/query/react';
import { RootState, AppDispatch } from '@/store';
import Config from 'react-native-config';
import { navigate } from '@/navigation';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { AUTH_ROUTE_NAMES } from '@/navigation/app/stacks';
import { authSlice } from '@/store/slices';
import { googleSignOut, getStoredRefreshToken } from '@/helpers';
import { api } from '@/constants';
import { SocialService } from '@/types';
import { Mutex } from 'async-mutex';
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
  walletApi,
  amegaApi
} from '@/store/api';
import * as Sentry from '@sentry/react-native';
import { Buffer } from 'buffer';

const {
  API_URL,
  CMS_URL,
  CMS_TOKEN,
  SUMSUB_URL,
  MT5_API_URL,
  CUSTOMER_API_URL,
  CUSTOMER_API_TOKEN,
  CUSTOMER_TRACK_API_URL,
  CUSTOMER_TRACK_SITE_ID,
  CUSTOMER_TRACK_API_KEY,
  PROMO_URL,
  CA_API_URL,
  PULSE_URL
} = Config || {};

const {
  actions: { logOut, setAccessToken, setRefreshToken }
} = authSlice;

const mutex = new Mutex();

export const staggeredBaseQuery = (fn: BaseQueryFn<string | FetchArgs, unknown, unknown, {}, FetchBaseQueryMeta>) =>
  retry(fn, { maxRetries: 5 });

const sentryLogger = {
  fetchFn: async (input: RequestInfo, init: RequestInit | undefined) => {
    try {
      const response = await fetch(input, init);
      const { ok, status, statusText, url } = response || {};

      if (!ok) {
        const errorBody = await response
          .clone()
          .json()
          .catch(() => null);

        const errorMessage = {
          status,
          statusText,
          url,
          body: errorBody,
          request: {
            input,
            init
          }
        };

        const errorStr = String(`${status || ''} ${statusText || ''}`)?.trim();
        const errorTitle = String(`API Error${errorStr ? ': ' + errorStr : ''}`)?.trim();

        Sentry.captureException(new Error(errorTitle), {
          extra: errorMessage
        });
      }

      return response;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          request: {
            input,
            init
          }
        }
      });

      throw error;
    }
  }
};

const commonSignOut = async (dispatch: AppDispatch) => {
  navigate(ROOT_ROUTE_NAMES.Auth, {
    screen: AUTH_ROUTE_NAMES.SignIn
  });

  await googleSignOut();

  dispatch(logOut());

  dispatch(applicationApi.util.resetApiState());
  dispatch(ideasHubApi.util.resetApiState());
  dispatch(marketMT5Api.util.resetApiState());

  dispatch(portfolioApi.util.resetApiState());
  dispatch(portfolioCsmApi.util.resetApiState());
  dispatch(portfoliomt5Api.util.resetApiState());

  dispatch(profileApi.util.resetApiState());
  dispatch(amegaApi.util.resetApiState());
  dispatch(sumSubApi.util.resetApiState());
  dispatch(verificationApi.util.resetApiState());
  dispatch(walletApi.util.resetApiState());
};

export const apiAuthBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers, queryApi) => {
    const { getState } = queryApi || {};
    const { auth } = (getState && (getState() as RootState)) || {};
    const { accessToken } = auth || {};
    if (!headers.has('Authorization') && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
  ...sentryLogger
});

export const apiAuthBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = (...args) => {
  const [query] = args;

  console.log('API Request: ', {
    ...(typeof query !== 'string' ? query : {}),
    url: `${API_URL}${typeof query !== 'string' ? query.url : {}}`
  });

  return apiAuthBaseQuery(...args) as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const apiBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers, queryApi) => {
    const { getState } = queryApi || {};
    const { auth } = (getState && (getState() as RootState)) || {};
    const { accessToken } = auth || {};
    if (!headers.has('Authorization') && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
  ...sentryLogger
});

export const apiAmegaBaseQuery = fetchBaseQuery({
  baseUrl: Config.API_AMEGA_BASE_URL,
  prepareHeaders: async (headers, queryApi) => {
    const { getState } = queryApi || {};
    const { auth } = (getState && (getState() as RootState)) || {};
    const { accessToken } = auth || {};
    if (!headers.has('Authorization') && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
  ...sentryLogger
});

export const promoBaseQuery = fetchBaseQuery({
  baseUrl: PROMO_URL,
  prepareHeaders: async (headers, queryApi) => {
    const { getState } = queryApi || {};
    const { auth } = (getState && (getState() as RootState)) || {};
    const { accessToken } = auth || {};
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
  ...sentryLogger
});

export const promoBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = (...args) => {
  const [query] = args;

  console.log('Promo API Request: ', {
    ...(typeof query !== 'string' ? query : {}),
    url: `${PROMO_URL}/api${typeof query === 'string' ? '' : query.url}`
  });
  
  return promoBaseQuery(...args) as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const apiBaseQueryWithLogger: BaseQueryFn<string | FetchArgs, unknown, unknown, {}, FetchBaseQueryMeta> = async (
  args,
  queryApi,
  extraOptions
) => {
  const { dispatch } = queryApi || {};

  console.log('API Request: ', {
    ...(typeof args !== 'string' ? args : {}),
    url: `${API_URL}${typeof args !== 'string' ? args.url : {}}`
  });
  
  let result = await apiBaseQuery(args, queryApi, extraOptions);

  const { error } = result || {};
  const { status } = (error || {}) as FetchBaseQueryError;

  if (status === 401) {
    if (
      [
        api.auth.forgotPassword,
        api.auth.signIn,
        api.auth.check2FA,
        api.auth.socialSignIn(SocialService.facebook),
        api.auth.socialSignIn(SocialService.google)
        // api.profile.socialConnect(SocialService.facebook),
        // api.profile.socialConnect(SocialService.google)
      ].includes(typeof args !== 'string' && args.url ? args.url : '')
    ) {
      return result;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const token = await getStoredRefreshToken();

        if (!token) {
          await commonSignOut(dispatch);

          return result;
        }

        const refreshResult = await apiBaseQuery(
          {
            url: api.auth.refreshToken,
            method: 'POST',
            body: {
              refreshToken: token
            }
          },
          queryApi,
          extraOptions
        );

        const { data } = (refreshResult || {}) as {
          data: { accessToken: string; refreshToken: string };
        };

        const { accessToken, refreshToken } = data || {};

        if (accessToken && refreshToken) {
          dispatch(setAccessToken(accessToken));
          dispatch(setRefreshToken(refreshToken));

          result = await apiBaseQuery(args, queryApi, extraOptions);
        } else {
          result = { data: {} };

          await commonSignOut(dispatch);
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();

      result = await apiBaseQuery(args, queryApi, extraOptions);
    }
  }

  return result;
};

export const getCMSImageUrl = (image: string | undefined | null) => {
  if (!image) {
    return undefined;
  }
  return `${CMS_URL}${image}`;
};

export const cmsBaseQuery = fetchBaseQuery({
  baseUrl: `${CMS_URL}/api`,
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${CMS_TOKEN}`);
    return headers;
  },
  ...sentryLogger
});

export const cmsBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = (...args) => {
  const [query] = args;

  console.log('CMS API Request: ', {
    ...(typeof query !== 'string' ? query : {}),
    url: `${CMS_URL}/api${typeof query === 'string' ? '' : query.url}`
  });
  
  return cmsBaseQuery(...args) as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const caBaseQuery = fetchBaseQuery({
  baseUrl: CA_API_URL,
  prepareHeaders: async (headers, queryApi) => {
    const { getState } = queryApi || {};
    const { auth } = (getState && (getState() as RootState)) || {};
    const { accessToken } = auth || {};
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
  ...sentryLogger
});

export const caBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = (...args) => {
  const [query] = args;

  console.log('ClientArea API Request: ', {
    ...(typeof query !== 'string' ? query : {}),
    url: `${CA_API_URL}${typeof query === 'string' ? '' : query.url}`
  });
  
  return caBaseQuery(...args) as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const sumSubBaseQuery = fetchBaseQuery({
  baseUrl: SUMSUB_URL,
  ...sentryLogger
});

export const sumSubBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = (...args) => {
  const [query] = args;

  console.log('SumSub API Request: ', {
    ...(typeof query !== 'string' ? query : {}),
    url: `${SUMSUB_URL}${typeof query === 'string' ? '' : query.url}`
  });

  return sumSubBaseQuery(...args) as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const mt5BaseQuery = fetchBaseQuery({
  baseUrl: MT5_API_URL,
  prepareHeaders: async (headers, queryApi) => {
    const { getState } = queryApi || {};
    const { auth } = (getState && (getState() as RootState)) || {};
    const { accessToken } = auth || {};
    if (!headers.has('Authorization') && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
  ...sentryLogger
});

export const mt5BaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, queryApi, extraOptions) => {
  const customHeaders = (args as any)?.headers || {};
  const { dispatch } = queryApi || {};

  console.log('MT5 API Request: ', {
    ...(typeof args !== 'string' ? args : {}),
    url: `${MT5_API_URL}${typeof args === 'string' ? '' : args.url}`
  });
  
  let result = await mt5BaseQuery(args, queryApi, extraOptions);

  // const { error } = result || {}; //ADD HANDLER UNAUTHORIZED ACCESS for MT5 BACKEND
  // const { status } = error || {};

  // if (status === 401) {
  //   await commonSignOut(dispatch);
  //   return;
  // }
  return result as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const pulseBaseQuery = fetchBaseQuery({
  baseUrl: PULSE_URL,
  prepareHeaders: async (headers, queryApi) => {
    const { getState } = queryApi || {};
    const { auth } = (getState && (getState() as RootState)) || {};
    const { accessToken } = auth || {};
    if (!headers.has('Authorization') && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
  ...sentryLogger
});

export const pulseBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, queryApi, extraOptions) => {
  const result = await pulseBaseQuery(args, queryApi, extraOptions);

  return result as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const customerBaseQuery = fetchBaseQuery({
  baseUrl: CUSTOMER_API_URL,
  prepareHeaders: async (headers) => {
    headers.set('Authorization', `Bearer ${CUSTOMER_API_TOKEN}`);
    return headers;
  },
  ...sentryLogger
});

export const customerBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, queryApi, extraOptions) => {
  console.log('Customer.io API Request: ', {
    ...(typeof args !== 'string' ? args : {}),
    url: `${CUSTOMER_API_URL}${typeof args === 'string' ? '' : args.url}`
  });

  let result = await customerBaseQuery(args, queryApi, extraOptions);

  return result as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

export const customerTrackBaseQuery = fetchBaseQuery({
  baseUrl: CUSTOMER_TRACK_API_URL,
  prepareHeaders: async (headers) => {
    const token = `${CUSTOMER_TRACK_SITE_ID}:${CUSTOMER_TRACK_API_KEY}`;
    const secret = new Buffer(token).toString('base64');
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Basic ${secret}`);
    return headers;
  },
  ...sentryLogger
});

export const customerTrackBaseQueryWithLogger: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, queryApi, extraOptions) => {
  console.log('Customer.io Track API Request: ', {
    ...(typeof args !== 'string' ? args : {}),
    url: `${CUSTOMER_TRACK_API_URL}${typeof args === 'string' ? '' : args.url}`
  });

  let result = await customerTrackBaseQuery(args, queryApi, extraOptions);

  return result as MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>;
};

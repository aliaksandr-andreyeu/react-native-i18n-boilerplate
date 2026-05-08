import { createApi } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import { portfolioSlice } from '@/store/slices';
import {
  apiBaseQueryWithLogger,
  cmsBaseQueryWithLogger,
  mt5BaseQueryWithLogger,
  caBaseQueryWithLogger
} from '@/helpers';
import { api } from '@/constants';
import {
  ClosePosition,
  DealsInfoArgs,
  EditOrderInfoArgs,
  DeleteOrderInfoArgs,
  EditPositionInfoArgs,
  PortfolioTradingAssetData,
  PositionInfoArgs,
  SymbolLastTickArgs
} from './types';
import { portfolioTradeAssetsParser } from './parsers';
import {
  CalculateLimitsArgs,
  CalculateLimitsResponse,
  CalculateMarginArgs,
  CalculateMarginResponse,
  DealsAccounts,
  Position,
  SymbolConfig,
  SymbolLastTick
} from '@/store/slices/portfolio/types';

const {
  actions: { setUserInfo, setApplications, setTradeAccountInfo, setDealsInfo, setDealsAccounts, setTradingAssets }
} = portfolioSlice;

export const portfoliomt5Api = createApi({
  reducerPath: 'portfoliomt5Api',
  baseQuery: mt5BaseQueryWithLogger,
  tagTypes: ['Deals', 'History', 'Position', 'Order'],
  endpoints: (builder) => ({
    getDealsAccounts: builder.query<DealsAccounts[], number>({
      providesTags: ['Deals'],
      query: (arg) => ({
        url: api.portfolio.getDealsAccounts(arg),
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

          dispatch(setDealsAccounts(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    getDealsInfo: builder.query<any, DealsInfoArgs>({
      providesTags: ['History'],
      query: (args: DealsInfoArgs) => ({
        url: api.portfolio.getDealsInfo(args),
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

          dispatch(setDealsInfo(data));
        } catch (error: unknown) {
          console.log(error);
        }
      }
    }),
    getPositionInfo: builder.query<Position, PositionInfoArgs>({
      providesTags: ['Position'],
      query: (args) => ({
        url: api.portfolio.getPositionInfo(args),
        method: 'GET'
      })
    }),
    getClosedPositionInfo: builder.query<Position, { accountId: number; userId: number; positionTicket: string }>({
      query: (args) => ({
        url: api.portfolio.getClosedPositionInfo(args),
        method: 'GET'
      })
    }),
    getSymbolLastTick: builder.query<SymbolLastTick, SymbolLastTickArgs>({
      query: (args) => ({
        url: api.portfolio.getSymbolLastTick(args),
        method: 'GET'
      })
    }),
    getSymbolConfig: builder.mutation<SymbolConfig, any>({
      query: (args) => ({
        url: api.portfolio.getSymbolConfig(args),
        method: 'GET'
      })
    }),
    placeOrderByMoneyAmount: builder.mutation<any, any>({
      invalidatesTags: ['Deals'],
      query: (body) => {
        return {
          url: api.portfolio.placeOrderByMoneyAmount,
          method: 'POST',
          body
        };
      }
    }),
    placeOrder: builder.mutation<any, any>({
      invalidatesTags: ['Deals'],
      query: (body) => {
        return {
          url: api.portfolio.placeOrder,
          method: 'POST',
          body
        };
      }
    }),
    editPosition: builder.mutation<any, EditPositionInfoArgs>({
      invalidatesTags: ['Deals', 'Position'],
      query: (args) => ({
        url: api.portfolio.editPosition(args),
        method: 'PUT'
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    openPositionByMoneyAmount: builder.mutation<any, any>({
      invalidatesTags: ['Deals', 'Position'],
      query: (body) => ({
        url: api.portfolio.openPositionByMoneyAmount,
        method: 'POST',
        body
      })
    }),
    openPosition: builder.mutation<any, any>({
      invalidatesTags: ['Deals', 'Position'],
      query: (body) => ({
        url: api.portfolio.openPosition,
        method: 'POST',
        body
      })
    }),
    calculatePosition: builder.query<any, any>({
      query: (body) => ({
        url: api.portfolio.calculatePosition,
        method: 'POST',
        body
      })
    }),
    calculateLimits: builder.mutation<CalculateLimitsResponse, CalculateLimitsArgs>({
      query: (body) => ({
        url: api.portfolio.calculateLimits,
        method: 'POST',
        body
      })
    }),
    calculatePendingOrder: builder.query<any, any>({
      query: (body) => ({
        url: api.portfolio.calculatePendingOrder,
        method: 'POST',
        body
      })
    }),
    calculateMargin: builder.mutation<CalculateMarginResponse, CalculateMarginArgs>({
      query: (body) => ({
        url: api.portfolio.calculateMargin,
        method: 'POST',
        body
      })
    }),
    positionMaxMargin: builder.query<any, any>({
      query: (body) => ({
        url: api.portfolio.positionMaxMargin,
        method: 'POST',
        body
      })
    }),
    orderMax: builder.query<any, any>({
      query: (body) => ({
        url: api.portfolio.orderMax,
        method: 'POST',
        body
      })
    }),
    getPendingOrderInfo: builder.query<any, PositionInfoArgs>({
      providesTags: ['Order'],
      query: (args) => ({
        url: api.portfolio.getOrderInfo(args),
        method: 'GET'
      })
    }),
    editPendingOrder: builder.mutation<any, EditOrderInfoArgs>({
      invalidatesTags: ['Deals', 'Order'],
      query: (body) => ({
        url: api.portfolio.editOrder,
        method: 'PUT',
        body
      })
    }),
    deletePendingOrder: builder.query<any, DeleteOrderInfoArgs>({
      query: (args) => ({
        url: api.portfolio.deleteOrder(args),
        method: 'GET'
      })
    }),
    closePosition: builder.mutation<any, ClosePosition>({
      invalidatesTags: ['Deals', 'History', 'Position'],
      query: (args) => ({
        url: api.portfolio.closePosition(args),
        method: 'POST'
      })
    }),
    tradeAccountInfo: builder.query<any, any>({
      query: ({ accountId, userId }) => ({
        url: api.portfolio.getTradeAccountInfo(accountId, userId),
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

          dispatch(setTradeAccountInfo(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    })
  })
});

export const portfolioCsmApi = createApi({
  reducerPath: 'portfolioCsmApi',
  baseQuery: cmsBaseQueryWithLogger,
  endpoints: (builder) => ({
    getTradeAssets: builder.query<any, void>({
      query: () => ({
        url: api.portfolio.tradingAssets,
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || [];

          const isData = Boolean(data?.length);

          if (!isData) {
            return;
          }

          dispatch(setTradingAssets(data));
        } catch (error: unknown) {
          console.error(error);
        }
      },
      transformResponse: (response: { data: PortfolioTradingAssetData[] }) => portfolioTradeAssetsParser(response?.data)
    })
  })
});

export const portfolioCaApi = createApi({
  reducerPath: 'portfolioCaApi',
  baseQuery: caBaseQueryWithLogger,
  endpoints: (builder) => ({
    userProfile: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: api.portfolio.userProfile,
        method: 'POST',
        body
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};
          const { masterPartnerId } = data || {};

          const isData = Boolean(data && Object.keys(data).length > 0);

          if (!isData) {
            return;
          }

          const {
            portfolio: { userInfo }
          } = getState() as RootState;

          const userProfile = {
            ...userInfo,
            ibid: masterPartnerId
          };

          dispatch(setUserInfo(userProfile));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    })
  })
});

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: apiBaseQueryWithLogger,
  endpoints: (builder) => ({
    profile: builder.query<any, void>({
      query: () => ({
        url: api.portfolio.profile,
        method: 'GET'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};

          const isData = Boolean(data && Object.keys(data).length > 0);

          if (!isData) {
            return;
          }

          dispatch(setUserInfo(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    applications: builder.query<any, any>({
      query: () => ({
        url: api.portfolio.applications,
        method: 'GET'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response || {};

          const isData = Boolean(data && Array.isArray(data));

          if (!isData) {
            return;
          }

          dispatch(setApplications(data));
        } catch (error: unknown) {
          console.error(error);
        }
      }
    }),
    changeAccountLeverage: builder.mutation<any, { loginSid: string; leverage: number }>({
      query: (body) => ({
        url: api.portfolio.changeAccountLeverage,
        method: 'POST',
        body: {
          loginSid: body.loginSid,
          leverage: body.leverage
        }
      })
    }),
    changeLanguage: builder.mutation<any, { language: string }>({
      query: (body) => ({
        url: api.portfolio.changeLanguage,
        method: 'POST',
        body
      })
    })
  })
});

export const {
  useLazyProfileQuery: useProfileQuery,
  useLazyApplicationsQuery: useApplicationsQuery,
  useChangeAccountLeverageMutation,
  useChangeLanguageMutation
} = portfolioApi;

export const {
  useLazyGetDealsAccountsQuery: useGetDealsAccountsQuery,
  useLazyGetDealsInfoQuery: useGetDealsInfoQuery,
  useLazyGetPositionInfoQuery: useGetPositionInfoQuery,
  useLazyGetClosedPositionInfoQuery: useGetClosedPositionInfoQuery,
  useLazyGetSymbolLastTickQuery: useGetSymbolLastTickQuery,
  useGetSymbolConfigMutation,
  useEditPendingOrderMutation,
  useClosePositionMutation,
  usePlaceOrderByMoneyAmountMutation,
  usePlaceOrderMutation,
  useOpenPositionByMoneyAmountMutation,
  useEditPositionMutation,
  useCalculateMarginMutation,
  useLazyCalculatePositionQuery: useCalculatePositionQuery,
  useLazyCalculatePendingOrderQuery: useCalculatePendingOrderQuery,
  useLazyPositionMaxMarginQuery: usePositionMaxMarginQuery,
  useLazyOrderMaxQuery: useOrderMaxQuery,
  useLazyGetPendingOrderInfoQuery: useGetPendingOrderInfoQuery,
  useLazyDeletePendingOrderQuery: useDeletePendingOrderQuery,
  useLazyTradeAccountInfoQuery: useTradeAccountInfoQuery,
  useOpenPositionMutation,
  useCalculateLimitsMutation
} = portfoliomt5Api;

export const { useLazyGetTradeAssetsQuery: useGetTradeAssetsQuery } = portfolioCsmApi;

export const { useUserProfileMutation } = portfolioCaApi;

export const portfolioActions = {
  useUserProfileMutation,
  useProfileQuery,
  useApplicationsQuery,
  useChangeAccountLeverageMutation,
  useTradeAccountInfoQuery,
  useGetDealsAccountsQuery,
  useGetDealsInfoQuery,
  useGetPositionInfoQuery,
  useGetClosedPositionInfoQuery,
  useGetSymbolLastTickQuery,
  useGetSymbolConfigMutation,
  useEditPendingOrderMutation,
  useClosePositionMutation,
  usePlaceOrderByMoneyAmountMutation,
  usePlaceOrderMutation,
  useOpenPositionByMoneyAmountMutation,
  useEditPositionMutation,
  useCalculatePositionQuery,
  useCalculatePendingOrderQuery,
  usePositionMaxMarginQuery,
  useOrderMaxQuery,
  useGetPendingOrderInfoQuery,
  useDeletePendingOrderQuery,
  useGetTradeAssetsQuery,
  useChangeLanguageMutation
};

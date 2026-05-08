import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQueryWithLogger, cmsBaseQueryWithLogger, mt5BaseQueryWithLogger, jsonParse } from '@/helpers';
import { api } from '@/constants';
import { walletSlice, portfolioSlice } from '@/store/slices';
import {
  DepositResponse,
  MakeDeposit,
  NewTransfer,
  NewWalletArgs,
  PSP,
  ParsedPaymentMethod,
  PaymentDetails,
  PaymentMethod,
  UserAccount,
  WithdrawPayments,
  WithdrawUploadBody,
  TransactionsBody,
  TransactionsData,
  TransfersBody,
  TransfersData,
  CancelTransactionData,
  ParsedWalletData,
  WalletData,
  DepositFeesBody,
  Fees,
  WithdrawalDetailBody,
  WithdrawalDetail,
  UnverifiedPaymentMethod,
  ParsedUnverifiedPaymentMethod
} from '@/store/slices/wallet/types';
import {
  walletConfigsParser,
  walletPaymentMethodConfingsParser,
  unverifiedPaymentMethodConfingsParser
} from './parsers';
import { RootState } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const { CONTEST_TYPE_ID, DEMO_TYPE_ID, DEEPLINKING_PREFIX_PROD } = Config;

const {
  actions: {
    setWalletAccount,
    setTradingAccount,
    setTradingAccounts,
    setCashbackAccount,
    setRewardsAccount,
    setDepositPayments,
    setDepositAccount,
    setPaymentMethods,
    setUnverifiedPaymentMethods,
    setWithdrawAccount,
    setWithdrawPayments,
    setHasIBWallet,
    setDemoAccounts,
    setDemoContestAccount,
    setContestAccount,
    setAccountConfigs
  }
} = walletSlice;

const {
  actions: { setSelectedAccount }
} = portfolioSlice;

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: apiBaseQueryWithLogger,
  endpoints: (builder) => ({
    getAccounts: builder.mutation<UserAccount[], { category?: string; scope?: string }>({
      query: (body) => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: body.category || 'live',
          scope: body.scope || 'all'
        }
      })
    }),
    createNewAccount: builder.mutation<any, NewWalletArgs>({
      query: (body) => ({
        url: api.wallet.newAccount,
        body,
        method: 'POST'
      })
    }),
    getWalletAccounts: builder.query<UserAccount[], void>({
      query: () => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: 'wallet',
          scope: 'all'
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;
          const { data: walletData } = response || {};

          const store = getState() as RootState;
          const { common, wallet } = store || {};
          const { accountConfigs = [] } = wallet || {};

          const mappedConfigs = new Map(accountConfigs.map((item: any) => [`${item.systemTypeId}`, item]));

          const data: UserAccount[] = [];

          for (let i = 0; i < walletData.length; i++) {
            const currentAccount = walletData[i];

            const typeID = `${currentAccount.typeId}`;
            const config = mappedConfigs.get(typeID);

            data.push({
              ...currentAccount,
              ...(!!config && config)
            });
          }

          const walletTypeId = common?.config?.trading?.walletTypeIds?.find((el) => el);

          if (!walletTypeId) {
            return;
          }

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) {
            return;
          }

          const walletAccount = data.find((el) => `${el.typeId}` === `${walletTypeId}`);

          if (!walletAccount) {
            return;
          }

          dispatch(setWalletAccount(walletAccount));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    getDemoTradingAccounts: builder.query<UserAccount[], void>({
      query: () => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: 'demo',
          scope: 'all'
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;
          const { data: demoData } = response || {};

          const {
            wallet: { accountConfigs = [] }
          } = getState() as RootState;

          const mappedConfigs = new Map(accountConfigs.map((item: any) => [`${item.systemTypeId}`, item]));

          const data: UserAccount[] = [];

          for (let i = 0; i < demoData.length; i++) {
            const currentAccount = demoData[i];

            const typeID = `${currentAccount.typeId}`;
            const config = mappedConfigs.get(typeID);

            data.push({
              ...currentAccount,
              ...(!!config && config)
            });
          }

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) return;

          dispatch(setDemoAccounts(data));
        } catch (error) {
          console.error(error);
        }
      }
    }),
    getTradingAccounts: builder.query<UserAccount[], void>({
      query: () => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: 'live',
          scope: 'all'
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;
          const { data: allLiveAccounts } = response || {};

          const demoAccountsResponse =
            (await dispatch(walletApi.endpoints.getDemoTradingAccounts.initiate()).unwrap()) || [];

          const concatData = [...allLiveAccounts, ...demoAccountsResponse];

          const {
            wallet: { accountConfigs = [] }
          } = getState() as RootState;

          const mappedConfigs = new Map(accountConfigs.map((item: any) => [`${item.systemTypeId}`, item]));

          const data: UserAccount[] = [];

          for (let i = 0; i < concatData.length; i++) {
            const currentAccount = concatData[i];

            const typeID = `${currentAccount.typeId}`;
            const config = mappedConfigs.get(typeID);

            data.push({
              ...currentAccount,
              ...(!!config && config)
            });
          }

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) {
            return;
          }

          const store = getState() as RootState;
          const {
            common,
            portfolio: { userInfo }
          } = store || {};
          const liveAccountTypeIds = common?.config?.trading?.accountTypeIds || [];

          let filteredData: UserAccount[] = [];
          const filteredIdsTemp: number[] = [];
          const filteredLoginsTemp: string[] = [];

          for (let i = 0; i < data.length; i++) {
            const account = data[i];
            for (let j = 0; j < liveAccountTypeIds.length; j++) {
              const liveTypeId = liveAccountTypeIds[j];
              if (
                account.typeId === liveTypeId &&
                !(filteredIdsTemp.includes(liveTypeId) && filteredLoginsTemp.includes(account.login))
              ) {
                filteredData.push(account);
                filteredIdsTemp.push(liveTypeId);
                filteredLoginsTemp.push(account.login);
              }
            }
          }

          const userId = userInfo.id || 0;
          let storedDefaultAccount = await AsyncStorage.getItem('default-trading-account');
          if (storedDefaultAccount) {
            const parsedDefaultAccount = jsonParse(storedDefaultAccount);
            if (parsedDefaultAccount) {
              const exactUserDefaultAccount = parsedDefaultAccount[userId];
              if (exactUserDefaultAccount) {
                storedDefaultAccount = exactUserDefaultAccount;
              } else storedDefaultAccount = '';
            }
          }

          filteredData = filteredData.sort((a, b) => {
            if (storedDefaultAccount) {
              if (a.login === storedDefaultAccount) return -1;
              if (b.login === storedDefaultAccount) return 1;
            }
            return a.type.displayOrder - b.type.displayOrder;
          });

          dispatch(setTradingAccounts(filteredData));

          const demoAccounts = filteredData.filter((item) => `${item.typeId}` === `${DEMO_TYPE_ID}`) || {};
          const contestAccounts = filteredData.filter((item) => `${item.typeId}` === `${CONTEST_TYPE_ID}`) || {};

          dispatch(setDemoContestAccount(demoAccounts));
          dispatch(setContestAccount(contestAccounts));

          if (!liveAccountTypeIds.length) {
            return;
          }

          let tradingAccount = filteredData[0];

          if (storedDefaultAccount)
            tradingAccount =
              filteredData.find((item) => `${item.login}` === `${storedDefaultAccount}`) || filteredData[0];

          if (!tradingAccount) {
            return;
          }

          if (`${storedDefaultAccount}` !== `${tradingAccount.login}`)
            await AsyncStorage.setItem('default-trading-account', String(tradingAccount.login));
          dispatch(setTradingAccount(tradingAccount));

          const { login } = tradingAccount || {};

          if (login) {
            dispatch(setSelectedAccount(Number(login)));
          }
        } catch (error) {
          console.log(error);
        }
      }
    }),
    getCashbackAccounts: builder.query<UserAccount[], void>({
      query: () => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: 'cashback_wallet',
          scope: 'all'
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;
          const { data: cashbackData } = response || {};

          const store = getState() as RootState;
          const {
            common,
            wallet: { accountConfigs = [] }
          } = store || {};

          const { config } = common || {};
          const { cashback: chachbackTypeId } = config || {};

          const mappedConfigs = new Map(accountConfigs.map((item: any) => [`${item.systemTypeId}`, item]));

          const data: UserAccount[] = [];

          for (let i = 0; i < cashbackData.length; i++) {
            const currentAccount = cashbackData[i];

            const typeID = `${currentAccount.typeId}`;
            const config = mappedConfigs.get(typeID);

            data.push({
              ...currentAccount,
              ...(!!config && config)
            });
          }

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) {
            return;
          }

          const cashbackAccount = data.find((el) => el?.typeId === chachbackTypeId);

          if (!cashbackAccount) {
            return;
          }

          dispatch(setCashbackAccount(cashbackAccount));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    getRewardsAccounts: builder.query<UserAccount[], void>({
      query: () => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: 'ib_wallet',
          scope: 'all'
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;
          const { data: rewardsData } = response || {};

          const {
            wallet: { accountConfigs = [] }
          } = getState() as RootState;

          const mappedConfigs = new Map(accountConfigs.map((item: any) => [`${item.systemTypeId}`, item]));

          const data: UserAccount[] = [];

          for (let i = 0; i < rewardsData.length; i++) {
            const currentAccount = rewardsData[i];

            const typeID = `${currentAccount.typeId}`;
            const config = mappedConfigs.get(typeID);

            data.push({
              ...currentAccount,
              ...(!!config && config)
            });
          }

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) {
            dispatch(setHasIBWallet(false));
            return;
          }

          const rewardsAccount = data.find((el) => el);

          if (!rewardsAccount) {
            dispatch(setHasIBWallet(false));
            return;
          }

          dispatch(setHasIBWallet(true));
          dispatch(setRewardsAccount(rewardsAccount));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    cancelTransaction: builder.mutation<CancelTransactionData, { id: string | number }>({
      query: ({ id }: { id: string | number }) => ({
        url: api.wallet.cancelTransaction(id),
        method: 'PATCH'
      })
    }),
    getTransactions: builder.mutation<TransactionsData, TransactionsBody>({
      query: ({ offset, limit, filtersField, filtersValue, sortingField, extraFilters = [] }) => ({
        url: api.wallet.transactions,
        method: 'POST',
        body: {
          tableConfig: {
            filters: [
              {
                field: filtersField || '',
                modificator: 'Equals',
                value: filtersValue || ['string']
              },
              ...extraFilters
            ],
            segment: {
              limit: limit || 500,
              offset: offset || 0
            },
            sorting: {
              field: sortingField || 'string',
              direction: 'DESC'
            },
            csv: false,
            withTotals: false
          }
        }
      })
    }),
    getTransfers: builder.mutation<TransfersData, TransfersBody>({
      query: ({ offset, limit, filtersField, filtersValue, sortingField }) => ({
        url: api.wallet.transfers,
        method: 'POST',
        body: {
          tableConfig: {
            filters: [
              {
                field: filtersField || 'string',
                modificator: 'Equals',
                value: filtersValue || ['string']
              }
            ],
            segment: {
              limit: limit || 500,
              offset: offset || 0
            },
            sorting: {
              field: sortingField || 'string',
              direction: 'DESC'
            },
            csv: false,
            withTotals: false
          }
        }
      })
    }),
    getDepositPayments: builder.query<PSP[], string>({
      query: (arg: string) => ({
        url: api.wallet.depositPayments(arg),
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response;

          const hasData = Boolean(data);

          if (!hasData) return;

          dispatch(setDepositPayments(data));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    getWithdrawPayments: builder.query<WithdrawPayments[], string>({
      query: (arg: string) => ({
        url: api.wallet.withdrawPayments(arg),
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response;

          const hasData = Boolean(data);

          if (!hasData) return;

          dispatch(setWithdrawPayments(data));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    getDepositAccounts: builder.mutation<UserAccount[], void>({
      query: () => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: 'wallet',
          scope: 'all'
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;

          const { data } = response;

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) return;

          const store = getState() as RootState;
          const { common } = store || {};
          const walletTypeId = common?.config?.trading?.walletTypeIds?.find((el) => el);

          const filteredData = data.filter((el) => el.typeId === walletTypeId);

          dispatch(setDepositAccount(filteredData));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    getWithdrawAccounts: builder.mutation<UserAccount[], void>({
      query: () => ({
        url: api.wallet.accounts,
        method: 'POST',
        body: {
          category: 'wallet',
          scope: 'all'
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const response = await queryFulfilled;

          const { data } = response;

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) return;

          const store = getState() as RootState;
          const { common } = store || {};
          const walletTypeId = common?.config?.trading?.walletTypeIds?.find((el) => el);

          const filteredData = data.filter((el) => el.typeId === walletTypeId);

          dispatch(setWithdrawAccount(filteredData));
        } catch (error) {
          console.log(error);
        }
      }
    }),
    getDepositFees: builder.mutation<Fees[], DepositFeesBody>({
      query: (body) => ({
        url: api.wallet.depositFees,
        method: 'POST',
        body
      })
    }),
    getWithdrawalDetail: builder.mutation<WithdrawalDetail, WithdrawalDetailBody>({
      query: (body) => ({
        url: api.wallet.withdrawalDetail,
        method: 'POST',
        body
      })
    }),
    getPaymentDetails: builder.query<PaymentDetails[], number | undefined>({
      query: (arg) => ({
        url: api.wallet.paymentDetails(arg),
        method: 'GET'
      })
    }),
    makeDeposit: builder.mutation<DepositResponse, MakeDeposit>({
      query: (body) => ({
        url: api.wallet.makeDeposit,
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          Origin: DEEPLINKING_PREFIX_PROD,
          Referer: `${DEEPLINKING_PREFIX_PROD}/`
        }
      })
    }),
    getPaymentDetailsConfig: builder.query<any, any>({
      query: () => ({
        url: api.wallet.paymentDetailsConfig,
        method: 'GET'
      })
    }),
    payout: builder.mutation<any, MakeDeposit>({
      query: (args) => ({
        url: api.wallet.payout,
        body: args,
        method: 'POST'
      })
    }),
    upload: builder.mutation<any, WithdrawUploadBody>({
      query: (args) => ({
        url: api.wallet.upload,
        body: args,
        method: 'POST'
      })
    }),
    transfer: builder.mutation<any, NewTransfer>({
      query: (body) => ({
        url: api.wallet.transfer,
        body,
        method: 'POST'
      })
    }),
    checkTransfer: builder.mutation<any, NewTransfer>({
      query: (body) => ({
        url: api.wallet.checkTransfer,
        body,
        method: 'POST'
      })
    }),
    deletePaymentAccount: builder.mutation<any, number>({
      query: (arg) => ({
        url: api.wallet.paymentDetails(arg),
        method: 'DELETE'
      })
    }),
    getCashbackBreakdown: builder.mutation<any, any>({
      query: (args) => ({
        url: api.market.getCashbackBreakdown,
        method: 'POST',
        body: args
      })
    })
  })
});

export const walletMt5Api = createApi({
  reducerPath: 'walletMt5Api',
  baseQuery: mt5BaseQueryWithLogger,
  endpoints: (builder) => ({
    changeAccountType: builder.mutation<any, any>({
      query: (args) => ({
        url: api.wallet.changeGroup(args),
        method: 'POST'
      })
    })
  })
});

export const walletCmsApi = createApi({
  reducerPath: 'walletCmsApi',
  baseQuery: cmsBaseQueryWithLogger,
  endpoints: (builder) => ({
    getPaymentMethodConfigs: builder.query<ParsedPaymentMethod[], void>({
      query: () => ({
        url: api.wallet.paymentMethodConfigs,
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response;

          const hasData = Boolean(data);
          if (!hasData) return;

          dispatch(setPaymentMethods(data));
        } catch (error) {
          console.log(error);
        }
      },
      transformResponse: (response: { data: PaymentMethod[] }) => walletPaymentMethodConfingsParser(response?.data)
    }),
    getUnverifiedPaymentMethodConfigs: builder.query<ParsedUnverifiedPaymentMethod[], void>({
      query: () => ({
        url: api.wallet.unverifiedPaymentMethodConfigs,
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          const { data } = response;

          const hasData = Boolean(data);
          if (!hasData) return;

          dispatch(setUnverifiedPaymentMethods(data));
        } catch (error) {
          console.log(error);
        }
      },
      transformResponse: (response: { data: UnverifiedPaymentMethod[] }) =>
        unverifiedPaymentMethodConfingsParser(response?.data)
    }),
    accountTypeConfig: builder.query<ParsedWalletData, string>({
      query: (typeID) => ({
        url: api.wallet.accountTypeConfig(typeID),
        method: 'GET'
      })
    }),
    accountTypeConfigs: builder.query<ParsedWalletData[], void>({
      query: () => ({
        url: api.wallet.accountTypeConfigs,
        method: 'GET'
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;

          const { data } = response;

          const isData = Boolean(data && Array.isArray(data) && data.length > 0);

          if (!isData) return;

          dispatch(setAccountConfigs(data));
        } catch (error) {
          console.log(error);
        }
      },
      transformResponse: (response: { data: WalletData[] }) => walletConfigsParser(response?.data)
    })
  })
});

export const {
  useGetDepositFeesMutation: useGetDepositFees,
  useGetWithdrawalDetailMutation: useGetWithdrawalDetail,
  useCancelTransactionMutation: useCancelTransaction,
  useGetAccountsMutation,
  useLazyGetWalletAccountsQuery: useGetWalletAccountsMutation,
  useLazyGetTradingAccountsQuery: useGetTradingAccountsMutation,
  useLazyGetCashbackAccountsQuery: useGetCashbackAccountsMutation,
  useLazyGetRewardsAccountsQuery: useGetRewardsAccountsMutation,
  useLazyGetDemoTradingAccountsQuery: useGetDemoTradingAccountsMutation,
  useGetTransactionsMutation,
  useGetTransfersMutation,
  useLazyGetDepositPaymentsQuery: useGetDepositPaymentsQuery,
  useGetDepositAccountsMutation,
  useMakeDepositMutation,
  useLazyGetPaymentDetailsQuery: useGetPaymentDetailsQuery,
  useGetWithdrawAccountsMutation,
  useLazyGetWithdrawPaymentsQuery: useGetWithdrawPaymentsQuery,
  useLazyGetPaymentDetailsConfigQuery: useGetPaymentDetailsConfigQuery,
  usePayoutMutation,
  useUploadMutation,
  useTransferMutation,
  useCheckTransferMutation,
  useCreateNewAccountMutation: useCreateNewAccount,
  useDeletePaymentAccountMutation,
  useGetCashbackBreakdownMutation
} = walletApi;

export const { useChangeAccountTypeMutation: useChangeAccountType } = walletMt5Api;

export const {
  useLazyGetPaymentMethodConfigsQuery: useGetPaymentMethodConfigsQuery,
  useLazyGetUnverifiedPaymentMethodConfigsQuery: useGetUnverifiedPaymentMethodConfigsQuery,
  useLazyAccountTypeConfigQuery: useAccountTypeConfigQuery,
  useLazyAccountTypeConfigsQuery: useAccountTypeConfigsQuery
} = walletCmsApi;

export const walletActions = {
  useGetDepositFees,
  useGetWithdrawalDetail,
  useCancelTransaction,
  useGetAccountsMutation,
  useCreateNewAccount,
  useGetWalletAccountsMutation,
  useGetTradingAccountsMutation,
  useGetCashbackAccountsMutation,
  useGetRewardsAccountsMutation,
  useGetDemoTradingAccountsMutation,
  useGetTransactionsMutation,
  useGetTransfersMutation,
  useGetDepositPaymentsQuery,
  useGetDepositAccountsMutation,
  useGetPaymentMethodConfigsQuery,
  useMakeDepositMutation,
  useGetPaymentDetailsQuery,
  useGetWithdrawAccountsMutation,
  useGetWithdrawPaymentsQuery,
  useGetPaymentDetailsConfigQuery,
  useGetUnverifiedPaymentMethodConfigsQuery,
  usePayoutMutation,
  useUploadMutation,
  useTransferMutation,
  useCheckTransferMutation,
  useGetCashbackBreakdownMutation,
  useAccountTypeConfigQuery,
  useAccountTypeConfigsQuery,
  useChangeAccountType
};

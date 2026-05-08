import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { InitialState, PSP, UserAccount } from './types';
import Config from 'react-native-config';

const { DASHBOARD_URL } = Config || {};

const initialState: InitialState = {
  accounts: {
    wallet: {} as UserAccount,
    trading: {} as UserAccount,
    cashback: {} as UserAccount,
    rewards: {} as UserAccount,
    demoContest: [] as UserAccount[],
    contest: [] as UserAccount[]
  },
  tradingAccounts: [],
  depositPayments: [],
  depositAccounts: [],
  paymentMethods: [],
  unverifiedPaymentMethods: [],
  withdrawAccounts: [],
  withdrawPayments: [],
  balance: 0,
  hasIBWallet: false,
  accountConfigs: [],
  demoAccounts: [],
  accountTypeId: 0
};

export const walletSlice = createSlice({
  initialState,
  name: 'wallet',
  reducers: {
    setAccountType: (state, { payload }) => {
      state.accountTypeId = payload;
    },
    setAccountConfigs: (state, { payload }) => {
      state.accountConfigs = payload;
    },
    setWalletAccount: (state, { payload }: PayloadAction<UserAccount>) => {
      state.accounts.wallet = payload || {};
    },
    setTradingAccount: (state, { payload }: PayloadAction<UserAccount>) => {
      state.accounts.trading = payload || {};
      state.accountTypeId = state.accounts.trading.type.id;
    },
    setCashbackAccount: (state, { payload }: PayloadAction<UserAccount>) => {
      state.accounts.cashback = payload || {};
    },
    setHasIBWallet: (state, { payload }) => {
      state.hasIBWallet = payload;
    },
    setRewardsAccount: (state, { payload }: PayloadAction<UserAccount>) => {
      state.accounts.rewards = payload || {};
    },
    setTradingAccounts: (state, { payload }: PayloadAction<UserAccount[]>) => {
      state.tradingAccounts = payload || [];
    },
    setDemoAccounts: (state, { payload }) => {
      state.demoAccounts = payload;
    },
    setDemoContestAccount: (state, { payload }) => {
      state.accounts.demoContest = payload;
    },
    setContestAccount: (state, { payload }) => {
      state.accounts.contest = payload;
    },
    setDepositPayments: (state, { payload }: PayloadAction<PSP[]>) => {
      if (state.paymentMethods.length && payload?.length) {
        const paymentMethodsMap = new Map(state.paymentMethods.map((item) => [item.systemId, item]));
        const newDepositPaymentsAsArray = [...payload] as InitialState['depositPayments'];

        for (let i = 0; i < payload.length; i++) {
          const depositPayment = payload[i];
          const stringID = depositPayment.id.toString();

          const config = paymentMethodsMap.get(stringID);

          if (config) {
            const { displayName, methodGroup, logo, depositGuides, systemId } = config;
            newDepositPaymentsAsArray[i] = {
              ...depositPayment,
              ...(methodGroup && { methodGroup }),
              ...(displayName && { displayName }),
              ...(logo && { logo }),
              ...(!!depositGuides && { depositGuides }),
              ...(!!systemId && { systemId })
            };
          } else {
            newDepositPaymentsAsArray[i] = {
              ...depositPayment,
              logo: depositPayment.logo ? `${DASHBOARD_URL}${depositPayment.logo}` : ''
            };
          }
        }

        state.depositPayments = newDepositPaymentsAsArray;
      } else state.depositPayments = payload;
    },
    setWithdrawPayments: (state, { payload }) => {
      if (state.paymentMethods.length && payload?.length) {
        const paymentMethodsMap = new Map(state.paymentMethods.map((item) => [item.systemId, item]));
        const newWithdrawPaymentsAsArray = [...payload] as InitialState['withdrawPayments'];

        for (let i = 0; i < payload.length; i++) {
          const withdrawPayment = payload[i];
          const stringID = withdrawPayment.id.toString();

          const config = paymentMethodsMap.get(stringID);

          if (config) {
            const { displayName, methodGroup, logo } = config;
            newWithdrawPaymentsAsArray[i] = {
              ...withdrawPayment,
              ...(methodGroup && { methodGroup }),
              ...(displayName && { displayName }),
              ...(logo && { logo })
            };
          } else {
            newWithdrawPaymentsAsArray[i] = {
              ...withdrawPayment,
              logo: withdrawPayment.logo ? `${DASHBOARD_URL}${withdrawPayment.logo}` : ''
            };
          }
        }

        state.withdrawPayments = newWithdrawPaymentsAsArray;
      } else state.withdrawPayments = payload;
    },
    setDepositAccount: (state, { payload }) => {
      state.depositAccounts = payload;
    },
    setPaymentMethods: (state, { payload }) => {
      state.paymentMethods = payload;
    },
    setUnverifiedPaymentMethods: (state, { payload }) => {
      state.unverifiedPaymentMethods = payload;
    },
    setWithdrawAccount: (state, { payload }) => {
      state.withdrawAccounts = payload;
    },
    setBalance: (state, { payload }) => {
      state.balance = payload;
    }
  }
});

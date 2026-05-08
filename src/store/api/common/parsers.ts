import { CommonConfigData, ParsedCommonConfigData } from './types';
import Config from 'react-native-config';

const {
  MIN_INVESTMENT_AMOUNT,
  WALLET_TYPE_ID,
  LIVE_TYPE_ID,
  PRIMARY_TYPE_ID,
  CASHBACK_TYPE_ID,
  PRIMARY_ACCOUNT_LEVERAGE,
  WALLET_LEVERAGE
} = Config || {};

export const commonConfigParser = (data: CommonConfigData): ParsedCommonConfigData => {
  return {
    trading: {
      minInvestmentAmount: data?.attributes?.minInvestmentAmount || Number(MIN_INVESTMENT_AMOUNT),
      walletTypeIds: data?.attributes?.walletTypeIds || [Number(WALLET_TYPE_ID)],
      accountTypeIds: data?.attributes?.accountTypeIds || [Number(LIVE_TYPE_ID)],
      primaryAccount: data?.attributes?.primaryAccount || Number(PRIMARY_TYPE_ID),
      primaryAccountLeverage: data?.attributes?.primaryAccountLeverage || Number(PRIMARY_ACCOUNT_LEVERAGE),
      walletLeverage: data?.attributes?.walletLeverage || Number(WALLET_LEVERAGE)
    },
    cashback: data?.attributes?.cashbackTypeId || Number(CASHBACK_TYPE_ID),
    socialAuth: {
      android: data?.attributes?.socialAuth?.android || false,
      ios: data?.attributes?.socialAuth?.ios || false
    },
    skipPhoneVerification: data?.attributes?.skipPhoneVerification || []
  };
};

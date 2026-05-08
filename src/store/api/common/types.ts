export interface CommonConfigDataAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  minInvestmentAmount: number;
  walletTypeIds: number[];
  accountTypeIds: number[];
  primaryAccount: number;
  cashbackTypeId: number;
  primaryAccountLeverage: number;
  walletLeverage: number;
  socialAuth: {
    android: boolean;
    id: number;
    ios: boolean;
  };
  skipPhoneVerification: string[] | null;
}

export interface CommonConfigData {
  id: number;
  attributes: CommonConfigDataAttributes;
}

export interface ParsedCommonConfigData {
  trading: {
    minInvestmentAmount: number;
    walletTypeIds: number[];
    accountTypeIds: number[];
    primaryAccount: number;
    primaryAccountLeverage: number;
    walletLeverage: number;
  };
  cashback: number;
  socialAuth: {
    android: boolean;
    ios: boolean;
  };
  skipPhoneVerification: string[];
}

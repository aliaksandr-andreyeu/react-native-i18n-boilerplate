export interface Config {
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

export interface CommonState {
  config: Config;
  loggedInBefore: boolean;
  fbInitialUrlChecked: boolean;
}

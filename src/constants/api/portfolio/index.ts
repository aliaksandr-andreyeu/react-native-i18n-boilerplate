import dateHelper from '@/helpers/dateHelper';
import {
  DeleteOrderInfoArgs,
  ClosePosition,
  DealsInfoArgs,
  EditPositionInfoArgs,
  PositionInfoArgs,
  SymbolLastTickArgs
} from '@/store/api/portfolio/types';

const portfolio = {
  userProfile: '/user',
  profile: '/profile',
  verifyEmail: '/profile/verify-email',
  questionnaireAnswers: '/applications/upload',
  verifyEmailValidate: (hash: string) => `/profile/verify-email/validate/${hash}`,
  applications: '/applications',
  accounts: '/accounts',
  changeAccountLeverage: '/accounts/change/leverage',
  getTradeAccountInfo: (accountId: number, userId: number) =>
    `/TradeHistory/Account?userId=${userId}&accountId=${accountId}`,
  getDealsInfo: ({ userId, accountId, from, page = 1, recordsPerPage = 50, to }: DealsInfoArgs) => {
    let base = `/TradeHistory/Deals?userId=${userId}&accountId=${accountId}&page=${page}&recordsPerPage=${recordsPerPage}`;
    const add = (field: string, val: number) => (base += `&${field}=${val}`);
    if (from !== undefined) add('from', from || dateHelper.toStartUnix());
    if (to !== undefined) add('to', to || dateHelper.toEndUnix());
    return base;
  },
  tradingAssets: '/trading-assets?populate=*&pagination[limit]=-1',
  getDealsAccounts: (userId: number) => `/TradeHistory?userId=${userId}`,
  getPositionInfo: ({ accountId, ticket }: PositionInfoArgs) =>
    `/Trade/PositionInfo?accountId=${accountId}&positionTicket=${ticket}`,
  getClosedPositionInfo: ({
    accountId,
    userId,
    positionTicket
  }: {
    accountId: number;
    userId: number;
    positionTicket: string;
  }) => `/TradeHistory/Positions/${positionTicket}?accountId=${accountId}&userId=${userId}`,
  getSymbolLastTick: ({ accountId, symbol }: SymbolLastTickArgs) =>
    `/Trade/SymbolLastTick?symbol=${symbol}${accountId ? `&accountId=${accountId}` : ''}`,
  getSymbolConfig: ({ symbol, accountId }: { symbol: string; accountId: number }) =>
    `/Trade/SymbolConf?symbol=${symbol}&accountId=${accountId}`,
  openPositionByMoneyAmount: `/Trade/OpenPositionByMoneyAmount`,
  openPosition: `/Trade/OpenPosition`,
  calculatePosition: `/Trade/CalculatePosition`,
  calculatePendingOrder: `/Trade/CalculatePendingOrder`,
  positionMaxMargin: `/Trade/PositionMaxMargin`,
  orderMax: `/Trade/OrderMaxVolume`,
  placeOrderByMoneyAmount: '/Trade/PlaceOrderBymoneyAmount',
  placeOrder: '/Trade/PlaceOrder',
  calculateLimits: '/Trade/CalculateLimits',
  calculateMargin: '/Trade/PositionMargin',
  editPosition: ({ accountId, ticket, stopLoss, takeProfit }: EditPositionInfoArgs) => {
    let url = `/Trade/ModifyPosition?accountId=${accountId}&positionId=${ticket}`;

    if (stopLoss) {
      url = url + `&stopLoss=${stopLoss}`;
    }
    if (takeProfit) {
      url = url + `&takeProfit=${takeProfit}`;
    }
    return url;
  },
  getOrderInfo: ({ accountId, ticket }: PositionInfoArgs) => `/Trade/GetOrder?accountId=${accountId}&orderId=${ticket}`,
  editOrder: '/Trade/ModifyOrder',
  deleteOrder: ({ accountId, orderId }: DeleteOrderInfoArgs) =>
    `/Trade/DeleteOrder?accountId=${accountId}&orderId=${orderId}`,
  closePosition: ({ accountId, partialClosingVolume, positionId }: ClosePosition) => {
    if (!partialClosingVolume) {
      return `/Trade/ClosePosition?accountId=${accountId}&positionId=${positionId}`; // full close (100%)
    }
    return `/Trade/ClosePosition?accountId=${accountId}&positionId=${positionId}&partialClosingVolume=${partialClosingVolume}`;
  },
  changeLanguage: '/profile/change-language',
  verifyPhone: '/profile/phone/verify',
  changePhone: '/profile/change-phone'
};

export default portfolio;

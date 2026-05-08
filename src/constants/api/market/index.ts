const market = {
  getAllSymbols: (accountId: number) => `/User/AllSymbols${accountId ? `?accountId=${accountId}` : ''}`,
  getCandlesHistory: ({ accountId, symbol, period }: { accountId: number; symbol: string; period: string }) =>
    `/Charts/CandelsHistory?${accountId ? `accountId=${accountId}&` : ''}symbol=${symbol}&period=${period}`,
  getCategories: (accountId: number) => `/User/Groups?accountId=${accountId}`,
  getSymbols: (accountId: number, groupName: string) =>
    `/User/Groups/Symbols?accountId=${accountId}&groupName=${groupName}`,
  getSignals: (accountId?: number, language?: string) => {
    const params = [
      {
        key: 'accountId',
        value: accountId
      },
      {
        key: 'language',
        value: language
      }
    ]
      .filter(({ value }) => value)
      .map(({ key, value }) => `${key}=${value}`)
      .join('&');

    return `/Acuity${params ? `?${params}` : ''}`;
  },
  getRecentActivities: ({
    accountId,
    count = 10,
    from = 0,
    to = 0
  }: {
    accountId: number | null;
    count: number;
    from: number;
    to: number;
  }) =>
    `/TradeHistory/RecentActivity?${accountId ? `accountId=${accountId}&` : ''}count=${count}&from=${from}&to=${to}`,
  getCashbackBreakdown: '/cashback-breakdown'
};

export default market;

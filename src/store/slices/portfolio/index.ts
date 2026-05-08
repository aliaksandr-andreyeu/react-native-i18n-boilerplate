import { createSlice } from '@reduxjs/toolkit';
import { PortfolioState, UserInfo, AccountData, DealsInfo, DealsAccounts } from './types';
import dayjs from 'dayjs';
import dateHelper from '@/helpers/dateHelper';
import { ColorValue } from 'react-native';

const fillObj = { color: '#70d7c7', textColor: 'white' };

const getDates = (startDate: string, endDate: Date) => {
  const dates: Record<string, { color: ColorValue; textColor: ColorValue }> = {};
  let currentDate = new Date(startDate);
  const endTimestamp = endDate.getTime();

  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate.getTime() < endTimestamp) {
    const dateString = currentDate.toISOString().slice(0, 10);
    dates[dateString] = fillObj;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const initialState: PortfolioState = {
  userInfo: {} as UserInfo,
  applications: [],
  tradeAccountInfo: {} as AccountData,
  dealsInfo: [],
  dealsSorted: [],
  dealsAccounts: [],
  tradingAssets: [],
  dateRange: [
    dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    dateHelper.current('YYYY-MM-DD'),
    getDates(dayjs().subtract(1, 'day').format('YYYY-MM-DD'), new Date())
  ],
  selectedAccount: null,
  activeTab: 0,
  hasLastDeal: true,
  assetSymbolData: {},
  lastValues: undefined,
  exitFromDate: false,
  lastErrors: {}
};

export const portfolioSlice = createSlice({
  initialState,
  name: 'portfolio',
  reducers: {
    setLastErrors: (state, { payload }) => {
      state.lastErrors = payload;
    },
    setLastValues: (state, { payload }) => {
      state.lastValues = payload;
    },
    setExitFromDate: (state, { payload }) => {
      state.exitFromDate = payload;
    },
    setAssetSymbolData: (state, { payload }) => {
      state.assetSymbolData = payload || {};
    },
    setUserInfo: (state, { payload }) => {
      state.userInfo = payload || {};
    },
    setApplications: (state, { payload }) => {
      state.applications = payload || [];
    },
    setTradeAccountInfo: (state, { payload }) => {
      state.tradeAccountInfo = payload || {};
    },
    setDealsInfo: (state, { payload }: { payload: DealsInfo[] }) => {
      if (payload?.length > 0 && state.tradingAssets.length) {
        state.dealsInfo = [...state.dealsInfo, ...payload];
        state.hasLastDeal = true;

        const sections = new Map(state.dealsSorted.map((dealInfo) => [dealInfo.title, dealInfo]));

        const assetMap = new Map(state.tradingAssets.map((asset) => [asset.systemName, asset]));

        for (let i = 0; i < payload.length; i++) {
          const deal = payload[i];

          if (deal.entry === 0) continue;
          let { orders, positions, ...newDeal } = deal as any;

          const title = dateHelper.to(newDeal.time, 'DD MMMM YYYY');
          const assets = assetMap.get(newDeal.symbol);

          if (assets) Object.assign(newDeal, assets);

          if (sections.has(title)) {
            const existingDeal = sections.get(title);
            if (existingDeal) {
              const hasDuplicate = new Set(existingDeal.data.map((item) => item.ticket)).has(newDeal.ticket);
              if (!hasDuplicate) existingDeal.data.push(newDeal);
            }
          } else {
            const d = dateHelper.valueOf(deal.time);
            sections.set(title, { title, d, data: [newDeal] } as any);
          }
        }
        const filteredData = Array.from(sections.values()).sort((a: any, b: any) => b.d - a.d);
        state.dealsSorted = filteredData;
      } else {
        state.hasLastDeal = false;
      }
    },
    setDealsAccounts: (state, { payload }) => {
      const data = payload || [];

      state.dealsAccounts = data.filter(
        (item: DealsAccounts) => String(item?.accountId) === String(state.selectedAccount)
      );
    },
    setTradingAssets: (state, { payload }) => {
      state.tradingAssets = payload || [];
    },
    setDateRange: (state, { payload }) => {
      state.dateRange = payload;
    },
    resetDealsInfo: (state) => {
      state.hasLastDeal = true;
      state.dealsInfo = [];
      state.dealsSorted = [];
    },
    setSelectedAccount: (state, { payload }) => {
      state.selectedAccount = Number(payload);
    },
    setActiveTab: (state, { payload }) => {
      state.activeTab = payload;
    },
    setHasLastDeal: (state, { payload }) => {
      state.hasLastDeal = payload;
    }
  }
});

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IConfigs, ApplicationState, DefaultModalConfig, LanguageItem, PromoWelcomeAccount } from './types';
import { authSlice } from '../auth';
import { TradingSessionSchedule } from '../portfolio/types';

export interface BaseErrorInterface {
  status?: number;
  data?: {
    code?: number;
    message?: string;
    errors?: {
      children?: {
        [key: string]: undefined | { errors?: string[] };
      };
    };
  };
}

export type BaseError = BaseErrorInterface | undefined;

const initialState: ApplicationState = {
  configs: [],
  questions: null,
  modalConfig: null,
  languages: [],
  symbolsTradingSessionSchedule: {},
  promoWelcome: {} as PromoWelcomeAccount,
  abTest: 'strict-funnel'
};

export const applicationSlice = createSlice({
  initialState,
  name: 'application',
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.logOut, (state) => {
      return initialState;
    });
  },
  reducers: {
    setApplicationConfigs: (state, { payload }) => {
      const questions = payload.filter(
        (item: IConfigs) => item.type === 'questionnaire' && item.requiredForVerification
      );
      state.configs = payload;
      state.questions = questions[0] || null;
    },
    setMarketOpenSchedule: (
      state,
      action: PayloadAction<{ symbolName: string; schedule: TradingSessionSchedule[] | undefined }>
    ) => {
      const { symbolName, schedule } = action.payload;
      state.symbolsTradingSessionSchedule[symbolName] = schedule;
    },
    openModal: (state, action: PayloadAction<DefaultModalConfig | null>) => {
      state.modalConfig = action.payload;
    },
    setSupportedLanguages: (state, action: PayloadAction<LanguageItem[]>) => {
      state.languages = action.payload;
    },
    setPromoWelcome: (state, { payload }) => {
      state.promoWelcome = payload;
    },
    setABTest: (state, { payload }) => {
      state.abTest = payload;
    }
  }
});

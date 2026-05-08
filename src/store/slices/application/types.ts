import { ReactNode } from 'react';
import { CountriesCode } from '@/assets/icons/countries-flags/types';
import { ImageSourcePropType } from 'react-native';
import { TradingSessionSchedule } from '../portfolio/types';
import { BaseButtonType } from '@/components';

export interface PromoWelcomeAccount {
  conditionsCreditAmount: number;
  conditionsMarginCall: string;
  conditionsMaxLeverage: string;
  conditionsMaxPositionOrOrders: string;
  conditionsMaxPositionSize: string;
  conditionsNumberOfInstruments: string;
  conditionsStopOut: string;
  createdAt: string;
  description: string;
  locale: string;
  publishedAt: Date | string;
  title: string;
  updatedAt: Date | string;
  welcomeAccountTypeId: number;
}

export type ABTEST = 'control' | 'strict-funnel' | undefined;

export interface ApplicationState {
  configs: IConfigs[];
  questions: IConfigs | null;
  symbolsTradingSessionSchedule: SymbolsTradingSessionSchedule;
  modalConfig: DefaultModalConfig | null;
  languages: Array<LanguageItem>;
  promoWelcome: PromoWelcomeAccount;
  abTest: ABTEST;
}

export type LanguageItem = {
  name: string;
  language: CountriesCode;
};
export interface DefaultModalConfig {
  title: string;
  subTitle?: string | ReactNode;
  icon?: ImageSourcePropType | undefined;
  iconSize?: { width: number; height: number };
  testID?: string;
  button?: {
    text: string;
    onPress?: () => void;
    type?: BaseButtonType;
  };
  secondaryButton?: {
    text: string;
    onPress?: () => void;
    type?: BaseButtonType;
  };
  onClosed?: () => void | Promise<void>;
  closeTime?: number;
}

interface SymbolsTradingSessionSchedule {
  [symbolName: string]: TradingSessionSchedule[] | undefined;
}

export interface IFields {
  choiceLabels: string[];
  choices: string[];
  dataType: string;
  description: string;
  fieldType: 'choice' | 'text';
  help: string;
  key: string;
  label: string;
  required: boolean;
  validators: string[];
  multiple: boolean;
}

interface IConfigItem {
  title: string;
  fields: IFields[];
}

export interface IConfigs {
  id: number;
  title: string;
  category: string;
  type: string;
  description: string;
  requiredForVerification: boolean;
  config: IConfigItem[];
}

export interface IFeatureFlag {
  promotion?: {
    name: string;
    restricted_countries: string; // 'US, RU, KP, IR, SY, SD'
  };
}

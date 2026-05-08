import { ParsedTradingAssets } from '@/store/api/portfolio/types';

export interface CalculateLimitsArgs {
  accountId: number;
  instrument: string;
  tradeAction: number;
}

export interface CalculateLimitsResponse {
  minVolume: number;
  maxVolume: number;
}

export interface CalculateMarginArgs {
  accountId: number;
  instrument: string;
  tradeAction: number;
  volume: number;
}

export interface CalculateMarginResponse {
  margin: number;
  value: number;
}

interface ApplicationData {
  format: string;
  data: Record<string, any>;
  meta: Record<string, any>;
}

interface ApplicationConfig {
  [key: string]: {
    title: string;
    fields: Record<string, any>;
  };
}

interface ApplicationUploadConfig {
  id: number;
  title: string;
  category: string;
  type: string;
  description: string;
  requiredForVerification: boolean;
  config: ApplicationConfig;
}

export interface Application {
  id: number;
  uploadConfig: ApplicationUploadConfig;
  status: string;
  type: string;
  declineReason: string;
  createdAt: string;
  data: ApplicationData[];
}

export interface UserInfo {
  ibid?: number;
  id: number;
  cid: number;
  token: string | null;
  isIb: boolean;
  canRequestIb: boolean;
  ibLinksRestricted: boolean;
  canCreateIbLinks: boolean;
  clientType: string;
  title: string | null;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  language: string;
  email: string;
  password: string | null;
  isVerified: boolean;
  notificationPreferences: {
    helpdesk: boolean;
    transfer: boolean;
    documents: boolean;
    marketing: boolean;
    'ib-new-reg': boolean;
    applications: boolean;
    transactions: boolean;
    'payment-methods': boolean;
  };
  birthDate: Date | null;
  customFields: {
    custom_google_profile_connected: 'true' | 'false';
    custom_facebook_profile_connected: 'true' | 'false';
    document_group_1: boolean;
    custom_date_email_verified_at: Date | null;
    custom_sum_sub_applicant_id: Date | null;
    custom_date_first_live_account: Date | null;
    custom_webinar_join_url: string;
    custom_idfa?: string | null;
    custom_last_touch_platform?: 'IOS_APP' | 'ANDROID_APP' | null;
    custom_gaid?: string | null;
    custom_last_touch_os?: 'Android' | 'iOS' | null;
  };
  financialPermissions: string[];
  smsNotificationEnabled: boolean;
  twoFactorAuthEnabled: boolean;
  referralLinkId: number | null;
  firstDepositDate: Date | null;
  firstDepositId: number | null;
  lastDepositId: number | null;
  lastDepositDate: Date | null;
  lastTradedAt: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  referralCode: string;
  registrationDate: Date | null;
  marketingLinkId: number | null;
}

export interface Position {
  login: number;
  symbol: string;
  action: number;
  digits: number;
  digitsCurrency: number;
  contractSize: number;
  ticket: number;
  externalId: string;
  timeCreate: string;
  timeUpdate: string;
  priceOpen: number;
  priceCurrent: number;
  priceSL: number;
  priceTP: number;
  Volume: number;
  profit: number;
  storage: number;
  rateProfit: number;
  rateMargin: number;
  expertId: number;
  expertPositionId: number;
  comment: string;
  activationMode: number;
  activationTime: string;
  activationPrice: number;
  activationFlags: number;
  dealer: number;
  modificationFlags: number;
  reason: number;
  currencyProfit: string;
}

export interface PendingOrder {
  ticket: number;
  externalId: string;
  login: number;
  dealer: number;
  symbol: string;
  digits: number;
  digitsCurrency: number;
  contractSize: number;
  state: number;
  reason: number;
  timeSetup: string;
  timeExpiration: string;
  timeDone: string;
  type: number;
  typeFill: number;
  typeTime: number;
  priceOrder: number;
  priceTrigger: number;
  priceCurrent: number;
  priceSL: number;
  priceTP: number;
  VolumeInitial: number;
  volumeInitialExt: number;
  VolumeCurrent: number;
  expertId: number;
  positionId: number;
  positionById: number;
  comment: string;
  activationMode: number;
  activationTime: string;
  activationPrice: number;
  activationFlags: number;
  rateMargin: number;
  modificationFlags: number;
}

export interface AccountData {
  accountId: number;
  positions: Position[];
  pendingOrders: PendingOrder[];
}

export interface DealsInfo {
  login: number;
  ticket: number;
  symbol: string;
  action: number;
  entry: number;
  reason: number;
  time: string;
  dealer: number;
  timeOpened: number;
  digits: number;
  digitsCurrency: number;
  contractSize: number;
  pricePosition: number;
  price: number;
  priceSL: number;
  priceTP: number;
  ask: number;
  bid: number;
  profit: number;
  profitRaw: number;
  value: number;
  storage: number;
  commission: number;
  fee: number;
  volume: number;
  VolumeClosed: number;
  rateProfit: number;
  positionId: number;
  rateMargin: number;
  modificationFlags: number;
  order: number;
  orders: PendingOrder[];
  positions: Position[];

  isOrder?: boolean;
}

export interface SymbolLastTick {
  symbol: string;
  datetime: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  datetime_msc: number;
  flags: number;
  volume_ext: number;
}

interface TradingSession {
  open: string;
  close: string;
}

export interface TradingSessionSchedule {
  dayOfWeek: string;
  tradingSessions: TradingSession[];
}

export interface SymbolConfig {
  tradingSessionShedule: TradingSessionSchedule[];
  lastClosedPrice: number;
  symbol: string;
  path: string;
  isin: string;
  description: string;
  international: string;
  category: string;
  exchange: string;
  cfi: string;
  sector: string;
  industry: string;
  country: string;
  basis: string;
  source: string;
  page: string;
  currencyBase: string;
  currencyBaseDigits: number;
  currencyProfit: string;
  currencyProfitDigits: number;
  currencyMargin: string;
  currencyMarginDigits: number;
  color: number;
  colorBackground: number;
  digits: number;
  point: number;
  multiply: number;
  tickFlags: number;
  tickBookDepth: number;
  filterSoft: number;
  filterSoftTicks: number;
  filterHard: number;
  filterHardTicks: number;
  filterDiscard: number;
  filterSpreadMax: number;
  filterSpreadMin: number;
  filterGap: number;
  filterGapTicks: number;
  subscriptionDelay: number;
  tradeMode: number;
  calcMode: number;
  execMode: number;
  gtcMode: number;
  fillFlags: number;
  expirFlags: number;
  spread: number;
  spreadBalance: number;
  spreadDiff: number;
  spreadDiffBalance: number;
  tickValue: number;
  tickSize: number;
  contractSize: number;
  stopsLevel: number;
  freezeLevel: number;
  quotesTimeout: number;
  volumeMin: number;
  volumeMinExt: number;
  volumeMax: number;
  volumeMaxExt: number;
  volumeStep: number;
  volumestepExt: number;
  volumeLimit: number;
  volumeLimitExt: number;
  marginFlags: number;
  marginInitial: number;
  marginMaintenance: number;
  marginRateInitial: { property1: null | number; property2: null | number };
  marginRateMaintenance: { property1: null | number; property2: null | number };
  marginLong: number;
  marginShort: number;
  marginLimit: number;
  marginStop: number;
  marginStopLimit: number;
  marginHedged: number;
  marginRateCurrency: number;
  marginRateLiquidity: number;
  swapMode: number;
  swapLong: number;
  swapShort: number;
  swap3Day: number;
  leverage: number;
  margin: number;
  swapYearDays: number;
  swapFlags: number;
  swapRateSunday: number;
  swapRateMonday: number;
  swapRateTuesday: number;
  swapRateWednesday: number;
  swapRateThursday: number;
  swapRateFriday: number;
  swapRateSaturday: number;
  timeStart: number;
  timeExpiration: number;
  reFlags: number;
  reTimeout: number;
  ieCheckMode: number;
  ieTimeout: number;
  ieSlipProfit: number;
  ieSlipLosing: number;
  iEVolumeMax: number;
  iEVolumeMaxExt: number;
  ieFlags: number;
  priceSettle: number;
  priceLimitMax: number;
  priceLimitMin: number;
  tradeFlags: number;
  orderFlags: number;
  faceValue: number;
  accruedInterest: number;
  spliceType: number;
  spliceTimeType: number;
  spliceTimeDays: number;
  chartMode: number;
  optionsMode: number;
  priceStrike: number;
}

export interface DealsAccounts {
  accountId: number;
  pendingOrders: PendingOrder[];
  positions: Position[];
}

export type DateRange = [string, string, Record<string, object>];

export interface DealData {
  title: string;
  data: (DealsInfo & ParsedTradingAssets)[];
}

export type ORDER_TYPES = 'market_order' | 'pending_order';

export interface PortfolioState {
  userInfo: UserInfo;
  applications: Application[];
  tradeAccountInfo: AccountData;
  dealsInfo: DealsInfo[];
  dealsSorted: DealData[];
  dealsAccounts: DealsAccounts[];
  tradingAssets: ParsedTradingAssets[];
  dateRange: DateRange;
  selectedAccount: number | null;
  activeTab: number;
  hasLastDeal: boolean;
  assetSymbolData: any;
  lastValues: any;
  exitFromDate: boolean;
  lastErrors: any;
}

export interface DepositFeesBody {
  paymentSystemId: number;
  loginSid: string;
  currency: string;
}
export interface Fees {
  name: string;
  fee: string;
  feeType: string;
  minFee: string;
  minFeeType: string;
  maxFee: string;
  maxFeeType: string;
  description: string;
  isVisible: boolean;
  visible: boolean;
}

export interface WithdrawalDetailBody {
  localDepositorId: number;
  paymentSystemId: number;
  paymentDetailsId: number;
  loginSid: string;
  amount: number;
  currency: string;
}

export interface WithdrawalDetail {
  pspId: number;
  pspRuleId: number;
  loginSid: string;
  amount: number;
  currency: string;
  vendorCurrency: string;
  divider: number;
  rate: number;
  fees: Fees[];
  minAmount: number;
  maxAmount: number;
  description: string;
}

export interface TransactionsBody {
  offset?: number;
  limit?: number;
  filtersField?: string;
  filtersValue?: string[];
  sortingField?: string;
  extraFilters?: {
    field: string;
    modificator: 'Equals';
    value: string[];
  }[];
}

export interface CancelTransactionData {
  id: number;
  status: string;
  type: string;
  amount: number;
  currency: string;
  createdAt: Date | string;
  processedAt: Date | string;
  paymentSystem: {
    id: number;
    logo: string;
    displayName: string;
    displayOrder: number;
    paymentDetailsRequired: boolean;
    description: string;
    currencies: string[];
    paymentDetailsConfigId: number;
  };
  reason: string;
  canCancel: boolean;
}

export interface TransactionsConfig {
  tableConfig: {
    filters: {
      field: string;
      modificator: string;
      value: string[];
    }[];
    segment: {
      limit: number;
      offset: number;
    };
    sorting: {
      field: string;
      direction: string;
    };
    csv: boolean;
    withTotals: boolean;
  };
}

export interface TransactionsData {
  columns: {
    key: string;
    title: string;
  }[];
  rows: {
    data: {
      key: string;
      value: string;
    }[];
  }[];
  totals: {
    field: string;
    total: number;
  }[];
  canExportToCsv: boolean;
  canFilter: boolean;
}

export interface TransfersBody {
  offset?: number;
  limit?: number;
  filtersField?: string;
  filtersValue?: string[];
  sortingField?: string;
}

export interface TransfersConfig {
  tableConfig: {
    filters: {
      field: string;
      modificator: string;
      value: string[];
    }[];
    segment: {
      limit: number;
      offset: number;
    };
    sorting: {
      field: string;
      direction: string;
    };
    csv: boolean;
    withTotals: boolean;
  };
}

export interface TransfersData {
  columns: {
    key: string;
    title: string;
  }[];
  rows: {
    data: {
      key: string;
      value: string;
    }[];
  }[];
  totals: {
    field: string;
    total: number;
  }[];
  canExportToCsv: boolean;
  canFilter: boolean;
}

export interface PSP {
  id: number;
  logo: string;
  displayName: string;
  displayOrder: number;
  paymentDetailsRequired: boolean;
  description: string;
  currencies: string[] | null;
  paymentDetailsConfigId: number;
}

export interface ClientPermissions {
  canDeposit: boolean;
  canWithdraw: boolean;
  canTransferFrom: boolean;
  canTransferTo: boolean;
}

export interface AccountType {
  id: number;
  defaultLeverage: number;
  maxAccounts: number;
  displayOrder: number;
  initialDepositAmount: number;
  minimumTransferAmount: number;
  initialDepositCurrency: string;
  minimumTransferCurrency: string;
  maximumTransferAmount: number;
  minimumOutgoingTransferAmount: number;
  maximumOutgoingTransferAmount: number;
  title: string;
  server: string;
  category: string;
  platform: string;
  description: string;
  showCredentials: boolean;
  canChangeLeverage: boolean;
  canChangeTradingPassword: boolean;
  canChangeInvestorPassword: boolean;
  canRequestLeverage: boolean;
  canRequestSwapFree: boolean;
  canViewTradingHistory: boolean;
  leverages: number[] | null;
  currencies: string[];
  clientPermissions: ClientPermissions;
}

export interface AccountConfig {
  useLoginEmail: boolean;
  showPassword: boolean;
  showInvestPassword: boolean;
  showLeverage: boolean;
  showServer: boolean;
  showCurrency: boolean;
  customPasswordText: string | null;
}

interface CustomFields {
  custom_expiration_available: string;
  custom_expiration_date: string; //"25-12-2024"
  custom_account_expired: string;
}

export interface UserAccount extends ParsedWalletData {
  login: string;
  sid: number;
  typeId: number;
  loginSid: string;
  currency: string;
  password: string | null;
  investorPassword: string | null;
  leverage: number | null;
  balance: number;
  equity: number;
  credit: number;
  margin: number;
  type: AccountType;
  createdAt: string;
  firstDepositDate: string | null;
  marginFree: number;
  marginLevel: number;
  isSwapFree: boolean;
  sendReports: boolean;
  swapFreeApplication: string | null;
  supportRequestSwapFree: boolean;
  supportChangeSendReports: boolean;
  ibId: string | null;
  tradingStatus: string;
  isReadOnly: boolean;
  isEnabled: boolean;
  availableForWithdrawal: string;
  accountConfig: AccountConfig;
  customFields?: CustomFields;
}

export interface LogoAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: any | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLogoData {
  id: number;
  attributes: LogoAttributes;
}

export interface PaymentLogo {
  data: PaymentLogoData;
}

export interface PaymentAttributes {
  systemName: string;
  systemId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  methodGroup: string;
  logo: PaymentLogo;
  depositGuides: { data: PaymentLogoData[] };
}

export interface PaymentMethod {
  id: number;
  attributes: PaymentAttributes;
}

export interface UnverifiedPaymentAttributes {
  available: boolean;
  action: 'deposit' | 'withdrawal';
  createdAt: string;
  displayDescription: string | null;
  displayName: string;
  logo: PaymentLogo;
  publishedAt: string;
  systemId: string;
  systemName: string;
  updatedAt: string;
  visibilityByJurisdiction: {
    id: number;
    mauritius: boolean;
    stlucia: boolean;
  };
}
export interface UnverifiedPaymentMethod {
  id: number;
  attributes: UnverifiedPaymentAttributes;
}

export interface ParsedUnverifiedPaymentMethod {
  available: boolean;
  action: 'deposit' | 'withdrawal';
  displayDescription: string | null;
  displayName: string;
  logo: string;
  systemId: string;
  systemName: string;
}

export interface DepositGuide {
  caption: string;
  url: string;
}

export interface ParsedPaymentMethod {
  systemId: string;
  logo: string;
  displayName: string;
  methodGroup: string;
  systemName: string;
  depositGuides: DepositGuide[] | undefined;
}

export interface FirstPayloadMakeDeposit {
  paymentSystem: number;
  account: string;
  currency?: string;
  wallet?: number;
}

export type SecondPayloadMakeDeposit = Record<string, any>;
export type MakeDeposit = FirstPayloadMakeDeposit | SecondPayloadMakeDeposit;
export interface OptionAttributes {
  class: string;
  autocomplete: string;
  'data-decimal-places': number | string;
}

export interface FieldOptions {
  label: string | null;
  disabled: boolean;
  required: boolean;
  attr: OptionAttributes;
  choices: { value: string; label: string }[] | null;
}

export type FormTypes =
  | 'calculated_amount'
  | 'transferAmount'
  | 'hidden'
  | 'phone'
  | 'choice'
  | 'checkbox'
  | 'form'
  | 'required_text'
  | 'text'
  | 'wallet';

export interface Field {
  name: string;
  value: string | null;
  errors: any[];
  type: FormTypes;
  children: Field[];
  options: FieldOptions;
  choices: { value: string; label: string }[] | null;
}

export interface Form {
  fields: Field[];
  errors: any[];
}

export interface Step2AdditionalData {
  minAmount: string;
  maxAmount: string;
  rate: string;
  currency: string;
  fees: Fees[];
  description: string;
  calculatedAmountCurrency: string;
  pspRule: number;
}

export interface DepositResult {
  redirectUrl: string;
  url: null;
  params: null;
  method: null;
  content: string;
}

export interface DepositResponse {
  depositResult: DepositResult | null;
  form: Form;
  step2AdditionalData: Step2AdditionalData;
  step3AdditionalData: any;
}

export interface Validator {
  requiredIf?: { [key: string]: string[] };
}

export interface FieldConfig {
  label: string;
  key: string;
  dataType: string;
  fieldType: string;
  description: string;
  required: boolean;
  choices: string[] | null;
  choiceLabels: string[] | null;
  example: string | string[] | Array<{ name: string; file: string }> | null;
  validators: Validator[];
  multiple: boolean;
  help: string | null;
}

export interface UploadConfig {
  id: number;
  title: string;
  category: string;
  type: string | null;
  description: string;
  requiredForVerification: boolean;
  config: { [key: string]: FieldConfig };
}

export interface DataField {
  type: string;
  label: string;
  value: string | null | string[];
}

export interface PaymentDetailData {
  [key: string]: DataField;
}

export interface PaymentDetails {
  id: number;
  uploadConfig: UploadConfig;
  status: string;
  declineReason: string | null;
  description: string | null;
  number: string;
  createdAt: string;
  data: PaymentDetailData;
}

export interface UnverifiedPaymentMethods {}

export type PaymentInfoStatus = 'pending' | 'success' | 'error';

export interface RequestUrlArgs {
  url: string;
  params: Record<any, any> | null;
  method: string | null;
}

export interface WithdrawPayments {
  id: number;
  logo: string;
  displayName: string;
  displayOrder: number;
  paymentDetailsRequired: boolean;
  description: string;
  currencies: string[];
  paymentDetailsConfigId: number;
}

export interface WithdrawUploadData {
  key: string;
  value: any[] | string;
}

export interface WithdrawUploadBody {
  data: WithdrawUploadData[];
  configId: number;
}

export interface ConfirmItem {
  label: string;
  value: string;
}

export interface ConfirmData {
  confirmData: ConfirmItem[];
}

export interface NewTransfer {
  fromLoginSid: string;
  toLoginSid: string;
  amount: number;
}

export interface NewWalletArgs {
  typeId: number;
  leverage: number;
  currency: 'USD';
  ibId: number;
}

export interface IconAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: any | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface IconData {
  data: {
    id: number;
    attributes: IconAttributes;
  } | null;
}

export interface InfoBlockElement {
  icon?: IconData;
  id: number;
  primaryText: string | null;
  secondaryText: string | null;
}

export interface ParsedInfoBlockElement {
  icon: string;
  primaryText: string | null;
  secondaryText: string | null;
}

export interface AccountFeaturesDescription {
  bulletPointStyle: 'icons' | 'numbers';
  boxStyle: 'simple' | 'with-border';
  id: number;
  infoBlockElement?: InfoBlockElement[];
  title: string | null;
}

export interface ParsedAccountFeaturesDescription {
  bulletPointStyle: 'icons' | 'numbers';
  boxStyle: 'simple' | 'with-border';
  infoBlockElement: ParsedInfoBlockElement[];
  title: string | null;
}

export interface SupportedChangeAccountTypes {
  accountFeaturesDescription: AccountFeaturesDescription | null;
  accountTypeChangeEnabled: boolean | null;
  colour: string | null;
  createdAt: string;
  shortDescription: string | null;
  publishedAt: string;
  updatedAt: string;
  systemName: string | null;
  systemTypeId: string | null;
  typeDisplayName: string | null;
  appDescriptionBlockBackground?: IconData;
  iconMobile: IconData;
  supportedChangeAccountTypes?: SupportedChangeAccountTypesData;
}

export interface SupportedChangeAccountTypesData {
  data:
    | {
        attributes: SupportedChangeAccountTypes;
        id: number;
      }[]
    | [];
}

export interface ParsedSupportedChangeAccountTypesData {
  accountTypeChangeEnabled: boolean;
  colour: string;
  shortDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  systemName: string;
  systemTypeId: string;
  typeDisplayName: string;
  appDescriptionBlockBackground: string;
  icon: string;
  accountFeaturesDescription: ParsedAccountFeaturesDescription | null;
  supportedChangeAccountTypes: ParsedSupportedChangeAccountTypesData[];
}

export interface WalletAttributes {
  systemName: string | null;
  systemTypeId: string | null;
  colour: string;
  shortDescription: string | null;
  typeDisplayName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  iconMobile: IconData;
  iconWeb: IconData;
  appDescriptionBlockBackground: IconData;
  accountTypeChangeEnabled: boolean;
  accountFeaturesDescription: AccountFeaturesDescription | null;
  supportedChangeAccountTypes: SupportedChangeAccountTypesData;
}

export interface WalletData {
  id: number;
  attributes: WalletAttributes;
}

export interface ParsedWalletData {
  systemName: string;
  systemTypeId: string;
  colour: string;
  typeDisplayName: string;
  shortDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  icon: string;
  appDescriptionBlockBackground: string;
  accountTypeChangeEnabled: boolean;
  accountFeaturesDescription: ParsedAccountFeaturesDescription | null;
  supportedChangeAccountTypes: ParsedSupportedChangeAccountTypesData[];
}

export interface DepositFlowTrackingPayload {
  currentStep: number;
  actionName: 'deposit_flow';
  fxboUserId: number;
  traceId: string;
  updatedAt: string;
  completed: boolean;
  payload: string;
  response: string;
}

export interface InitialState {
  accounts: {
    wallet: UserAccount;
    trading: UserAccount;
    cashback: UserAccount;
    rewards: UserAccount;
    demoContest: UserAccount[];
    contest: UserAccount[];
  };
  tradingAccounts: UserAccount[];
  depositPayments: Partial<PSP & ParsedPaymentMethod>[];
  depositAccounts: UserAccount[];
  paymentMethods: ParsedPaymentMethod[];
  unverifiedPaymentMethods: ParsedUnverifiedPaymentMethod[];
  withdrawAccounts: UserAccount[];
  withdrawPayments: Partial<WithdrawPayments & ParsedPaymentMethod>[];
  balance: number;
  hasIBWallet: boolean;
  accountConfigs: ParsedWalletData[];
  demoAccounts: UserAccount[];
  accountTypeId: number;
}

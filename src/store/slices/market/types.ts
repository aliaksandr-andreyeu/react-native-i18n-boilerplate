export interface Symbols {
  name: string;
  description: string;
  priceBid: string;
  priceAsk: string;
  image: string | undefined;
  digits: number;
  tradeMode: number;
  lastClosedPrice: number;
}

export interface Signals {
  type?: 'blur' | undefined;
  id: string;
  language: string;
  Disabled: boolean;
  Product: {
    assetGroup: string;
    lastTick?: {
      ask: number;
      bid: number;
      digits: number;
    };
    amegaName: string;
    name: string;
  };
  Report: {
    status: number;
    action: number;
    buy_entry_target_1: number | null;
    sell_entry_target_1: number | null;
    buy_target_1: number;
    sell_target_1: number;
    stop: number;
    expiry: string;
    confidence: number;
    res_1: number;
    res_2: number;
    res_3: number;
    sup_1: number;
    sup_2: number;
    sup_3: number;
  };
  BuyPhrase?: string[];
  SellPhrase?: string[];
  Phrase?: string[];
}

export interface InitialState {
  categories: string[];
  allSymbols: Symbols[];
  symbols: Symbols[];
  signals: Signals[];
  isLoading: boolean;
  activeTab: string;
}

export interface PositionDetailsForm {
  isStopEnabled: boolean;
  isTakeEnabled: boolean;
  accountId: number | null;
  instrument: string;
  priceStopLoss: string;
  priceTakeProfit: string;
  price: string;
  volume: string;
  tradeAction: number;
}

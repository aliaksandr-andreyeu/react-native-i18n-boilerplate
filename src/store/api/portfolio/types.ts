export interface ParsedTradingAssets {
  acuityProductName: string;
  fullName: string;
  image: string;
  systemName: string;
  assetUnitOfMeasure: string;
  assetUnitOfMeasureDigits: number;
}

export interface PortfolioTradingAssetAttributes {
  acuityProductName: string;
  name: string;
  fullName: string;
  systemName: string;
  seoText: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  marketHours: string | null;
  marketHoursNotes: string | null;
  locale: string;
  assetUnitOfMeasure: null | string;
  assetUnitOfMeasureDigits: null | number;
  assetLogo: AssetLogo;
}

export interface AssetLogo {
  data: null | any;
}

export interface PortfolioTradingAssetData {
  id: number;
  attributes: PortfolioTradingAssetAttributes;
}

export interface DealsInfoArgs {
  userId: number;
  accountId: number | null;
  from?: number;
  to?: number;
  page?: number;
  recordsPerPage?: number;
}

export interface PositionInfoArgs {
  accountId: number;
  ticket: number;
}

export interface SymbolLastTickArgs {
  accountId: number;
  symbol: string;
}
export interface EditPositionInfoArgs {
  accountId: number;
  ticket: number;
  stopLoss: number;
  takeProfit: number;
}

export interface EditOrderInfoArgs {
  accountId: number;
  orderId: number;
  price: number;
  priceTakeProfit: number;
  priceStopLoss: number;
  expirationTime: number;
}

export interface DeleteOrderInfoArgs {
  accountId: number;
  orderId: number;
}

export interface ClosePosition {
  accountId: number;
  positionId: number;
  partialClosingVolume: number | undefined;
}

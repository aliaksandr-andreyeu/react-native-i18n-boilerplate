export interface TopPerformer {
  instrument: string;
  category: string;
  performanceMetric: number;
  direction: 'Buy' | 'Sell';
  percentageProfitBuy: number;
  expiredAt: Date;
  takeProfit: number;
  stopLoss: number;
}

export interface ParsedTopPerformer {
  instrument: string;
  category: string;
  performanceMetric: number;
  direction: 'Buy' | 'Sell';
  isBuy: boolean;
  percentageProfitBuy: string;
  expiredAt: Date;
  takeProfit: number;
  stopLoss: number;
  id: string;
  ask?: number;
  bid?: number;
  currencyProfit?: string;
}

export type ResponseKey = string;

export interface TopPerformerPayload {
  [key: ResponseKey]: TopPerformer[];
}

export interface TopPerformerResponse {
  success: boolean;
  messages: any[];
  payload: TopPerformerPayload;
}

export interface ParsedTopPerformerResponse {
  keys: ResponseKey[];
  data: ParsedTopPerformer[];
}

export interface TopSignal {
  instrument: string;
  category: string;
  rate: number;
  rsi: number;
  takeProfit: number;
  stopLoss: number;
  confidence: number;
  direction: string;
  expiredAt: Date;
  rewardToRiskRatio: number;
}
export interface ParsedTopSignal {
  instrument: string;
  category: string;
  rate: number;
  rsi: number;
  takeProfit: number;
  stopLoss: number;
  confidence: number;
  direction: string;
  expiredAt: Date;
  rewardToRiskRatio: string;
  id: string;
  ask?: number;
  bid?: number;
  currencyProfit?: string;
  confidencePercentage: number;
}

export interface TopSignalsPayloadData {
  [key: ResponseKey]: TopSignal[];
}

export interface TopSignalPayload {
  topSignals: TopSignalsPayloadData;
  expiredAt: Date;
}

export interface TopSignalResponse {
  success: boolean;
  messages: any[];
  payload: TopSignalPayload;
}

export interface ParsedTopSignalResponse {
  keys: ResponseKey[];
  data: ParsedTopSignal[];
  expiredAt: Date | undefined;
}

export interface OpenPositionData {
  ask: number;
  bid: number;
  tp?: number;
  sl?: number;
  asset: string;
  entry: boolean;
  category: string;
  id: string;
  performanceMetric?: number;
  confidence?: number;
}

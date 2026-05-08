import {
  ParsedTopPerformer,
  ParsedTopPerformerResponse,
  ParsedTopSignalResponse,
  TopPerformer,
  TopPerformerResponse,
  TopSignalResponse
} from './types';

export const topPerformerParser = (data: TopPerformerResponse): ParsedTopPerformerResponse => {
  if (!data || Object.keys(data || {}).length === 0 || !data?.payload) return { keys: [], data: [] };
  const payload = data?.payload;
  const keys = Object.keys(payload);
  const parsedData = Object.values(payload)
    .flat()
    .sort((a, b) => b.percentageProfitBuy - a.percentageProfitBuy)
    .map((item) => ({
      ...item,
      isBuy: item?.direction === 'Buy',
      percentageProfitBuy: item?.percentageProfitBuy?.toFixed?.(2) || '',
      id: item?.instrument + item?.performanceMetric + item?.expiredAt || '',
      takeProfit: +(item?.takeProfit?.toFixed(6) || 0),
      stopLoss: +(item?.stopLoss?.toFixed(6) || 0)
    }));
  return { keys, data: parsedData };
};

export const topSignalParser = (data: TopSignalResponse): ParsedTopSignalResponse => {
  if (!data || Object.keys(data || {} || data).length === 0 || !data.payload)
    return { keys: [], data: [], expiredAt: undefined };

  const payload = data.payload.topSignals;
  const expiredAt = data.payload.expiredAt;

  const getRandomConfidence = (confidence: number) => {
    const min = [0, 10, 21, 41, 61, 81, 90];
    const max = [10, 20, 40, 60, 80, 90, 100];

    if (confidence < 0 || confidence > 6) return 0;

    return Math.random() * (max[confidence] - min[confidence]) + min[confidence];
  };

  const keys = Object.keys(payload);
  const parsedData = Object.values(payload)
    .flat()
    .map((item) => ({
      ...item,
      direction: item?.direction?.toLowerCase?.() || '',
      rsi: +item?.rsi?.toFixed?.(4) || 0,
      confidencePercentage: getRandomConfidence(item?.confidence),
      rewardToRiskRatio: item?.rewardToRiskRatio?.toFixed?.(2) || '',
      id: item?.instrument + item?.rewardToRiskRatio + item?.rsi || '',
      stopLoss: +(item?.stopLoss?.toFixed?.(6) || 0),
      takeProfit: +(item?.takeProfit?.toFixed?.(6) || 0)
    }));
  return { keys, data: parsedData, expiredAt };
};

export const topPerformerSocketParser = (data: TopPerformer): ParsedTopPerformer => {
  if (!data) return {} as ParsedTopPerformer;
  return {
    ...data,
    isBuy: data?.direction === 'Buy',
    percentageProfitBuy: data?.percentageProfitBuy?.toFixed?.(2) || '',
    id: data.instrument + data.performanceMetric + data.expiredAt || '',
    takeProfit: +(data?.takeProfit?.toFixed(6) || 0),
    stopLoss: +(data?.stopLoss?.toFixed(6) || 0)
  };
};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dateHelper from '../dateHelper';

dayjs.extend(utc);

function getWeeklyRange(
  startWeekday: number,
  startHour: number,
  startMinute: number,
  startSecond: number,
  endWeekday: number,
  endHour: number,
  endMinute: number,
  endSecond: number
) {
  const now = dayjs().utc();

  let start = now
    .startOf('week')
    .add(startWeekday, 'day')
    .hour(startHour)
    .minute(startMinute)
    .second(startSecond)
    .millisecond(0);

  let end = now.startOf('week').add(endWeekday, 'day').hour(endHour).minute(endMinute).second(endSecond).millisecond(0);

  if (now.isBefore(start)) {
    start = start.subtract(1, 'week');
    end = end.subtract(1, 'week');
  }

  return { start, end, now };
}

const getForexRange = () => getWeeklyRange(5, 22, 0, 0, 7, 22, 0, 0);

const getMetalRange = () => getWeeklyRange(5, 23, 59, 0, 7, 22, 5, 0);

export const isMarketClosed = (tab: string) => {
  const lowerCaseTab = (tab || '').toLowerCase();

  switch (lowerCaseTab) {
    case 'all':
      return false;
    case 'crypto':
      return false;
    case 'forex':
      const { end: forexEnd, now: forexNow, start: forexStart } = getForexRange();
      return dateHelper.isBetweenUTC(forexStart, forexEnd, forexNow);
    case 'metal':
      const { end: metalEnd, now: metalNow, start: metalStart } = getMetalRange();
      return dateHelper.isBetweenUTC(metalStart, metalEnd, metalNow);
    default:
      return false;
  }
};

const InstrumentCategories = {
  Forex: 'Forex',
  Crypto: 'Crypto',
  Metal: 'Metal'
} as const;

const Confidence = {
  VeryLow: 1,
  Low: 2,
  Medium: 3,
  High: 4,
  VeryHigh: 5
} as const;

const Direction = {
  Buy: 'Buy',
  Sell: 'Sell'
} as const;

type CalcuateFN = {
  bid: number;
  ask: number;
  category: keyof typeof InstrumentCategories;
  confidence: number;
  direction: keyof typeof Direction;
};

type CalcuateFNReturn = {
  takeProfit: number | undefined;
  stopLoss: number | undefined;
};

function getPercents(category: keyof typeof InstrumentCategories, confidence: number) {
  switch (category) {
    case InstrumentCategories.Forex:
      switch (confidence) {
        case Confidence.VeryLow:
          return { prev: 0.001, next: 0.01 };
        case Confidence.Low:
          return { prev: 0.005, next: 0.015 };
        case Confidence.Medium:
          return { prev: 0.01, next: 0.02 };
        case Confidence.High:
          return { prev: 0.015, next: 0.025 };
        case Confidence.VeryHigh:
          return { prev: 0.02, next: 0.03 };
        default:
          undefined;
      }

    case InstrumentCategories.Crypto:
      switch (confidence) {
        case Confidence.VeryLow:
          return { prev: 0.01, next: 0.1 };
        case Confidence.Low:
          return { prev: 0.05, next: 0.15 };
        case Confidence.Medium:
          return { prev: 0.1, next: 0.2 };
        case Confidence.High:
          return { prev: 0.15, next: 0.25 };
        case Confidence.VeryHigh:
          return { prev: 0.2, next: 0.3 };
        default:
          undefined;
      }

    case InstrumentCategories.Metal:
      switch (confidence) {
        case Confidence.VeryLow:
          return { prev: 0.02, next: 0.06 };
        case Confidence.Low:
          return { prev: 0.04, next: 0.08 };
        case Confidence.Medium:
          return { prev: 0.06, next: 0.1 };
        case Confidence.High:
          return { prev: 0.08, next: 0.12 };
        case Confidence.VeryHigh:
          return { prev: 0.1, next: 0.14 };
        default:
          undefined;
      }

    default:
      undefined;
  }
}

export const calculateTakeProfitStopLossTopSignals = ({
  bid,
  ask,
  category,
  confidence,
  direction
}: CalcuateFN): CalcuateFNReturn => {
  const percents = getPercents(category, confidence);

  if (!percents) {
    return {
      takeProfit: undefined,
      stopLoss: undefined
    };
  }

  const { prev: prevPercent, next: nextPercent } = percents;

  if (direction === Direction.Buy) {
    const entry = ask;
    return {
      takeProfit: entry * (1 + nextPercent),
      stopLoss: entry * (1 - prevPercent)
    };
  }

  if (direction === Direction.Sell) {
    const entry = bid;
    return {
      takeProfit: entry * (1 - nextPercent),
      stopLoss: entry * (1 + prevPercent)
    };
  }

  return {
    takeProfit: undefined,
    stopLoss: undefined
  };
};

type DirectionType = 'Buy' | 'Sell';

interface Params {
  entry?: boolean;
  performanceMetric?: number;
  confidence?: number;
  category?: string;
  bid?: number;
  ask?: number;
}

function getDirection(entry: boolean): DirectionType {
  return entry ? 'Buy' : 'Sell';
}

function calculateFromPerformanceMetric(entry?: boolean, bid?: number, ask?: number, performanceMetric?: number) {
  if (performanceMetric === undefined || entry === undefined) {
    return { tp: undefined, sl: undefined };
  }

  const price = entry ? ask : bid;
  if (!price) return { tp: undefined, sl: undefined };

  const factor = performanceMetric / 100;

  if (entry) {
    return {
      tp: price * (1 + factor),
      sl: price * (1 - factor)
    };
  } else {
    return {
      tp: price * (1 - factor),
      sl: price * (1 + factor)
    };
  }
}

function calculateFromSignal(entry?: boolean, bid?: number, ask?: number, confidence?: number, category?: string) {
  if (!bid || !ask || confidence === undefined || !category || entry === undefined) {
    return { tp: undefined, sl: undefined };
  }

  const direction = getDirection(entry);

  const { stopLoss, takeProfit } = calculateTakeProfitStopLossTopSignals({
    ask,
    bid,
    category: category as any,
    confidence,
    direction
  });

  return {
    tp: takeProfit,
    sl: stopLoss
  };
}

export const getLastTakeProfitStopLoss = ({ entry, performanceMetric, confidence, category, ask, bid }: Params) => {
  let tp: number | undefined;
  let sl: number | undefined;

  if (performanceMetric !== undefined) {
    ({ tp, sl } = calculateFromPerformanceMetric(entry, bid, ask, performanceMetric));
  } else {
    ({ tp, sl } = calculateFromSignal(entry, bid, ask, confidence, category));
  }

  return {
    lastTakeProfit: tp !== undefined ? tp.toFixed(6) : undefined,
    lastStopLoss: sl !== undefined ? sl.toFixed(6) : undefined
  };
};

export const calculateSlTpLimits = (action?: number, tick = 0, stopsLevel = 0, point = 0) => {
  let takeProfit = 0;
  let stopLoss = 0;

  if (action === null || action === undefined) {
    return { takeProfit, stopLoss };
  }

  if (action === 0) {
    takeProfit = tick + stopsLevel * point;
    stopLoss = tick - stopsLevel * point;
  } else {
    takeProfit = tick - stopsLevel * point;
    stopLoss = tick + stopsLevel * point;
  }

  return { takeProfit, stopLoss };
};

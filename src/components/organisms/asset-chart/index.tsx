import React, { FC, Fragment, memo, useEffect, useLayoutEffect, useMemo, useCallback, useState, useRef } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  View,
  TouchableOpacity,
  ViewProps,
  ViewStyle,
  TextStyle,
  InteractionManager,
} from 'react-native';
import moment from 'moment';
import { BaseText, BaseTextVariant, BaseAssetCandlestickChart, BaseAssetLineChart } from '@/components';
import { useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAppSelector, useCandlesWebsocket, useTradingSchedule, TradingScheduleData, useCommonStyles } from '@/hooks';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { actions } from '@/store';
import 'moment/locale/es';
import 'moment/locale/ms';
import 'moment/locale/th';
import 'moment/locale/vi';
import 'moment/locale/pt';
import 'moment/locale/it';
import { getAssetName } from '@/helpers';

const {
  isDevelopment,
  isIOS,
  fonts: { generalSans },
  animation: { duration },
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

interface PeriodItem {
  label: string;
  interval: string;
}

interface PeriodLayout {
  width: number;
  x: number;
}

interface ChartLayout {
  width: number;
  height: number;
}

interface LineChartData {
  timestamp: number;
  value: number;
}

interface CandlestickChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlesWebsocketData {
  ts: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

interface CandlesHistoryData {
  ts: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export type ChartHorizontalLine = {
  value: number;
  color: string;
};

interface TradingSession {
  open: string;
  close: string;
}

interface TradingSessionSchedule {
  dayOfWeek: string;
  tradingSessions: TradingSession[];
}

interface AssetChartProps extends ViewProps {
  tradingSessionSchedule: TradingSessionSchedule[] | undefined;
  price: string | undefined;
  dailyChange: string | undefined;
  dailyChangePercent: string | undefined;
  horizontalLines?: ChartHorizontalLine[];
  initialInterval?: 'h1' | 'd1' | 'w1' | 'mn1' | 'mn3' | 'mn6' | 'y1';
  initialIndex?: number;
  status?: undefined | number;
}

const {
  market: { useCandlesHistoryQuery }
} = actions;

const calculateMinMax = (values: number[]): { min: number; max: number } => {
  if (values.length === 0) {
    return { min: 0, max: 0 };
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  return { min, max };
};

const AssetChart: FC<AssetChartProps> = ({
  style,
  tradingSessionSchedule,
  price,
  dailyChange,
  dailyChangePercent,
  horizontalLines,
  initialInterval,
  initialIndex,
  status
}) => {
  const scheduleData: TradingScheduleData | null = useTradingSchedule({
    schedule: tradingSessionSchedule
  });

  const lastInteractionInstance = useRef<{ cancel: () => void; }>({ cancel: () => { } })

  const {
    t,
    i18n: { language }
  } = useTranslation();

  const periodData: PeriodItem[] = useMemo(
    () => [
      {
        label: t('components.asset-chart.interval.h1'),
        interval: 'h1'
      },
      {
        label: t('components.asset-chart.interval.d1'),
        interval: 'd1'
      },
      {
        label: t('components.asset-chart.interval.w1'),
        interval: 'w1'
      },
      {
        label: t('components.asset-chart.interval.mn1'),
        interval: 'mn1'
      },
      {
        label: t('components.asset-chart.interval.mn3'),
        interval: 'mn3'
      },
      {
        label: t('components.asset-chart.interval.mn6'),
        interval: 'mn6'
      },
      {
        label: t('components.asset-chart.interval.y1'),
        interval: 'y1'
      }
    ],
    [t]
  );

  const [isLoading, setLoading] = useState(true);
  const [isSetUp, setSetUp] = useState(true);

  const [showDate, setShowDate] = useState<boolean>(false);
  const [chartDate, setChartDate] = useState<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [currentInterval, setCurrentInterval] = useState(periodData[currentIndex].interval);
  const [periodLayout, setPeriodLayout] = useState<Record<string, PeriodLayout>>({} as Record<string, PeriodLayout>);
  const [chartLayout, setChartLayout] = useState<ChartLayout>({} as ChartLayout);

  const [candleChart, setCandleChart] = useState(false);
  const [lineChartData, setLineChartData] = useState<Record<string, LineChartData[]>>(
    {} as Record<string, LineChartData[]>
  );
  const [candlestickChartData, setCandlestickChartData] = useState<Record<string, CandlestickChartData[]>>(
    {} as Record<string, CandlestickChartData[]>
  );
  const [lastMessage, setLastMessage] = useState<Record<string, CandlesWebsocketData>>(
    {} as Record<string, CandlesWebsocketData>
  );

  const setInitialState = () => {
    setLoading(true);
    setCandleChart(false);

    setLastMessage({});
    setLineChartData({});
    setCandlestickChartData({});
  };

  useEffect(() => {
    setInitialState();
    return () => {
      setInitialState();
    };
  }, []);

  useEffect(() => {
    if (initialInterval) {
      const initialIndex = periodData.findIndex((el) => el.interval === initialInterval);
      if (initialIndex !== -1) {
        setCurrentIndex(initialIndex);
        setCurrentInterval(periodData[initialIndex].interval);
      }
    }
  }, [initialInterval]);

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { base, graphite, blue }
  } = theme;

  const timeSchedule = useMemo(() => {
    if (!scheduleData) {
      return null;
    }

    const { timeToOpen, timeToClose } = scheduleData || {};

    let desc: string | null = null;

    if (timeToOpen === undefined && timeToClose === undefined) {
      desc = t('components.asset-chart.market-open');

      setSetUp(true);
    } else if (timeToOpen) {
      if (status === 9) desc = t('components.signals.market-is-closed');
      else desc = t('components.asset-chart.market-opens', { time: timeToOpen });

      setSetUp(false);
    } else if (timeToClose) {
      desc = t('components.asset-chart.market-closes', { time: timeToClose });

      setSetUp(true);
    }

    if (!desc) {
      return null;
    }

    return (
      <View style={styles.alertBox}>
        {timeToOpen && <SvgIcon name={SvgXmlIconNames.halfMoon} size={IconSize.xs} color={theme.palette.blue[500]} />}
        <BaseText variant={BaseTextVariant.extraSmall}>{desc}</BaseText>
      </View>
    );
  }, [scheduleData, t, setSetUp, theme.dark, status]);

  const portfolio = useAppSelector((store) => store.portfolio);
  const { assetSymbolData, selectedAccount } = portfolio || {};
  const { asset: assetSymbol, digits: assetDigits = 0 } = assetSymbolData || {};

  const {
    lastData,
    websocket: candlesWebsocket,
    isReadyState
  } = useCandlesWebsocket({
    symbol: assetSymbol,
    period: currentInterval,
    setUp: isSetUp
  });

  const lastDataHandler = () => {
    if (!(lastData && Object.keys(lastData).length > 0)) {
      return;
    }

    setLastMessage((prev) => ({
      ...prev,
      [currentInterval]: lastData
    }));
  };

  useLayoutEffect(() => {
    lastDataHandler();
  }, [lastData]);

  const [getCandlesHistory, candlesHistoryResponse] = useCandlesHistoryQuery({
    refetchOnReconnect: true
  });

  const getCandlesHistoryHandler = async () => {
    if (!assetSymbol || currentInterval === undefined) {
      return;
    }
    try {
      setLoading(true);
      await getCandlesHistory({
        ...(selectedAccount && { accountId: selectedAccount }),
        symbol: getAssetName(assetSymbol),
        period: currentInterval
      });
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    getCandlesHistoryHandler();
  }, [selectedAccount, assetSymbol, currentInterval]);

  useLayoutEffect(() => {
    setHistoryData();
  }, [candlesHistoryResponse]);

  const historyLoading = useMemo(() => {
    const { isLoading: candlesHistoryLoading } = candlesHistoryResponse || {};
    return Boolean(candlesHistoryLoading || isLoading);
  }, [candlesHistoryResponse, isLoading]);

  const setHistoryData = useCallback(() => {
    const { data } = candlesHistoryResponse || {};

    const isData = Boolean(data && Array.isArray(data) && data.length > 0);

    if (!isData) {
      return;
    }

    const lineData = data.map((line: CandlesHistoryData) => ({
      timestamp: line.ts,
      value: line.c
    }));

    const candlestickData = data.map((candle: CandlesHistoryData) => ({
      timestamp: candle.ts,
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c
    }));

    setLineChartData((prev) => ({
      ...prev,
      [currentInterval]: lineData
    }));
    setCandlestickChartData((prev) => ({
      ...prev,
      [currentInterval]: candlestickData
    }));
    setLastMessage((prev) => ({
      ...prev,
      [currentInterval]: {} as CandlesWebsocketData
    }));
  }, [candlesHistoryResponse, setLineChartData, setCandlestickChartData, setLastMessage]);

  const setLiveLineData = useCallback(() => {
    const { ts, c } = lastMessage[currentInterval] || {};

    if (ts === undefined || c === undefined) return;

    const currentData: LineChartData[] = Array.from(lineChartData[currentInterval] || []);
    if (!currentData.length) return;

    const last = currentData.at(-1);
    if (!last) return;

    const newPoint: LineChartData = {
      timestamp: ts,
      value: c
    };

    let updatedData = [...currentData];

    if (ts === last.timestamp) {
      updatedData[updatedData.length - 1] = newPoint;
    } else if (ts > last.timestamp) {
      updatedData.push(newPoint);
    } else return;

    setLineChartData(prev => ({
      ...prev,
      [currentInterval]: updatedData
    }));
  }, [lastMessage, currentInterval, lineChartData, setLineChartData]);

  const setLiveCandlesData = useCallback(() => {
    const { ts, o, h, l, c } = lastMessage[currentInterval] || {};

    if ([ts, o, h, l, c].some(val => val === undefined)) return;

    const tempData: CandlestickChartData[] = Array.from(candlestickChartData[currentInterval] || []);
    if (!tempData.length) return;

    const last = tempData[tempData.length - 1];
    if (!last) return;

    if (ts === last.timestamp) {
      tempData[tempData.length - 1] = {
        timestamp: ts,
        open: o,
        high: h,
        low: l,
        close: c
      };
    }

    else if (ts > last.timestamp) {
      tempData.push({
        timestamp: ts,
        open: o,
        high: h,
        low: l,
        close: c
      });
    }

    else return;

    setCandlestickChartData(prev => ({
      ...prev,
      [currentInterval]: tempData
    }));
  }, [lastMessage, currentInterval, candlestickChartData, setCandlestickChartData]);

  useEffect(() => {
    setLiveLineData();
    setLiveCandlesData();
  }, [lastMessage]);

  const historyData = useMemo(() => {
    const data = candleChart ? candlestickChartData[currentInterval] : lineChartData[currentInterval];
    return data || [];
  }, [candleChart, candlestickChartData, lineChartData, currentInterval]);

  const typeSwitchButton = useMemo(() => {
    return (
      <TouchableOpacity
        accessibilityRole='button'
        activeOpacity={activeOpacity}
        hitSlop={hitSlop}
        style={styles.switchButton}
        onPress={() => {
          setCandleChart(!candleChart);
          setShowDate(false);
          setChartDate(null);
        }}
      >
        {candleChart ? (
          <SvgIcon name={SvgXmlIconNames.lineCurve} size={IconSize.xs} color={graphite['900']} />
        ) : (
          <SvgIcon name={SvgXmlIconNames.candleStick} size={IconSize.xs} color={graphite['900']} />
        )}
      </TouchableOpacity>
    );
  }, [styles, candleChart, setCandleChart, setShowDate, setChartDate, base]);

  const animatedPosition = useAnimatedStyle(() => {
    if (Object.keys(periodLayout).length === 0) {
      return {};
    }
    const { x } = periodLayout[currentIndex] || {};
    if (x === undefined) {
      return {};
    }
    return {
      left: withTiming(x, {
        duration
      })
    };
  });

  const slider = useMemo(() => {
    if (Object.keys(periodLayout).length === 0) {
      return null;
    }
    const { width } = periodLayout[currentIndex] || {};
    if (width === undefined) {
      return null;
    }
    return (
      <Animated.View style={[styles.periodButtonSlider, { width }, animatedPosition]}>
        <View style={styles.periodButtonSliderItem} />
      </Animated.View>
    );
  }, [styles, animatedPosition, periodLayout, currentIndex]);

  const periodControls = useMemo(() => {
    return (
      <View style={styles.periodControlsBox}>
        {slider}
        <View style={styles.periodControls}>
          {periodData.map(({ label, interval }, idx) => {
            const isActive = currentInterval === interval;

            const onPress = () => {
              if (isActive) return;
              lastInteractionInstance.current?.cancel?.()


              lastInteractionInstance.current = InteractionManager.runAfterInteractions(() => {
                setCurrentInterval(interval);
                setCurrentIndex(idx);

                setLineChartData({});
                setCandlestickChartData({});
                setLastMessage({});
              });
            };


            const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
              const {
                layout: { width, x }
              } = nativeEvent;

              setPeriodLayout((prev) => ({
                ...prev,
                [idx]: { width, x }
              }));
            };

            return (
              <TouchableOpacity
                onPress={onPress}
                disabled={isActive}
                key={`${idx}-${interval}`}
                onLayout={onLayout}
                style={styles.periodButton}
              >
                <PeriodControl isActive={isActive} label={label} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }, [
    styles,
    slider,
    base,
    graphite,
    currentInterval,
    setCurrentInterval,
    setCurrentIndex,
    setPeriodLayout,
    setLineChartData,
    setCandlestickChartData,
    setLastMessage
  ]);

  const priceComponent = useMemo(() => {
    if (price === undefined) {
      return (
        <ContentLoader speed={2} width={120} height={20} backgroundColor={'#E2E6F2'} foregroundColor={graphite['050']}>
          <Rect x={0} y={0} rx='4' ry='4' width={120} height={20} />
        </ContentLoader>
      );
    }

    const formattedPrice = Number(price).toFixed(assetDigits);

    const priceItems = formattedPrice.split('.');
    const priceFirst = priceItems[0];
    const priceLast = priceItems[1] ? `.${priceItems[1]}` : null;

    return (
      <BaseText variant={BaseTextVariant.captionSemiBold}>
        {priceFirst}
        {priceLast ? <BaseText variant={BaseTextVariant.extraSmallSemiBold}>{priceLast}</BaseText> : null}
      </BaseText>
    );
  }, [price, assetDigits]);

  const pnlComponent = useMemo(() => {
    if (dailyChange === undefined || dailyChangePercent === undefined) {
      return (
        <ContentLoader speed={2} width={120} height={18} backgroundColor={'#E2E6F2'} foregroundColor={graphite['050']}>
          <Rect x={0} y={0} rx='4' ry='4' width={36} height={18} />
          <Rect x={44} y={7} rx='4' ry='4' width={4} height={4} />
          <Rect x={56} y={0} rx='4' ry='4' width={54} height={18} />
        </ContentLoader>
      );
    }

    const numberDailyChangePercent = Number(dailyChangePercent);

    const dailyStyles =
      numberDailyChangePercent > 0 ? styles.pnlProfit : numberDailyChangePercent < 0 ? styles.pnlLoss : undefined;
    const dailyDescStyles =
      numberDailyChangePercent > 0
        ? styles.pnlDescProfit
        : numberDailyChangePercent < 0
          ? styles.pnlDescLoss
          : undefined;

    return (
      <View style={styles.pnlBox}>
        <BaseText variant={BaseTextVariant.small} style={styles.gain}>
          {dailyChange}
        </BaseText>
        <View style={styles.dot} />
        <View style={[styles.pnl, dailyStyles]}>
          <BaseText variant={BaseTextVariant.extraSmall} style={[styles.pnlDesc, dailyDescStyles]}>
            {dailyChangePercent}%
          </BaseText>
        </View>
      </View>
    );
  }, [dailyChange, dailyChangePercent]);

  const dateComponent = useMemo(() => {
    const date = chartDate && showDate ? moment.unix(chartDate).locale(language).format('D MMM YYYY, H:mm') : ` `;
    return (
      <BaseText variant={BaseTextVariant.extraSmall} numberOfLines={1} style={styles.dateTime}>
        {date}
      </BaseText>
    );
  }, [styles, chartDate, showDate, language]);

  const infoComponent = useMemo(() => {
    return (
      <View style={styles.infoBox}>
        <View style={styles.infoItem}>
          {priceComponent}
          {pnlComponent}
          {dateComponent}
        </View>
        {isDevelopment ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor:
                candlesWebsocket !== null && !isReadyState
                  ? 'orange'
                  : candlesWebsocket !== null && isReadyState
                    ? 'green'
                    : 'red',
              width: 8,
              height: 8,
              borderRadius: 8
            }}
          />
        ) : null}
        <View style={styles.infoItem}>{timeSchedule}</View>
      </View>
    );
  }, [
    isDevelopment,
    styles,
    t,
    priceComponent,
    pnlComponent,
    dateComponent,
    candlesWebsocket,
    isReadyState,
    timeSchedule,
    status
  ]);

  const noDataComponent = useMemo(() => {
    return (
      <View style={styles.noData}>
        <BaseText variant={BaseTextVariant.caption}>{t('components.asset-chart.no-data')}</BaseText>
      </View>
    );
  }, [t, styles]);

  const minMaxValues = useMemo(() => {
    const priceLineData = candlestickChartData[currentInterval] || [];
    const closeValues = priceLineData.map((o) => o.close);
    const horizontalLineValues = horizontalLines?.map((line) => line.value) || [];
    const allValues = [...closeValues, ...horizontalLineValues, Number(price)];

    return calculateMinMax(allValues);
  }, [candlestickChartData, currentInterval, horizontalLines, price, assetDigits]);

  const chartComponent = useMemo(() => {
    const { width, height } = chartLayout || {};

    const isData = Boolean(historyData && Array.isArray(historyData) && historyData.length > 0);

    if (historyLoading || !width || !height) {
      const size = isIOS ? 'small' : 'large';
      return (
        <Fragment>
          <View style={styles.loader}>
            <ActivityIndicator
              testID={testIDs.components.organisms.assetChart?.activityIndicator}
              color={graphite['900']}
              size={size}
              animating={true}
            />
          </View>
          {/*      PREVIOUS LOADER -- FOR USER TEST -- REMOVE AFTER STORY CLOSED
            <ContentLoader
              speed={2}
              width={'100%'}
              height={'100%'}
              backgroundColor={'#E2E6F2'}
              foregroundColor={graphite['050']}
            >
              <Rect x={0} y={0} rx='4' ry='4' width={'100%'} height={'100%'} />
            </ContentLoader>
          */}
        </Fragment>
      );
    }

    if (!isData) {
      return noDataComponent;
    }

    if (candleChart) {
      return (
        <BaseAssetCandlestickChart
          digits={assetDigits}
          data={historyData as CandlestickChartData[]}
          width={width}
          height={height}
          setShowDate={setShowDate}
          setChartDate={setChartDate}
        />
      );
    }

    return (
      <BaseAssetLineChart
        horizontalLines={horizontalLines}
        digits={assetDigits}
        data={historyData as LineChartData[]}
        width={width}
        stickWidth={2}
        height={height}
        setShowDate={setShowDate}
        setChartDate={setChartDate}
        minMaxValues={minMaxValues}
      />
    );
  }, [
    blue,
    graphite,
    assetDigits,
    candleChart,
    historyData,
    historyLoading,
    noDataComponent,
    chartLayout,
    currentInterval,
    setShowDate,
    setChartDate
  ]);

  const onChartLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const {
      layout: { width, height }
    } = nativeEvent;

    setChartLayout({ width, height });
  };

  const timeLine = useMemo(() => {
    const priceLineData = candlestickChartData[currentInterval] || [];

    const empty = new Array(1).join();

    let minValue = empty;
    let maxValue = empty;

    if (priceLineData && Array.isArray(priceLineData) && priceLineData.length > 0) {
      const minTimestamp = Math.min(...priceLineData.map((o) => o?.timestamp));
      const maxTimestamp = Math.max(...priceLineData.map((o) => o?.timestamp));

      const format = currentInterval === 'h1' || currentInterval === 'd1' ? 'HH:mm' : 'MMM D, YYYY';

      minValue = moment.unix(minTimestamp).locale(language).format(format);
      maxValue = moment.unix(maxTimestamp).locale(language).format(format);
    }

    return (
      <View style={styles.chartTimeLine}>
        <BaseText numberOfLines={1} style={styles.chartDesc} variant={BaseTextVariant.tiny}>
          {minValue}
        </BaseText>
        <BaseText numberOfLines={1} style={styles.chartDesc} variant={BaseTextVariant.tiny}>
          {maxValue}
        </BaseText>
      </View>
    );
  }, [styles, candlestickChartData, currentInterval, language]);

  const priceLine = useMemo(() => {
    return (
      <View style={styles.chartPriceLine}>
        <BaseText numberOfLines={1} style={styles.chartDesc} variant={BaseTextVariant.tiny}>
          {minMaxValues.max.toFixed(assetDigits)}
        </BaseText>
        <BaseText numberOfLines={1} style={styles.chartDesc} variant={BaseTextVariant.tiny}>
          {minMaxValues.min.toFixed(assetDigits)}
        </BaseText>
      </View>
    );
  }, [styles, minMaxValues]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.chartBox}>
        {infoComponent}
        <View style={styles.chartWrapper}>
          <View style={styles.chartRow}>
            <View style={styles.chartInbox}>
              <View style={styles.chart}>
                <View style={styles.chartItem} onLayout={onChartLayout}>
                  {chartComponent}
                </View>
              </View>
              {timeLine}
            </View>
            {priceLine}
          </View>
        </View>
      </View>
      <View style={styles.controls}>
        {periodControls}
        {typeSwitchButton}
      </View>
    </View>
  );
};

interface PeriodControlProps {
  isActive: boolean;
  label: string;
}

const PeriodControl: FC<PeriodControlProps> = ({ isActive, label }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { base, graphite }
  } = theme;

  const animatedPositionColor = useAnimatedStyle(() => {
    return {
      color: withTiming(isActive ? '#f1f5ff' : graphite['900'], {
        duration
      })
    };
  });

  return (
    <Animated.Text numberOfLines={1} style={[styles.periodText, animatedPositionColor]}>
      {label}
    </Animated.Text>
  );
};

interface Styles {
  dateTime: TextStyle;
  chartBox: ViewStyle;
  chartWrapper: ViewStyle;
  chartInbox: ViewStyle;
  chartRow: ViewStyle;
  chart: ViewStyle;
  chartItem: ViewStyle;
  chartTimeLine: ViewStyle;
  chartDesc: TextStyle;
  chartPriceLine: ViewStyle;
  noData: ViewStyle;
  infoBox: ViewStyle;
  infoItem: ViewStyle;
  pnlBox: ViewStyle;
  pnl: ViewStyle;
  pnlProfit: ViewStyle;
  pnlLoss: ViewStyle;
  pnlDesc: TextStyle;
  pnlDescProfit: TextStyle;
  pnlDescLoss: TextStyle;
  gain: TextStyle;
  alertBox: ViewStyle;
  container: ViewStyle;
  dot: ViewStyle;
  loader: ViewStyle;
  controls: ViewStyle;
  periodControlsBox: ViewStyle;
  periodControls: ViewStyle;
  periodButtonSlider: ViewStyle;
  periodButtonSliderItem: ViewStyle;
  periodButton: ViewStyle;
  periodText: TextStyle;
  switchButton: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, red, graphite }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    dateTime: {
      marginTop: 4,
      color: '#4E5F64'
    },
    chartWrapper: {
      flex: 1
    },
    chartInbox: {
      flex: 1,
      flexGrow: 1,
      gap: 4
    },
    chartRow: {
      flex: 1,
      flexDirection: 'row',
      gap: 4
    },
    chart: {
      flex: 1,
      flexGrow: 1,
      borderColor: '#8fa6ae',
      borderBottomWidth: isIOS ? 0.5 : 1,
      borderRightWidth: isIOS ? 0.5 : 1,
      borderStyle: isIOS ? 'solid' : 'dashed',
      paddingHorizontal: 4,
      paddingTop: 4
    },
    chartItem: {
      flex: 1
    },
    chartTimeLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      minHeight: 16
    },
    chartDesc: {
      flexShrink: 1,
      color: '#4E5F64'
    },
    chartPriceLine: {
      justifyContent: 'space-between',
      flexGrow: 0,
      flexShrink: 0,
      paddingTop: 4,
      paddingBottom: 8,
      marginBottom: 16,
      minWidth: 0
    },
    noData: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 16
    },
    infoBox: {
      gap: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    infoItem: {
      justifyContent: 'center',
      gap: 4,
      flex: 1
    },
    pnlBox: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center'
    },
    pnl: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      backgroundColor: '#ECF0F1'
    },
    pnlProfit: {
      backgroundColor: '#e2faea'
    },
    pnlLoss: {
      backgroundColor: red['100']
    },
    pnlDesc: {},
    pnlDescProfit: {
      color: '#02500E'
    },
    pnlDescLoss: {
      color: '#A10C2F'
    },
    gain: {
      color: '#4E5F64'
    },
    alertBox: {
      alignSelf: 'flex-end',
      paddingVertical: 4,
      paddingLeft: 6,
      paddingRight: 8,
      borderRadius: 6,
      backgroundColor: '#D1DEFF',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    container: {
      gap: 16
    },
    dot: {
      width: 2,
      height: 2,
      borderRadius: 2,
      backgroundColor: '#4E5F64'
    },
    chartBox: {
      backgroundColor: base.white,
      borderRadius: 16,
      width: '100%',
      height: 376,
      paddingLeft: 16,
      paddingTop: 24,
      paddingBottom: 16,
      paddingRight: 16,
      gap: 0,
      ...shadow6Style
    },
    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 16
    },
    controls: {
      flexDirection: 'row',
      gap: 16,
      justifyContent: 'space-between'
    },
    periodControlsBox: {
      flexDirection: 'row',
      backgroundColor: base.white,
      borderRadius: 8,
      flexGrow: 1,
      height: 30,
      justifyContent: 'space-between',
      ...shadow6Style
    },
    periodControls: {
      flexDirection: 'row',
      borderRadius: 8,
      flex: 1,
      gap: 0,
      justifyContent: 'space-between'
    },
    periodButtonSlider: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      flex: 1,
      width: 0,
      padding: 3
    },
    periodButtonSliderItem: {
      flex: 1,
      borderRadius: 8,
      backgroundColor: graphite['900']
    },
    periodButton: {
      borderRadius: 8,
      flex: 1,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center'
    },
    periodText: {
      fontSize: 13,
      fontFamily: generalSans.medium,
      textAlignVertical: 'top',
      textAlign: 'center',
      color: graphite['900']
    },
    switchButton: {
      backgroundColor: base.white,
      borderRadius: 8,
      height: 30,
      width: 30,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow6Style
    }
  });
};

export default memo(AssetChart);

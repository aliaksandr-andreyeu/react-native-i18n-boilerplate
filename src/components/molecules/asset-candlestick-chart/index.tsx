import React, { FC, memo, useEffect, useMemo, useState, Dispatch, SetStateAction, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, ColorValue } from 'react-native';
import { BaseText } from '@/components';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { formatTwoDecimals, rgba } from '@/helpers';
import { CandlestickChart } from 'react-native-wagmi-charts';
import { runOnJS } from 'react-native-reanimated';
import { Line, NumberProp, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

let timeout: ReturnType<typeof setTimeout> | undefined;

export interface IRenderRects {
  x: NumberProp;
  y: NumberProp;
  width: NumberProp;
  height: NumberProp;
  fill: ColorValue;
  useAnimations: boolean;
  direction: 'positive' | 'negative';
}

export interface IRenderLine {
  x1: NumberProp;
  y1: NumberProp;
  x2: NumberProp;
  y2: NumberProp;
  stroke: ColorValue;
  strokeWidth: NumberProp;
  useAnimations: boolean;
  direction: 'positive' | 'negative';
}

export interface CandlestickChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface BaseAssetCandlestickChartProps {
  digits: number;
  data: CandlestickChartData[];
  width: number;
  height: number;
  setShowDate: Dispatch<SetStateAction<boolean>>;
  setChartDate: Dispatch<SetStateAction<number | null>>;
}

const BaseAssetCandlestickChart: FC<BaseAssetCandlestickChartProps> = ({
  digits = 0,
  data = [],
  width,
  height,
  setShowDate,
  setChartDate
}) => {


  const cleanedData = useMemo(() => {
    const seen = new Set<number>();
    return data
      .filter((item) => {
        const isValid =
          typeof item.open === 'number' &&
          typeof item.high === 'number' &&
          typeof item.low === 'number' &&
          typeof item.close === 'number' &&
          item.open !== 0 &&
          item.high !== 0 &&
          item.low !== 0 &&
          item.close !== 0;

        if (!isValid || seen.has(item.timestamp)) return false;

        seen.add(item.timestamp);
        return true;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);


  const lastMessage = cleanedData?.at(-1) || ({} as CandlestickChartData);

  const [currentOHLC, setCurrentOHLC] = useState<CandlestickChartData | undefined>(undefined);

  const theme = useTheme();
  const styles = useStyles(theme);
  const { palette } = theme || {};
  const { border, background } = palette || {};

  const green = border.base.positive.medium;
  const red = border.base.negative;
  const grey = background.interaction.basic.primary.loading;
  const white = background.card.primary;

  const { t } = useTranslation();

  const isData = Boolean(cleanedData && Array.isArray(cleanedData) && cleanedData.length > 0);

  useEffect(() => {
    setCurrentOHLC(lastMessage);
  }, []);

  const clearDate = () => {
    setShowDate(false);
    setChartDate(null);
  };

  const setDate = (value: number) => {
    setChartDate(value);
    setShowDate(true);
  };


  const handleCurrentData = (value: number) => {
    const currentData = cleanedData
      ?.filter(({ timestamp }) => {
        return timestamp == value;
      })
      ?.find((el) => el);

    if (currentData) {
      setCurrentOHLC(currentData);
    }

    timeout && clearTimeout(timeout);

    // setDebouncedDate(value);
    setDate(value);

    timeout = setTimeout(() => {
      clearDate();
    }, 1500);
  };

  const chartColor = useMemo(() => {
    const { open, close } = lastMessage || ({} as CandlestickChartData);

    if (open > close) {
      return red;
    }
    if (open < close) {
      return green;
    }
    return grey;
  }, [red, green, grey, lastMessage]);

  const tooltipColor = useMemo(() => {
    const { open, close } = lastMessage || ({} as CandlestickChartData);
    const { text } = palette || {};

    if (open < close) {
      return text.base.primary;
    }
    return text.base.inverted;
  }, [palette, lastMessage]);

  const tooltipPrice = useMemo(() => {
    if (!currentOHLC) {
      return null;
    }

    const { open = 0, high = 0, low = 0, close = 0 } = currentOHLC || {};

    return (
      <View style={[styles.tooltipBox, { backgroundColor: chartColor }]}>
        <View style={styles.tooltipRow}>
          <BaseText style={[styles.tooltipTitle, { color: tooltipColor }]}>
            {t('components.molecules.asset-candlestick.open')}:
          </BaseText>
          <BaseText style={[styles.tooltipDesc, { color: tooltipColor }]}>
            {formatTwoDecimals(open?.toFixed(digits))}
          </BaseText>
        </View>
        <View style={styles.tooltipRow}>
          <BaseText style={[styles.tooltipTitle, { color: tooltipColor }]}>
            {t('components.molecules.asset-candlestick.high')}:
          </BaseText>
          <BaseText style={[styles.tooltipDesc, { color: tooltipColor }]}>
            {formatTwoDecimals(high?.toFixed(digits))}
          </BaseText>
        </View>
        <View style={styles.tooltipRow}>
          <BaseText style={[styles.tooltipTitle, { color: tooltipColor }]}>
            {t('components.molecules.asset-candlestick.low')}:
          </BaseText>
          <BaseText style={[styles.tooltipDesc, { color: tooltipColor }]}>
            {formatTwoDecimals(low?.toFixed(digits))}
          </BaseText>
        </View>
        <View style={styles.tooltipRow}>
          <BaseText style={[styles.tooltipTitle, { color: tooltipColor }]}>
            {t('components.molecules.asset-candlestick.close')}:
          </BaseText>
          <BaseText style={[styles.tooltipDesc, { color: tooltipColor }]}>
            {formatTwoDecimals(close?.toFixed(digits))}
          </BaseText>
        </View>
      </View>
    );
  }, [styles, currentOHLC, chartColor, tooltipColor, digits, t]);

  if (!isData || !width || !height) {
    return null;
  }

  const RenderRect = useCallback(
    (props: IRenderRects) => {

      const isPositive = props.direction === 'positive';
      const stroke = isPositive ? green : red;

      return (
        <>
          <Rect {...props} fill={white} rx={1} ry={1} />
          <Rect {...props} strokeWidth={1} stroke={stroke} fill={rgba(stroke, 50)} rx={1} ry={1} />
        </>
      )
    },
    [green, red, white]
  );

  const RenderLine = useCallback(
    (props: IRenderLine) => {
      const isPositive = props.direction === 'positive';
      const stroke = isPositive ? green : red;
      return <Line {...props} stroke={stroke} />;
    },
    [red, green]
  );



  return (
    <View style={styles.container}>
      <CandlestickChart.Provider data={cleanedData}>
        <CandlestickChart height={height} width={width}>
          <CandlestickChart.Candles
            positiveColor={green}
            negativeColor={red}
            renderRect={RenderRect as (props: Omit<IRenderRects, 'direction'>) => React.JSX.Element}
            renderLine={RenderLine as (props: Omit<IRenderLine, 'direction'>) => React.JSX.Element}
            useAnimations={false}

          />
          <CandlestickChart.Crosshair color={chartColor}>
            <CandlestickChart.DatetimeText
              format={({ value }) => {
                'worklet';
                runOnJS(handleCurrentData)(Number(value));
                return '';
              }}
            />
            <CandlestickChart.Tooltip
              style={{
                paddingVertical: 8,
                paddingHorizontal: 8,
                backgroundColor: chartColor,
                borderRadius: 8
              }}
              textStyle={{ padding: 0, color: tooltipColor }}
            >
              {tooltipPrice}
            </CandlestickChart.Tooltip>
          </CandlestickChart.Crosshair>
        </CandlestickChart>
      </CandlestickChart.Provider>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  tooltipBox: ViewStyle;
  tooltipRow: ViewStyle;
  tooltipTitle: TextStyle;
  tooltipDesc: TextStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      flex: 1
    },
    tooltipBox: {
      gap: 4
    },
    tooltipRow: {
      flex: 1,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    tooltipTitle: {},
    tooltipDesc: {}
  });

export default memo(BaseAssetCandlestickChart);

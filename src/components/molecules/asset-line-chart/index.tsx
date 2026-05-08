import React, { Dispatch, FC, SetStateAction, memo, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { LineChart } from 'react-native-wagmi-charts';
import { runOnJS } from 'react-native-reanimated';
import { ChartHorizontalLine } from '@/components/organisms/asset-chart';
import { BaseTextVariant } from '@/components/atoms';

let timeout: ReturnType<typeof setTimeout> | undefined;

export interface LineChartData {
  timestamp: number;
  value: number;
}

interface BaseAssetLineChartProps {
  digits: number;
  data: LineChartData[];
  width: number;
  stickWidth?: number;
  height: number;
  setShowDate: Dispatch<SetStateAction<boolean>>;
  setChartDate: Dispatch<SetStateAction<number | null>>;
  horizontalLines?: ChartHorizontalLine[];
  minMaxValues: {
    min: number;
    max: number;
  };
}

const BaseAssetLineChart: FC<BaseAssetLineChartProps> = ({
  digits = 0,
  data = [],
  width,
  height,
  setShowDate,
  setChartDate,
  horizontalLines,
  minMaxValues,
  stickWidth
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { palette } = theme || {};
  const { border, background } = palette || {};

  const green = border.base.positive.medium;
  const red = border.base.negative;
  const grey = background.interaction.basic.primary.loading;

  const isData = Boolean(data && Array.isArray(data) && data.length > 0);

  const firstElement = isData ? data[0] : ({} as LineChartData);
  const { value: firstValue } = firstElement || {};

  const lastElement = isData ? data[data.length - 1] : ({} as LineChartData);
  const { value: lastValue } = lastElement || {};

  const clearDate = () => {
    setShowDate(false);
    setChartDate(null);
  };

  const setDate = (value: number) => {
    setChartDate(value);
    setShowDate(true);
  };

  const handleCurrentData = (value: number) => {
    if (value !== -1) {
      timeout && clearTimeout(timeout);

      setDate(value);

      timeout = setTimeout(() => {
        clearDate();
      }, 1500);
    }
  };

  const tipColor = useMemo(() => {
    const { background } = palette || {};

    return background.interaction.basic.primary.disabled;
  }, [palette]);

  const chartColor = useMemo(() => {
    if (!firstValue || !lastValue) {
      return grey;
    }

    if (firstValue > lastValue) {
      return red;
    } else if (firstValue < lastValue) {
      return green;
    } else {
      return grey;
    }
  }, [red, green, grey, firstValue, lastValue]);

  const tooltipColor = useMemo(() => {
    const { text } = palette || {};

    return text.base.primary;
  }, [palette]);

  if (!isData || !width || !height) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LineChart.Provider data={data} yRange={minMaxValues}>
        <LineChart height={height} width={width}>
          <LineChart.Path
            color={chartColor}
            width={stickWidth}
            animationDuration={0}
            mountAnimationDuration={0}
            showInactivePath={false}
            animateOnMount={undefined}
          >
            <LineChart.Gradient color={chartColor} />
            {horizontalLines &&
              horizontalLines.map((line, index) => {
                return <LineChart.HorizontalLine at={{ value: line.value }} color={line.color} key={index} />;
              })}
          </LineChart.Path>
          <LineChart.CursorLine color={chartColor} />
          <LineChart.CursorCrosshair color={chartColor}>
            <LineChart.DatetimeText
              format={({ value }) => {
                'worklet';
                runOnJS(handleCurrentData)(Number(value));
                return '';
              }}
            />
            <LineChart.Tooltip
              style={{
                paddingVertical: 2,
                paddingHorizontal: 8,
                backgroundColor: tipColor,
                borderRadius: 8
              }}
              textStyle={[styles.tipTextStyle, { padding: 0, color: tooltipColor }]}
              textProps={{ precision: digits || 2, variant: 'value' }}
            />
          </LineChart.CursorCrosshair>
        </LineChart>
      </LineChart.Provider>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  tipTextStyle: TextStyle;
}

const useStyles = ({ palette: { base } }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      flex: 1
    },
    tipTextStyle: {
      ...BaseTextVariant.tiny
    }
  });

export default memo(BaseAssetLineChart);

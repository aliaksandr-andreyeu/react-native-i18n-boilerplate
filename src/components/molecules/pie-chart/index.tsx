import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { TouchableWithoutFeedback, View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Text } from 'react-native-svg';
import ChartLegend from '../chart-legend';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { useTranslation } from 'react-i18next';

export interface IColorsDonutChart {
  data: { value: number; color: string; type?: string }[];
  withLegend?: boolean;
  goal: number;
}

const DonutChart: FC<IColorsDonutChart> = ({ data, withLegend = false, goal }) => {
  const theme = useTheme();
  const {
    fonts: { generalSans }
  } = config;

  const { t } = useTranslation();

  const BASE_COLOR = theme.palette.graphite[100];
  const GAP_ANGLE = 6;
  const STROKE_WIDTH = 8;
  const RADIUS = 90;
  let START_ANGLE = -270;

  const [activeSector, setActiveSector] = useState<number | null>(null);
  const { container } = useStyles(theme);
  const [chartData, setChartData] = useState(data);
  const [totalProgress, setTotalProgress] = useState(0);

  const calculatedTotal = data.reduce((acc, item) => acc + item.value, 0);
  const localGoal = Math.max(goal, calculatedTotal);

  const dataWithPercentages = useMemo(
    () => data.map((el) => ({ ...el, value: (el.value / localGoal) * 100 })),
    [data, localGoal]
  );

  useEffect(() => {
    const total = dataWithPercentages.reduce((sum, item) => sum + item.value, 0);
    setTotalProgress(Math.min(100, total));
    const remainder = 100 - total;
    const newData =
      remainder > 0 ? [...dataWithPercentages, { value: remainder, color: BASE_COLOR }] : dataWithPercentages;
    setChartData(newData.filter((item) => item.value > 0));
  }, [data]);

  const numGaps = chartData.length;
  const totalGapAngle = numGaps * GAP_ANGLE;

  const availableSectorAngle = 360 - totalGapAngle;

  const toggleActiveSector = useCallback((index: number) => {
    if (index === chartData.length - 1) return;
    setActiveSector((prev) => (prev === index ? null : index));
  }, []);

  const getPath = (startAngle: number, endAngle: number, cx = 100, cy = 100) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const startX = cx + RADIUS * Math.cos(startRad);
    const startY = cy + RADIUS * Math.sin(startRad);
    const endX = cx + RADIUS * Math.cos(endRad);
    const endY = cy + RADIUS * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const path = `M ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endX} ${endY}`;
    return path;
  };

  const paths = useMemo(() => {
    return chartData.map((item, index) => {
      const angle = (item.value / 100) * availableSectorAngle;
      const adjustedStartAngle = START_ANGLE;
      const adjustedEndAngle = adjustedStartAngle + angle;
      const path = getPath(adjustedStartAngle, adjustedEndAngle);
      START_ANGLE = adjustedEndAngle + (index < chartData.length - 1 ? GAP_ANGLE : 0);
      const opacity = activeSector === index || activeSector === null ? 1 : 0.5;
      return (
        <TouchableWithoutFeedback key={item.color} onPress={() => toggleActiveSector(index)}>
          <Path
            d={path}
            fill='none'
            stroke={item.color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap='round'
            opacity={index === chartData.length - 1 ? 1 : opacity}
          />
        </TouchableWithoutFeedback>
      );
    });
  }, [activeSector, chartData]);

  const percentText = 100 - totalProgress > 0 ? `${(100 - totalProgress).toFixed(2)}%` : '100%';
  const labelText =
    100 - totalProgress > 0
      ? t('components.molecules.pie-chart.for-goal')
      : t('components.molecules.pie-chart.completed');
  const textY = 95;

  return (
    <View style={container}>
      <Svg width={160} height={160} viewBox='0 0 200 200'>
        {paths}
        <Circle cx='100' cy='100' r={RADIUS - 10} fill='none' stroke={BASE_COLOR} strokeWidth='2' />
        <Text
          x='100'
          y={textY}
          fill={theme.palette.graphite[400]}
          fontFamily={generalSans.medium}
          fontSize='16'
          textAnchor='middle'
          alignmentBaseline='middle'
        >
          {percentText}
        </Text>
        <Text
          x='100'
          y={textY + 20}
          fill={theme.palette.graphite[400]}
          fontFamily={generalSans.medium}
          fontSize='14'
          textAnchor='middle'
          alignmentBaseline='middle'
        >
          {labelText}
        </Text>
      </Svg>
      {withLegend && <ChartLegend data={data} />}
    </View>
  );
};

export default DonutChart;

interface IDonutChartStyles {
  container: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  return StyleSheet.create<IDonutChartStyles>({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      columnGap: 24
    }
  });
};

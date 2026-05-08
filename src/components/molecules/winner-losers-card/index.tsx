import React from 'react';
import { NavigationProp, ParamListBase, useNavigation, useTheme } from '@react-navigation/native';
import useStyles from './style';
import { TouchableOpacity, View, Image } from 'react-native';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useAppSelector } from '@/hooks';
import { useMemo } from 'react';
import dateHelper from '@/helpers/dateHelper';
import { LineChart } from 'react-native-wagmi-charts';
import { IDEASHUB_ROUTE_NAMES } from '@/navigation/app/stacks';
import { articleViewedMixpanel, formatTwoDecimals } from '@/helpers';

interface WinnersAndLosersCardProps {
  profit: number;
  config: { lastClosedPrice: number };
  chartData: {
    ts: number;
    c: number;
  }[];
  id: number;
  createdAt: string;
  title: string;
  description: string;
  symbol: string;
  lastTick: { ask: number; bid: number };
  fullName: string;
  testID?: string;
}

const WinnersAndLosersCard = ({
  profit,
  config,
  chartData,
  id,
  lastTick,
  createdAt,
  title,
  description,
  symbol,
  fullName,
  testID
}: WinnersAndLosersCardProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const tradingAssets = useAppSelector((store) => store.portfolio.tradingAssets);

  const lastClosedPrice = config?.lastClosedPrice;
  const isProfitPlus = profit > 0;

  const imageUrl = useMemo(() => tradingAssets.find((i) => i.systemName === symbol)?.image || '', [symbol]);

  const lineData =
    chartData?.map((line: { ts: number; c: number }) => ({
      timestamp: line.ts,
      value: line.c
    })) || [];

  const isData = Boolean(lineData && Array.isArray(lineData) && lineData.length > 0);

  const goToArticle = () => {
    articleViewedMixpanel({
      contentCategory: 'Top Movers',
      contentID: id,
      contentTitle: title
    });
    navigation.navigate(IDEASHUB_ROUTE_NAMES.WinnerAndLosersArticle, {
      profit: profit,
      isProfitPlus: isProfitPlus,
      config: config,
      chartData: lineData,
      id: id,
      createdAt: createdAt,
      title: title,
      description: description,
      symbol: symbol,
      imageUrl: imageUrl,
      lastTick: lastTick,
      fullName: fullName
    });
  };

  const renderProfit = () =>
    profit !== undefined && lastClosedPrice ? (
      <View style={[styles.profitContainer, isProfitPlus ? styles.profilePlus : styles.profileMinus]}>
        <BaseText variant={BaseTextVariant.small}>
          {isProfitPlus ? '+' : ''}
          {formatTwoDecimals(profit % 1 !== 0 ? profit.toFixed(2) : profit)}%
        </BaseText>
      </View>
    ) : null;

  const renderChart = () =>
    isData ? (
      <View>
        <LineChart.Provider data={lineData}>
          <LineChart height={72} width={164}>
            <LineChart.Path color={isProfitPlus ? theme.palette.green['400'] : theme.palette.red['600']} width={3} />
          </LineChart>
        </LineChart.Provider>
      </View>
    ) : null;

  return (
    <View>
      <TouchableOpacity testID={testID} style={styles.container} onPress={goToArticle}>
        {renderProfit()}
        {imageUrl && <Image resizeMode='cover' source={{ uri: imageUrl }} style={styles.img} />}
        {renderChart()}
        <View style={styles.titleContainer}>
          <BaseText variant={BaseTextVariant.widgetTitle} style={styles.title} numberOfLines={3}>
            {title}
          </BaseText>
        </View>
      </TouchableOpacity>
      <BaseText variant={BaseTextVariant.extraSmall} style={styles.date}>
        {dateHelper.to(createdAt, 'DD MMM YYYY')}
      </BaseText>
    </View>
  );
};

export default WinnersAndLosersCard;

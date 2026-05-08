import WinnersAndLosersCard from '@/components/molecules/winner-losers-card';
import { useAppSelector } from '@/hooks';
import { useGetWinnersAndLosersQuery } from '@/store/api';
import React, { useCallback, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import useStyles from './style';
import { useTranslation } from 'react-i18next';
import { BaseCaption } from '@/components/molecules';
import { useTheme } from '@react-navigation/native';
import { WinnersAndLosers } from '@/store/slices/ideas-hub/types';
import { testIDs } from '@/constants';

interface IWinnersAndLosersWidgetProps {
  testID?: string;
  onDataLengthChange?: (hasData: boolean) => void;
}

const WinnersAndLosersWidget: React.FC<IWinnersAndLosersWidgetProps> = ({ testID, onDataLengthChange }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const [getWinnersAndLosers, { currentData: data }] = useGetWinnersAndLosersQuery();
  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount) || 0;

  useEffect(() => {
    getWinnersAndLosersData();
  }, [selectedAccount]);

  useEffect(() => {
    onDataLengthChange && onDataLengthChange(!!data?.length);
  }, [data?.length]);

  const getWinnersAndLosersData = useCallback(async () => {
    try {
      await getWinnersAndLosers(selectedAccount, false);
    } catch (error) { }
  }, [selectedAccount]);

  const renderItem = ({ item }: { item: WinnersAndLosers }) => (
    <WinnersAndLosersCard
      testID={testIDs.components.organisms.winnersAndLosersWidget.item(item.id)}
      profit={item.profit}
      config={item.config}
      chartData={item.chartData}
      id={item.id}
      createdAt={item.createdAt}
      title={item.title}
      description={item.description}
      symbol={item.symbol}
      lastTick={item.lastTick}
      fullName={item.fullName}
    />
  );

  const Seperator = useCallback(() => {
    return (
      <View style={styles.seperatorContainer} testID={testIDs.components.organisms.winnersAndLosersWidget.separator.root}>
        <View style={styles.seperatorUp} testID={testIDs.components.organisms.winnersAndLosersWidget.separator.up} />
        <View style={styles.seperatorDown} testID={testIDs.components.organisms.winnersAndLosersWidget.separator.down} />
      </View>
    );
  }, [theme.dark]);

  if (!data || data?.length < 1) return null;

  return (
    <View testID={testID ?? testIDs.components.organisms.winnersAndLosersWidget.container}>
      <Seperator />
      <BaseCaption
        style={styles.header}
        label={t('screens.ideas-hub.winners-losers.title')}
        help={t('screens.ideas-hub.winners-losers.help')}
        testID={testIDs.components.organisms.winnersAndLosersWidget.caption}
      />
      <FlatList
        scrollEnabled={data?.length > 2}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={data}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        testID={testIDs.components.organisms.winnersAndLosersWidget.list}
      />
    </View>
  );
};

export default WinnersAndLosersWidget;

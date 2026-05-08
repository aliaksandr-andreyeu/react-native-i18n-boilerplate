import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { BaseTopPerformerCard } from '@/components';
import { OpenPositionData, ParsedTopPerformer, ParsedTopPerformerResponse } from '@/store/api/pulse/types';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useGetSymbolConfigMutation, useGetSymbolLastTickQuery, useGetTopPerformersQuery } from '@/store/api';
import { MarketClosed } from '../components';
import { isMarketClosed } from '@/helpers';
import { useTranslation } from 'react-i18next';
import { useAppSelector, usePulseHub } from '@/hooks';
import { SymbolConfig, SymbolLastTick } from '@/types';
import { useNetwork } from '@/providers';

interface ITopPerformersScreen {
  tab: string;
  onPress(data?: OpenPositionData, close?: boolean): void;
  isIslamic: boolean;
}

const { screenWidth } = config;

const transition = LinearTransition.duration(600);

const TopPerformersScreen: React.FC<ITopPerformersScreen> = ({ tab, onPress, isIslamic }) => {
  const [allData, setAllData] = useState<ParsedTopPerformerResponse['data']>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasHydratedOnce, setHasHydratedOnce] = useState(false);

  const [getSymbolLastTick] = useGetSymbolLastTickQuery();
  const [getSymbolConfig] = useGetSymbolConfigMutation();

  const [getPerformers, { data: topPerformerData, isFetching: isTopPerformerLoading, isLoading }] =
    useGetTopPerformersQuery();

  const scrollRef = useRef<Animated.ScrollView>(null);

  const tradingAssets = useAppSelector((store) => store.portfolio.tradingAssets);
  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);

  const { performerUpdates, removeProcessed } = usePulseHub({ autoReconnectOnForeground: true });
  const { websocket, isReadyState } = useNetwork();
  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = websocket && pageIsFocused && isReadyState;

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme as UserTheme);

  const marketClosed = useMemo(() => isMarketClosed(tab), [tab]);
  const metalClosed = isMarketClosed('metal');
  const forexClosed = isMarketClosed('forex');

  const buckets = useMemo(() => {
    const map = new Map<string, ParsedTopPerformerResponse['data']>();
    map.set('All', allData);

    for (const item of allData) {
      const key = item.category ?? 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    return map;
  }, [allData]);

  const visibleUpdates = useMemo(() => (pageIsFocused ? performerUpdates : []), [performerUpdates, pageIsFocused]);

  const deferredTab = useDeferredValue(marketClosed ? '' : tab);

  const sortedData = useMemo(() => {
    if (!deferredTab) return [];

    let sData = buckets.get(deferredTab) ?? [];

    if ((metalClosed || forexClosed || isIslamic) && deferredTab === 'All') {
      sData = sData.filter(
        (item) =>
          ![forexClosed && 'Forex', metalClosed && 'Metal', isIslamic && 'Crypto'].includes(item.category as any)
      );
    }

    return sData;
  }, [buckets, deferredTab, metalClosed, forexClosed, isIslamic]);

  const loader = useMemo(() => {
    const viewWidth = screenWidth - 44;
    const gap = 13.5;
    const itemWidth = (viewWidth - gap) / 2;
    const itemHeight = 165;
    const itemsSize = 10;
    const items = new Array(itemsSize).fill(null);
    const viewHeight = itemHeight * (itemsSize / 2) + gap * (itemsSize / 2 - 1) + 20;

    return (
      <Animated.ScrollView entering={FadeIn} contentContainerStyle={styles.loaderContainer}>
        <ContentLoader
          speed={2}
          width={viewWidth}
          height={viewHeight}
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={(theme as UserTheme).palette.graphite['050']}
        >
          {items.map((_, index) => {
            const isOdd = index % 2 !== 0;
            const calculatedY = isOdd ? (index - 1) / 2 : index / 2 - 1;
            const y = calculatedY * (gap + itemHeight);
            const x = isOdd ? 0 : gap + itemWidth;

            return <Rect key={index} x={x} y={y} rx='12' ry='12' width={itemWidth} height={itemHeight} />;
          })}
        </ContentLoader>
      </Animated.ScrollView>
    );
  }, [styles.loaderContainer, theme]);

  const onRefresh = useCallback(() => {
    getPerformers();
  }, [getPerformers]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isTopPerformerLoading && !isLoading}
        onRefresh={onRefresh}
        tintColor={'#1FE07A'}
        colors={['#1FE07A']}
      />
    ),
    [onRefresh, isTopPerformerLoading, isLoading]
  );

  const assetNames = useMemo(() => new Set(tradingAssets.map((a) => a.systemName)), [tradingAssets]);

  const profitSymbol = useCallback(
    (currencyProfit: string | undefined) => {
      if (!currencyProfit || assetNames.size === 0) return;

      const base = currencyProfit.toUpperCase();
      const directPair = base + 'USD';
      const reversePair = 'USD' + base;

      if (assetNames.has(directPair)) return ` ${directPair}`;
      if (assetNames.has(reversePair)) return ` ${reversePair}`;

      return;
    },
    [assetNames]
  );

  const symbols = useMemo(() => {
    if (!sortedData.length) return '';

    const hasTradingAssets = tradingAssets.length > 0;

    return sortedData
      .map((item) => {
        const profit = hasTradingAssets ? profitSymbol(item.currencyProfit) || '' : '';
        return ` ${item.instrument}${profit}`;
      })
      .join('');
  }, [sortedData, tradingAssets, profitSymbol]);

  const onExpired = useCallback(
    (id: string, asset: string, currencyProfit: string | undefined) => {
      setAllData((prev) => prev.filter((item) => item.id !== id));
      if (!websocket) return;

      const suffix = tradingAssets.length ? profitSymbol(currencyProfit) || '' : '';
      const unsubscribe = `${asset}${suffix}`;

      websocket.send(`unsubscribe ${unsubscribe}`);
    },
    [websocket, tradingAssets, profitSymbol]
  );

  const onCardPress = useCallback(
    (item: OpenPositionData) => {
      onPress?.(item);
    },
    [onPress]
  );

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const mergeByAsset = useCallback((a: ParsedTopPerformer[], b: ParsedTopPerformer[]) => {
    const map = new Map<string | number, ParsedTopPerformer>();

    for (const item of a) {
      map.set(item.instrument, item);
    }

    for (const item of b) {
      map.set(item.instrument, item);
    }

    return Array.from(map.values());
  }, []);

  const higherToLower = (data: ParsedTopPerformer[]) => {
    return data.sort((a, b) => +b.percentageProfitBuy - +a.percentageProfitBuy);
  };

  useEffect(() => {
    if (!visibleUpdates.length) return;

    setAllData((prev) => higherToLower(mergeByAsset(prev, visibleUpdates)));

    const processedIds = visibleUpdates.map((item) => item.id);
    removeProcessed(processedIds);
  }, [visibleUpdates, mergeByAsset]);

  useEffect(() => {
    if (!enabledHandleMessage || !symbols || !websocket) return;

    websocket.send(`subscribe${symbols}`);

    return () => {
      websocket.send('unsubscribe ALL');
    };
  }, [enabledHandleMessage, symbols, websocket]);

  useEffect(() => {
    if (!topPerformerData) return;

    if (!topPerformerData.data?.length) {
      setAllData([]);
      setLoading(false);
      setHasHydratedOnce(true);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setHasHydratedOnce(false);

        const instrumentsSet = new Set(topPerformerData.data.map((item) => item.instrument));
        const uniqueInstruments = Array.from(instrumentsSet);

        const perSymbolPromises = uniqueInstruments.map(async (symbol) => {
          const [tickRes, configRes] = await Promise.allSettled([
            getSymbolLastTick({
              accountId: selectedAccount || 0,
              symbol
            }).unwrap(),
            getSymbolConfig({
              accountId: selectedAccount || 0,
              symbol
            }).unwrap()
          ]);

          const merged: { ask?: number; bid?: number; currencyProfit?: string } = {};

          if (tickRes.status === 'fulfilled') {
            const tick = tickRes.value as SymbolLastTick;
            merged.ask = tick.ask;
            merged.bid = tick.bid;
          }

          if (configRes.status === 'fulfilled') {
            const cfg = configRes.value as SymbolConfig;
            merged.currencyProfit = cfg.currencyProfit;
          }

          return [symbol, merged] as const;
        });

        const entries = await Promise.all(perSymbolPromises);

        const resultMap = new Map<string, { ask?: number; bid?: number; currencyProfit?: string }>(entries);

        const allDataWithAskAndBid = topPerformerData.data.map((item) => {
          const extra = resultMap.get(item.instrument);
          if (!extra) return item;

          return {
            ...item,
            ask: extra.ask,
            bid: extra.bid,
            currencyProfit: extra.currencyProfit
          };
        });

        setAllData(higherToLower(allDataWithAskAndBid));
      } finally {
        setHasHydratedOnce(true);
        setLoading(false);
      }
    })();
  }, [topPerformerData, getSymbolLastTick, selectedAccount, getSymbolConfig]);

  if (!marketClosed && (isTopPerformerLoading || loading || !hasHydratedOnce)) {
    return loader;
  }

  const hasSortedData = sortedData.length > 0;

  const shouldShowMarketClosed = marketClosed || (hasHydratedOnce && !hasSortedData);

  return (
    <ScrollView
      ref={scrollRef as any}
      key={marketClosed || !sortedData.length ? 'market-closed-list_performers' : `tab_performers_list`}
      refreshControl={refreshControl}
      style={styles.scrollStyle}
      contentContainerStyle={styles.scrollContent}
    >
      {shouldShowMarketClosed ? (
        <MarketClosed
          key={'market-closed-performer'}
          info={t('screens.pulse.market-closed.top-performers-will-resume')}
        />
      ) : (
        <Animated.View layout={transition} style={styles.contentContainer}>
          {sortedData.map((item) => (
            <Animated.View
              key={item.id}
              layout={transition}
              entering={FadeIn}
              exiting={FadeOut}
              style={styles.cardWitdh}
            >
              <BaseTopPerformerCard
                id={item.id}
                currencyProfit={item.currencyProfit}
                onPress={onCardPress}
                onExpired={onExpired}
                asset={item.instrument}
                category={item.category}
                performanceMetric={item.performanceMetric}
                lastAsk={item.ask}
                lastBid={item.bid}
                stopLoss={item.stopLoss}
                takeProfit={item.takeProfit}
                expiresIn={item.expiredAt}
                change={item.performanceMetric}
                isBuy={item.isBuy}
                profitTarget={+item.percentageProfitBuy}
              />
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );
};

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 13,
      paddingTop: 6,
      paddingBottom: 20,
      gap: 12
    },
    cardWitdh: {
      width: '48%'
    },
    scrollStyle: { flex: 1 },
    contentContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 13.5
    },
    loaderContainer: {
      alignItems: 'center',
      paddingTop: 5
    }
  });

export default memo(TopPerformersScreen);

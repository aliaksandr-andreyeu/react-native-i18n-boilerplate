import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, FlatList, ListRenderItemInfo, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { OpenPositionData, ParsedTopSignal, ParsedTopSignalResponse } from '@/store/api/pulse/types';
import { BaseTopSignalCard } from '@/components';
import Animated, { FadeIn } from 'react-native-reanimated';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useGetSymbolConfigMutation, useGetSymbolLastTickQuery, useGetTopSignalsQuery } from '@/store/api';
import { isMarketClosed } from '@/helpers';
import { MarketClosed } from '../components';
import { useTranslation } from 'react-i18next';
import dateHelper from '@/helpers/dateHelper';
import dayjs from 'dayjs';
import { useAppSelector } from '@/hooks';
import { SymbolConfig, SymbolLastTick } from '@/types';

interface ITopSignals {
    tab: string;
    onPress(data?: OpenPositionData): void;
    isIslamic: boolean
};

const {
    screenWidth
} = config

const closedArr = [null as any];
const TopSignals: React.FC<ITopSignals> = ({
    tab,
    onPress,
    isIslamic
}) => {

    const [allData, setAllData] = useState<ParsedTopSignal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasHydratedOnce, setHasHydratedOnce] = useState(false);


    const [getTopSignals, { data: topSignalsData, isFetching, isLoading }] = useGetTopSignalsQuery();
    const [getSymbolConfig] = useGetSymbolConfigMutation();
    const [getSymbolLastTick] = useGetSymbolLastTickQuery();

    const timerRef = useRef<NodeJS.Timeout>(undefined);

    const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);

    const { t } = useTranslation()
    const theme = useTheme();
    const styles = useStyles(theme);

    const marketClosed = useMemo(() => isMarketClosed(tab), [tab, isFetching]);
    const metalClosed = isMarketClosed('metal');
    const forexClosed = isMarketClosed('forex');

    const buckets = useMemo(() => {
        const sData = allData ?? [];
        const map = new Map<string, ParsedTopSignalResponse['data']>();
        map.set('All', sData);

        for (const item of sData) {
            const key = item.category ?? 'Unknown';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(item);
        }
        return map;
    }, [allData]);

    const deferredTab = useDeferredValue(marketClosed ? '' : tab);

    const sortedData = useMemo(() => {
        if (!deferredTab) return [];
        let sData = buckets.get(deferredTab) ?? []
        if ((metalClosed || forexClosed || isIslamic) && deferredTab === 'All') sData = sData.filter(item => ![forexClosed && 'Forex', metalClosed && 'Metal', isIslamic && 'Crypto'].includes(item.category))
        return sData
    }, [deferredTab, metalClosed, forexClosed, buckets, isIslamic]);

    const loader = useMemo(() => {
        const viewWidth = screenWidth - 44;
        const gap = 12
        const itemWidth = viewWidth;
        const itemHeight = 70;
        const itemsSize = 15;
        const items = new Array(itemsSize).fill(null);
        const viewHeight = (itemHeight * (itemsSize)) + (gap * ((itemsSize) - 1)) + 20;

        return (
            <Animated.ScrollView entering={FadeIn} contentContainerStyle={styles.loaderContainer} >
                <ContentLoader
                    speed={2}
                    width={viewWidth}
                    height={viewHeight}
                    viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                    backgroundColor={'#E2E6F2'}
                    foregroundColor={theme.palette.graphite['050']}
                >
                    {items.map((_, index) => {
                        const y = index * (itemHeight + gap)
                        return <Rect key={index} x={0} y={y} rx='12' ry='12' width={itemWidth} height={itemHeight} />;
                    })}
                </ContentLoader>
            </Animated.ScrollView>
        )
    }, [theme.dark]);


    const hasSortedData = sortedData.length > 0;
    const shouldShowMarketClosed = marketClosed || (hasHydratedOnce && !hasSortedData);

    const _keyExtractor = useCallback((item: ParsedTopSignal) => shouldShowMarketClosed ? 'market-closed-signal' : item?.instrument + item?.category + item?.rsi, [shouldShowMarketClosed])

    const _renderItem = useCallback(({ item }: ListRenderItemInfo<ParsedTopSignal>) => {
        if (shouldShowMarketClosed) return <MarketClosed info={t('screens.pulse.market-closed.top-signal-will-resume')} />;

        return (
            <BaseTopSignalCard
                onPress={onPress}
                id={item.id}
                category={item.category}
                assetName={item.instrument}
                direction={item.direction as 'buy' | 'sell'}
                rewardsAndRisk={item.rewardToRiskRatio}
                confidencePercentage={item.confidencePercentage}
                confidence={item.confidence}
                lastAsk={item.ask}
                lastBid={item.bid}
                sl={item.stopLoss}
                tp={item.takeProfit}
            />
        );
    }, [shouldShowMarketClosed, onPress]);

    const onRefresh = useCallback(() => {
        getTopSignals()
    }, [getTopSignals])

    const refreshControl = useMemo(() => {
        return (
            <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={onRefresh}
                tintColor={'#1FE07A'}
                colors={['#1FE07A']}
            />
        )
    }, [onRefresh, isFetching, isLoading])

    useEffect(() => {
        onRefresh();
    }, [onRefresh]);


    useEffect(() => {
        if (topSignalsData?.expiredAt) {
            const seconds = Math.max(
                0,
                dateHelper.diff(dayjs(), topSignalsData.expiredAt)
            );
            timerRef.current = setTimeout(() => {
                getTopSignals();
            }, seconds * 1000);
        };

        return () => {
            timerRef.current && clearTimeout(timerRef.current)
        };
    }, [topSignalsData?.expiredAt]);

    useEffect(() => {
        if (!topSignalsData) return;

        if (!topSignalsData.data?.length) {
            setAllData([]);
            setLoading(false);
            setHasHydratedOnce(true)
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setHasHydratedOnce(false)
                const instrumentsSet = new Set(topSignalsData.data.map(item => item.instrument));
                const uniqueInstruments = Array.from(instrumentsSet);

                const perSymbolPromises = uniqueInstruments.map(async (symbol) => {
                    const [tickRes, configRes] = await Promise.allSettled([
                        getSymbolLastTick({
                            accountId: selectedAccount || 0,
                            symbol,
                        }).unwrap(),
                        getSymbolConfig({
                            accountId: selectedAccount || 0,
                            symbol,
                        }).unwrap(),
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

                const allDataWithAskAndBid = topSignalsData.data.map(item => {
                    const extra = resultMap.get(item.instrument);
                    if (!extra) return item;

                    return {
                        ...item,
                        ask: extra.ask,
                        bid: extra.bid,
                        currencyProfit: extra.currencyProfit,
                    };
                });

                const sorted = allDataWithAskAndBid.sort((a, b) => (+b.rewardToRiskRatio) - (+a.rewardToRiskRatio))
                setAllData(sorted);
            } finally {
                setHasHydratedOnce(true)
                setLoading(false)
            }
        })();
    }, [topSignalsData, getSymbolLastTick, selectedAccount, getSymbolConfig]);

    if ((isFetching || loading || !hasHydratedOnce) && !marketClosed) return loader;

    return (
        <FlatList
            key={shouldShowMarketClosed ? 'market-closed-list_signals' : `tab_list_signals`}
            data={shouldShowMarketClosed ? closedArr : sortedData}
            style={styles.scrollStyle}
            refreshControl={refreshControl}
            contentContainerStyle={styles.scrollContent}
            keyExtractor={_keyExtractor}
            renderItem={_renderItem}
        />
    )
};

const useStyles = ({
    palette: { }
}: UserTheme) => StyleSheet.create({
    scrollStyle: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 13,
        paddingTop: 6,
        paddingBottom: 20,
        gap: 12,
    },
    loaderContainer: {
        alignItems: 'center',
        paddingTop: 5
    }
});

export default memo(TopSignals);
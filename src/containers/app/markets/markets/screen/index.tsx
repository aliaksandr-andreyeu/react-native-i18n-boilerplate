import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MARKETS_ROUTE_NAMES, MarketsRootParamsList } from '@/navigation/app/stacks';
import {
  Dimensions,
  FlatList,
  TouchableOpacity,
  View,
  ViewToken,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput
} from 'react-native';
import {
  BaseSearch,
  BaseImage,
  BaseMarketTabs,
  BaseAssetCard,
  BaseText,
  BaseTextVariant,
  BaseVerifyBanner
} from '@/components';
import { useTheme, ParamListBase, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { images } from '@/assets';
import { useAppSelector } from '@/hooks';
import { config, testIDs } from '@/constants';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { Symbols } from '@/store/slices/market/types';
import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useNetwork } from '@/providers';
import { useGetSignalsQuery } from '@/store/api';

const {
  buttons: { activeOpacity }
} = config;

type MarketsScreenProps = StackScreenProps<ParamListBase & MarketsRootParamsList, MARKETS_ROUTE_NAMES.Markets>;

const _keyExtractor = (_: Symbols, index: number) => `${index}-asset`;

const { width, height } = Dimensions.get('window');

let lastScrollY = 0;

let searchDebounce: NodeJS.Timeout | undefined = undefined;
const MarketsScreen: FC<MarketsScreenProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { assetCategory = '' } = params || {};

  const [search, setSearch] = useState<string>('');
  const listRef = useRef<FlatList>(null);
  const [data, setData] = useState<Symbols[]>([]);
  const [searchIsFocused, setSearchIsFocused] = useState<boolean>(false);

  const [viewableAssets, setViewableAssets] = useState<ViewToken[]>([] as ViewToken[]);

  const inputRef = useRef<TextInput>(null);

  const { t, i18n } = useTranslation();

  const { websocket, isReadyState } = useNetwork();
  const [getSignals] = useGetSignalsQuery();

  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = pageIsFocused && isReadyState && websocket;

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const isAuthorized = Boolean(accessToken);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { tradingAssets = [], selectedAccount, userInfo } = portfolio || {};

  const market = useAppSelector((store) => store.market);
  const { symbols: categorySymbols, allSymbols: allCategorySymbols } = market || {};

  const filteredCategorySymbols = useMemo(() => {
    if (!isAuthorized) {
      return categorySymbols.filter(
        (symbol) => !symbol.name?.toLowerCase()?.includes('.isl') && !symbol.name?.toLowerCase()?.includes('.vip')
      );
    }
    return categorySymbols;
  }, [categorySymbols, isAuthorized]);

  const filteredAllCategorySymbols = useMemo(() => {
    if (!isAuthorized) {
      return allCategorySymbols.filter(
        (symbol) => !symbol.name?.toLowerCase()?.includes('.isl') && !symbol.name?.toLowerCase()?.includes('.vip')
      );
    }
    return allCategorySymbols;
  }, [allCategorySymbols, isAuthorized]);

  const symbols = useMemo((): Symbols[] => {
    if (!tradingAssets) return filteredCategorySymbols;

    const mixedSymbols = filteredCategorySymbols.map((symbol) => {
      const asset = tradingAssets.find((item) => item.systemName === symbol.name?.replace(/\.isl|\.vip/gi, ''));
      return asset ? { ...symbol, image: asset.image, description: asset.fullName || symbol.description } : symbol;
    });

    return mixedSymbols;
  }, [filteredCategorySymbols, tradingAssets]);

  const allSymbols = useMemo((): Symbols[] => {
    if (!tradingAssets) return filteredAllCategorySymbols;

    const mixedSymbols = filteredAllCategorySymbols.map((symbol) => {
      const asset = tradingAssets.find((item) => item.systemName === symbol.name?.replace(/\.isl|\.vip/gi, ''));
      return asset ? { ...symbol, image: asset.image, description: asset.fullName || symbol.description } : symbol;
    });

    return mixedSymbols;
  }, [filteredAllCategorySymbols, tradingAssets]);

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [symbols]);

  useEffect(() => {
    fetchSignals();
  }, [selectedAccount, userInfo.id, i18n.language]);

  const fetchSignals = useCallback(() => {
    getSignals({ accountId: selectedAccount || undefined, language: i18n.language });
  }, [selectedAccount, userInfo.id, i18n.language]);

  const filteredSymbolNames = useMemo((): string[] => {
    if (!symbols.length) {
      setData([]);
      return [];
    }
    const symbolsNames = symbols.map((item) => item.name);
    if (!search.length) {
      setData(symbols);
      return symbolsNames;
    }
    const searchValue = search.toLowerCase();
    const testValue = (val: string, s: string) => val.toLowerCase().includes(s);

    const symbolsData = allSymbols.filter(
      ({ name, description }) => testValue(name, searchValue) || testValue(description, searchValue)
    );
    const filteredSymbols = symbolsData.map((item) => item.name);

    setData(symbolsData);
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      setData(symbolsData);
    }, 250);

    return filteredSymbols;
  }, [search, symbols, allSymbols]);

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || filteredSymbolNames.length === 0) {
      return;
    }

    websocket.send(`unsubscribe ALL`);
    websocket.send(`subscribe ${filteredSymbolNames.join(' ')}`);
  }, [enabledHandleMessage, filteredSymbolNames]);

  const unsubscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage) {
      return;
    }
    websocket.send(`unsubscribe ALL`);
  }, [enabledHandleMessage]);

  useFocusEffect(
    useCallback(() => {
      subscribeWebsocket();
      return () => {
        unsubscribeWebsocket();
      };
    }, [navigation, route, enabledHandleMessage, filteredSymbolNames, selectedAccount])
  );

  const _renderItem = useCallback(
    ({ item, index }: { item: Symbols; index: number }) => {
      const isViewable = viewableAssets.find((el) => el.index === index);
      const renderCard = (
        <BaseAssetCard
          testID={testIDs.markets.screen.assetCard(item.name)}
          useTradeMode={true}
          tradeMode={item.tradeMode}
          isViewable={Boolean(isViewable)}
          fullName={item.description}
          title={item.name}
          bid={item.priceBid}
          image={item.image}
          ask={item.priceAsk}
          digits={item.digits || 2}
          lastClosedPrice={item.lastClosedPrice}
        />
      );

      return (
        <View style={styles.gap}>
          {index === 2 && <BaseVerifyBanner testID={testIDs.markets.screen.verifyBanner} />}
          {renderCard}
        </View>
      );
    },
    [websocket, viewableAssets, isReadyState]
  );

  const EmptySearchList = useCallback(() => {
    return (
      <View
        style={styles.emptyBox}
        testID={testIDs.markets.screen.emptyBlockWrapper}
        accessibilityValue={{
          text: testIDs.markets.screen.emptyBlockWrapper
        }}
        accessibilityLabel={testIDs.markets.screen.emptyBlockWrapper}
        accessible={true}
      >
        <BaseImage
          testID={testIDs.markets.screen.emptyBlockImage}
          resizeMode='contain'
          style={styles.searchImg}
          source={images.search}
        />
        <View style={styles.emptyTextBox}>
          <BaseText
            testID={testIDs.markets.screen.emptyBlockText}
            style={styles.textAlign}
            variant={BaseTextVariant.captionSemiBold}
          >
            {t('screens.markets.nothing-found')}
          </BaseText>
          <BaseText style={styles.textAlign}>{t('screens.markets.try-another-search')}</BaseText>
        </View>
      </View>
    );
  }, [t, search]);

  const ListEmptyComponent = useCallback(() => {
    if (search) {
      return <EmptySearchList />;
    }

    if (symbols.length) return null;

    const rows = new Array(20).fill(null);

    const cardWidth = width - 40;
    const cardHeight = 64;

    return (
      <View
        testID={testIDs.markets.screen.loader}
        accessibilityValue={{
          text: testIDs.markets.screen.loader
        }}
        accessibilityLabel={testIDs.markets.screen.loader}
        accessible={true}
      >
        <ContentLoader
          speed={2}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={theme.palette.graphite['050']}
        >
          {rows.map((_, index) => {
            const y = index * 8 + index * cardHeight;
            return <Rect key={`${index}-placeholder`} rx={8} ry={8} y={y} width={cardWidth} height={cardHeight} />;
          })}
        </ContentLoader>
      </View>
    );
  }, [theme.dark, symbols.length, search, EmptySearchList]);

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    setViewableAssets(viewableItems);
  };

  useEffect(() => {
    lastScrollY && listRef.current?.scrollToOffset?.({ offset: lastScrollY });
  }, [symbols]);

  const onClear = useCallback(() => setSearch(''), []);

  const onSearchChange = useCallback(() => {
    setSearch('');
    lastScrollY = 0;
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => (lastScrollY = e.nativeEvent.contentOffset.y),
    []
  );

  const onFocus = useCallback(() => setSearchIsFocused(true), []);
  const onBlur = useCallback(() => setSearchIsFocused(false), []);

  const onCancel = useCallback(() => {
    if (Keyboard.isVisible()) Keyboard.dismiss();
    requestAnimationFrame(() => {
      setSearch('');
      inputRef.current?.blur();
    });
  }, []);

  const footer = useMemo(() => {
    return data.length < 2 ? <BaseVerifyBanner testID={testIDs.markets.screen.verifyFooterBanner} /> : null;
  }, [data.length]);

  return (
    <View style={styles.safe} onStartShouldSetResponder={() => true} onResponderRelease={() => Keyboard.dismiss()}>
      <View style={styles.searchContainer}>
        <BaseSearch
          testID={testIDs.markets.screen.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('screens.markets.search')}
          onClear={onClear}
          onFocus={onFocus}
          ref={inputRef}
          containerStyle={{
            flex: 1
          }}
          onBlur={onBlur}
          hasClear={search?.length > 0}
        />
        {(!!search.length || searchIsFocused) && (
          <TouchableOpacity
            style={{ alignSelf: 'center' }}
            onPress={onCancel}
            activeOpacity={activeOpacity}
            hitSlop={10}
            testID={testIDs.markets.screen.cancelButton}
          >
            <BaseText variant={BaseTextVariant.textSemiBold} style={styles.cancel}>
              {t('screens.deposit.cancel')}
            </BaseText>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.tabsContainer,
          {
            ...(search && styles.tabsHide)
          }
        ]}
      >
        <BaseMarketTabs assetCategory={assetCategory} setSearch={onSearchChange} />
      </View>
      <View style={styles.screen}>
        <Animated.FlatList
          testID={testIDs.markets.screen.assetsList}
          keyboardShouldPersistTaps={'always'}
          data={data}
          onScroll={onScroll}
          key={`${data?.[0]?.name}-name`}
          entering={!!search.length ? undefined : FadeInUp.duration(300)}
          exiting={!!search.length ? undefined : FadeOutUp.duration(300)}
          itemLayoutAnimation={CurvedTransition}
          style={styles.list}
          ref={listRef}
          onViewableItemsChanged={onViewableItemsChanged}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyExtractor={_keyExtractor}
          ListFooterComponent={footer}
          renderItem={_renderItem}
        />
      </View>
    </View>
  );
};

export default MarketsScreen;

import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { StyleSheet, FlatList, Dimensions, ViewStyle, View, Linking } from 'react-native';
import BaseButton, { BaseButtonSize, BaseButtonType } from '../button';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config, testIDs } from '@/constants';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useAppDispatch, useAppSelector, useCommonStyles } from '@/hooks';
import { useGetSymbolsQuery, useGetCategoriesQuery } from '@/store/api/market';
import { useGetDealsAccountsQuery } from '@/store/api';
import { marketSlice } from '@/store/slices/market';

interface IBaseMarketTabs {
  assetCategory?: string;
  setSearch?: Dispatch<SetStateAction<string>>;
  additionalCategories?: string[];
  onTabPressed?: (category: string) => Promise<void>;
  counts?: TabCounts;
  tabIcons?: TabIcon;
  testID?: string;
}

interface TabCounts {
  [key: string]: number;
}
interface TabIcon {
  [key: string]: ReactElement;
}

const {
  actions: { setSymbols, setActiveTab }
} = marketSlice;

const { isIOS } = config;
const { width, height } = Dimensions.get('window');

const BaseMarketTabs: React.FC<IBaseMarketTabs> = ({
  assetCategory = '',
  setSearch,
  additionalCategories = [],
  onTabPressed,
  counts,
  tabIcons,
  testID
}) => {
  const [active, setActive] = useState<string>('');
  const listRef = useRef<FlatList>(null);
  const lastSymbolFetchRef = useRef<any>({ abort: () => null });

  const accountTypeId = useAppSelector((state) => state.wallet.accountTypeId);
  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo, selectedAccount: accountId = 0, tradingAssets } = portfolio || {};
  const { id: userId } = userInfo || {};

  const market = useAppSelector((store) => store.market);
  const { categories = [] } = market || {};

  const memoizedAdditionalCategories = useMemo(() => {
    return additionalCategories;
  }, [additionalCategories]);

  const memoizedCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const categoriesList = useMemo(() => {
    if (!memoizedAdditionalCategories) {
      return memoizedCategories;
    }
    return [...memoizedAdditionalCategories, ...memoizedCategories];
  }, [additionalCategories, memoizedCategories]);

  const dispatch = useAppDispatch();

  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getCategories] = useGetCategoriesQuery();
  const [getSymbols] = useGetSymbolsQuery();

  const getDealsAccountsHandler = async () => {
    try {
      await getDealsAccounts(userId || 0);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    getDealsAccountsHandler();
  }, [userId]);

  const getCategoriesHandler = async () => {
    try {
      await getCategories(accountId || 0);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getSymbolsHandler = useCallback(
    async (groupName: string) => {
      if (!groupName) {
        return;
      }
      try {
        lastSymbolFetchRef.current?.abort?.();
        dispatch(setSymbols([]));
        lastSymbolFetchRef.current = getSymbols({ accountId: accountId || 0, groupName });
      } catch (error: unknown) {
        console.error(error);
      }
    },
    [accountId]
  );

  const getData = async () => {
    if (categoriesList.length === 0) {
      return;
    }

    const first = assetCategory || categoriesList[0];

    setActive(first);
    setSearch && setSearch?.('');

    if (onTabPressed) {
      onTabPressed(first);
    } else {
      setActiveTab(first);
    }

    try {
      if (!onTabPressed) await getSymbolsHandler(first);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    getCategoriesHandler();
  }, [accountId, accountTypeId]);

  useLayoutEffect(() => {
    getData();
  }, [accountId, tradingAssets, assetCategory, categories, accountTypeId]);

  useEffect(() => {
    const listener = Linking.addEventListener('url', async ({ url }) => {
      if (decodeURIComponent(url).replaceAll('_', ' ').includes(assetCategory)) {
        setActive(assetCategory);
        setSearch && setSearch?.('');
        if (onTabPressed) {
          onTabPressed(assetCategory);
        } else {
          setActiveTab(assetCategory);
        }
        try {
          if (!onTabPressed) await getSymbolsHandler(assetCategory);
        } catch (error: unknown) {
          console.error(error);
        }
      }
    });
    return listener.remove;
  }, [assetCategory, onTabPressed, accountId]);

  const theme = useTheme();
  const styles = useStyles(theme);

  const _renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const onPress = () => {
        if (active === item) return;
        requestAnimationFrame(async () => {
          setActive(item);
          listRef.current?.scrollToIndex({ index, viewOffset: 80 });

          setSearch?.('');
          dispatch(setSymbols([]));

          try {
            if (onTabPressed) {
              await onTabPressed(item);
            } else {
              await getSymbolsHandler(item);
              dispatch(setActiveTab(item));
            }
          } catch (error) {
            console.error(error);
          }
        });
      };

      if (counts && counts[item] === 0) return null;

      const selected = active === item;
      const backgroundColor = selected ? theme.palette.graphite['900'] : theme.palette.base.white;
      const color = selected ? theme.palette.base.white : theme.palette.graphite['900'];

      const trimmedTitle = (str: string): string => {
        if (!str) return '';

        const isForex = str.toLowerCase().includes('forex');
        const isMetals = str.toLowerCase().includes('metals');

        if (isForex) {
          return str.replace(str, 'Forex');
        }

        if (isMetals) {
          return str.replace(str, 'Metals');
        }

        return str.replace(/\\VIP|ISL\\|\\ISL/gi, '');
      };

      return (
        <View style={styles.card}>
          <BaseButton
            testID={testIDs.components.atoms.baseMarketTabs.tab(item)}
            type={BaseButtonType.primary}
            style={[styles.buttonStyle, { backgroundColor }]}
            labelStyle={{ color }}
            onPress={onPress}
            disabled={!!onTabPressed ? false : false}
            size={BaseButtonSize.small}
            label={trimmedTitle(item)}
          />
          {(tabIcons && tabIcons[item]) ?? null}
        </View>
      );
    },
    [active, onTabPressed, tabIcons, counts, accountId, getSymbolsHandler, setSearch, dispatch, theme.dark]
  );

  const ListEmptyComponent = useCallback(() => {
    const rows = new Array(6).fill(null);

    const cardWidth = Math.floor((width - 34) / 4);

    return (
      <ContentLoader
        testID={testIDs.components.atoms.baseMarketTabs.contentLoader}
        speed={2}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        backgroundColor={'#E2E6F2'}
        foregroundColor={theme.palette.graphite['050']}
      >
        {rows.map((_, index) => {
          const x = index * 12 + index * cardWidth;
          return <Rect key={`${index}-placeholder`} rx={8} ry={8} x={x} width={cardWidth} height={32} />;
        })}
      </ContentLoader>
    );
  }, [theme.dark]);

  const tabWitdh = useMemo((): ViewStyle => ({ width: isIOS ? '100%' : undefined }), [isIOS]);

  const _keyExtractor = useCallback((item: string) => `${item}-tab`, []);

  return (
    <FlatList
      testID={testID || testIDs.components.atoms.baseMarketTabs.container}
      data={categories.length > 0 ? categoriesList : categories}
      ref={listRef}
      horizontal
      style={[styles.list, tabWitdh]}
      ListEmptyComponent={ListEmptyComponent}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentStyle}
      keyExtractor={_keyExtractor}
      renderItem={_renderItem}
    />
  );
};

const useStyles = (theme: UserTheme) => {
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    contentStyle: {
      paddingLeft: 20,
      paddingRight: 10,
      paddingVertical: 12,
      alignSelf: 'flex-start'
    },
    card: {
      paddingRight: 10
    },
    list: { alignSelf: 'flex-start' },
    buttonStyle: {
      borderWidth: 0,
      ...shadow6Style
    }
  });
};

export default memo(BaseMarketTabs);

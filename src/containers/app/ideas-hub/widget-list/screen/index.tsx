import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseIdeaCard,
  BaseText,
  BaseTextVariant,
  BaseWidget
} from '@/components';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES, WALLET_ROUTE_NAMES } from '@/navigation/app/stacks';
import { WatchWidget } from '@/store/slices/ideas-hub/types';
import { ParamListBase } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  ListRenderItemInfo,
  ListRenderItem
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import {
  useInvestmentIdeasByCategoryIdQuery,
  useInvestmentIdeasCategoriesQuery,
  useWatchWidgetQuery
} from '@/store/api';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { IdeaData } from '@/types';
import { useTranslation } from 'react-i18next';

type WidgetListScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.WidgetList>;

interface Category {
  id: number | null;
  title: string;
}

const {
  screenWidth,
  headerBar: {
    buttons: { hitSlop, activeOpacity },
    height
  }
} = config;

const widgetWidth = (screenWidth - 48) / 2;
const leftWidgetHeight = 182;
const rightWidgetHeight = 208;
const animateTill = 7;
const animationDuration = 100;
const diff = 715;
const numPerPage = 19;
const WidgetListScreen: React.FC<WidgetListScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<WatchWidget[]>([]);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [category, setCategory] = useState<number | null | -1>(-1);

  const hasIdeasCategories = useRef<boolean>(false);
  const isLoading = useRef<boolean>(false);

  const isInvestment = route.params?.isInvestment ?? false;

  const firstRenderHeight = useMemo(() => (isInvestment ? 10 * 264 : 10 * 208), [isInvestment]);

  const [maxScroll, setMaxScroll] = useState<number>(firstRenderHeight);

  const theme = useTheme();
  const styles = useStyles(theme);

  const [getWatchWidgets, { isFetching: isWatchLoading }] = useWatchWidgetQuery();
  const [getInvestmentIdeas, { isFetching: isInvestmentLoading }] = useInvestmentIdeasByCategoryIdQuery();
  const [getIdeasCategories, { data: ideasCategories }] = useInvestmentIdeasCategoriesQuery();

  const isFetching = useMemo(
    () => (isInvestment ? isInvestmentLoading : isWatchLoading),
    [isInvestment, isInvestmentLoading, isWatchLoading]
  );

  const categories = useMemo(() => {
    if (!ideasCategories?.length) return [];
    hasIdeasCategories.current = true;
    setCategory(null);
    const iCategories = ideasCategories.map((item: Category) => ({ id: item.id, title: item.title })) || [];
    const allData = { id: null, title: 'All' };
    return [allData, ...iCategories];
  }, [ideasCategories]);

  const getNewWidgets = async (p: number, last: boolean, investment: boolean, category: number | null) => {
    try {
      if (last || isLoading.current) return;
      isLoading.current = true;
      let res: WatchWidget[];
      if (investment) res = await getInvestmentIdeas({ id: category, page: p }).unwrap();
      else res = await getWatchWidgets(p).unwrap();
      if (res.length) setData((prev) => [...prev, ...res]);
      else setIsLast(true);
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.current = false;
    }
  };

  useEffect(() => {
    (async () => {
      if (isInvestment) {
        if (!hasIdeasCategories.current) await getIdeasCategories();
        if (category !== -1) getNewWidgets(page, isLast, isInvestment, category);
      } else getNewWidgets(page, isLast, isInvestment, category);
    })();
  }, [page, isLast, isInvestment, category]);

  const columnDatas = useMemo(() => {
    const initial: { left: (WatchWidget | IdeaData)[]; right: (WatchWidget | IdeaData)[] } = { left: [], right: [] };
    return (data || []).reduce((acc, item, index) => {
      if ((index % numPerPage) % 2 === 0) acc.left.push(item);
      else acc.right.push(item);
      return acc;
    }, initial);
  }, [data]);

  const _keyExtractor = useCallback(
    (item: WatchWidget | IdeaData) => `${item.id}-widget`,
    []
  );

  const _renderIdeaItemLeft = useCallback(({ item, index }: ListRenderItemInfo<IdeaData>) => {
    const seq = (i: number) => (i === 0 ? i : i + 1);
    const onPress = () => {
      navigation.navigate(ROOT_ROUTE_NAMES.WidgetArticle, { id: item.id, isInvestment: true });
    };

    const positionInPage = index % numPerPage;
    const shouldAnimate = positionInPage < animateTill;
    const animationIndex = shouldAnimate ? seq(positionInPage) : undefined;

    return (
      <BaseIdeaCard
        widgetWidth={widgetWidth}
        widgetHeight={leftWidgetHeight}
        title={item.shortTitle}
        image={item.image}
        articleTitle={item.title}
        animationDuration={animationDuration}
        ideaId={item.id}
        onWidgetPress={onPress}
        verticalTextAlignment={item.verticalTextAlignment}
        index={animationIndex}
      />
    );
  }, []);

  const _renderIdeaItemRight = useCallback(({ item, index }: ListRenderItemInfo<IdeaData>) => {
    const seq = (i: number) => (i === 0 ? i + 1 : i + 2);
    const onPress = () => {
      navigation.navigate(ROOT_ROUTE_NAMES.WidgetArticle, { id: item.id, isInvestment: true });
    };

    const positionInPage = index % numPerPage;
    const shouldAnimate = positionInPage < animateTill;
    const animationIndex = shouldAnimate ? seq(positionInPage) : undefined;

    return (
      <BaseIdeaCard
        widgetWidth={widgetWidth}
        widgetHeight={rightWidgetHeight}
        title={item.shortTitle}
        image={item.image}
        articleTitle={item.title}
        animationDuration={animationDuration}
        ideaId={item.id}
        onWidgetPress={onPress}
        verticalTextAlignment={item.verticalTextAlignment}
        index={animationIndex}
      />
    );
  }, []);

  const _renderItemLeft = useCallback(({ item, index }: ListRenderItemInfo<WatchWidget>) => {
    const seq = (i: number) => (i === 0 ? i : i + 1);
    const onPress = () => {
      navigation.navigate(ROOT_ROUTE_NAMES.WidgetArticle, { id: item.id });
    };

    const positionInPage = index % numPerPage;
    const shouldAnimate = positionInPage < animateTill;
    const animationIndex = shouldAnimate ? seq(positionInPage) : undefined;

    return (
      <BaseWidget
        widgetWidth={widgetWidth}
        widgetHeight={leftWidgetHeight}
        title={item.title}
        onPress={onPress}
        id={item.id}
        image={item.image}
        animationDuration={animationDuration}
        index={animationIndex}
      />
    );
  }, []);

  const _renderItemRight = useCallback(({ item, index }: ListRenderItemInfo<WatchWidget>) => {
    const seq = (i: number) => (i === 0 ? i + 1 : i + 2);
    const onPress = () => {
      navigation.navigate(ROOT_ROUTE_NAMES.WidgetArticle, { id: item.id });
    };
    const positionInPage = index % numPerPage;
    const shouldAnimate = positionInPage < animateTill;
    const animationIndex = shouldAnimate ? seq(positionInPage) : undefined;

    return (
      <BaseWidget
        widgetWidth={widgetWidth}
        widgetHeight={rightWidgetHeight}
        title={item.title}
        onPress={onPress}
        id={item.id}
        image={item.image}
        animationDuration={animationDuration}
        index={animationIndex}
      />
    );
  }, []);

  const goToIdeasHub = useCallback(() => {
    if (isInvestment) {
      return navigation.navigate(ROOT_ROUTE_NAMES.App, {
        screen: APP_ROUTE_NAMES.Wallet,
        params: {
          screen: WALLET_ROUTE_NAMES.Wallet
        }
      })
    }
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation, isInvestment]);

  const onContentSizeChange = useCallback((_: number, h: number) => setMaxScroll(h), []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoading.current || isLast) return;
      const end = Math.floor(maxScroll - diff - 300);
      const offset = Math.floor(e.nativeEvent.contentOffset.y);
      if (offset >= end) setPage((p) => p + 1);
    },
    [maxScroll, isLast]
  );

  const ListEmptyComponent = useCallback(() => {
    const rows = new Array(6).fill(null);

    const cardWidth = Math.floor((screenWidth - 34) / 4);

    return (
      <ContentLoader
        speed={2}
        width={screenWidth}
        height={height}
        viewBox={`0 0 ${screenWidth} ${height}`}
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

  const _renderTabs = useCallback(
    ({ item }: { item: Category }) => {
      const onPress = () => {
        if (category === item.id || isLoading.current) return;
        setPage(1);
        setIsLast(false);
        setData([]);
        setCategory(item.id);
      };

      const selected = category === item.id;
      const backgroundColor = selected ? theme.palette.graphite['900'] : theme.palette.base.white;
      const color = selected ? theme.palette.base.white : theme.palette.graphite['900'];

      return (
        <BaseButton
          type={BaseButtonType.primary}
          style={[styles.buttonStyle, { backgroundColor }]}
          labelStyle={{ color }}
          onPress={onPress}
          disabled={isFetching}
          size={BaseButtonSize.small}
          label={item.title}
        />
      );
    },
    [isFetching, category, theme.dark]
  );

  const _tabKeyExtractor = useCallback(
    (item: Category) => `${Date.now() + Math.random()}-${item.id}-${item.title}-category`,
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={hitSlop}
          onPress={goToIdeasHub}
          activeOpacity={activeOpacity}
          style={styles.headerBack}
        >
          <SvgIcon name={SvgXmlIconNames.arrowLeft} color={theme.palette.graphite['900']} size={IconSize.lg} />
        </TouchableOpacity>
        <BaseText style={styles.headerText} variant={BaseTextVariant.caption}>
          {isInvestment ? t('screens.ideas-hub.asset-collections.title') : t('screens.ideas-hub.what-to-watch.title')}
        </BaseText>
      </View>
      {isInvestment && (
        <View style={styles.tabContainer}>
          <FlatList
            data={categories}
            horizontal
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={styles.tabContent}
            keyExtractor={_tabKeyExtractor}
            showsHorizontalScrollIndicator={false}
            renderItem={_renderTabs}
          />
        </View>
      )}
      <ScrollView
        onScroll={onScroll}
        contentContainerStyle={styles.contentScroll}
        onContentSizeChange={onContentSizeChange}
      >
        <View style={styles.listContainer}>
          <FlatList
            data={columnDatas.left}
            contentContainerStyle={styles.contentStyle}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={_keyExtractor}
            renderItem={
              (isInvestment ? _renderIdeaItemLeft : _renderItemLeft) as ListRenderItem<WatchWidget | IdeaData>
            }
          />
          <FlatList
            data={columnDatas.right}
            scrollEnabled={false}
            contentContainerStyle={styles.contentStyle}
            showsVerticalScrollIndicator={false}
            keyExtractor={_keyExtractor}
            renderItem={
              (isInvestment ? _renderIdeaItemRight : _renderItemRight) as ListRenderItem<WatchWidget | IdeaData>
            }
          />
        </View>
        {isFetching && (
          <ActivityIndicator size='small' color={theme.palette.graphite['900']} style={styles.indicator} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flex: 1
    },
    contentStyle: {
      gap: 8
    },
    listContainer: {
      flexDirection: 'row',
      marginHorizontal: 20,
      gap: 8,
      marginTop: 12,
      marginBottom: 20
    },
    buttonStyle: {
      borderWidth: 0,
      marginVertical: 8,
      ...shadow6Style
    },
    tabContent: {
      paddingLeft: 20,
      paddingRight: 10,
      paddingVertical: 3,
      gap: 12
    },
    tabContainer: {
      paddingVertical: 4
    },
    header: {
      height,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingHorizontal: 20
    },
    contentScroll: {
      paddingBottom: 40
    },
    indicator: { alignSelf: 'center' },
    headerText: { marginRight: 'auto' },
    headerBack: { flex: 0.5 }
  });
};

export default WidgetListScreen;

import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { View, StyleSheet, ListRenderItemInfo, Linking, ScrollView } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation, useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { useGetPromotionsQuery } from '@/store/api';
import { useAppSelector, useDateRange } from '@/hooks';
import { BasePromoBanner } from '@/components/atoms';
import { AnimatedDot } from '..';
import { ParsedPromoData } from '@/store/slices/ideas-hub/types';
import Animated, {
  CurvedTransition,
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { minPromotionsCardWidth } from '@/components/atoms/promotion-banner';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { useTranslation } from 'react-i18next';
import { isPromoRestricted } from '@/helpers';

interface IPromotions {
  testID?: string;
}

const { screenWidth } = config;

const Promotions: React.FC<IPromotions> = ({ testID }) => {
  const offsetX = useSharedValue(0);

  const {
    i18n: { language }
  } = useTranslation();

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetX.value = event.contentOffset.x;
  });

  const [getPromotions, { isFetching }] = useGetPromotionsQuery();

  const ideasHub = useAppSelector((store) => store.ideasHub);
  const { promotions = [] } = ideasHub || {};
  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo } = portfolio || {};

  const { addData, newData } = useDateRange<ParsedPromoData>();

  const promotionsWithRestrictions = useMemo(() => {
    const promoData = newData['promo'] || [];
    if (!(promoData && Array.isArray(promoData) && promoData.length > 0)) {
      return [];
    }

    return promoData.filter((item) => {
      const { visibilityRestrictions } = item || {};
      const isRestricted = isPromoRestricted(visibilityRestrictions, userInfo);
      return !isRestricted;
    });
  }, [userInfo, newData]);

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    offsetX.value = 0;
  }, [isFetching]);

  useLayoutEffect(() => {
    addData(promotions, 'promo');
  }, [promotions]);

  useEffect(() => {
    (async () => {
      try {
        const pData = await getPromotions(language).unwrap();
        if (language === 'en' || pData.length) return;
        getPromotions('en');
      } catch (error) {
        console.error(error);
      }
    })();
  }, [language]);

  const dataLengthIsOne = useMemo(() => promotionsWithRestrictions.length === 1, [promotionsWithRestrictions.length]);

  const _keyExtractor = useCallback((item: ParsedPromoData) => `${item.id}-promotion`, []);

  const _renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ParsedPromoData>) => {
      const onCardPress = (id: number) => {
        if (item.ctaMobileDeepLink) {
          Linking.openURL(item.ctaMobileDeepLink);
        } else {
          navigation.navigate(ROOT_ROUTE_NAMES.PromotionDetails, { id });
        }
      };

      return (
        <BasePromoBanner
          testID={testIDs.components.molecules.promotions.card(item.id)}
          fullWidth={dataLengthIsOne}
          onCardPress={onCardPress}
          bgImage={item.bgImage}
          subTitle={item.subTitle}
          bannerButtonColor={item.bannerButtonColour}
          bannerButtonLabelColor={item.bannerButtonLabelColour}
          bannerTextColor={item.bannerTextColor}
          buttonLabel={item.buttonLabel}
          tagLine={item.tagline}
          bgColor={item.primaryColor}
          id={item.id}
          title={item.title}
        />
      );
    },
    [dataLengthIsOne]
  );

  const AnimatedScrollDots = useCallback(({ testID }: { testID?: string }) => {
    const arr = new Array(promotionsWithRestrictions.length).fill(null);
    return (
      <View style={styles.dotContainer} testID={testID}>
        {arr.map((_, index) => {
          return (
            <AnimatedDot
              key={`${index}-dot`}
              testID={testIDs.components.molecules.promotions.dot(index)}
              inputRange={[index - 1, index, index + 1]}
              outputRange={[theme.palette.graphite[200], theme.palette.graphite['900'], theme.palette.graphite[200]]}
              useWidthAnim
              minDotWidth={5}
              maxDotWidth={7}
              maxWidth={minPromotionsCardWidth + 16}
              dotStyle={styles.dotStyle}
              scroll={offsetX}
            />
          );
        })}
      </View>
    );
  }, [promotionsWithRestrictions.length, minPromotionsCardWidth, theme.dark]);

  const Loader = useCallback(() => {
    const width = minPromotionsCardWidth * 2 + 56;
    const height = 159;
    return (
      <>
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut}
          style={styles.gap12}
          testID={testIDs.components.molecules.promotions.loader}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            testID={testIDs.components.molecules.promotions.loaderScroll}
          >
            <ContentLoader
              speed={2}
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              backgroundColor={'#E2E6F2'}
              foregroundColor={theme.palette.graphite['050']}
            >
              <Rect rx={12} ry={12} x={20} width={minPromotionsCardWidth} height={height} />
              <Rect rx={12} ry={12} x={minPromotionsCardWidth + 36} width={minPromotionsCardWidth} height={height} />
            </ContentLoader>
          </ScrollView>
          <ContentLoader
            speed={2}
            width={screenWidth}
            height={7}
            viewBox={`0 0 ${screenWidth} ${7}`}
            backgroundColor={'#E2E6F2'}
            foregroundColor={theme.palette.graphite['050']}
          >
            <Rect rx={4} x={screenWidth / 2 - 7} ry={4} y={0} width={7} height={7} />
            <Rect rx={4} x={screenWidth / 2 + 4} ry={4} y={1} width={5} height={5} />
          </ContentLoader>
        </Animated.View>
        <Seperator testID={testIDs.components.molecules.promotions.seperator} />
      </>
    );
  }, [theme.dark]);

  const Seperator = useCallback(({ testID }: { testID?: string }) => {
    return (
      <Animated.View layout={CurvedTransition} style={styles.seperatorContainer} testID={testID}>
        <View style={styles.seperatorUp} testID={testIDs.components.molecules.promotions.seperatorUp} />
        <View style={styles.seperatorDown} testID={testIDs.components.molecules.promotions.seperatorDown} />
      </Animated.View>
    );
  }, [theme.dark]);

  if (!isFetching && !promotionsWithRestrictions.length) return null;
  else if (isFetching) return <Loader />;

  return (
    <>
      <Animated.View
        exiting={FadeOut.duration(150)}
        entering={FadeIn}
        style={styles.container}
        testID={testID || testIDs.components.molecules.promotions.container}
      >
        <Animated.FlatList
          horizontal
          scrollEnabled={!dataLengthIsOne}
          onScroll={scrollHandler}
          data={promotionsWithRestrictions}
          snapToInterval={minPromotionsCardWidth + 16}
          decelerationRate={'fast'}
          keyExtractor={_keyExtractor}
          renderItem={_renderItem}
          contentContainerStyle={styles.content}
          showsHorizontalScrollIndicator={false}
          testID={testIDs.components.molecules.promotions.flatList}
        />
        {dataLengthIsOne || <AnimatedScrollDots testID={testIDs.components.molecules.promotions.scrollDots} />}
      </Animated.View>
      <Seperator testID={testIDs.components.molecules.promotions.seperator} />
    </>
  );
};

const useStyles = ({ palette: { graphite } }: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 12,
      marginBottom: 12,
      flex: 1
    },
    content: {
      gap: 16,
      paddingHorizontal: 20
    },
    dotStyle: {
      borderRadius: 4
    },
    dotContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'center',
      minHeight: 7
    },
    gap12: {
      gap: 12,
      marginBottom: 12
    },
    seperatorContainer: {
      width: screenWidth,
      height: 44,
      backgroundColor: '#E1DFE5',
      gap: 8
    },
    seperatorUp: {
      width: '100%',
      height: 18,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 18,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    }
  });

export default memo(Promotions);

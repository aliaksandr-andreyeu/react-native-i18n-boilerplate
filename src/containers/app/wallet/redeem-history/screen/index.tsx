import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Currencies } from '@/helpers';
import getCurrency from '@/helpers/currency';
import { useTranslation } from 'react-i18next';
import {
  View,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ListRenderItemInfo,
  LayoutChangeEvent
} from 'react-native';
import dateHelper from '@/helpers/dateHelper';
import Animated, {
  useSharedValue,
  CurvedTransition,
  FadeIn,
  FadeOut,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import useStyles from './styles';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { BaseText, BaseBackButton, BaseTextVariant, BaseDateSelector, BaseCalendarButton } from '@/components';

type RedeemHistoryScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.RedeemHistory>;

export interface DateRangeColors {
  [key: string]: { color: string; textColor: string };
}

// TODO: Begin test data
interface RedeemItemProps {
  name: string;
  date: string;
  time: string;
  price: string;
  id: number;
}

const redeemData: RedeemItemProps[] = [
  {
    name: 'MAIN WALLET',
    date: '20.03.24',
    time: '12:00',
    price: '$100',
    id: 0
  },
  {
    name: 'MAIN WALLET',
    date: '20.03.24',
    time: '12:00',
    price: '$100',
    id: 1
  },
  {
    name: 'MAIN WALLET',
    date: '20.03.24',
    time: '12:00',
    price: '$100',
    id: 2
  },
  {
    name: 'MAIN WALLET',
    date: '20.03.24',
    time: '12:00',
    price: '$100',
    id: 3
  }
];
// TODO: End test data

export type DateRange = [string, string, DateRangeColors];

export const RedeemItem = ({
  item,
  activeItem,
  onPressHandler
}: {
  item: ListRenderItemInfo<RedeemItemProps>;
  activeItem: number | null;
  onPressHandler: (id: number) => void;
}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const theme = useTheme();
  const styles = useStyles(theme);

  const isExpanded = item.item.id === activeItem;
  const progress = useSharedValue(isExpanded ? 1 : 0);

  const { t } = useTranslation();

  useEffect(() => {
    progress.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, contentHeight], Extrapolate.CLAMP),
    opacity: progress.value,
    overflow: 'hidden'
  }));

  const animatedActive = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, 24], Extrapolate.CLAMP),
    opacity: progress.value,
    overflow: 'hidden'
  }));

  const onContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height !== contentHeight) {
      setContentHeight(height);
    }
  };

  const RedeemSeperator = useCallback(() => {
    return (
      <Animated.View style={[styles.redeemSeperatorContainer, animatedActive]}>
        <View style={styles.redeemSeperatorUp} />
        <View style={styles.redeemSeperatorDown} />
      </Animated.View>
    );
  }, [theme.dark]);

  const styledBorder = () => {
    switch (true) {
      case redeemData.length === 1:
        return [styles.redeemBorderTop, styles.redeemBorderBottom];
      case item.index === 0:
        return styles.redeemBorderTop;
      case item.index === redeemData.length - 1:
        return styles.redeemBorderBottom;
    }
  };

  return (
    <>
      <Pressable onPress={() => onPressHandler(item.item.id)}>
        {isExpanded && item.index !== 0 && <RedeemSeperator />}
        <View style={[styles.redeemItem, styles.shadow, styledBorder()]}>
          {item.index !== 0 && <View style={styles.whiteLine} />}
          <View style={styles.container}>
            <View style={styles.iconBox}>
              <SvgIcon name={SvgXmlIconNames.arrowUp} size={IconSize.md} color={'#1B1F24'} />
            </View>
            <View style={styles.box}>
              <BaseText style={styles.primaryText} variant={BaseTextVariant.titleXXS}>
                {item.item.name}
              </BaseText>
              <BaseText style={styles.hintText} variant={BaseTextVariant.extraSmall}>
                {item.item.date} · {item.item.time}
              </BaseText>
            </View>
            <View style={[styles.box, styles.boxRight]}>
              <BaseText style={styles.primaryText} variant={BaseTextVariant.textLight}>
                {item.item.price}
              </BaseText>
            </View>
          </View>
          {(isExpanded || !(item.index === redeemData.length - 1)) && <View style={styles.borderBox} />}
          <Animated.View style={animatedStyle}>
            <View style={styles.infoBox} onLayout={onContentLayout}>
              <View style={styles.infoLine}>
                <BaseText style={styles.hintText} variant={BaseTextVariant.extraSmall}>
                  {t('screens.redeem-history.standard-type')}
                </BaseText>
                <BaseText style={styles.secondaryText} variant={BaseTextVariant.extraSmall}>
                  $40
                </BaseText>
              </View>
              <View style={styles.infoLine}>
                <BaseText style={styles.hintText} variant={BaseTextVariant.extraSmall}>
                  {t('screens.redeem-history.cashback-type')}
                </BaseText>
                <BaseText style={styles.secondaryText} variant={BaseTextVariant.extraSmall}>
                  $40
                </BaseText>
              </View>
              <View style={styles.infoLine}>
                <BaseText style={styles.hintText} variant={BaseTextVariant.extraSmall}>
                  {t('screens.redeem-history.referral-type')}
                </BaseText>
                <BaseText style={styles.secondaryText} variant={BaseTextVariant.extraSmall}>
                  $40
                </BaseText>
              </View>
            </View>
          </Animated.View>
        </View>
        {isExpanded && !(item.index === redeemData.length - 1) && <RedeemSeperator />}
      </Pressable>
    </>
  );
};

const RedeemHistoryScreen: React.FC<RedeemHistoryScreenProps> = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>(['', '', {}]);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const listRef = useRef<FlatList>(null);

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const AnimatedIndicator = Animated.createAnimatedComponent(ActivityIndicator);

  const Seperator = useCallback(() => {
    return (
      <Animated.View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </Animated.View>
    );
  }, [theme.dark]);

  const TimeStats = useCallback(
    ({
      earned,
      currency,
      redeemed,
      available
    }: {
      earned: number;
      currency: Currencies;
      redeemed: number;
      available: number;
    }) => {
      const listTimeStats: { name: string; number: string }[] = [
        {
          name: t('screens.redeem-history.earned'),
          number: getCurrency(currency).text(earned.toFixed(2))
        },
        {
          name: t('screens.redeem-history.redeemed'),
          number: getCurrency(currency).text(redeemed.toFixed(2))
        },
        {
          name: t('screens.redeem-history.available'),
          number: getCurrency(currency).text(available.toFixed(2))
        }
      ];

      return (
        <>
          <View style={styles.listContainer}>
            <BaseText style={styles.primaryText} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.redeem-history.all-time-stats')}
            </BaseText>
            <FlatList
              data={listTimeStats}
              renderItem={({ item }) => (
                <View style={styles.timeStatsItem}>
                  <BaseText style={styles.secondaryText} variant={BaseTextVariant.text}>
                    {item.name}
                  </BaseText>
                  <BaseText style={styles.primaryText} variant={BaseTextVariant.statsNumber}>
                    {item.number}
                  </BaseText>
                </View>
              )}
              style={[styles.timeStatsList, styles.shadow]}
              contentContainerStyle={styles.timeStatsContentContainer}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(subItem) => subItem.name.replace(/ /g, ' ')}
            />
          </View>
          <Seperator />
        </>
      );
    },
    [styles, t]
  );

  const DateBar = useCallback(() => {
    const handleDate = () => {
      const firstDate = dateHelper.isValid(dateRange[0]) && dateHelper.to(dateRange[0], 'DD MMM YYYY');
      const secondDate = dateHelper.isValid(dateRange[1]) && dateHelper.to(dateRange[1], 'DD MMM YYYY');
      if (firstDate) {
        if (secondDate) return `${firstDate} - ${secondDate}`;
        return firstDate;
      }
      return '';
    };

    const today = dateHelper.current('YYYY-MM-DD');
    const todayFormat = dateHelper.to(today, 'DD MMM YYYY');
    const selectedDate = dateHelper.to(dateRange[0], 'DD MMM YYYY');
    const isToday = todayFormat === selectedDate;
    const hasSecondDate = !!dateRange[1].length;
    const show = hasSecondDate ? true : !isToday;

    return (
      <>
        <Animated.View layout={CurvedTransition} entering={FadeIn} style={[styles.headContainer]}>
          <View style={{ gap: 8, flexDirection: 'row', alignItems: 'center' }}>
            <BaseText style={{ color: theme.palette.text.interaction.basic.accent.default }}>{handleDate()}</BaseText>
            {show && (
              <Pressable hitSlop={8} onPress={() => setDateRange([today, '', {}])}>
                <SvgIcon
                  style={{ top: 1 }}
                  name={SvgXmlIconNames.close}
                  size={IconSize.xxs}
                  color={theme.palette.icon.base.strong}
                />
              </Pressable>
            )}
          </View>
          <BaseCalendarButton onPress={onDateButtonPress} />
        </Animated.View>
      </>
    );
  }, [dateRange[0], dateRange[1], theme.dark, styles, onDateButtonPress, setDateRange]);

  const setDRange = (d: any) => {
    setDateRange(d);
    setIsDateOpen(false);
  };

  const onRequestClose = () => setIsDateOpen(false);

  const onDateButtonPress = useCallback(() => setIsDateOpen((p) => !p), [setIsDateOpen]);

  const setInitialState = () => {
    const today = dateHelper.current('YYYY-MM-DD');
    setDateRange([today, '', {}]);
  };

  const _tradingKeyExtractor = useCallback(
    (item: RedeemItemProps, index: number) => `${item.name.replace(/ /g, ' ')}-${index}`,
    []
  );

  const onPressHandler = (id: number) => {
    if (id === activeItem) {
      setActiveItem(null);
    } else {
      setActiveItem(id);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
    }, [route, navigation])
  );

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.head}>
        <BaseBackButton isChevron={false} />
        <View style={styles.headerTitle}>
          <BaseText variant={BaseTextVariant.caption}>{t('screens.redeem-history.title')}</BaseText>
        </View>
      </View>
      {isLoading ? (
        <AnimatedIndicator
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.indicator}
          color={theme.palette.graphite['900']}
          size={'small'}
        />
      ) : (
        <Animated.ScrollView contentContainerStyle={styles.scroll} entering={FadeIn}>
          <TimeStats earned={340.5} currency={'USD' as Currencies} redeemed={10.7} available={100.5} />
          <DateBar />
          <FlatList
            ref={listRef}
            scrollEnabled={false}
            data={redeemData}
            keyExtractor={_tradingKeyExtractor}
            showsHorizontalScrollIndicator={false}
            renderItem={(item) => <RedeemItem item={item} onPressHandler={onPressHandler} activeItem={activeItem} />}
            extraData={activeItem}
          />
          <Modal animationType='fade' transparent={true} visible={isDateOpen} onRequestClose={onRequestClose}>
            <BaseDateSelector onClose={onRequestClose} onConfirmPress={setDRange} currentDateRange={dateRange} />
          </Modal>
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RedeemHistoryScreen;

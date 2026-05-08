import React, { FC, Fragment, useCallback, useLayoutEffect, useState, useMemo, SetStateAction, Dispatch } from 'react';
import {
  View,
  Modal,
  SectionList,
  Pressable,
  TouchableOpacity,
  SectionListData,
  SectionListRenderItemInfo,
  SectionListRenderItem,
  ColorValue
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  BaseText,
  BaseBackButton,
  BaseCalendarButton,
  BaseTextVariant,
  BaseImage,
  BaseTransferCard,
  BaseTransactionCard,
  BasePortfolioEmptyContainer,
  CalendarWeekNames
} from '@/components';
import { config } from '@/constants';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { BlurView } from '@react-native-community/blur';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppSelector } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ContentLoader, { Rect } from 'react-content-loader/native';
import moment from 'moment';
import type { DateRange } from '@/containers/app/wallet/recent-activity';
import type { HistoryData, HistoryDataItem } from '@/containers/app/wallet/recent-activity';
import useStyles from './styles';
import dayjs from 'dayjs';
import { capitalizeWord } from '@/helpers';

type RecentActivityScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.RecentActivity>;

interface RecentActivityScreenData extends RecentActivityScreenProps {
  dateRange: DateRange;
  setDateRange: Dispatch<SetStateAction<DateRange>>;
  setOffset: Dispatch<SetStateAction<number>>;
  fullList: boolean;
  history: HistoryData[] | undefined;
  setHistory: Dispatch<SetStateAction<HistoryData[] | undefined>>;
}

const {
  screenWidth,
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const fillObj = { color: '#70d7c7', textColor: 'white' };

const getDates = (startDate: string, endDate: Date) => {
  const dates: Record<string, { color: ColorValue; textColor: ColorValue }> = {};
  let currentDate = new Date(startDate);
  const endTimestamp = endDate.getTime();

  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate.getTime() < endTimestamp) {
    const dateString = currentDate.toISOString().slice(0, 10);
    dates[dateString] = fillObj;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const RecentActivityScreen: FC<RecentActivityScreenData> = ({
  route,
  navigation,
  setOffset,
  setHistory,
  fullList,
  history,
  dateRange,
  setDateRange
}) => {
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { registrationDate } = userInfo || {};

  const { bottom } = useSafeAreaInsets();

  const {
    t,
    i18n: { language }
  } = useTranslation();

  const isLoading = history === undefined;

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { blue, graphite, purple }
  } = theme || {};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: t('screens.recent-activity.title'),
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: styles.headerStyle,
      headerLeft: () => <BaseBackButton isChevron={false} />,
      headerRight: () => null
    });
    return () => {};
  }, [navigation, route]);

  const onDateButtonPress = () => setIsDateOpen(true);

  const onCalendarBackPress = () => setIsDateOpen(false);

  const clearDateRange = () => {
    setDateRange(['', '', {}]);
    setHistory(undefined);
    setOffset(0);
  };

  const minDate = useMemo(() => {
    return registrationDate ? moment(registrationDate).format('YYYY-MM-DD') : undefined;
  }, [registrationDate]);

  const maxDate = useMemo(() => {
    return moment().format('YYYY-MM-DD');
  }, []);

  const dateRangeValue = useMemo(() => {
    const firstDate = dateRange[0];
    const secondDate = dateRange[1];

    if (!firstDate) {
      return null;
    }

    let firstFormattedDate = moment(firstDate).format('D MMM YYYY');

    let rangeDateStr = firstFormattedDate;

    if (secondDate) {
      const secondFormattedDate = moment(secondDate).format('D MMM YYYY');
      const isSameMonth = moment(firstDate).isSame(moment(secondDate), 'month');
      const isSameYear = moment(firstDate).isSame(moment(secondDate), 'year');

      if (isSameMonth && isSameYear) {
        firstFormattedDate = moment(firstDate).format('D');
      } else if (!isSameMonth && isSameYear) {
        firstFormattedDate = moment(firstDate).format('D MMM');
      }

      rangeDateStr = `${firstFormattedDate} - ${secondFormattedDate}`;
    }

    return (
      <Fragment>
        <BaseText style={styles.datePickerDateText}>{rangeDateStr}</BaseText>
        <TouchableOpacity
          style={styles.datePickerDateBtn}
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          onPress={() => clearDateRange()}
        >
          <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={purple['500']} />
        </TouchableOpacity>
      </Fragment>
    );
  }, [clearDateRange]);

  const handleDaySelect = (d: DateData) => {
    const selectedDate = d.dateString;
    const [firstDate, secondDate] = dateRange;

    if (firstDate === selectedDate && secondDate === '') return setDateRange(['', '', {}]);

    let newDateRange = [selectedDate, ''];

    if (firstDate && !secondDate) {
      const [d1, sD] = [new Date(firstDate).getTime(), new Date(selectedDate).getTime()];
      newDateRange = sD > d1 ? [firstDate, selectedDate] : [selectedDate, firstDate];
    }

    const dates = getDates(newDateRange[0], new Date(newDateRange[1]));
    const resultDate = [...newDateRange, dates];

    setDateRange(resultDate as DateRange);
  };

  const markedDates = useMemo((): Record<string, object> => {
    const firstDate = dateRange[0];
    const secondDate = dateRange[1];

    const data = {
      [firstDate]: { startingDay: !!secondDate ? true : false, color: '#50cebb', textColor: 'white' },
      ...dateRange[2],
      [secondDate]: { endingDay: true, color: '#50cebb', textColor: 'white' }
    };

    return data;
  }, [dateRange]);

  const onEndReached = () => {
    const firstDate = dateRange[0];

    if (firstDate || fullList) {
      return;
    }
    setOffset((prev) => prev + 1);
  };

  const onRequestClose = () => setIsDateOpen(false);

  const Separator = useCallback(
    (info: { section: HistoryData }) => {
      const { section } = info || {};
      const { ts } = section || {};

      const historyData = history || [];
      const historyLength = historyData.length;
      const index = historyData.findIndex((el) => el.ts === ts);

      if (index !== -1 && index === historyLength - 1) {
        return null;
      }

      return (
        <View style={styles.separatorContainer}>
          <View style={styles.separatorUp} />
          <View style={styles.separatorDown} />
        </View>
      );
    },
    [history]
  );

  const _renderHeader = useCallback(({ section: { title } }: { section: { title: string } }) => {
    return (
      <View style={styles.sectionHeader}>
        <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>
      </View>
    );
  }, []);

  const _keyExtractor = useCallback((item: HistoryDataItem, index: number) => `${item.id}-${index}`, []);

  const _renderItem = useCallback(({ item }: SectionListRenderItemInfo<{ item: HistoryDataItem[] }, HistoryData>) => {
    const { item: itemData } = item || {};

    return (
      <View style={styles.sectionBox}>
        <View style={styles.sectionItemBox}>
          {itemData.map((el) => {
            const { id, type } = el || {};

            const isTransfer = type === 'transfer';

            return isTransfer ? (
              <BaseTransferCard
                key={id}
                data={el}
                onPress={() => {
                  navigation.navigate(ROOT_ROUTE_NAMES.RecentActivityDetails, {
                    ...el,
                    isTransfer: true
                  });
                }}
              />
            ) : (
              <BaseTransactionCard
                key={id}
                data={el}
                onPress={() => {
                  navigation.navigate(ROOT_ROUTE_NAMES.RecentActivityDetails, {
                    ...el,
                    isTransfer: false
                  });
                }}
              />
            );
          })}
        </View>
      </View>
    );
  }, []);

  const LoadingDataComponent = useCallback(() => {
    const itemHeight = '100%';
    const itemWidth = screenWidth - 40;
    return (
      <View style={styles.loaderBox}>
        <ContentLoader
          speed={2}
          width={'100%'}
          height={'100%'}
          backgroundColor={'#E2E6F2'}
          foregroundColor={graphite['050']}
        >
          <Rect x={screenWidth - 50} y={12} rx='8' ry='8' width={30} height={30} />
          <Rect x={20} y={54} rx='8' ry='8' width={160} height={20} />
          <Rect x={20} y={90} rx='12' ry='12' width={itemWidth} height={itemHeight} />
        </ContentLoader>
      </View>
    );
  }, [blue, graphite]);

  const goToDeposit = () =>
    requestAnimationFrame(() => navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true }));

  const EmptyDataComponent = useCallback(() => {
    const firstDate = dateRange[0];

    return (
      <View style={[styles.emptyBox, !firstDate && { paddingHorizontal: 0 }]}>
        <View style={styles.emptyTextBox}>
          {firstDate ? (
            <Fragment>
              <BaseImage source={images.search} style={styles.emptyImg} />
              <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.textAlign}>
                {t('screens.recent-activity.no-activity')}
              </BaseText>
              <BaseText style={styles.textAlign}>{t('screens.recent-activity.change-filters')}</BaseText>
            </Fragment>
          ) : (
            <BasePortfolioEmptyContainer
              showButton
              style={{ top: '50%' }}
              buttonText={t('screens.recent-activity.make-deposit')}
              title={t('screens.recent-activity.no-transaction')}
              onPress={goToDeposit}
              subTitle={t('screens.recent-activity.start-deposit')}
            />
          )}
        </View>
      </View>
    );
  }, [t, styles, dateRange]);

  const _renderCalendarHeader = useCallback(
    (date: string) => {
      const year = dayjs(date).locale(language).format('YYYY');
      const month = dayjs(date).locale(language).format('MMMM');

      return (
        <View style={styles.calendarHeader}>
          <BaseText variant={BaseTextVariant.captionSemiBold}>{capitalizeWord(month)}</BaseText>
          <BaseText variant={BaseTextVariant.captionSemiBold}>{year}</BaseText>
        </View>
      );
    },
    [language]
  );

  return (
    <>
      {isLoading ? (
        <LoadingDataComponent />
      ) : (
        <Fragment>
          <View style={styles.datePickerBox}>
            <View style={styles.datePickerDate}>{dateRangeValue}</View>
            {(!!history.length || isLoading || !!dateRange[0]) && (
              <BaseCalendarButton
                onPress={() => {
                  onDateButtonPress();
                }}
              />
            )}
          </View>
          <SectionList
            contentContainerStyle={[history.length === 0 && { flex: 1 }, { paddingBottom: 34 + bottom }]}
            style={styles.scrollBox}
            stickySectionHeadersEnabled={false}
            sections={(history as SectionListData<HistoryDataItem, HistoryData>[]) || []}
            keyExtractor={_keyExtractor}
            renderSectionFooter={Separator}
            ListEmptyComponent={EmptyDataComponent}
            renderItem={_renderItem as unknown as SectionListRenderItem<HistoryDataItem, HistoryData>}
            renderSectionHeader={_renderHeader}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
          />
          <Modal animationType='fade' transparent={true} visible={isDateOpen} onRequestClose={onRequestClose}>
            <BlurView blurAmount={1} blurType='light' style={styles.datePickerContainer}>
              <Pressable onPress={onCalendarBackPress} style={styles.datePickerBackDrop}>
                <Pressable android_disableSound>
                  <Calendar
                    minDate={minDate}
                    maxDate={maxDate}
                    renderHeader={_renderCalendarHeader}
                    markingType={'period'}
                    markedDates={markedDates}
                    renderDays={() => <CalendarWeekNames />}
                    onDayPress={handleDaySelect}
                    style={styles.calendar}
                  />
                </Pressable>
              </Pressable>
            </BlurView>
          </Modal>
        </Fragment>
      )}
    </>
  );
};

export default RecentActivityScreen;

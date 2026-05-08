import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseText, BaseTextVariant } from '@/components/atoms';
import dayjs from 'dayjs';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, ColorValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { Direction } from 'react-native-calendars/src/types';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config, testIDs } from '@/constants';
import Animated, { CurvedTransition } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import 'dayjs/locale/es';
import 'dayjs/locale/ms';
import 'dayjs/locale/th';
import 'dayjs/locale/vi';
import 'dayjs/locale/pt';
import 'dayjs/locale/it';
import CalendarWeekNames from '../calendar-week-names';
import { capitalizeWord } from '@/helpers';

interface IBaseDateSelector {
  onConfirmPress(dateRange: [string, string, Object]): void;
  currentDateRange: [string, string, Object];
  onClose(): void;
  minDate?: string;
}

type ColorMapNames = 'disable' | 'disable.marked' | 'today' | 'today.marked' | 'middle.marked' | 'day' | 'default';

type ColorMap = Record<ColorMapNames, string>;

const {
  screenWidth,
  buttons: { activeOpacity },
  isIOS,
  headerBar: {
    height,
    buttons: { hitSlop }
  }
} = config;

const fillObj = { textColor: 'white' };

const getDates = (startDate: string, endDate: Date) => {
  const dates: Record<string, { textColor: ColorValue }> = {};
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

const startRadius: ViewStyle = {
  borderTopLeftRadius: 24,
  borderBottomLeftRadius: 24
};

const endRadius: ViewStyle = {
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24
};

const tabs = ['W', 'M', '6M', 'Y', 'All', 'Custom'];

const BaseDateSelector: React.FC<IBaseDateSelector> = ({ onConfirmPress, currentDateRange, onClose, minDate }) => {
  const [dateRange, setDateRange] = useState<[string, string, Object]>(currentDateRange);

  const {
    i18n: { language }
  } = useTranslation();
  const theme = useTheme();
  const { palette } = theme || {};
  const { icon } = palette || {};

  const styles = useStyles(theme);

  const colorMap: ColorMap = useMemo(
    () => ({
      'disable.marked': theme.palette.purple[300],
      'middle.marked': theme.palette.icon.base.strong,
      day: theme.palette.graphite['900'],
      disable: icon?.base?.tertiary,
      today: theme.palette.purple[800],
      'today.marked': theme.palette.base.white,
      default: '#6D858C'
    }),
    [theme.dark]
  );

  const markedDates = useMemo((): Record<string, object> => {
    const firstDate = dateRange[0];
    const secondDate = dateRange[1];

    const data = {
      [firstDate]: { startingDay: !!secondDate ? true : false, textColor: 'white' },
      ...dateRange[2],
      [secondDate]: { endingDay: true, textColor: 'white' }
    };

    return data;
  }, [dateRange[0], dateRange[1]]);

  const handleDaySelect = useCallback(
    (d: DateData | undefined) => {
      if (!d) return;
      const selectedDate = d.dateString;
      const [firstDate, secondDate] = dateRange;

      if (firstDate === selectedDate && secondDate === '') return setDateRange(['', '', {}]);

      let newDateRange: [string, string] = [selectedDate, ''];

      if (firstDate && !secondDate) {
        const [d1, sD] = [new Date(firstDate).getTime(), new Date(selectedDate).getTime()];
        newDateRange = sD > d1 ? [firstDate, selectedDate] : [selectedDate, firstDate];
      }

      const dates = getDates(newDateRange[0], new Date(newDateRange[1]));
      const resultDate: [string, string, Object] = [...newDateRange, dates];
      setDateRange(resultDate);
    },
    [dateRange[0], dateRange[1]]
  );

  const _renderHeader = useCallback(
    (date: string) => {
      const year = dayjs(date).locale(language).format('YYYY');
      const month = dayjs(date).locale(language).format('MMMM');

      return (
        <View testID={testIDs.components.molecules.dateSelector.header.container} style={styles.header}>
          <BaseText
            testID={testIDs.components.molecules.dateSelector.header.month}
            variant={BaseTextVariant.captionSemiBold}
          >
            {capitalizeWord(month)}
          </BaseText>
          <BaseText
            testID={testIDs.components.molecules.dateSelector.header.year}
            variant={BaseTextVariant.captionSemiBold}
          >
            {year}
          </BaseText>
        </View>
      );
    },
    [language]
  );

  const _renderArrow = useCallback((direction: Direction) => {
    if (direction === 'right')
      return (
        <SvgIcon
          testID={testIDs.components.molecules.dateSelector.arrow.right}
          size={IconSize.xsm}
          name={SvgXmlIconNames.chevronRight}
        />
      );
    return (
      <SvgIcon
        testID={testIDs.components.molecules.dateSelector.arrow.left}
        size={IconSize.xsm}
        name={SvgXmlIconNames.chevronLeft}
      />
    );
  }, []);

  const _dayComponent = useCallback(
    (day: DayProps & { date?: DateData | undefined }) => {
      const hasMarking = !!day.marking;

      const isToday = dayjs(day.date?.dateString).isSame(dayjs(), 'day');
      const isStart = day.marking?.startingDay;
      const isEnd = day.marking?.endingDay;
      const isMiddle = !isStart && !isEnd && hasMarking;
      const isDisabled = day.state === 'disabled';

      const dayColor = () => {
        if (hasMarking) {
          if (isToday) return colorMap['today.marked'];
          if (isDisabled) return colorMap['disable.marked'];
          return colorMap['middle.marked'];
        } else {
          if (isToday) return colorMap['today'];
          if (isMiddle) return colorMap['day'];
          if (isDisabled) return colorMap['disable'];
        }
        return colorMap['default'];
      };

      const onPress = () => handleDaySelect(day.date);

      return (
        <TouchableOpacity
          style={[styles.day, isMiddle && { backgroundColor: theme.palette.purple[100] }]}
          hitSlop={5}
          onPress={onPress}
          activeOpacity={0.7}
          testID={testIDs.components.molecules.dateSelector.calendar.dayButton(day.date?.dateString || '')}
        >
          <View
            style={[
              {
                ...(isStart && startRadius),
                ...(isEnd && endRadius),
                backgroundColor: hasMarking ? theme.palette.purple[100] : undefined
              },
              styles.dayWrap
            ]}
            testID={testIDs.components.molecules.dateSelector.calendar.dayWrap}
          >
            <View style={[isToday && styles.todayStyle, { paddingBottom: isToday && hasMarking ? 0 : 2 }]}>
              <View
                testID={testIDs.components.molecules.dateSelector.calendar.dayInside}
                style={isToday && hasMarking && styles.dayInside}
              >
                <BaseText
                  testID={testIDs.components.molecules.dateSelector.calendar.day(day.date?.dateString || '')}
                  style={{ color: dayColor() }}
                >
                  {day.date?.day}
                </BaseText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [theme.dark, dateRange]
  );

  const onConfirm = useCallback(() => {
    onConfirmPress(dateRange);
  }, [dateRange]);

  return (
    <SafeAreaView style={styles.general}>
      <TouchableOpacity
        testID={testIDs.components.molecules.dateSelector.closeButton}
        onPress={onClose}
        hitSlop={hitSlop}
        style={styles.close}
        activeOpacity={activeOpacity}
      >
        <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xs} />
      </TouchableOpacity>
      <Animated.View
        testID={testIDs.components.molecules.dateSelector.calendarContainer}
        layout={CurvedTransition}
        style={styles.container}
      >
        <Calendar
          renderArrow={_renderArrow}
          dayComponent={_dayComponent}
          markingType={'period'}
          markedDates={markedDates}
          renderDays={() => <CalendarWeekNames />}
          renderHeader={_renderHeader}
          onDayPress={handleDaySelect}
          minDate={minDate}
        />
      </Animated.View>
      <BaseButton
        testID={testIDs.components.molecules.dateSelector.confirmButton}
        onPress={onConfirm}
        size={BaseButtonSize.large}
        type={BaseButtonType.primary}
        label='Confirm'
        disabled={!dateRange[0]}
        style={styles.btn}
      />
    </SafeAreaView>
  );
};

const useStyles = ({ palette: { graphite, text, icon } }: UserTheme) =>
  StyleSheet.create({
    container: {
      width: screenWidth - 40,
      borderRadius: 16,
      backgroundColor: 'white',
      padding: 8,
      marginTop: '40%',
      alignSelf: 'center'
    },
    btn: {
      position: 'absolute',
      bottom: 44,
      width: screenWidth - 40,
      alignSelf: 'center',
      marginHorizontal: 20
    },
    day: {
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      width: 58
    },
    dayInside: {
      width: 19,
      height: 19,
      backgroundColor: text.interaction.basic.accent.default,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 2
    },
    general: {
      zIndex: 9999,
      width: '100%',
      height: '100%',
      padding: 8,
      justifyContent: 'flex-start',
      backgroundColor: graphite['050'],
      flex: 1
    },
    dayWrap: {
      width: 37,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center'
    },
    header: {
      flexDirection: 'row',
      gap: 4
    },
    close: {
      alignSelf: 'flex-start',
      justifyContent: 'center',
      marginLeft: 20,
      height: isIOS ? height : undefined,
      top: isIOS ? height : height / 2 - 12
    },
    todayStyle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: icon.base.strong,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 0
    }
  });

export default memo(BaseDateSelector);

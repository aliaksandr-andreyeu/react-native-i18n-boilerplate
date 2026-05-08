import React, { FC, useCallback, useLayoutEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import {
  BaseBackButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseText,
  BaseTextVariant,
  CalendarWeekNames
} from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Calendar, DateData } from 'react-native-calendars';
import useStyles from './styles';
import { View } from 'react-native';
import dateHelper from '@/helpers/dateHelper';
import DatePicker from 'react-native-date-picker';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import dayjs from 'dayjs';
import { capitalizeWord } from '@/helpers';

const current = new Date();

type SelectDateScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.SelectDate>;

const SelectDateScreen: FC<SelectDateScreenProps> = ({ route, navigation }) => {
  const {
    t,
    i18n: { language }
  } = useTranslation();

  const { title, date, onSubmit, updatedValues } = route.params || {};

  const theme = useTheme();
  const styles = useStyles(theme);

  const [selected, setSelected] = useState<Date | null>(date || null);
  const [isCalendarShown, showCalendar] = useState(true);

  const formatedSelectedDate = dateHelper.to(selected, 'YYYY-MM-DD');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: title || t('navigation.select-date'),
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: styles.headerStyle,
      headerLeft: () => <BaseBackButton isChevron={false} />,
      headerRight: () => null
    });
    return () => {};
  }, [navigation, route]);

  const handleSubmit = () => {
    if (selected) {
      onSubmit?.(selected, updatedValues);
    }

    navigation.goBack();
  };

  const _renderHeader = useCallback(
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
    <SafeAreaView style={styles.safe}>
      <View>
        <View style={styles.row}>
          <View style={styles.horizontal}>
            <BaseButton
              type={BaseButtonType.secondary}
              size={BaseButtonSize.tiny}
              labelStyle={{ color: isCalendarShown ? theme.palette?.purple[800] : theme.palette.graphite['900'] }}
              label={dateHelper.to(selected || current, 'DD MMMM YYYY')}
              style={[styles.topButton, { marginRight: 8 }]}
              onPress={() => {
                showCalendar(true);
              }}
            />
            <BaseButton
              type={BaseButtonType.secondary}
              size={BaseButtonSize.tiny}
              label={dateHelper.to(selected || current, 'HH:mm')}
              labelStyle={{ color: !isCalendarShown ? theme.palette?.purple[800] : theme.palette.graphite['900'] }}
              style={[styles.topButton, { marginRight: 8 }]}
              onPress={() => {
                showCalendar(false);
              }}
            />
          </View>
          {selected && (
            <BaseButton
              type={BaseButtonType.link}
              size={BaseButtonSize.tiny}
              label={'Reset'}
              onPress={() => {
                setSelected(null);
              }}
            />
          )}
        </View>
        {isCalendarShown ? (
          <Calendar
            minDate={dateHelper.to(current, 'YYYY-MM-DD')}
            current={selected ? formatedSelectedDate : undefined}
            style={styles.calendar}
            renderDays={() => <CalendarWeekNames />}
            renderHeader={_renderHeader}
            markedDates={
              selected
                ? {
                    [formatedSelectedDate]: { selected: true, selectedColor: theme.palette?.purple[800] }
                  }
                : {}
            }
            onDayPress={(day: DateData) => {
              setSelected(dateHelper.toDate(day?.timestamp));
            }}
          />
        ) : (
          <View style={styles.dateWrapper}>
            <DatePicker
              is24hourSource='locale'
              modal={false}
              mode={'time'}
              theme='light'
              date={new Date(selected || current)}
              onDateChange={(date) => {
                console.log('selected', dateHelper.to(date, 'YYYY-MM-DD'));
                setSelected(date);
              }}
              locale='fr'
            />
          </View>
        )}
      </View>
      <BaseButton
        disabled={!selected}
        type={BaseButtonType.primary}
        size={BaseButtonSize.large}
        label={t('screens.create-position-details.confirm')}
        onPress={handleSubmit}
      />
    </SafeAreaView>
  );
};

export default SelectDateScreen;

import { BaseButton, BaseButtonSize, BaseButtonType, BaseText, BaseTextVariant } from '@/components/atoms';
import dateHelper from '@/helpers/dateHelper';
import React, { memo, useCallback, useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { config, testIDs, UserTheme } from '@/constants';
import { Calendar, DateData } from 'react-native-calendars';
import ProgressHeader from '../progress-header';
import CalendarWeekNames from '../calendar-week-names';
import dayjs from 'dayjs';
import { capitalizeWord } from '@/helpers';

interface IBaseSingleDateSelector {
  title?: string;
  date: Date | null;
  onSubmit(date: Date): void;
  onDismiss(): void;
  visible: boolean;
  testID?: string;
}

const {
  fonts: { generalSans }
} = config;

const current = new Date();

const BaseSingleDateSelector: React.FC<IBaseSingleDateSelector> = ({
  date,
  onSubmit = () => {},
  title = '',
  onDismiss,
  visible,
  testID
}) => {
  const {
    t,
    i18n: { language }
  } = useTranslation();

  const { top } = useSafeAreaInsets();

  const theme = useTheme();
  const styles = useStyles(theme);

  const [selected, setSelected] = useState<Date | null>(date || null);
  const [isCalendarShown, showCalendar] = useState(true);

  const formatedSelectedDate = dateHelper.to(selected, 'YYYY-MM-DD');

  const handleSubmit = () => {
    requestAnimationFrame(() => {
      if (selected) {
        onSubmit?.(selected);
        onDismiss();
      }
    });
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
    <>
      {
        // <SafeAreaView style={styles.flex}>
      }
      <Modal onDismiss={onDismiss} visible={visible} onRequestClose={onDismiss} animationType='fade'>
        <ProgressHeader
          title={title}
          currentStep={0}
          stepsCount={0}
          style={[styles.header, { paddingTop: top }]}
          hideProgressBar
          onBackPressed={onDismiss}
        />
        <View style={styles.safe}>
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
                renderHeader={_renderHeader}
                renderDays={() => <CalendarWeekNames />}
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
                  minimumDate={new Date()}
                  date={new Date(selected || current)}
                  onDateChange={(date) => {
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
        </View>
      </Modal>
      {
        // </SafeAreaView>
      }
    </>
  );
};

const useStyles = ({ palette: { base, graphite } }: UserTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    safe: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      paddingBottom: 20,
      backgroundColor: graphite['050']
    },
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: generalSans.medium
    },
    calendar: {
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8
    },
    row: {
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      paddingLeft: 16,
      paddingTop: 8,
      paddingBottom: 4,
      backgroundColor: base.white,
      marginTop: 32,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    horizontal: {
      flexDirection: 'row'
    },
    topButton: {
      backgroundColor: '#ecf0f1',
      borderWidth: 0,
      borderRadius: 4
    },
    dateWrapper: {
      backgroundColor: 'white',
      alignItems: 'center',
      paddingVertical: 20,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8
    },
    header: {
      backgroundColor: graphite['050']
    },
    calendarHeader: {
      flexDirection: 'row',
      gap: 4
    }
  });

export default memo(BaseSingleDateSelector);

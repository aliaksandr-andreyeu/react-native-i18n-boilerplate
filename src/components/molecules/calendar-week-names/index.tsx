import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import moment from 'moment';
import { capitalizeWord } from '@/helpers';

const CalendarWeekNames: React.FC = () => {
  const {
    i18n: { language }
  } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const weekDays = moment.localeData(language).weekdaysShort();

  return (
    <View style={styles.container}>
      {weekDays.map((item) => {
        return (
          <BaseText testID={testIDs.components.molecules.calendarWeekNames[item?.toLocaleLowerCase()]} style={styles.week} variant={BaseTextVariant.small} key={`${item}-week`}>
            {capitalizeWord(item)}
          </BaseText>
        );
      })}
    </View>
  );
};

const useStyles = ({ palette: { graphite } }: UserTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14
    },
    week: {
      color: '#B4C4C9'
    }
  });

export default CalendarWeekNames;

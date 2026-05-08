import i18n from '@/localization';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/ms';
import 'dayjs/locale/th';
import 'dayjs/locale/vi';
import 'dayjs/locale/pt';
import 'dayjs/locale/it';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

const getDefaultLanguage = () => {
  const defaultLang = i18n.language || 'en';
  return defaultLang;
};

const dateHelper = {
  toYear: (timestamp: number) => {
    return dayjs.unix(timestamp).year();
  },
  current: (format = 'DD.MM.YYYY') => {
    const defaultLanguage = getDefaultLanguage();
    return dayjs().locale(defaultLanguage).format(format);
  },
  to: (date: dayjs.ConfigType, format = 'DD.MM.YYYY') => {
    const defaultLanguage = getDefaultLanguage();
    return dayjs(date).locale(defaultLanguage).format(format);
  },
  toTime: (date: number, format = 'DD.MM.YYYY') => {
    const defaultLanguage = getDefaultLanguage();
    return dayjs.unix(date).locale(defaultLanguage).format(format);
  },
  toDate: (timestamp: number) => {
    const defaultLanguage = getDefaultLanguage();
    return dayjs(timestamp).locale(defaultLanguage).endOf('day').toDate();
  },
  toTimestamp: (date: dayjs.ConfigType) => {
    return dayjs(date).unix();
  },
  valueOf: (date: dayjs.ConfigType) => {
    const defaultLanguage = getDefaultLanguage();
    return dayjs(date).locale(defaultLanguage).valueOf();
  },
  toStartUnix: (date: dayjs.ConfigType = dayjs()) => {
    return dayjs(date, 'YYYY-MM-DD').startOf('day').unix();
  },
  toEndUnix: (date: dayjs.ConfigType = dayjs()) => {
    return dayjs(date, 'YYYY-MM-DD').endOf('day').unix();
  },
  diff: (date1: dayjs.ConfigType, date2: dayjs.ConfigType, customParser?: string) => {
    dayjs.extend(customParseFormat);
    const firstDate = dayjs(date1, customParser);
    const secondDate = dayjs(date2, customParser);

    const seconds = secondDate.diff(firstDate, 'seconds');

    return seconds;
  },
  isValid: (date: dayjs.ConfigType) => {
    return dayjs(date).isValid();
  },
  isBetween: (
    startDate: string | dayjs.ConfigType | undefined,
    endDate: string | dayjs.ConfigType | undefined,
    givenDate: string | dayjs.ConfigType | undefined
  ) => {
    if (!startDate || !endDate || !givenDate) return false;
    dayjs.extend(isBetween);
    return dayjs(givenDate).isBetween(dayjs(startDate).startOf('day'), dayjs(endDate).endOf('day'), null, '[]');
  },
  isBetweenUTC: (startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs, givenDate?: dayjs.Dayjs) => {
    if (!startDate || !endDate || !givenDate) return false;
    if (!startDate.isValid() || !endDate.isValid() || !givenDate.isValid()) return false;
    return givenDate.isBetween(startDate, endDate, null, '[]');
  },
  hasTimePassed: (date: string, dateFormat: string | undefined): boolean => {
    dayjs.extend(customParseFormat);

    const targetDateTime = dayjs(date, dateFormat).hour(0).minute(15).second(0);

    const now = dayjs();

    return now.isAfter(targetDateTime);
  },
  getClosest: (dates: Date[]) => {
    const now = dayjs();
    let closestDate = null;
    let smallestDiff = Infinity;

    for (const date of dates) {
      const diff = Math.abs(dayjs(date).diff(now));
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestDate = date;
      }
    }

    return closestDate;
  }
};

export default dateHelper;

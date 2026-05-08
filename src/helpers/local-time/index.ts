import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const convertUtcTimeSmart = (text: string): string => {
  try {
    const fullDateRegex = /(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+at)?\s+(\d{1,2}:\d{2})\s*UTC\b/i;
    const timeOnlyRegex = /\b(\d{1,2}:\d{2})\s*UTC\b/i;

    const nowUtc = dayjs().utc();
    const currentYear = nowUtc.year();

    const normalizeMonth = (month: string) => month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    const formatLocal = (date: dayjs.Dayjs) => `${date.local().format('MMMM D, YYYY [at] H:mm')} (your local time)`;

    const fullMatch = text.match(fullDateRegex);
    if (fullMatch) {
      const [, day, rawMonth, timeStr] = fullMatch;
      const month = normalizeMonth(rawMonth);
      const formats = ['D MMM YYYY HH:mm', 'D MMMM YYYY HH:mm'];

      for (const format of formats) {
        const parsed = dayjs.utc(`${day} ${month} ${currentYear} ${timeStr}`, format);
        if (parsed.isValid()) {
          const adjusted = parsed.isBefore(nowUtc.subtract(12, 'hours')) ? parsed.add(1, 'year') : parsed;
          return text.replace(fullDateRegex, formatLocal(adjusted));
        }
      }

      return text;
    }

    const timeMatch = text.match(timeOnlyRegex);
    if (timeMatch) {
      const [_, timeStr] = timeMatch;
      const [hour, minute] = timeStr.split(':').map(Number);
      const utcDate = nowUtc.clone().hour(hour).minute(minute).second(0).millisecond(0);
      if (!utcDate.isValid()) return text;
      return text.replace(timeOnlyRegex, formatLocal(utcDate));
    }

    return text;
  } catch {
    return text;
  }
};

export const localTime = (time: any, format: string = 'D MMM YYYY, HH:mm'): string => {
  try {
    const parsed = dayjs(time);
    if (!parsed.isValid()) return time;

    const local = parsed.local().format(format);
    return local;
  } catch {
    return time;
  }
};

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

type Item = {
  assetName: string;
  date: string;
  earning: number;
  lot: string;
};

export function filterItemsByDate(items: Item[], firstDate?: string, secondDate?: string): Item[] {
  if (!firstDate && !secondDate) return items;

  return items.filter((item) => {
    const itemDate = dayjs(item.date, 'DD.MM.YY [at] HH:mm');

    if (firstDate && !secondDate) {
      return itemDate.isSame(dayjs(firstDate, 'YYYY-MM-DD'), 'day');
    }

    if (firstDate && secondDate) {
      const start = dayjs(firstDate, 'YYYY-MM-DD').startOf('day');
      const end = dayjs(secondDate, 'YYYY-MM-DD').endOf('day');
      return itemDate.isBetween(start, end, null, '[]');
    }

    return true;
  });
}

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

type Row = {
  assetName: string;
  date: string;
  id: string;
  type: string;
  price: string;
  lot: string;
};

type Section = { title: string; key: string; data: Row[] };

export function buildSections(rows: Row[], dateRange: string[] = []): Section[] {
  const today = dayjs();
  const yesterday = dayjs().subtract(1, 'day');

  const staticToday: Row[] = [
    { assetName: 'BTC', date: today.toISOString(), id: '10001', type: 'Standard', price: '45000', lot: '0.5' },
    {
      assetName: 'ETH',
      date: today.add(2, 'hour').toISOString(),
      id: '10002',
      type: 'Standard',
      price: '3100',
      lot: '1.2'
    }
  ];

  const staticYesterday: Row[] = [
    { assetName: 'AAPL', date: yesterday.toISOString(), id: '10003', type: 'Standard', price: '185', lot: '3' },
    {
      assetName: 'TSLA',
      date: yesterday.add(5, 'hour').toISOString(),
      id: '10004',
      type: 'Standard',
      price: '700',
      lot: '2'
    }
  ];

  let allRows = [...rows, ...staticToday, ...staticYesterday];

  if (dateRange[1]) {
    const start = dayjs(dateRange[0], 'YYYY-MM-DD');
    const end = dayjs(dateRange[1], 'YYYY-MM-DD');
    allRows = allRows.filter((r) => dayjs(r.date).isBetween(start, end, 'day', '[]'));
  } else if (dateRange[0]) {
    const target = dayjs(dateRange[0], 'YYYY-MM-DD');
    allRows = allRows.filter((r) => dayjs(r.date).isSame(target, 'day'));
  }

  const buckets = new Map<string, Row[]>();
  for (const r of allRows) {
    const d = dayjs(r.date);
    if (!d.isValid()) continue;
    const key = d.format('YYYY-MM-DD');
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(r);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (dayjs(b).isAfter(dayjs(a)) ? 1 : -1))
    .map(([key, items]) => {
      const sortedItems = items.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

      const refDate = dayjs(sortedItems[0].date);
      const title = refDate.isSame(today, 'day')
        ? 'Today'
        : refDate.isSame(yesterday, 'day')
          ? 'Yesterday'
          : refDate.format('D MMMM YYYY');

      return {
        title,
        key,
        data: sortedItems.map((item) => ({
          ...item,
          date: dayjs(item.date).format('DD.MM.YY [at] HH:mm')
        }))
      };
    });
}

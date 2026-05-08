import { legalDocument } from '@/store/slices/legal-documents/types';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export const groupItemsByGroupingKey = (items: legalDocument[]) => {
  if (!items) return [];

  const grouped = items.reduce((acc: { [key: string]: any[] }, item: any) => {
    const attrs = item?.attributes || {};
    const groupingKey = item?.attributes?.grouping || 'No Group';

    if (attrs.beginOn) {
      attrs.beginOn = dayjs(attrs.beginOn).toISOString();
    }
    if (attrs.endOn) {
      attrs.endOn = dayjs(attrs.endOn).toISOString();
    }

    if (!acc[groupingKey]) {
      acc[groupingKey] = [];
    }

    acc[groupingKey].push({ ...item, attributes: attrs });
    return acc;
  }, {});

  for (const group in grouped) {
    grouped[group].sort((a, b) => {
      const sortOrderA = a.attributes.sortOrder !== undefined ? a.attributes.sortOrder : Number.MAX_SAFE_INTEGER;
      const sortOrderB = b.attributes.sortOrder !== undefined ? b.attributes.sortOrder : Number.MAX_SAFE_INTEGER;
      return sortOrderB - sortOrderA;
    });
  }

  const now = dayjs();
  return Object.keys(grouped)
    .sort((a, b) => {
      if (a === 'No Group') return 1;
      if (b === 'No Group') return -1;
      return 0;
    })
    .map((group) => ({
      title: group,
      data: grouped[group].filter((item) => {
        const beginOn = item?.attributes?.beginOn;
        const endOn = item?.attributes?.endOn;
        const hasBegin = !!beginOn;
        const hasEnd = !!endOn;

        if (hasBegin && hasEnd) {
          return now.isBetween(dayjs(beginOn), dayjs(endOn), null, '[)');
        }

        if (hasBegin) {
          return now.isAfter(dayjs(beginOn)) || now.isSame(dayjs(beginOn));
        }

        if (hasEnd) {
          return now.isBefore(dayjs(endOn));
        }
        return true;
      })
    }));
};

import { type MutableRefObject, type RefCallback } from 'react';

type MutableRefList<T> = Array<RefCallback<T> | MutableRefObject<T> | undefined | null>;

export const mergeRefs = <T>(...refs: MutableRefList<T>): RefCallback<T> => {
  return (val: T) => {
    setRef(val, ...refs);
  };
};

export const setRef = <T>(val: T, ...refs: MutableRefList<T>): void => {
  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(val);
    } else if (ref != null) {
      ref.current = val;
    }
  });
};

export const generatePassword = (length: number) => {
  const numberSymbols = '0123456789';
  const upperCaseSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseSymbols = 'abcdefghijklmnopqrstuvwxyz';

  const symbols = numberSymbols + upperCaseSymbols + lowerCaseSymbols;

  let passwordArray = Array(length);
  passwordArray[0] = numberSymbols;
  passwordArray[1] = upperCaseSymbols;
  passwordArray[2] = lowerCaseSymbols;

  passwordArray = passwordArray.fill(symbols, 3);

  const randPasswordArray = passwordArray.map((x: string) => x[Math.floor(Math.random() * x.length)]);

  for (var i = randPasswordArray.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = randPasswordArray[i];
    randPasswordArray[i] = randPasswordArray[j];
    randPasswordArray[j] = temp;
  }

  return randPasswordArray.join('');
};

export const jsonParse = (data: string | null | undefined): null | string | Record<string | number, any> => {
  if (!data) {
    return null;
  }
  try {
    const json = JSON.parse(data);

    return json;
  } catch (err) {
    return null;
  }
};

export function isValidJson(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export const formatNumberToAmount = (value: number | string | undefined): string => {
  if (!value) {
    return '0';
  }
  let parts = value.toString().split('.');
  parts[0] = parts?.[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
  return parts.join('.');
};

export const getFormattedTime = (value: number) => {
  if (!value || value <= 0) {
    return `00:00:00`;
  }
  const hours = Math.floor(value / 1000 / 60 / 60);
  const minutes = Math.floor(value / 1000 / 60) - hours * 60;
  const seconds = Math.floor((value / 1000) % 60);

  const hh = hours < 10 ? `0${hours}` : hours;
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  const ss = seconds < 10 ? `0${seconds}` : seconds;

  return `${hh}:${mm}:${ss}`;
};

export const capitalizeWord = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export function detectDateFormat(dateStr: string | undefined) {
  if (!dateStr) return undefined;
  const yyyyMmDdRegex = /^\d{4}-\d{2}-\d{2}$/;
  const ddMmYyyyRegex = /^\d{2}-\d{2}-\d{4}$/;

  if (yyyyMmDdRegex.test(dateStr)) {
    return 'YYYY-MM-DD';
  } else if (ddMmYyyyRegex.test(dateStr)) {
    return 'DD-MM-YYYY';
  } else {
    return '';
  }
}

export const getAssetName = (str: string | undefined): string => {
  if (!str) return '';
  const dotIndex = str.indexOf('.');
  return dotIndex === -1 ? str : str.slice(0, dotIndex);
};

export const formatTwoDecimals = (value: any) => {
  try {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') value = value.toString().trim();

    const match = value.match(/^([^\d.-]*)([\d.-]+)([^\d.-]*)$/);

    if (!match) return value;

    const [, prefix, numStr, suffix] = match;
    const num = Number(numStr);
    if (isNaN(num)) return value;

    const parts = numStr.split('.');
    if (!parts[1]) {
      return `${prefix}${num.toFixed(2)}${suffix}`;
    }
    if (parts[1].length === 1) {
      return `${prefix}${num.toFixed(2)}${suffix}`;
    }

    return `${prefix}${numStr}${suffix}`;
  } catch {
    return value;
  }
};

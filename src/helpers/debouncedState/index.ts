import { useRef } from 'react';
import { debounce } from 'throttle-debounce';

type DebounceCallback = (formattedValue: string) => void;

type debouncedChangeType = (
  fieldName: string,
  value: string,
  callback: DebounceCallback,
  precision?: number
) => void;

export const debouncedState = (): debouncedChangeType => {
  const debounceRef = useRef<{ [key: string]: ReturnType<typeof debounce> }>({});

  const handleDebouncedChange: debouncedChangeType = (
    fieldName,
    value,
    callback,
    precision = 5
  ) => {
    if (!debounceRef.current[fieldName]) {
      debounceRef.current[fieldName] = debounce(500, (val: string) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          callback(num.toFixed(precision));
        } else {
          callback(val);
        }
      });
    }
    debounceRef.current[fieldName](value);
  };

  return handleDebouncedChange;
};
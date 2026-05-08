import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { jsonParse } from '@/helpers';

type IUseAsyncStorageRetrun<T extends string> = {
  loading: boolean;
  storageValues: Record<T, any>;
  get(key: T, passLoading?: boolean): Promise<any>;
  set(key: T, value: any, passLoading?: boolean, updateState?: boolean): void;
  remove(key: T, passLoading?: boolean): void;
  clear(passLoading?: boolean): void;
};

const useAsyncStorage = <T extends string>(
  defaultStorage: Record<T, any> = {} as Record<T, any>
): IUseAsyncStorageRetrun<T> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [storageValues, setStorageValues] = useState<Record<T, any>>(defaultStorage as Record<T, any>);

  const get = async (key: T, passLoading?: boolean) => {
    let value: any;
    try {
      !passLoading && setLoading(true);
      value = await AsyncStorage.getItem(key);
      if (value) value = jsonParse(value);
      !passLoading && setLoading(false);
      setStorageValues((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.log(error);
    } finally {
      !passLoading && setLoading(false);
      return value;
    }
  };

  const set = async (key: T, value: any, passLoading?: boolean, updateState: boolean = true) => {
    try {
      !passLoading && setLoading(true);
      if (value === undefined || value === null) {
        !passLoading && setLoading(false);
        return undefined;
      }
      value = JSON.stringify(value);
      await AsyncStorage.setItem(key, value);
      updateState && setStorageValues((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.log(error);
    } finally {
      !passLoading && setLoading(false);
    }
  };

  const remove = async (key: T, passLoading?: boolean) => {
    try {
      !passLoading && setLoading(true);
      await AsyncStorage.removeItem(key);
      const newValues = { ...storageValues };
      delete newValues[key];
      setStorageValues(newValues);
    } catch (error) {
      console.log(error);
    } finally {
      !passLoading && setLoading(false);
    }
  };

  const clear = async (passLoading?: boolean) => {
    try {
      !passLoading && setLoading(true);
      await AsyncStorage.clear();
      setStorageValues({} as Record<T, any>);
    } catch (error) {
      console.log(error);
    } finally {
      !passLoading && setLoading(false);
    }
  };

  return {
    get,
    set,
    remove,
    clear,
    storageValues,
    loading
  };
};

export default useAsyncStorage;

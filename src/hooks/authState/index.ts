import { useReducer, useState } from 'react';
import useAsyncStorage from '../asyncstorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { actions } from '@/store';
import { useAppDispatch } from '../store';

export type StateTypes =
  | 'user-email'
  | 'user-phone'
  | 'user-password'
  | 'user-emailVerify'
  | 'user-phoneVerify'
  | 'last-auth-screen'
  | 'user-code'
  | 'user-service';

export type Values = Partial<Record<StateTypes, string>>;

type Action = {
  type: 'SET_VALUE' | 'RESET' | 'SET_DEFAULT';
  key: StateTypes;
  value: string;
};

const initialValue: Values = {};

const valuesReducer = (state: Values, action: Action): Values => {
  if (!action.type) return {};
  switch (action.type) {
    case 'SET_DEFAULT':
      const { type, ...rest } = action;
      return rest as Values;
    case 'SET_VALUE':
      return {
        ...state,
        [action.key]: action.value
      };
    case 'RESET':
      return {};
    default:
      return state;
  }
};

export const allUserAuthKeys: StateTypes[] = [
  'user-email',
  'user-emailVerify',
  'user-password',
  'user-phone',
  'user-phoneVerify',
  'last-auth-screen',
  'user-code',
  'user-service'
];

const {
  auth: { setUserState }
} = actions;

const useAuthState = () => {
  const [loading, setLoading] = useState(true);
  const [values, dispatch] = useReducer(valuesReducer, initialValue);

  const { set, get } = useAsyncStorage<StateTypes>();
  const appDispatch = useAppDispatch();

  const change = (key: StateTypes, value: string) => {
    dispatch({ key, value, type: 'SET_VALUE' });
    set(key, value, true);
  };

  const reset = async () => {
    dispatch({ type: 'RESET', key: 'user-password', value: '' });
    appDispatch(setUserState(null));
    await AsyncStorage.multiRemove(allUserAuthKeys);
  };

  const onStart = async (): Promise<Values> => {
    try {
      setLoading(true);

      const storedValues = await Promise.all(allUserAuthKeys.map((item) => get(item)));
      if (!storedValues.length) return {};
      const values = allUserAuthKeys.reduce(
        (acc: Record<StateTypes, string>, item: StateTypes, index: number) => {
          acc[item] = storedValues[index] || '';
          return acc;
        },
        {} as Record<StateTypes, string>
      );

      dispatch({ ...values, type: 'SET_DEFAULT', key: 'user-emailVerify', value: values['user-emailVerify'] });
      appDispatch(setUserState(values));
      return values;
    } catch (error) {
      console.error(error);
      return {};
    } finally {
      setLoading(false);
    }
  };

  return { change, reset, values, loading, onStart };
};

export default useAuthState;

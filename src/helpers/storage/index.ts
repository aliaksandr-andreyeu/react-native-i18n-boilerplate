import { allUserAuthKeys } from '@/hooks/authState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jsonParse } from '@/helpers';

enum StoredKeyType {
  REFRESH_TOKEN = '@REFRESH_TOKEN',
  VERIFY_EMAIL_SENT = '@VERIFY_EMAIL_SENT',
  VERIFY_PHONE_SENT = '@VERIFY_PHONE_SENT',
  LOGGED_IN_BEFORE = '@LOGGED_IN_BEFORE',
  SAW_WELCOME = '@SAW_WELCOME',
  INVITE_PASSED = '@INVITE_PASSED',
  LAST_AUTH_ACTION = '@LAST_AUTH_ACTION'
}

export const setStoredLastAuthAction = async (action: 'sign-in' | 'sign-up') => {
  try {
    await AsyncStorage.setItem(StoredKeyType.LAST_AUTH_ACTION, action);
  } catch (error) {
    console.error(error);
  }
};
export const getStoredLastAuthAction = async (): Promise<'sign-in' | 'sign-up' | null | undefined> => {
  try {
    return (await AsyncStorage.getItem(StoredKeyType.LAST_AUTH_ACTION)) as 'sign-in' | 'sign-up' | null;
  } catch (error) {
    console.error(error);
  }
};

export const setStoredInvitePassed = async (email: string) => {
  try {
    const value = await AsyncStorage.getItem(StoredKeyType.INVITE_PASSED);
    const obj = JSON.parse(value || '{}');
    const newValue = { ...obj, [email]: true };
    await AsyncStorage.setItem(StoredKeyType.INVITE_PASSED, JSON.stringify(newValue));
  } catch (error) {
    console.error(error);
  }
};

export const getStoredInvitePassed = async (email: string) => {
  try {
    const value = await AsyncStorage.getItem(StoredKeyType.INVITE_PASSED);
    const obj = JSON.parse(value || '{}');
    return !!obj?.[email];
  } catch (error) {
    console.error(error);
  }
};

export const setStoredVerifyPhone = async () => {
  try {
    await AsyncStorage.setItem(StoredKeyType.VERIFY_PHONE_SENT, 'true');
  } catch (error) {
    console.error(error);
  }
};
export const getStoredVerifyPhone = async () => {
  try {
    return await AsyncStorage.getItem(StoredKeyType.VERIFY_PHONE_SENT);
  } catch (error) {
    console.error(error);
  }
};

export const removeStoredVerifyPhone = async () => {
  try {
    return await AsyncStorage.removeItem(StoredKeyType.VERIFY_PHONE_SENT);
  } catch (error) {
    console.error(error);
  }
};

export const getStoredVerifyEmail = async () => {
  try {
    const value = await AsyncStorage.getItem(StoredKeyType.VERIFY_EMAIL_SENT);

    return value;
  } catch (error: unknown) {
    console.error(error);

    return null;
  }
};

export const removeStoredVerifyEmail = async () => {
  try {
    await AsyncStorage.removeItem(StoredKeyType.VERIFY_EMAIL_SENT);
  } catch (error: unknown) {
    console.error(error);
  }
};

export const setStoredVerifyEmail = async () => {
  try {
    await AsyncStorage.setItem(StoredKeyType.VERIFY_EMAIL_SENT, String(true));
  } catch (error: unknown) {
    console.error(error);
  }
};

export const getStoredRefreshToken = async () => {
  try {
    const value = await AsyncStorage.getItem(StoredKeyType.REFRESH_TOKEN);

    return value;
  } catch (error: unknown) {
    console.error(error);

    return null;
  }
};

export const removeSawWelcome = async () => {
  try {
    await AsyncStorage.removeItem(StoredKeyType.SAW_WELCOME);
  } catch (error) {
    console.error(error);
  }
};

export const removeAuthKeys = async () => {
  try {
    await AsyncStorage.multiRemove(allUserAuthKeys);
  } catch (error) {
    console.error(error);
  }
};

export const removeStoredRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem(StoredKeyType.REFRESH_TOKEN);
  } catch (error: unknown) {
    console.error(error);
  }
};

export const setStoredRefreshToken = async (token: string) => {
  if (!token || typeof token !== 'string') {
    return;
  }
  try {
    await AsyncStorage.setItem(StoredKeyType.REFRESH_TOKEN, String(token));
  } catch (error: unknown) {
    console.error(error);
  }
};

export const setLoggedInBefore = async () => {
  try {
    await AsyncStorage.setItem(StoredKeyType.LOGGED_IN_BEFORE, String(true));
  } catch (error: unknown) {
    console.error(error);
  }
};

export const getLoggedInBefore = async () => {
  try {
    const value = await AsyncStorage.getItem(StoredKeyType.LOGGED_IN_BEFORE);
    return Boolean(value);
  } catch (error: unknown) {
    console.error(error);

    return null;
  }
};

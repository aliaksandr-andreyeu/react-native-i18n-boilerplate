import Config from 'react-native-config';
import CookieManager from '@react-native-cookies/cookies';

const { API_URL } = Config || {};

export const removeAllCookies = async () => {
  try {
    await CookieManager.clearAll();
    const cookies = await CookieManager.get(API_URL);

    console.log('@@@@@ CookieManager.get', cookies);
  } catch (error: unknown) {
    console.error(error);
  }
};

export const remove2FaCookie = async () => {
  try {
    await CookieManager.set(API_URL, {
      name: 'trusted_computer',
      value: ''
    });
    const cookies = await CookieManager.get(API_URL);

    console.log('@@@@@ CookieManager.get', cookies);
  } catch (error: unknown) {
    console.error(error);
  }
};

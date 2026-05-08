import appsFlyer from 'react-native-appsflyer';
import Config from 'react-native-config';
import { config } from '@/constants';

const { isIOS } = config || {};

const { APPSFLYER_DEV_KEY, APP_ENV, APPSFLYER_APP_ID } = Config || {};

const isProduction = Boolean(APP_ENV === 'production');

export enum AppsFlyerEventTypes {
  CompleteRegistration = 'af_complete_registration',
  Login = 'af_login',
  Deposit = 'af_deposit'
}

export const appsFlyerInit = async () => {
  if (!isProduction) {
    return;
  }
  if (!APPSFLYER_DEV_KEY) {
    return;
  }
  try {
    const data = await appsFlyer.initSdk({
      devKey: APPSFLYER_DEV_KEY,
      ...(isIOS && { appId: APPSFLYER_APP_ID }),
      isDebug: true,
      onInstallConversionDataListener: true,
      onDeepLinkListener: true,
      timeToWaitForATTUserAuthorization: 10,
      manualStart: true
    });

    appsFlyer.startSdk();

    console.warn('appsFlyerInit', data);
  } catch (error: unknown) {
    console.error('appsFlyerInit', error);
  }
};

export const appsFlyerLogEvent = async (eventName: AppsFlyerEventTypes, eventValues?: object) => {
  if (!isProduction) {
    return;
  }
  try {
    const data = await appsFlyer.logEvent(eventName, eventValues || {});

    console.warn('appsFlyerLogEvent', eventName, JSON.stringify(eventValues), data);
  } catch (error: unknown) {
    console.error(error);
  }
};

export const appsFlyerSetUserData = (userId: string | number, email: string) => {
  if (!isProduction) {
    return;
  }
  try {
    if (userId) {
      appsFlyer.setCustomerUserId(String(userId), (result?: unknown) => {
        console.warn('appsFlyerSetUserData setCustomerUserId', userId, result);
      });
    }
    if (email) {
      appsFlyer.setUserEmails(
        {
          emailsCryptType: 0,
          emails: [email]
        },
        (result?: unknown) => {
          console.warn('appsFlyerSetUserData setUserEmails', email, result);
        },
        (error?: Error) => {
          console.error('appsFlyerSetUserData setUserEmails error', error);
        }
      );
    }
  } catch (error: unknown) {
    console.error(error);
  }
};

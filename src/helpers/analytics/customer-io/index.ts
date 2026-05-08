import { CustomerIO, CioConfig, CioLogLevel, CioRegion, CioPushPermissionStatus } from 'customerio-reactnative';
import { ClientData } from '@/store/api';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Config from 'react-native-config';

const { CUSTOMER_CDP_API_KEY, CUSTOMER_CDP_IN_APP_SITE_ID } = Config || {};

const options = { ios: { sound: true, badge: true } };

const msg = messaging();

export enum CustomerIOTrackEvents {
  QuestionnaireStarted = 'questionnaire_started',
  QuestionnaireCompleted = 'questionnaire_completed',
  SignUp = 'sign_up'
}

export const customerIoInit = async () => {
  const isCustomerIOInitialized = CustomerIO.isInitialized();

  if (isCustomerIOInitialized) {
    return;
  }

  try {
    const customerIoConfig: CioConfig = {
      cdpApiKey: CUSTOMER_CDP_API_KEY,
      region: CioRegion.EU,
      // logLevel: __DEV__ ? CioLogLevel.Debug : CioLogLevel.Error,
      logLevel: CioLogLevel.None,
      trackApplicationLifecycleEvents: true,
      autoTrackDeviceAttributes: true,
      inApp: {
        siteId: CUSTOMER_CDP_IN_APP_SITE_ID
      }
    };

    await CustomerIO.initialize(customerIoConfig);
  } catch (error: unknown) {
    console.error(error);
  }
};

const getRegisteredDevice = async () => {
  try {
    const fcmToken = await CustomerIO.pushMessaging.getRegisteredDeviceToken();
    console.warn('+++ getRegisteredDevice fcmToken: ', fcmToken);

    return true;
  } catch (error: unknown) {
    return false;
  }
};

export const identifyUser = async (userData: ClientData, cb?: () => void) => {
  const isCustomerIOInitialized = CustomerIO.isInitialized();

  if (!isCustomerIOInitialized || !userData) {
    return;
  }

  const { id, email, firstName, lastName } = userData || {};

  if (!id) {
    return;
  }

  const userId = String(id);

  try {
    await CustomerIO.identify({
      userId,
      traits: {
        id: userId,
        email,
        firstName,
        lastName
      }
    });

    console.log('User identification successfully');

    const status = (await CustomerIO.pushMessaging.showPromptForPushNotifications(options)) as CioPushPermissionStatus;

    console.warn('+++ identifyUser showPromptForPushNotifications status: ', status);

    const isDeviceRegistered = await getRegisteredDevice();

    if (isDeviceRegistered || status !== CioPushPermissionStatus.Granted) {
      return;
    }

    const fcmToken = await msg.getToken();

    if (!fcmToken) {
      return;
    }

    console.warn('+++ identifyUser fcmToken: ', fcmToken);

    await CustomerIO.registerDeviceToken(fcmToken);

    console.warn('+++ registerDeviceToken fcmToken: ', fcmToken);

    cb?.();
  } catch (error) {
    console.error('Error identifying user:', error);
  }
};

export const trackSignUpCustomerIO = async () => {
  const isCustomerIOInitialized = CustomerIO.isInitialized();

  if (!isCustomerIOInitialized) {
    return;
  }

  try {
    await CustomerIO.track(CustomerIOTrackEvents.SignUp, {
      source: 'app',
      platform: Platform.OS
    });
    console.log('tracking user registration customerIO successfully');
  } catch (error) {
    console.error('customer IO error', error);
  }
};

export const clearUserIdentification = async () => {
  const isCustomerIOInitialized = CustomerIO.isInitialized();

  if (!isCustomerIOInitialized) {
    return;
  }

  try {
    await CustomerIO.clearIdentify();
    console.log('User identification cleared successfully');
  } catch (error) {
    console.error('Error clearing user identification:', error);
  }
};

export const trackQuestionnaireCustomerIO = async (isFirst?: boolean) => {
  const isCustomerIOInitialized = CustomerIO.isInitialized();

  if (!isCustomerIOInitialized) {
    return;
  }

  try {
    const event = isFirst ? CustomerIOTrackEvents.QuestionnaireStarted : CustomerIOTrackEvents.QuestionnaireCompleted;
    await CustomerIO.track(event);
  } catch (error) {
    console.error('customer IO error', error);
  }
};

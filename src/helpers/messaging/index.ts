import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { config } from '@/constants';

const { isAndroid, isIOS } = config || {};

const msg = messaging();

export enum NotificationChannel {
  id = 'default',
  name = 'Default Channel'
}

export interface CIOMessageData {
  push: {
    link: string;
  };
}

export interface MessageData {
  title: string;
  body: string;
  link?: string;
  CIO?: CIOMessageData;
}

export interface DataFromMessage {
  title: string;
  body: string;
  link?: string;
}

export const getDataFromMessage = (message: FirebaseMessagingTypes.RemoteMessage | null): DataFromMessage | {} => {
  if (!message) {
    return {};
  }

  const { data = {}, notification = {} } = message || {};
  const { body: notificationBody = '', title: notificationTitle = '' } = notification || {};
  const { body: messageBody = '', title: messageTitle = '', link: androidLink, CIO } = data || ({} as MessageData);
  const { push } = (CIO || {}) as CIOMessageData;
  const { link: iosLink } = push || {};

  return {
    title: (notificationTitle || messageTitle) as string,
    body: (notificationBody || messageBody) as string,
    link: (androidLink || iosLink) as string | undefined
  };
};

export const foregroundMessageHandler = () => {
  msg.onMessage((message: FirebaseMessagingTypes.RemoteMessage) => {
    console.warn('@Foreground Message Handler message: ', message);

    const { body, title, link } = getDataFromMessage(message) as DataFromMessage;

    if (!title && !body) {
      return;
    }

    displayNotification(body as string, title as string, link as string | undefined);
  });
};

export const backgroundMessageHandler = async (message: FirebaseMessagingTypes.RemoteMessage) => {
  console.warn('@Background Message Handler', message);

  const { notification = {} } = message || {};

  const isNotification = Boolean(notification && Object.keys(notification) && Object.keys(notification).length > 0);

  if (isNotification) {
    console.warn('@Background Message Handler NOTIFICATION');
    return;
  }

  console.warn('@Background Message Handler MESSAGE');

  const { body, title, link } = getDataFromMessage(message) as DataFromMessage;

  if (!title && !body) {
    return;
  }

  displayNotification(body as string, title as string, link as string | undefined);
};

export const displayNotification = async (title: string, body: string, link?: string) => {
  console.warn('@Display Notification', title, body, link);

  try {
    let pushData = {};

    if (isAndroid) {
      const channelId = await notifee.createChannel({
        id: NotificationChannel.id,
        name: NotificationChannel.name
      });
      console.warn('+++ FCM. channelId: ', channelId);

      pushData = {
        android: {
          smallIcon: 'ic_launcher_round',
          channelId,
          pressAction: {
            id: 'default'
          }
        }
      };
    }

    if (isIOS) {
      pushData = {
        ios: {
          sound: 'default'
        }
      };
    }

    console.warn('+++ FCM. displayNotification body: ', {
      title,
      body,
      data: {
        ...(link && { link })
      },
      ...pushData
    });

    await notifee.displayNotification({
      title,
      body,
      data: {
        ...(link && { link })
      },
      ...pushData
    });
  } catch (err: unknown) {
    console.warn('+++ FCM. displayNotification error: ', err);
  }
};

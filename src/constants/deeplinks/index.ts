import { Linking } from 'react-native';
import Config from 'react-native-config';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { COMMON_ROUTE_NAMES, AUTH_ROUTE_NAMES, MARKETS_ROUTE_NAMES } from '@/navigation/app/stacks';
import notifee, { EventType, Event } from '@notifee/react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { LinkingOptions, ParamListBase, PathConfigMap } from '@react-navigation/native';
import { getDataFromMessage, DataFromMessage } from '@/helpers';

const { DEEPLINKING_PREFIX_PROD, DEEPLINKING_PREFIX_DEV, DEEPLINKING_PREFIX_QA, DEEPLINKING_PREFIX_SHORT } =
  Config || {};

const prefixes = [DEEPLINKING_PREFIX_PROD, DEEPLINKING_PREFIX_DEV, DEEPLINKING_PREFIX_QA, DEEPLINKING_PREFIX_SHORT];

const msg = messaging();

const normalizeUrl = (url: string) => {
  const assetCollectionsDetailsRegex = new RegExp(
    `^${DEEPLINKING_PREFIX_SHORT}article/asset-collections/([0-9]+)$`,
    'i'
  );
  const marketPulseDetailsRegex = new RegExp(`^${DEEPLINKING_PREFIX_SHORT}article/market-pulse/([0-9]+)$`, 'i');

  const transactionDetailsRegex = new RegExp(`^${DEEPLINKING_PREFIX_SHORT}transaction/([0-9]+)$`, 'i');
  const transferDetailsRegex = new RegExp(`^${DEEPLINKING_PREFIX_SHORT}transfer/([0-9]+)$`, 'i');

  const assetDetailsRegex = new RegExp(`^${DEEPLINKING_PREFIX_SHORT}asset/(.*)$`, 'i');
  const signalDetailsRegex = new RegExp(`^${DEEPLINKING_PREFIX_SHORT}signal/(.*)$`, 'i');

  const partnerGoProdRegex = new RegExp(`^${DEEPLINKING_PREFIX_PROD}/links/go/([0-9]+)$`, 'i');
  const partnerGoQaRegex = new RegExp(`^${DEEPLINKING_PREFIX_QA}/links/go/([0-9]+)$`, 'i');
  const partnerGoDevRegex = new RegExp(`^${DEEPLINKING_PREFIX_DEV}/links/go/([0-9]+)$`, 'i');

  if (partnerGoProdRegex.test(url) || partnerGoQaRegex.test(url) || partnerGoDevRegex.test(url)) {
    const partnerGoData = url.match(partnerGoProdRegex) || url.match(partnerGoQaRegex) || url.match(partnerGoDevRegex);

    if (partnerGoData && partnerGoData[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}register/${partnerGoData[1]}`;
    }
  }

  if (assetCollectionsDetailsRegex.test(url)) {
    const assetCollectionsDetailsData = url.match(assetCollectionsDetailsRegex);
    if (assetCollectionsDetailsData && assetCollectionsDetailsData[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}article/asset-details/true/${assetCollectionsDetailsData[1]}`;
    }
  }

  if (marketPulseDetailsRegex.test(url)) {
    const marketPulseDetailsData = url.match(marketPulseDetailsRegex);
    if (marketPulseDetailsData && marketPulseDetailsData[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}article/asset-details/false/${marketPulseDetailsData[1]}`;
    }
  }

  if (transactionDetailsRegex.test(url)) {
    const transactionDetailsData = url.match(transactionDetailsRegex);
    if (transactionDetailsData && transactionDetailsData[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}recentActivity/false/${transactionDetailsData[1]}`;
    }
  }

  if (transferDetailsRegex.test(url)) {
    const transferDetailsData = url.match(transferDetailsRegex);
    if (transferDetailsData && transferDetailsData[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}recentActivity/true/${transferDetailsData[1]}`;
    }
  }

  if (assetDetailsRegex.test(url)) {
    const assetDetailsData = url.match(assetDetailsRegex);
    if (assetDetailsData && assetDetailsData[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}asset/${assetDetailsData[1]}`;
    }
  }

  if (signalDetailsRegex.test(url)) {
    const signalDetailsData = url.match(signalDetailsRegex);
    if (signalDetailsData && signalDetailsData[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}signal/${signalDetailsData[1]}`;
    }
  }

  const verifyEmailValidateProdRegex = new RegExp(
    `^${DEEPLINKING_PREFIX_PROD}/?profile/verify-email/validate/([^/]+)$`,
    'i'
  );

  const verifyEmailValidateQaRegex = new RegExp(
    `^${DEEPLINKING_PREFIX_QA}/?profile/verify-email/validate/([^/]+)$`,
    'i'
  );

  const verifyEmailValidateDevRegex = new RegExp(
    `^${DEEPLINKING_PREFIX_DEV}/?profile/verify-email/validate/([^/]+)$`,
    'i'
  );

  const verifyEmailValidateShortRegex = new RegExp(
    `^${DEEPLINKING_PREFIX_SHORT}/?profile/verify-email/validate/([^/]+)$`,
    'i'
  );

  if (
    verifyEmailValidateProdRegex.test(url) ||
    verifyEmailValidateQaRegex.test(url) ||
    verifyEmailValidateDevRegex.test(url) ||
    verifyEmailValidateShortRegex.test(url)
  ) {
    const m =
      url.match(verifyEmailValidateProdRegex) ||
      url.match(verifyEmailValidateQaRegex) ||
      url.match(verifyEmailValidateDevRegex) ||
      url.match(verifyEmailValidateShortRegex);

    if (m && m[1]) {
      return `${DEEPLINKING_PREFIX_SHORT}profile/verify-email/validate/false/${m[1]}`;
    }
  }

  // const assetCategoryRegex = new RegExp(`^${DEEPLINKING_PREFIX_SHORT}assetCategory/(.+)$`, 'i');

  // if (assetCategoryRegex.test(url)) {
  //   const assetCategoryData = url.match(assetCategoryRegex);
  //   if (assetCategoryData && assetCategoryData[1]) {
  //     return `${DEEPLINKING_PREFIX_SHORT}assetCategory/${assetCategoryData[1]}`;
  //   }
  // }

  switch (url) {
    case `${DEEPLINKING_PREFIX_SHORT}verifyEmail`:
      return `${DEEPLINKING_PREFIX_SHORT}profile/verify-email/validate/true`;

    case `${DEEPLINKING_PREFIX_SHORT}article/asset-collections`:
      return `${DEEPLINKING_PREFIX_SHORT}article/asset-collections/true`;

    case `${DEEPLINKING_PREFIX_SHORT}article/market-pulse`:
      return `${DEEPLINKING_PREFIX_SHORT}article/asset-collections/false`;

    case `${DEEPLINKING_PREFIX_SHORT}deposit`:
    case `${DEEPLINKING_PREFIX_PROD}/deposit`:
    case `${DEEPLINKING_PREFIX_QA}/deposit`:
    case `${DEEPLINKING_PREFIX_DEV}/deposit`:
      return `${DEEPLINKING_PREFIX_SHORT}deposit/true`;

    case `${DEEPLINKING_PREFIX_SHORT}verificationProgress`:
      return `${DEEPLINKING_PREFIX_PROD}/profile/verify-email/validate`;

    default:
      return url;
  }
};

const notifeeOnEvent = async (event: Event, listener: (url: string) => void) => {
  const { type, detail } = event || {};

  console.error('@COMMON notifeeOnEvent', event);

  if (!(type === EventType.PRESS)) {
    return;
  }

  const { notification = {} } = detail || {};
  const { data = {} } = notification || {};
  const { link } = data || {};

  if (!link) {
    return;
  }

  const url = normalizeUrl(link as string);

  listener(url);
};

const config: {
  initialRouteName?: keyof RootRootParamsList;
  screens: PathConfigMap<RootRootParamsList>;
} = {
  screens: {
    [ROOT_ROUTE_NAMES.App]: {
      screens: {
        [APP_ROUTE_NAMES.Markets]: {
          screens: {
            [MARKETS_ROUTE_NAMES.Markets]: {
              path: 'assetCategory/:assetCategory',
              exact: true,
              parse: {
                assetCategory: (value: string) => (value ? decodeURIComponent(value).replaceAll('_', ' ') : '')
              }
            }
          }
        }
      }
    },
    [ROOT_ROUTE_NAMES.PromotionDetails]: {
      path: 'promo/:promotionId',
      exact: true,
      parse: {
        promotionId: (value) => Number(value)
      }
    },
    [ROOT_ROUTE_NAMES.PositionInfo]: {
      path: 'closedPosition/:accountId/:closedPositionId',
      exact: true,
      parse: {
        closedPositionId: (value) => Number(value),
        accountId: (value) => Number(value)
      }
    },
    [ROOT_ROUTE_NAMES.RecentActivityDetails]: {
      path: 'recentActivity/:isTransfer/:activityId',
      exact: true,
      parse: {
        isTransfer: (value) => (value === 'true' ? true : false),
        activityId: (value) => String(value)
      }
    },
    [ROOT_ROUTE_NAMES.SignalDetails]: {
      path: 'signal/:asset',
      exact: true,
      parse: {
        asset: (value) => String(value)
      }
    },
    [ROOT_ROUTE_NAMES.AssetDetails]: {
      path: 'asset/:asset',
      exact: true,
      parse: {
        asset: (value) => String(value)
      }
    },
    [ROOT_ROUTE_NAMES.WidgetList]: {
      path: 'article/asset-collections/:isInvestment',
      exact: true,
      parse: {
        isInvestment: (value) => (value === 'true' ? true : false)
      }
    },
    [ROOT_ROUTE_NAMES.WidgetArticle]: {
      path: 'article/asset-details/:isInvestment/:id?',
      exact: true,
      parse: {
        isInvestment: (value) => (value === 'true' ? true : false),
        id: (value) => Number(value)
      }
    },
    [ROOT_ROUTE_NAMES.Deposit]: {
      path: 'deposit/:isDeposit',
      exact: true,
      parse: {
        isDeposit: () => true
      }
    },
    [ROOT_ROUTE_NAMES.EmailVerification]: {
      path: 'profile/verify-email/validate/:autoVerify?/:hash?',
      exact: true,
      parse: {
        autoVerify: (value: string | undefined) => value === 'true',
        hash: (value: string | undefined) => value
      }
    },
    [ROOT_ROUTE_NAMES.Auth]: {
      screens: {
        [AUTH_ROUTE_NAMES.BonusSignUp]: {
          path: 'register/:goID'
        }
      }
    },
    [ROOT_ROUTE_NAMES.Common]: {
      screens: {
        [COMMON_ROUTE_NAMES.LinkedAccounts]: {
          path: 'connect/service/facebook'
        }
      }
    }
  }
};

const deeplinks: LinkingOptions<ParamListBase> = {
  prefixes,
  config,
  async getInitialURL() {
    const initialUrl = await Linking.getInitialURL();

    console.error('@COMMON getInitialURL', initialUrl, initialUrl && normalizeUrl(initialUrl));

    if (initialUrl != null) {
      return normalizeUrl(initialUrl);
    }

    const notifeeMessage = await notifee.getInitialNotification();

    console.error('@COMMON notifeeMessage', notifeeMessage);

    const { notification = {} } = notifeeMessage || {};
    const { data = {} } = notification || {};
    const { link: notifeeLink } = data || {};

    const initialMessage = await msg.getInitialNotification();

    const { link: initialMessageLink } = getDataFromMessage(initialMessage) as DataFromMessage;

    console.error('@COMMON initialMessage', initialMessage);

    const link = notifeeLink || initialMessageLink;

    console.error('@COMMON link', link);

    if (!link) {
      return;
    }

    const url = normalizeUrl(link as string);

    return url;
  },
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => {
      console.error('@COMMON onReceiveURL', url, url && normalizeUrl(url));

      listener(normalizeUrl(url));
    };

    const unsubscribeLinking = Linking.addEventListener('url', onReceiveURL);

    const unsubscribeNotificationOpenedApp = msg.onNotificationOpenedApp(
      (message: FirebaseMessagingTypes.RemoteMessage) => {
        const { link } = getDataFromMessage(message) as DataFromMessage;

        console.error('@COMMON onNotificationOpenedApp', link, message);

        if (!link) {
          return;
        }

        const url = normalizeUrl(link as string);

        listener(url);
      }
    );

    notifee.onBackgroundEvent(async (event: Event) => await notifeeOnEvent(event, listener));

    const unsubscribeForegroundNotification = notifee.onForegroundEvent((event: Event) =>
      notifeeOnEvent(event, listener)
    );

    return () => {
      unsubscribeLinking.remove();
      unsubscribeForegroundNotification();
      unsubscribeNotificationOpenedApp();
    };
  }
};

export default deeplinks;

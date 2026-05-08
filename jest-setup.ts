import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');

  return {
    ...actualNav,
    useNavigation: jest.fn(),
    useIsFocused: jest.fn(() => true),
    useTheme: () => {
      const theme = require('@/constants/theme').default;
      return theme.lightTheme;
    },
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
    useFocusEffect: jest.fn(),
    useRoute: jest.fn()
  };
});

jest.mock('@react-navigation/stack', () => {
  return {
    createStackNavigator: jest.fn().mockReturnValue({
      Navigator: jest.fn(),
      Screen: jest.fn()
    })
  };
});

jest.mock('@react-navigation/material-top-tabs', () => {
  return {
    createMaterialTopTabNavigator: jest.fn().mockReturnValue({
      Navigator: jest.fn(),
      Screen: jest.fn()
    })
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: jest.fn().mockReturnValue({
      Navigator: jest.fn(),
      Screen: jest.fn()
    })
  };
});

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(() => ({
    isConnected: true
  }))
}));

jest.mock('react-native-wagmi-charts', () => ({
  LineChart: () => null
}));

jest.mock('d3-shape', () => ({
  arc: jest.fn()
}));

// Mock the Intercom module
jest.mock('@intercom/intercom-react-native', () => ({
  UNREAD_COUNT_CHANGE_NOTIFICATION: 'UNREAD_COUNT_CHANGE_NOTIFICATION'
}));

// Mock the actions object
jest.mock('@/store', () => ({
  actions: {
    wallet: {
      useGetWalletAccountsMutation: jest.fn(),
      useGetTradingAccountsMutation: jest.fn(),
      useCreateNewAccount: jest.fn()
    },
    sumSub: {
      useSumSubStatus: jest.fn(),
      useSumSubToken: jest.fn()
    },
    common: {
      useGetConfigQuery: jest.fn(),
      setUserLoggedInBefore: jest.fn()
    },
    profile: {
      useSocialConnect: jest.fn(),
      useSocialDisconnect: jest.fn(),
      useUpdateCustomFields: jest.fn()
    },
    verification: {
      startCountdown: jest.fn(),
      decrementRemainingSeconds: jest.fn(),
      resetCountdown: jest.fn(),
      useVerifyEmail: jest.fn(),
      useVerifyEmailValidate: jest.fn()
    },
    auth: {
      useSignIn: jest
        .fn()
        .mockReturnValue([
          jest.fn().mockResolvedValue({ data: { client: { id: '123' } } }),
          { isLoading: false, isSuccess: false, isError: false }
        ]),
      useForgotPassword: jest.fn(() => [jest.fn(), {}]),
      setIntercomLoggedIn: jest.fn(),
      useResetPassword: () => [jest.fn(), { isLoading: false, isSuccess: false, isError: false }]
    },
    application: {
      openModal: jest.fn()
    },
    ideasHub: {
      useInvestmentIdeasQuery: jest.fn()
    },
    market: {
      useCandlesHistoryQuery: jest.fn(),
      useGetRecentActivitiesMutation: jest.fn()
    },
    portfolio: {
      useGetDealsAccountsQuery: jest.fn(),
      resetDealsInfo: jest.fn(),
      setActiveTab: jest.fn(),
      setHasLastDeal: jest.fn()
    },
    legalDocuments: {
      setSampleDocuments: jest.fn()
    },
    useGetDealsAccountsQuery: () => [jest.fn()],
    useGetSymbolsQuery: () => [jest.fn(), { isFetching: false }],
    useGetCategoriesQuery: () => [jest.fn()]
  }
}));

jest.mock('@sumsub/react-native-mobilesdk-module', () => ({
  NativeEventEmitter: jest.fn(),
  NativeModules: jest.fn()
}));

// Mock the react-native-branch module
jest.mock('react-native-branch', () => ({
  BranchEvent: jest.fn(),
  STANDARD_EVENT_ADD_TO_CART: 'STANDARD_EVENT_ADD_TO_CART'
}));

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: ({ children }: { children: any }) => children
}));

jest.mock('react-native-webview', () => ({
  WebView: () => null
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn()
}));

jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn()
}));

jest.mock('query-string', () => ({
  parse: jest.fn(),
  stringify: jest.fn()
}));

jest.mock('@react-native-cookies/cookies', () => ({
  get: jest.fn(),
  set: jest.fn(),
  clearAll: jest.fn()
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    isSignedIn: jest.fn(),
    getCurrentUser: jest.fn(),
    getTokens: jest.fn()
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'
  }
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  crashlytics: {
    log: jest.fn(),
    recordError: jest.fn()
  }
}));

jest.mock('@react-native-firebase/analytics', () => {
  return () => ({
    logEvent: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
    logScreenView: jest.fn()
  });
});

jest.mock('@react-native-firebase/firestore', () => {
  return () => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    onSnapshot: jest.fn()
  });
});

jest.mock('mixpanel-react-native', () => {
  const Mixpanel = jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    setLoggingEnabled: jest.fn(),
    registerSuperProperties: jest.fn(),
    identify: jest.fn().mockResolvedValue(undefined),
    getPeople: jest.fn(() => ({ set: jest.fn() })),
    track: jest.fn(),
    timeEvent: jest.fn(),
    reset: jest.fn(),
    flush: jest.fn()
  }));
  return { Mixpanel };
});

jest.mock('react-native-appsflyer', () => ({
  initSdk: jest.fn(),
  logEvent: jest.fn(),
  setCustomerUserId: jest.fn(),
  getAppsFlyerUID: jest.fn(() => 'mock-appsflyer-uid'),
  onInstallConversionData: jest.fn(),
  onDeepLink: jest.fn(),
  setDebug: jest.fn()
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const { EventEmitter } = require('events');
  return EventEmitter;
});

const createMockActions = (actionStructure: any) => {
  const mocked: any = {};
  for (const key in actionStructure) {
    if (typeof actionStructure[key] === 'object') {
      mocked[key] = createMockActions(actionStructure[key]);
    } else {
      mocked[key] = jest.fn();
    }
  }
  return mocked;
};

jest.mock('@notifee/react-native', () => {
  return {
    onBackgroundEvent: jest.fn(),
    onForegroundEvent: jest.fn(),
    displayNotification: jest.fn(),
    createChannel: jest.fn(),
    requestPermission: jest.fn(),
    getInitialNotification: jest.fn(),
    EventType: {},
    Event: {}
  };
});

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn(),
  configureScope: jest.fn()
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 47 })
}));

jest.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (key: string) => key.split('.').pop(),
      i18n: { changeLanguage: () => new Promise(() => {}) }
    }),
    initReactI18next: {
      type: '3rdParty',
      init: jest.fn()
    }
  };
});

jest.mock('@/helpers', () => ({
  capitalizeWord: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
  rgba: (color: string, alpha?: number) => {
    const hex = color.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const a = alpha !== undefined && alpha >= 0 && alpha <= 100 ? alpha / (alpha ? 100 : 1) : 1;
    return `rgba(${r},${g},${b},${a})`;
  },
  formatTwoDecimals: (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return Number(num).toFixed(2);
  },
  jsonParse: (value: any) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },
  WS: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    onOpen: jest.fn(),
    onMessage: jest.fn(),
    onError: jest.fn(),
    onClose: jest.fn()
  })),
  getAssetName: (str: string | undefined): string => {
    if (!str) return '';
    const dotIndex = str.indexOf('.');
    return dotIndex === -1 ? str : str.slice(0, dotIndex);
  }
}));

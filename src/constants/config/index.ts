import { Platform, I18nManager, Dimensions } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import Config from 'react-native-config';

const { APP_ENV, MAJOR_VERSION, MINOR_VERSION, PATCH_VERSION, ANDROID_VERSION_CODE, IOS_VERSION_CODE } = Config || {};

const config = {
  mode: APP_ENV || 'development',
  isDevelopment: APP_ENV === 'development',
  isTesting: APP_ENV === 'testing',
  isStaging: APP_ENV === 'staging',
  isProduction: APP_ENV === 'production',
  isRTL: I18nManager.isRTL,
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  platformVersion: Platform.Version,
  androidAppVersion: `${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}`,
  iosAppVersion: `${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}`,
  androidVersionCode: ANDROID_VERSION_CODE,
  iosVersionCode: IOS_VERSION_CODE,
  screenHeight,
  screenWidth,
  platform: {
    os: Platform.OS,
    version: Platform.Version
  },
  shadowColor: '#8A9092', //@@@ In case of different implementation of box-shadow on the website and in the app, this color should be used in the app instead of the #D9E1E4 color from Figma (discussed with the designer).
  headerBar: {
    height: 44,
    buttons: {
      activeOpacity: 0.9,
      hitSlop: 8
    }
  },
  bottomBar: {
    height: 56,
    buttons: {
      activeOpacity: 0.9
    }
  },
  components: {
    cards: {
      activeOpacity: 0.9,
      hitSlop: 0
    },
    buttons: {
      activeOpacity: 0.75,
      hitSlop: 8
    },
    inputs: {
      buttons: {
        activeOpacity: 0.75,
        hitSlop: 4
      }
    },
    links: {
      activeOpacity: 0.75,
      hitSlop: 8
    }
  },
  common: {
    activeOpacity: 1
  },
  buttons: {
    activeOpacity: 0.75
  },
  animation: {
    duration: 250,
    speed: 50
  },
  fonts: {
    spaceGrotesk: {
      light: 'SpaceGrotesk-Light',
      regular: 'SpaceGrotesk-Regular',
      medium: 'SpaceGrotesk-Medium',
      semiBold: 'SpaceGrotesk-SemiBold',
      bold: 'SpaceGrotesk-Bold'
    },
    generalSans: {
      regular: 'GeneralSans-Regular',
      medium: 'GeneralSans-Medium',
      semiBold: 'GeneralSans-Semibold'
    },
    inter: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium'
    },
    unbounded: {
      medium: 'Unbounded-Medium'
    }
  },
  validation: {
    emailRegex: /^(?=.*[a-zA-Z])([a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
    questionnaireRegex: /^[A-Za-z0-9~`!@#$%^&*()_\-+={}|\\:;"'<,>.?\/ ]+$/,
    floatRegex: /^\d*\.?\d*$/,
    nameRegex: /^(?=(?:.*[a-zA-Z'-]){2,})[a-zA-Z\s'-]+$/
  },
  appLinks: {
    googleAuthAndroid: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en',
    googleAuthIOS: 'https://apps.apple.com/us/app/google-authenticator/id388497605'
  },
  recentActivity: {
    transactions: {
      createdAtKey: 'col_columndefinitions_createdatcolumndefinition_0d2ad97b4b4572c9c2ccfc9fae717cca'
    },
    transfers: {
      dateKey: 'col_44749712dbec183e983dcd78a7736c41'
    },
    cashback: {
      closeTimeKey: 'col_columndefinitions_closetime_2e87b6abd3fd37314a5c80bd8509ed2c'
    }
  }
};

export default config;

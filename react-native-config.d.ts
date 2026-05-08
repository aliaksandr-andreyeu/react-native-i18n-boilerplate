declare module 'react-native-config' {
  export interface NativeConfig {
    PRODUCT: string;
    APP_ENV: string;
    ANDROID_VERSION_CODE: number;
    IOS_VERSION_CODE: number;
    MAJOR_VERSION: number;
    MINOR_VERSION: number;
    PATCH_VERSION: number;
    DEEPLINKING_PREFIX_PROD: string;
    DEEPLINKING_PREFIX_DEV: string;
    DEEPLINKING_PREFIX_QA: string;
    DEEPLINKING_PREFIX_SHORT: string;
    DASHBOARD_URL: string;
    API_URL: string;
    API_URL_PORTFOLIO: string;
    CMS_URL: string;
    CMS_TOKEN: string;
    SUMSUB_URL: string;
    SUMSUB_TOKEN: string;
    SUMSUB_SECRET: string;
    ADJUST_TOKEN: string;
    CUSTOMER_API_URL: string;
    CUSTOMER_API_TOKEN: string;
    CUSTOMER_TRACK_API_URL: string;
    CUSTOMER_TRACK_API_KEY: string;
    CUSTOMER_TRACK_SITE_ID: string;
    CUSTOMER_CDP_API_KEY: string;
    CUSTOMER_CDP_IN_APP_SITE_ID: string;
    INTERCOM_ANDROID_SECRET: string;
    INTERCOM_IOS_SECRET: string;
    GOOGLE_WEB_CLIENT_ID: string;
    GOOGLE_IOS_CLIENT_ID: string;
    FACEBOOK_APP_ID: string;
    MT5_API_URL: string;
    WEBSOCKET_BASE_URL: string;
    MIN_INVESTMENT_AMOUNT: number;
    WALLET_TYPE_ID: number;
    LIVE_TYPE_ID: number;
    PRIMARY_TYPE_ID: number;
    MIXPANEL_TOKEN: string;
    POSTHOG_PROJECT_KEY: string;
    POSTHOG_API_HOST: string;
    WELCOME_TYPE_ID: number;
    PROMO_URL: string;
    SENTRY_DSN: string;
    CONTEST_TYPE_ID: string;
    DEMO_TYPE_ID: string;
    CASHBACK_TYPE_ID: string;
    CA_API_URL: string;
    AXIOM_TOKEN: string;
    AXIOM_DATASET: string;
    SERVER_API_TOKEN: string;
    APPSFLYER_DEV_KEY: string;
    APPSFLYER_APP_ID: string;
    PRIMARY_ACCOUNT_LEVERAGE: number;
    WALLET_LEVERAGE: number;
    FIRESTORE_DEPOSIT_COLLECTION: string;
    API_AMEGA_BASE_URL: string;
    PULSE_URL: string;
  }

  export const Config: NativeConfig;

  export default Config;
}

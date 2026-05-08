import Config from 'react-native-config';
import Sentry from '@sentry/react-native';

export const sentryConfig: Sentry.ReactNativeOptions = {
  dsn: Config.SENTRY_DSN,
  enableAutoSessionTracking: true,
  environment: Config.APP_ENV,
  debug: false,
  enableNative: true,
  enableNativeCrashHandling: true,
  enableNdkScopeSync: true, // https://docs.sentry.io/platforms/react-native/enriching-events/scopes/#scope-synchronization
  normalizeDepth: 5, // https://docs.sentry.io/platforms/react-native/configuration/options/#normalize-depth
  ignoreErrors: ['Network request failed'],
  profilesSampleRate: 1.0,
  enableUserInteractionTracing: true,
  attachScreenshot: true,
  attachThreads: true,
  attachStacktrace: true,
  attachViewHierarchy: true,
  autoSessionTracking: true,
  enableCaptureFailedRequests: true,
  enableTracing: true,
  tracesSampleRate: 0.8
};

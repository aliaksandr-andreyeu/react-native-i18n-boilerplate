import '@/localization';

import React, { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { enableScreens } from 'react-native-screens';
import { enableLayoutAnimations, ReanimatedLogLevel, configureReanimatedLogger } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Provider } from 'react-redux';
import Router from '@/navigation';
import { NetworkProvider, NavigationProvider } from '@/providers';
import { store } from '@/store';
import { config } from '@/constants';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import OrientationLocker from 'react-native-orientation-locker';
import { TrackingTransparency, ErrorBoundary } from '@/hoc';
import * as Sentry from '@sentry/react-native';
import { sentryConfig } from 'sentry.config.ts';
import { DevNetworkLoggerOverlay } from './components';

configureReanimatedLogger({ level: ReanimatedLogLevel.error });
Sentry.init(sentryConfig);

const { platformVersion, isAndroid } = config;

Animated.addWhitelistedNativeProps({ text: true });

const Application = () => {
  const enableAnimations = !Boolean(isAndroid && platformVersion === 23); //Fixed crash on Android 6

  useLayoutEffect(() => {
    OrientationLocker.lockToPortrait();

    LottieSplashScreen.hide();

    enableScreens(false); /*** Fixed Crash Related to RN-Reanimated ***/

    enableLayoutAnimations(enableAnimations);
  }, []);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <TrackingTransparency>
            <NavigationProvider>
              <ErrorBoundary>
                <NetworkProvider>
                  <Provider store={store}>
                    <Router />
                  </Provider>
                </NetworkProvider>
              </ErrorBoundary>
            </NavigationProvider>
          </TrackingTransparency>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    width: '100%',
    height: '100%',
    flex: 1,
    flexGrow: 1
  }
});

export default Sentry.wrap(Application);

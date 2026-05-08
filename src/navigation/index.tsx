import React, { useCallback, Fragment, useLayoutEffect, useRef, useEffect } from 'react';
import {
  StatusBar,
  Modal,
  ActivityIndicator,
  View,
  ViewStyle,
  StyleSheet,
  useColorScheme,
  AppStateStatus,
  AppState
} from 'react-native';
import AppNavigation from './app';
import { BaseLoader, BaseModal } from '@/components';
import { theme, config } from '@/constants';
import { Analytics, DataState } from '@/hoc';
import { useAppSelector, useAppRefreshToken } from '@/hooks';
import { foregroundMessageHandler } from '@/helpers';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import firebaseAnalyticsInstance from '@/helpers/analytics/firebase';
import { FIREBASE_ANALYTICS_EVENTS } from '@/helpers/analytics/firebase/const';
import { PostHogProvider } from 'posthog-react-native';
import { ToastProvider, navigationRef } from '@/providers';
import Config from 'react-native-config';

const { POSTHOG_PROJECT_KEY, POSTHOG_API_HOST } = Config || {};

const { isIOS } = config;

const Router = () => {
  useAppRefreshToken();

  const auth = useAppSelector((state) => state.auth);
  const modalConfig = useAppSelector((state) => state.application.modalConfig);
  const { accessToken } = auth || {};

  const lastState = useRef<AppStateStatus>(AppState.currentState);
  const didLogColdStart = useRef(false);

  const isLoading = Boolean(accessToken === undefined);

  const { lightTheme, darkTheme } = theme;
  const scheme = useColorScheme();

  const currentTheme = scheme === 'dark' ? darkTheme : lightTheme;

  const { colors, palette } = currentTheme;

  useLayoutEffect(() => {
    foregroundMessageHandler();
    return () => {
      foregroundMessageHandler();
    };
  }, []);

  useEffect(() => {
    // Cold start
    if (!didLogColdStart.current) {
      didLogColdStart.current = true;
      firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.APP_OPENED, { source: 'cold_start' });
    }

    const sub = AppState.addEventListener('change', (next) => {
      const prev = lastState.current;
      lastState.current = next;

      // Resume → became active from background/inactive
      if ((prev === 'background' || prev === 'inactive') && next === 'active') {
        firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.APP_OPENED, { source: 'resume' });
      }

      // Closed → leaving active to inactive/background
      if (prev === 'active' && (next === 'inactive' || next === 'background')) {
        firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.APP_CLOSED);
      }
    });

    return () => sub.remove();
  }, []);

  const Routing = useCallback(() => {
    if (isLoading) {
      return <BaseLoader active={isLoading} />;
    }
    return (
      <Fragment>
        <StatusBar barStyle='dark-content' backgroundColor={colors.background} />
        <AppNavigation />
      </Fragment>
    );
  }, [colors, isLoading]);

  const Loader = useCallback(() => {
    const size = isIOS ? 'small' : 'large';
    const onRequestClose = () => false;
    return (
      <Modal animationType='none' transparent={true} visible={true} onRequestClose={onRequestClose}>
        <View style={[styles.loader, { backgroundColor: palette.base.white }]}>
          <ActivityIndicator color={palette.graphite['900']} size={size} animating={true} />
        </View>
      </Modal>
    );
  }, [palette]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_PROJECT_KEY}
      autocapture={{
        navigationRef,
        captureTouches: true,
        captureScreens: true,
        ignoreLabels: ['ph-no-capture'],
        noCaptureProp: 'phNoCapture'
      }}
      options={{
        host: POSTHOG_API_HOST,
        enableSessionReplay: true,
        captureAppLifecycleEvents: true,
        sessionReplayConfig: {
          maskAllTextInputs: false, // enabled only for production
          maskAllImages: false, // enabled only for production
          maskAllSandboxedViews: false, // iOS only
          captureLog: true, // Android only (Logcat metadata)
          captureNetworkTelemetry: true, // iOS only (status/timings, no bodies)
          androidDebouncerDelayMs: 1000,
          iOSdebouncerDelayMs: 1000
        }
      }}
      // debug={__DEV__}
      debug={false}
    >
      <Analytics>
        <DataState>
          <ToastProvider>
            <BottomSheetModalProvider>
              <Routing />
              <BaseModal config={modalConfig} />
            </BottomSheetModalProvider>
          </ToastProvider>
        </DataState>
      </Analytics>
    </PostHogProvider>
  );
};

interface Styles {
  loader: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  }
});
export default Router;

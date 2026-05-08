import React, { createContext, FC, useRef, ReactNode, useEffect, useContext, useState, useMemo } from 'react';
import { AppState, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { rgba, WS } from '@/helpers';
import { config, websocketUrls } from '@/constants';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const {
  isDevelopment,
  fonts: { generalSans },
  animation: { duration }
} = config;

type NetworkContextInterface = {
  isReadyState: boolean;
  websocket: WS;
  appState: boolean;
  isConnected: boolean | null;
};

type Props = {
  children?: ReactNode;
};

let timeout: ReturnType<typeof setTimeout> | undefined;

const websocket = new WS();

const NetworkContext = createContext<NetworkContextInterface>({
  isReadyState: false,
  websocket: { ws: null } as WS,
  appState: false,
  isConnected: null
});

export const NetworkProvider: FC<Props> = ({ children }) => {
  if (!children) {
    return null;
  }

  const appState = useRef<string>(AppState.currentState);

  const [appStateVisible, setAppStateVisible] = useState(Boolean(appState.current === 'active'));
  const [isReadyState, setReadyState] = useState<boolean>(false);

  const netInfo = useNetInfo();
  const { isConnected = null } = netInfo || {};

  const { t } = useTranslation();

  const appStateHandler = (nextState: string) => {
    appState.current = nextState;
    setAppStateVisible(Boolean(appState.current === 'active'));
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', appStateHandler);
    return () => {
      subscription.remove();
    };
  }, []);

  const onSocketClosed = () => {
    setReadyState(false);

    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      makeSocketConnection();
    }, 250);
  };

  const onSocketOpened = () => {
    const { ws } = websocket || {};
    const { readyState } = ws || {};



    if (!Boolean(readyState === 1)) {
      return;
    }

    setReadyState(true);
  };

  const closeSocketConnection = () => {
    setReadyState(false);

    timeout && clearTimeout(timeout);
    websocket.close();
  };

  const makeSocketConnection = () => {
    if (!isConnected || !appStateVisible) {
      return;
    }
    websocket.init(websocketUrls.tickersPrices, onSocketOpened, onSocketClosed, onSocketClosed);
  };

  useEffect(() => {
    makeSocketConnection();
    return () => {
      closeSocketConnection();
    };
  }, [isConnected, appStateVisible]);

  const message = useMemo(() => {
    const msg = isConnected === false ? t('messages.no-network-connection') : null;

    if (!msg) {
      return null;
    }

    return (
      <Animated.View
        key={'network-message'}
        entering={FadeIn.duration(duration)}
        exiting={FadeOut.duration(duration)}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.message}>{msg}</Text>
        </View>
      </Animated.View>
    );
  }, [isConnected, t, styles]);

  const websocketIndicator = useMemo(() => {
    if (!isDevelopment) {
      return null;
    }
    const { ws } = websocket || {};
    const indicatorStyle =
      ws !== null && !isReadyState ? styles.connecting : ws !== null && isReadyState ? styles.ready : undefined;
    return (
      <Animated.View
        key={'websocket-indicator'}
        entering={FadeIn.duration(duration)}
        exiting={FadeOut.duration(duration)}
        style={[styles.indicator, indicatorStyle]}
      />
    );
  }, [styles, websocket, isReadyState]);

  return (
    <NetworkContext.Provider
      value={{
        websocket,
        isReadyState,
        appState: appStateVisible,
        isConnected
      }}
    >
      {children}
      {websocketIndicator}
      {message}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  message: TextStyle;
  indicator: ViewStyle;
  connecting: ViewStyle;
  ready: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  content: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: rgba('#000000', 60),
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  message: {
    fontSize: 14,
    fontFamily: generalSans.medium,
    color: rgba('#ffffff', 90),
    textAlign: 'center'
  },
  indicator: {
    position: 'absolute',
    top: 16,
    right: 56,
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: 'red'
  },
  connecting: {
    backgroundColor: 'orange'
  },
  ready: {
    backgroundColor: 'green'
  }
});

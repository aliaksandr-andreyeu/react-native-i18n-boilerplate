import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as signalR from '@microsoft/signalr';
import { createPulseConnection } from '@/helpers/pulse/socket';
import { ParsedTopPerformer, TopPerformer } from '@/store/api/pulse/types';
import { topPerformerSocketParser } from '@/store/api/pulse/parsers';
import { useAppSelector } from '../store';
import { SymbolConfig, SymbolLastTick } from '@/types';
import { useGetSymbolConfigMutation, useGetSymbolLastTickQuery } from '@/store/api';

export type PulseEventType = 'OnTopPerformerUpdate' | 'OnTopSignalUpdate';

interface SocketTopPerformer extends TopPerformer {
  type: PulseEventType;
  id: string;
}

export interface PulseMessage {
  topPerformer: SocketTopPerformer;
}

type Status = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

interface UsePulseHubOptions {
  autoReconnectOnForeground?: boolean;
  stopOnUnmount?: boolean;
}

const MAX_ITEMS = 30;
const KEEP_LAST = 16;

export const usePulseHub = (options?: UsePulseHubOptions) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<unknown>(null);
  const [performerUpdates, setPerformerUpdates] = useState<ParsedTopPerformer[]>([]);

  const [getSymbolLastTick] = useGetSymbolLastTickQuery();
  const [getSymbolConfig] = useGetSymbolConfigMutation();

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isStartingRef = useRef(false);

  const tradingAccount = useAppSelector((store) => store.wallet.accounts.trading);
  const accessToken = useAppSelector((store) => store.auth.accessToken);
  const isAuthorized = !!accessToken;

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const configCacheRef = useRef<Map<string, string>>(new Map());

  const tickInflightRef = useRef<Map<string, Promise<SymbolLastTick | null>>>(new Map());

  const fetchLastTick = useCallback(
    (symbol: string) => {
      const key = symbol;

      const existingPromise = tickInflightRef.current.get(key);
      if (existingPromise) return existingPromise;

      const promise = getSymbolLastTick({
        accountId: +(tradingAccount?.login || 0),
        symbol
      })
        .unwrap()
        .then((res) => res as SymbolLastTick)
        .catch(() => null)
        .finally(() => {
          tickInflightRef.current.delete(key);
        });

      tickInflightRef.current.set(key, promise);
      return promise;
    },
    [getSymbolLastTick, tradingAccount?.login]
  );

  const fetchCurrencyProfit = useCallback(
    async (symbol: string) => {
      const cached = configCacheRef.current.get(symbol);
      if (cached) return cached;

      try {
        const res = (await getSymbolConfig({
          accountId: +(tradingAccount?.login || 0),
          symbol
        }).unwrap()) as SymbolConfig;

        if (res?.currencyProfit) {
          configCacheRef.current.set(symbol, res.currencyProfit);
          return res.currencyProfit;
        }
      } catch {}

      return undefined;
    },
    [getSymbolConfig, tradingAccount?.login]
  );

  const enrichPerformer = useCallback(
    async (performer: ParsedTopPerformer) => {
      const symbol = performer.instrument;

      const [tick, currencyProfit] = await Promise.all([fetchLastTick(symbol), fetchCurrencyProfit(symbol)]);

      return {
        ...performer,
        ask: tick?.ask,
        bid: tick?.bid,
        currencyProfit: currencyProfit
      };
    },
    [fetchLastTick, fetchCurrencyProfit]
  );

  const isIslamicAccount = isAuthorized && tradingAccount?.typeDisplayName?.toLowerCase?.()?.includes?.('islamic');

  const pushMessage = useCallback(
    (type: PulseEventType, data: PulseMessage) => {
      const parsedSocket = topPerformerSocketParser(data?.topPerformer);

      if (isIslamicAccount && parsedSocket.category === 'Crypto') return;

      (async () => {
        const enriched = await enrichPerformer(parsedSocket);

        setPerformerUpdates((prev) => {
          const base = isIslamicAccount ? prev.filter((i) => i.category !== 'Crypto') : prev;

          if (isIslamicAccount && enriched.category === 'Crypto') return base;
          if (base.some((i) => i.id === enriched.id)) return base;

          const next = [...base, { ...enriched, type }];

          if (next.length > MAX_ITEMS) {
            return next.slice(-KEEP_LAST);
          }

          return next;
        });
      })();
    },
    [enrichPerformer, isIslamicAccount]
  );

  const pushMessageRef = useRef(pushMessage);

  const removeProcessed = useCallback((ids: Array<string | number>) => {
    setPerformerUpdates((prev) => prev.filter((item) => !ids.includes(item.id)));
  }, []);

  const ensureStarted = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection) return;

    if (isStartingRef.current) return;

    if (
      connection.state === signalR.HubConnectionState.Connected ||
      connection.state === signalR.HubConnectionState.Connecting ||
      connection.state === signalR.HubConnectionState.Reconnecting
    ) {
      return;
    }

    isStartingRef.current = true;
    setStatus('connecting');
    setError(null);

    try {
      await connection.start();
      setStatus('connected');
    } catch (err) {
      console.log('SignalR start error', err);
      setStatus('error');
      setError(err);
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  useEffect(() => {
    pushMessageRef.current = pushMessage;
  }, [pushMessage]);

  useEffect(() => {
    let isMounted = true;

    const connection = createPulseConnection();
    connectionRef.current = connection;

    const handlePerformer = (data: any) => {
      if (!isMounted) return;
      pushMessageRef?.current?.('OnTopPerformerUpdate', data);
    };

    const handleReconnecting = (err?: Error) => {
      if (!isMounted) return;
      setStatus('reconnecting');
      if (err) setError(err);
    };

    const handleReconnected = () => {
      if (!isMounted) return;
      setStatus('connected');
      setError(null);
    };

    const handleClose = (err?: Error) => {
      if (!isMounted) return;
      setStatus('disconnected');
      if (options?.autoReconnectOnForeground !== false && appStateRef.current === 'active') {
        setTimeout(() => {
          if (!isMounted || appStateRef.current !== 'active') return;
          ensureStarted();
        }, 2000);
      }
      if (err) setError(err);
    };

    connection.on('OnTopPerformerUpdate', handlePerformer);
    connection.onreconnecting(handleReconnecting);
    connection.onreconnected(handleReconnected);
    connection.onclose(handleClose);

    ensureStarted();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (!isMounted) return;
      appStateRef.current = nextState;
      if (nextState === 'active' && options?.autoReconnectOnForeground !== false) {
        ensureStarted();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted = false;
      isStartingRef.current = false;

      sub.remove();

      connection.off('OnTopPerformerUpdate', handlePerformer);
      connection.onreconnecting(() => {});
      connection.onreconnected(() => {});
      connection.onclose(() => {});

      if (options?.stopOnUnmount !== false) {
        connection.stop().catch((err) => {
          console.log('Error stopping connection:', err);
        });
      }

      connectionRef.current = null;
    };
  }, []);

  return {
    status,
    error,

    performerUpdates,

    removeProcessed,

    reconnect: ensureStarted
  };
};

import React, { useLayoutEffect, useState, useMemo } from 'react';
import { websocketUrls } from '@/constants';
import { useWebsocket } from '@/hooks';
import { debounce } from 'throttle-debounce';
import { jsonParse } from '@/helpers';

interface WebsocketData {
  ts: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

interface CandlesWebsocketProps {
  symbol: string;
  period: string;
  setUp: boolean;
}

const useCandlesWebsocket = ({ symbol, period, setUp = true }: CandlesWebsocketProps) => {
  const [lastData, setLastData] = useState<WebsocketData>({} as WebsocketData);

  const { isReadyState, websocket, init, destroy, addMessageHandler } = useWebsocket({
    reconnect: true
  });

  const setData = debounce(250, setLastData);

  const messageHandler = (event: WebSocketMessageEvent | null) => {
    const data = jsonParse(event?.data);
    if (!data) {
      return;
    }
    const { ts, o, h, l, c } = (data || {}) as { ts: number; o: number; h: number; l: number; c: number };

    if (ts === undefined || o === undefined || h === undefined || l === undefined || c === undefined) {
      return;
    }

    setData({ ts, o, h, l, c });
  };

  const url = useMemo(() => {
    if (symbol === undefined || period === undefined) {
      return;
    }
    return websocketUrls.candlesPrices({ symbol, period });
  }, [symbol, period]);

  const closeSocketConnection = () => {
    if (url === undefined) {
      return;
    }

    setLastData({} as WebsocketData);
    setData.cancel({ upcomingOnly: true });

    destroy();
  };

  const makeSocketConnection = () => {
    if (url === undefined || !setUp) {
      return;
    }

    init({ url });
    addMessageHandler(messageHandler);
  };

  useLayoutEffect(() => {
    makeSocketConnection();
    return () => {
      closeSocketConnection();
    };
  }, [url, setUp]);

  return {
    lastData,
    isReadyState,
    websocket
  };
};

export default useCandlesWebsocket;

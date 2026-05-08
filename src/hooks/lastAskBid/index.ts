import { useCallback, useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useNetwork } from '@/providers';
import { jsonParse } from '@/helpers';

const useLastAskBid = (asset: string) => {
  const askRef = useRef<number | undefined>(undefined);
  const bidRef = useRef<number | undefined>(undefined);
  const socketIsClosed = useRef<boolean>(false);

  const { websocket, isReadyState } = useNetwork();
  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = !!websocket && pageIsFocused && isReadyState;

  const setData = useCallback(
    (askPrice?: number, bidPrice?: number) => {
      if (!enabledHandleMessage) return;

      if (askPrice !== undefined) {
        askRef.current = askPrice;
      }
      if (bidPrice !== undefined) {
        bidRef.current = bidPrice;
      }
    },
    [enabledHandleMessage]
  );

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || !asset || !websocket) {
      socketIsClosed.current = true;
      return;
    }

    socketIsClosed.current = false;

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      if (socketIsClosed.current) return;

      const data = jsonParse(event?.data);
      if (!data) return;

      const { ask: dataAsk, bid: dataBid, symbol: dataSymbol } = data || {};

      if (!dataSymbol || dataSymbol !== asset) return;
      if (dataAsk === undefined && dataBid === undefined) return;

      setData(dataAsk, dataBid);
    });
  }, [enabledHandleMessage, asset, websocket, setData]);

  useEffect(() => {
    socketIsClosed.current = false;
    subscribeWebsocket();

    return () => {
      socketIsClosed.current = true;
    };
  }, [subscribeWebsocket, setData]);

  const getLastAskBid = useCallback(() => {
    return {
      ask: askRef.current,
      bid: bidRef.current
    };
  }, []);

  return getLastAskBid;
};

export default useLastAskBid;

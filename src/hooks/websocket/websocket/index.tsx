import React, { useRef, useLayoutEffect, useState } from 'react';

let timeout: ReturnType<typeof setTimeout> | undefined;

interface WebsocketProps {
  reconnect: boolean;
}

interface WebsocketInit {
  url: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

type WebSocketMessageHandler = (event: WebSocketMessageEvent) => void;

export interface WebsocketData {
  websocket: WebSocket | null;
  isReadyState: boolean;
  init: ({ url, onOpen, onClose, onError }: WebsocketInit) => void;
  destroy: () => void;
  addMessageHandler: (handler: WebSocketMessageHandler) => void;
  removeMessageHandler: (handler: WebSocketMessageHandler) => void;
}

const useWebsocket = ({ reconnect = true }: WebsocketProps): WebsocketData => {
  const ws = useRef<WebSocket | null>(null);

  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [isReadyState, setReadyState] = useState<boolean>(false);
  const [messageHandlers, setMessageHandlers] = useState<WebSocketMessageHandler[]>([]);

  const subscribeMessageHandlers = () => {
    if (websocket === null || ws.current === null) {
      return;
    }
    messageHandlers.forEach((handler) => {
      ws.current?.addEventListener('message', handler);
    });
  };

  const unsubscribeMessageHandlers = () => {
    if (websocket === null || ws.current === null) {
      return;
    }
    messageHandlers.forEach((handler) => {
      ws.current?.removeEventListener('message', handler);
    });
  };

  useLayoutEffect(() => {
    subscribeMessageHandlers();
    return () => {
      unsubscribeMessageHandlers();
    };
  }, [messageHandlers, websocket, ws]);

  const addMessageHandler = (handler: WebSocketMessageHandler) => {
    setMessageHandlers((prev) => {
      const next = prev.filter((fn) => fn !== handler);
      return [...next, handler];
    });
  };

  const removeMessageHandler = (handler: WebSocketMessageHandler) => {
    setMessageHandlers((prev) => {
      const next = prev.filter((fn) => fn !== handler);
      return next;
    });
  };

  const clearMessageHandler = () => {
    setMessageHandlers([]);
  };

  const init = ({ url, onOpen, onClose, onError }: WebsocketInit) => {
    if (!url) {
      return;
    }

    ws.current = new WebSocket(url);

    setWebsocket(ws.current);

    ws.current.onopen = () => {
      setReadyState(Boolean(ws.current?.readyState === 1));
      setWebsocket(ws.current);

      if (onOpen && typeof onOpen === 'function') {
        onOpen();
      }
    };

    ws.current.onclose = () => {
      ws.current = null;

      setReadyState(false);
      setWebsocket(ws.current);

      if (onClose && typeof onClose === 'function') {
        onClose();
      }

      if (reconnect) {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(() => {
          init({ url, onOpen, onClose, onError });
        }, 250);
      }
    };

    ws.current.onerror = () => {
      ws.current = null;

      setReadyState(false);
      setWebsocket(ws.current);

      if (onError && typeof onError === 'function') {
        onError();
      }

      if (reconnect) {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(() => {
          init({ url, onOpen, onClose, onError });
        }, 250);
      }
    };
  };

  const destroy = () => {
    if (ws.current === null) {
      return;
    }

    timeout && clearTimeout(timeout);

    clearMessageHandler();

    ws.current.onopen = () => {};
    ws.current.onclose = () => {};
    ws.current.onerror = () => {};

    ws.current.close();

    ws.current = null;

    setReadyState(false);
    setWebsocket(ws.current);
  };

  return {
    websocket,
    init,
    destroy,
    addMessageHandler,
    removeMessageHandler,
    isReadyState
  };
};

export default useWebsocket;

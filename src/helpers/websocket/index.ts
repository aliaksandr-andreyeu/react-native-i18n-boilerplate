/// <reference lib="dom" />

type WebSocketMessageHandler = (event: MessageEvent) => void;

class WS {
  ws: WebSocket | null = null;
  handlers: Map<string, WebSocketMessageHandler> = new Map();

  init(url: string, onOpen?: () => void, onClose?: () => void, onError?: () => void): void {
    this.ws = new WebSocket(url);

    // console.log('WebSocket init', this.ws);

    this.ws.onclose = () => {
      // console.log('WebSocket onclose', this.ws);

      this.ws = null;
      this.handlers.clear();
      onClose?.();
    };

    if (onError) {
      // console.log('WebSocket onError', this.ws);
      this.ws.onerror = onError;
    }

    if (onOpen) {
      // console.log('WebSocket onOpen', this.ws);
      this.ws.onopen = onOpen;
    }
  }

  send(message: string) {
    if (this.ws?.readyState === 1 && message) {
      // console.log('WebSocket send', this.ws);
      try {
        this.ws.send(message);
      } catch (error) {
        console.error(error);
      }
    }
  }

  onMessage(handler: (event: MessageEvent) => void, key = 'all') {
    if (this.ws) {
      this.handlers.set(key, handler);
      this.ws.addEventListener('message', handler);
    }
  }

  removeEventListener(key = 'all') {
    if (this.ws) {
      const handler = this.handlers.get(key);
      if (handler) {
        this.ws.removeEventListener('message', handler);
        this.handlers.delete(key);
      }
    }
  }

  close(onClose?: () => void) {
    if (this.ws) {
      // console.log('WebSocket close', this.ws);
      if (onClose) {
        this.ws.onclose = onClose;
      }

      this.handlers.forEach((handler) => {
        this.ws?.removeEventListener('message', handler);
      });
      this.handlers.clear();

      this.ws.close();

      this.ws = null;
    }
  }
}

export default WS;

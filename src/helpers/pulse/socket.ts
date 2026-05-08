import * as signalR from '@microsoft/signalr';
import Config from 'react-native-config';

const { PULSE_URL } = Config;

const HUB_URL = `${PULSE_URL}/sockets/hubs/pulse`;

let connection: signalR.HubConnection | null = null;

const RECONNECT_INTERVAL = new Array(60).fill(3000);

export const createPulseConnection = () => {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: true
    })
    .configureLogging(__DEV__ ? signalR.LogLevel.Information : signalR.LogLevel.None)
    .withAutomaticReconnect(RECONNECT_INTERVAL)
    .build();

  return connection;
};

export const getPulseConnection = () => {
  if (!connection) {
    throw new Error('Pulse SignalR connection not created yet.');
  }
  return connection;
};

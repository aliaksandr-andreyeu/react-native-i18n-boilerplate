import Config from 'react-native-config';
import api from '../api';

const { WEBSOCKET_BASE_URL, PULSE_URL } = Config || {};

const urls = {
  tickersPrices: `${WEBSOCKET_BASE_URL}/Tickers/Prices`,
  candlesPrices: ({ symbol, period }: { symbol: string; period: string }) =>
    `${WEBSOCKET_BASE_URL}/Tickers/Candels?symbol=${symbol}&period=${period}`,
  topPerformers: `${PULSE_URL}${api.pulse.topPerformers}/hubs/pulse`
};

export default urls;

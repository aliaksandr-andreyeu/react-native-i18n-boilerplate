import 'react-native-get-random-values';
import 'text-encoding';
import 'react-native-gesture-handler';

import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { backgroundMessageHandler } from '@/helpers';
import { AppRegistry, LogBox } from 'react-native';
import Application from './src';
import { name as appName } from './app.json';

if (__DEV__) {
  require('./reactotron.config');
}

LogBox.ignoreAllLogs();

globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, backgroundMessageHandler);

AppRegistry.registerComponent(appName, () => Application);

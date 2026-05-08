import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactotronReactNative } from 'reactotron-react-native';
import RNRestart from 'react-native-restart';
import { KeyValuePair } from '@react-native-async-storage/async-storage/lib/typescript/types';

const tron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: 'Amega Capital'
  })
  .useReactNative({
    asyncStorage: {
      ignore: ['.posthog-rn.json']
    },
    networking: {
      ignoreUrls: /symbolicate|generate_204|\/batch\/|\/e\/|posthog|customer\.io/i
    }
  });

declare global {
  interface Console {
    tron?: Partial<ReactotronReactNative>;
  }
}

if (__DEV__) {
  tron.onCustomCommand({
    command: 'AsyncStorage data',
    title: 'AsyncStorage',
    description: 'show AsyncStorage data',
    args: [{ name: 'asyncstorage key (leave empty if you want all values)', type: 'String' as any }],
    handler: async (arg) => {
      try {
        const givenArg = arg?.['asyncstorage key (leave empty if you want all values)']?.trim?.();
        if (givenArg) {
          const givenValue = await AsyncStorage.getItem(givenArg);
          return tron.display?.({
            name: `AsyncStorage : ${givenArg} `,
            value: givenValue || '',
            important: true,
            preview: 'click to view'
          });
        }
        const keys = await AsyncStorage.getAllKeys();
        const values = await AsyncStorage.multiGet(keys);
        if (values) {
          const normalized = Object.values(values).reduce((acc: Record<string, string>, c: KeyValuePair) => {
            const key = c[0] as string;
            acc[key] = c[1] || '';
            return acc;
          }, {});
          tron.display?.({
            name: 'AsyncStorage',
            value: normalized,
            important: true,
            preview: 'click to view'
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  tron.onCustomCommand({
    command: 'Reload App',
    title: 'Reload App',
    description: 'Reload App',
    handler: async () => {
      try {
        RNRestart.restart();
      } catch (error) {
        console.error(error);
      }
    }
  });
  tron.connect();

  (console as any).tron = tron as any;
}
export default tron;

import analytics from '@react-native-firebase/analytics';
import { config } from '@/constants';

const { platform, mode } = config;

class AnalyticsManager {
  protected _data = {};
  static instance: AnalyticsManager;

  constructor() {
    if (AnalyticsManager.instance) {
      return AnalyticsManager.instance;
    }
    AnalyticsManager.instance = this;

    this._data = {
      platform: platform.os,
      environment: mode
    };
  }

  async logEvent(eventName: string, params = {}) {
    try {
      const data = { ...this._data, ...params };
      console.log(`Logging event: ${eventName}`, data);
      await analytics().logEvent(eventName, data);
    } catch (error) {
      console.error(`Failed to log event: ${eventName}`, error);
    }
  }

  async setUserId(userId: string) {
    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  async setUserProperty(name: string, value: any) {
    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.error(`Failed to set user property: ${name}`, error);
    }
  }

  async logScreenView(screenName: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName
      });
    } catch (error) {
      console.error(`Failed to log screen view: ${screenName}`, error);
    }
  }
}

const firebaseAnalyticsInstance = new AnalyticsManager();
export default firebaseAnalyticsInstance;

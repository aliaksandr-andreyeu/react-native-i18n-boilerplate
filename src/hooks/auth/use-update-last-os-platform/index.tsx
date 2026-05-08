import React from 'react';
import { config } from '@/constants';
import { actions } from '@/store';

const {
  profile: { useUpdateCustomFields }
} = actions;

const { isAndroid, isIOS } = config;

enum OS {
  android = 'Android',
  ios = 'iOS'
}

enum Platform {
  android = 'ANDROID_APP',
  ios = 'IOS_APP'
}

interface Payload {
  os?: string | null;
  platform?: string | null;
}

interface UpdateLastOSData {
  updateLastOsPlatform: ({ os, platform }: Payload) => Promise<{ success: boolean }>;
}

const useUpdateLastOsPlatform = (): UpdateLastOSData => {
  const [updateCustomFields] = useUpdateCustomFields();

  const updateLastOsPlatform = async ({ os, platform }: Payload) => {
    const lastTouchOS: OS | null = isAndroid ? OS.android : isIOS ? OS.ios : null;
    const lastTouchPlatform: Platform | null = isAndroid ? Platform.android : isIOS ? Platform.ios : null;

    if (lastTouchOS === os && lastTouchPlatform === platform) {
      return { success: true };
    }

    try {
      await updateCustomFields({
        customFields: {
          custom_last_touch_os: lastTouchOS,
          custom_last_touch_platform: lastTouchPlatform
        }
      });
      return { success: true };
    } catch (error: unknown) {
      console.error(error);
      return { success: false };
    }
  };

  return { updateLastOsPlatform };
};

export default useUpdateLastOsPlatform;

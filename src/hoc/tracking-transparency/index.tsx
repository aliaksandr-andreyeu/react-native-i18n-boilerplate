import React, { FC, ReactNode, useLayoutEffect } from 'react';
import { getTrackingStatus, requestTrackingPermission, TrackingStatus } from 'react-native-tracking-transparency';
import { config } from '@/constants';

const { isIOS, platformVersion } = config || {};

interface TrackingTransparencyProps {
  children?: ReactNode;
}

const TrackingTransparency: FC<TrackingTransparencyProps> = ({ children }) => {
  const requestPermission = async () => {
    try {
      const status: TrackingStatus = await requestTrackingPermission();

      console.warn('@@@@@@ status requestTrackingPermission', status);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getStatus = async () => {
    if (!(isIOS && parseInt(String(platformVersion), 10) >= 14)) {
      return;
    }
    try {
      const status: TrackingStatus = await getTrackingStatus();

      console.warn('@@@@@@ status getTrackingStatus', status);

      if (status === 'not-determined') {
        requestPermission();
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    getStatus();
  }, []);

  if (!children) {
    return null;
  }

  return children;
};

export default TrackingTransparency;

import React, { FC, ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import {
  mixpanel,
  appsFlyerInit,
  customerIoInit,
  setUserIdMixpanel,
  appInstallMixpanel,
  appOpenedMixpanel,
  appUsageTimeEventMixpanel,
  appUsageTimeMixpanel,
  appClosedMixpanel
} from '@/helpers';
import appsFlyer, { ConversionData, OnAppOpenAttributionData, UnifiedDeepLinkData } from 'react-native-appsflyer';
import branch, { BranchOpenStartEvent, BranchSubscriptionEvent } from 'react-native-branch';
import { logger } from '@/helpers';
import { useAppDispatch, useAppSelector, useAppState } from '@/hooks';
import { actions } from '@/store';
import { useCustomPostHog } from '@/helpers';
import Config from 'react-native-config';
import { ClientData } from '@/store/api';

const { APP_ENV } = Config || {};

const isProduction = Boolean(APP_ENV === 'production');

interface AnalyticsProps {
  children?: ReactNode;
}

enum MediaSource {
  cellxpert = 'cellxpert_int'
}

enum ClickId {
  cxd = '[cxd]'
}

enum MatchType {
  googlePlay = 'gp_referrer'
}

enum Campaign {
  amegacapital = 'amegacapital'
}

const {
  auth: { setCellExpertId }
} = actions;

const Analytics: FC<AnalyticsProps> = ({ children }) => {
  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { id: userId, email, firstName, lastName } = userInfo || {};

  const lastIdentifiedRef = useRef<string | null>(null);

  const isUserData = Boolean(userInfo && Object.keys(userInfo).length > 0);

  const dispatch = useAppDispatch();

  const { identify } = useCustomPostHog();

  const appState = useAppState();

  const identifyPostHogHandler = () => {
    if (!userId) {
      return;
    }

    const newId = String(userId);

    if (lastIdentifiedRef.current === newId) {
      return;
    } // avoid repeats (incl. RN dev double-invoke)

    lastIdentifiedRef.current = newId;

    identify({
      id: userId,
      email,
      firstName,
      lastName
    } as ClientData);
  };

  const setUserIdMixpanelHandler = async () => {
    if (!isUserData) {
      return;
    }
    try {
      await setUserIdMixpanel(userInfo);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const setMixpanelEventsHandler = async () => {
    try {
      if (appState === 'active') {
        appUsageTimeEventMixpanel();
        appOpenedMixpanel();
      } else if (appState === 'background') {
        appUsageTimeMixpanel();
        appClosedMixpanel();
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    if (!isProduction) {
      return () => {};
    }

    const onDeepLinkCanceller = appsFlyer.onDeepLink((response: UnifiedDeepLinkData) => {
      console.warn('@@@ onDeepLink:', response);
      logger.info('onDeepLink:', response);
    });

    const onInstallConversionDataCanceller = appsFlyer.onInstallConversionData((response: ConversionData) => {
      console.warn('@@@ onInstallConversionData:', response);
      logger.info('onInstallConversionData:', response);

      const { data } = response || {};
      const { af_sub1: cellExpertId, media_source, match_type, clickid, campaign } = data || {};

      const isCellExpertId = Boolean(
        cellExpertId && media_source === MediaSource.cellxpert && clickid === ClickId.cxd
        // && match_type === MatchType.googlePlay
        // && campaign === Campaign.amegacapital
      );

      if (!isCellExpertId) {
        return;
      }

      dispatch(setCellExpertId(cellExpertId));
    });

    const onInstallConversionFailureCanceller = appsFlyer.onInstallConversionFailure((response: ConversionData) => {
      console.warn('@@@ onInstallConversionFailure:', response);
      logger.info('onInstallConversionFailure:', response);
    });

    const onAppOpenAttributionCanceller = appsFlyer.onAppOpenAttribution((response: OnAppOpenAttributionData) => {
      console.warn('@@@ onAppOpenAttribution:', response);
      logger.info('onAppOpenAttribution:', response);
    });

    const onAttributionFailureCanceller = appsFlyer.onAttributionFailure((response: OnAppOpenAttributionData) => {
      console.warn('@@@ onAttributionFailure:', response);
      logger.info('onAttributionFailure:', response);
    });

    return () => {
      onDeepLinkCanceller;
      onInstallConversionDataCanceller;
      onInstallConversionFailureCanceller;
      onAppOpenAttributionCanceller;
      onAttributionFailureCanceller;
    };
  }, []);

  const init = async () => {
    try {
      await customerIoInit();
      await appsFlyerInit();
      await mixpanel.init();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    init();
  }, []);

  useLayoutEffect(() => {
    const unsubscribe = branch.subscribe({
      onOpenStart: (data: BranchOpenStartEvent) => {
        console.error('branch onOpenStart', data);
      },
      onOpenComplete: (data: BranchSubscriptionEvent) => {
        const { params } = data || {};

        const isFirstSession = Boolean(params?.['+is_first_session']);

        console.error('branch isFirstSession', isFirstSession);
        console.error('branch onOpenComplete', data);

        if (!isFirstSession) {
          return;
        }

        appInstallMixpanel();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useLayoutEffect(() => {
    setUserIdMixpanelHandler();
  }, [userInfo]);

  useEffect(() => {
    identifyPostHogHandler();
  }, [userId]);

  useLayoutEffect(() => {
    setMixpanelEventsHandler();
  }, [appState]);

  if (!children) {
    return null;
  }

  return children;
};

export default Analytics;

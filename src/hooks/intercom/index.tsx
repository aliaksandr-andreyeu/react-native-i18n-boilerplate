import React from 'react';
import Intercom from '@intercom/intercom-react-native';
import CryptoJS from 'crypto-js';
import { actions } from '@/store';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { intercomeStartedMixpanel } from '@/helpers';
import { config } from '@/constants';
import Config from 'react-native-config';
import firebaseAnalyticsInstance from '@/helpers/analytics/firebase';
import { FIREBASE_ANALYTICS_EVENTS } from '@/helpers/analytics/firebase/const';

const { INTERCOM_ANDROID_SECRET, INTERCOM_IOS_SECRET } = Config || {};
const { isIOS } = config || {};

const {
  auth: { setIntercomLoggedIn }
} = actions;

const useIntercom = () => {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state.auth);
  const { intercomLoggedIn } = auth || {};

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { email, id, firstName = '', lastName = '' } = userInfo || {};

  const intercomPresent = () => {
    try {
      if (!(email && id)) {
        Intercom.loginUnidentifiedUser();
      }

      if (!intercomLoggedIn && email && id) {
        const secretKey = (isIOS ? INTERCOM_IOS_SECRET : INTERCOM_ANDROID_SECRET) || '';
        const userIdHash = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(String(id), secretKey));

        Intercom.setUserHash(userIdHash);

        Intercom.loginUserWithUserAttributes({
          email,
          name: `${userInfo.firstName} ${userInfo.lastName}`
        });

        Intercom.updateUser({ name: `${firstName} ${lastName}` });

        dispatch(setIntercomLoggedIn(true));
      }

      Intercom.present();

      firebaseAnalyticsInstance.logEvent(FIREBASE_ANALYTICS_EVENTS.INTERCOM_PRESENT);

      intercomeStartedMixpanel({
        'User ID': id
      });
    } catch (error) {
      console.error(error);
    }
  };

  return { intercomPresent };
};

export default useIntercom;

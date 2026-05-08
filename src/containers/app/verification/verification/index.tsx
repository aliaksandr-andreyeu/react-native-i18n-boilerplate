import React, { FC, useLayoutEffect, useCallback, useEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import {
  IDEASHUB_ROUTE_NAMES,
  AUTH_ROUTE_NAMES,
  COMMON_ROUTE_NAMES,
  CommonRootParamsList,
  PULSEAI_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { ParamListBase, useFocusEffect } from '@react-navigation/native';
import VerificationScreen from './screen';
import { actions } from '@/store';
import { useAppSelector } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

const {
  verification: { useVerifyEmail, useVerifyEmailValidate },
  portfolio: { useProfileQuery, useApplicationsQuery },
  sumSub: { useSumSubStatus, useSumSubToken }
} = actions;

type VerificationProps = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.Verification>;

const Verification: FC<VerificationProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { hash } = params || {};

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const verificationState = useAppSelector((state) => state.verification);
  const { remainingSeconds } = verificationState || {};

  const isDisabled = Boolean(remainingSeconds > 0);

  const { goBack, canGoBack } = navigation || {};
  const canBack = canGoBack();

  const [getSumSubStatus, sumSubStatusResponse] = useSumSubStatus({
    pollingInterval: 1 * 60 * 1000,
    skipPollingIfUnfocused: true
  });

  const { data: sumSubStatus } = sumSubStatusResponse || {};

  const [verifyEmail] = useVerifyEmail();

  const [validateEmailHash, validateEmailHashResponse] = useVerifyEmailValidate();
  const { isSuccess: isValidateSuccess, isError: isValidateError } = validateEmailHashResponse || {};

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { emailVerified, isVerified, id: userId } = userInfo || {};

  const goSignIn = () => {
    navigation.replace(ROOT_ROUTE_NAMES.Auth, {
      screen: AUTH_ROUTE_NAMES.SignIn
    });
  };

  const [getProfile] = useProfileQuery({
    pollingInterval: 1 * 60 * 1000,
    skipPollingIfUnfocused: true
  });

  const [getApplications] = useApplicationsQuery({
    pollingInterval: 1 * 60 * 1000,
    skipPollingIfUnfocused: true
  });

  const [getSumSubToken] = useSumSubToken();

  const getSumSubStatusHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      await getSumSubStatus(userId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getSumSubTokenHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      const { token } = await getSumSubToken(userId).unwrap();

      return token;
    } catch (error: unknown) {
      console.error(error);

      return;
    }
  };

  const getProfileHandler = async () => {
    try {
      await getProfile();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getApplicationsHandler = async () => {
    try {
      await getApplications({});
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const goToPulse = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

  const onGoBack = () => {
    if (!canBack) {
      goToPulse();
      return;
    }
    goBack();
  };

  const checkAuthStatus = async () => {
    if (accessToken) {
      return;
    }
    goSignIn();
  };

  useFocusEffect(
    useCallback(() => {
      checkAuthStatus();
    }, [route, navigation, accessToken, goSignIn])
  );

  const verifyEmailHandler = async () => {
    if (isDisabled || isVerified || isVerified === undefined) {
      return;
    }
    try {
      await verifyEmail({});
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const validateEmailHashHandler = async () => {
    if (!hash || emailVerified || emailVerified === undefined || isVerified || isVerified === undefined) {
      return;
    }
    try {
      await validateEmailHash(hash);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const errorValidateEmailHashResponseHandler = () => {
    if (!isValidateError) {
      return;
    }
    const { error } = validateEmailHashResponse || {};
    if (!error) {
      return null;
    }
    const { message } = (error || {}) as { message: string };
    if (message === 'Email has already been verified') {
      return;
    }
  };

  const successValidateEmailHashResponseHandler = async () => {
    if (!isValidateSuccess) {
      return;
    }
    await getProfileHandler();
  };

  useFocusEffect(
    useCallback(() => {
      if (!isVerified) {
        return;
      }
      onGoBack();
    }, [route, navigation, isVerified, onGoBack])
  );

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        getProfileHandler();
        getApplicationsHandler();
      }
    });

    return appStateListener.remove;
  }, []);

  useFocusEffect(
    useCallback(() => {
      getProfileHandler();
      getApplicationsHandler();
    }, [route, navigation])
  );

  useFocusEffect(
    useCallback(() => {
      getSumSubStatusHandler();
    }, [route, navigation, userId])
  );

  useLayoutEffect(() => {
    validateEmailHashHandler();
  }, [hash, emailVerified, isVerified]);

  useLayoutEffect(() => {
    errorValidateEmailHashResponseHandler();
  }, [isValidateError]);

  useLayoutEffect(() => {
    successValidateEmailHashResponseHandler();
  }, [isValidateSuccess]);

  return (
    <VerificationScreen
      route={route}
      navigation={navigation}
      verifyEmail={verifyEmailHandler}
      sumSubStatus={sumSubStatus}
      getSumSubToken={getSumSubTokenHandler}
      getSumSubStatus={getSumSubStatusHandler}
    />
  );
};

export default Verification;

import React, { FC, useCallback, useEffect, useLayoutEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/hooks';
import EmailVerificationScreen from './screen';
import { actions } from '@/store';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useVerifyEmailValidate } from '@/store/api';

const {
  portfolio: { useProfileQuery }
} = actions;

type EmailVerificationProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.EmailVerification>;

const EmailVerification: FC<EmailVerificationProps> = ({ route, navigation }) => {

  const hash = route?.params?.hash;
  const [getProfile] = useProfileQuery({
    pollingInterval: 1 * 60 * 1000,
    skipPollingIfUnfocused: true
  });

  const [validateEmailHash, validateEmailHashResponse] = useVerifyEmailValidate();


  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { emailVerified, isVerified } = userInfo || {};

  const getProfileHandler = async () => {
    try {
      await getProfile();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (validateEmailHashResponse.isSuccess) getProfileHandler();
  }, [validateEmailHashResponse.isSuccess])

  useLayoutEffect(() => {
    if (hash && !(emailVerified || isVerified)) validateEmailHash(hash)
  }, [hash, emailVerified, isVerified]);

  useFocusEffect(
    useCallback(() => {
      if (!emailVerified) {
        return;
      }
      // navigation.dispatch(StackActions.replace(ROOT_ROUTE_NAMES.PhoneVerification));
    }, [route, navigation, emailVerified])
  );

  useFocusEffect(
    useCallback(() => {
      getProfileHandler();
    }, [route, navigation])
  );

  return <EmailVerificationScreen route={route} navigation={navigation} />;
};

export default EmailVerification;

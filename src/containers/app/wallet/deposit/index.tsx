import React, { FC, useLayoutEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import { BaseLoader } from '@/components';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { COMMON_ROUTE_NAMES } from '@/navigation/app/stacks';
import { useAppSelector } from '@/hooks';
import DepositScreen from './screen';

type DepositProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.Deposit>;

const Deposit: FC<DepositProps> = ({ route, navigation }) => {
  const [verified, setVerified] = useState<boolean | undefined>(undefined);

  const { userInfo } = useAppSelector((store) => store.portfolio);
  const { isVerified } = userInfo || {};

  const checkVerification = () => {
    setVerified(Boolean(isVerified));
  };

  const goToVerification = () => {
    if (verified === false) {
      navigation.replace(ROOT_ROUTE_NAMES.Common, {
        screen: COMMON_ROUTE_NAMES.Verification
      });
    }
  };

  useLayoutEffect(() => {
    checkVerification();
  }, [isVerified]);

  useLayoutEffect(() => {
    goToVerification();
  }, [verified]);

  if (!verified) {
    return <BaseLoader active={true} />;
  }

  return <DepositScreen route={route} navigation={navigation} />;
};

export default Deposit;

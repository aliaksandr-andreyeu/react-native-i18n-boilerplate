import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import TwoFactorAuthScreen from './screen';

type TwoFactorAuthProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.TwoFactorAuth>;

const TwoFactorAuth: FC<TwoFactorAuthProps> = ({ route, navigation }) => {
  return <TwoFactorAuthScreen route={route} navigation={navigation} />;
};

export default TwoFactorAuth;

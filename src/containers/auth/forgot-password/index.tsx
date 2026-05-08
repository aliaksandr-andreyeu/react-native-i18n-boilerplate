import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import ForgotPasswordScreen from './screen';

type ForgotPasswordProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.ForgotPassword>;

const ForgotPassword: FC<ForgotPasswordProps> = ({ route, navigation }) => {
  return <ForgotPasswordScreen route={route} navigation={navigation} />;
};

export default ForgotPassword;

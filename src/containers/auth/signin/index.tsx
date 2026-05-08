import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import SignInScreen from './screen';

type SignInBoxProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.SignIn>;

const SignIn: FC<SignInBoxProps> = ({ route, navigation }) => {
  return <SignInScreen route={route} navigation={navigation} />;
};

export default SignIn;

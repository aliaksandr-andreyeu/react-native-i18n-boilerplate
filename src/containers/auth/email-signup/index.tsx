import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import EmailSignUpScreen from './screen';

type SignUpBoxProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.EmailSignUp>;

const EmailSignUp: FC<SignUpBoxProps> = ({ route, navigation }) => {
  return <EmailSignUpScreen route={route} navigation={navigation} />;
};

export default EmailSignUp;

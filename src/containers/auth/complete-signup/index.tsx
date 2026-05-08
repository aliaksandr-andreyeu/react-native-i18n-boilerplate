import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import CompleteSignUpScreen from './screen';

type CompleteSignUpProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.CompleteSignUp>;

const CompleteSignUp: React.FC<CompleteSignUpProps> = ({ route, navigation }) => {
    return <CompleteSignUpScreen route={route} navigation={navigation} />;
};

export default CompleteSignUp;
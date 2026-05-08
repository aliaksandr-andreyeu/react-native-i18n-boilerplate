import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import BonusSignUpScreen from './screen';

type SignUpBoxProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.BonusSignUp>;

const BonusSignUp: FC<SignUpBoxProps> = ({ route, navigation }) => {
    return <BonusSignUpScreen route={route} navigation={navigation} />;
};

export default BonusSignUp;
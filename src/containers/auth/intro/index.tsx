import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import IntroScreen from './screen';

type SignUpBoxProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.Intro>;

const Intro: FC<SignUpBoxProps> = ({ route, navigation }) => {
    return <IntroScreen route={route} navigation={navigation} />;
};

export default Intro;
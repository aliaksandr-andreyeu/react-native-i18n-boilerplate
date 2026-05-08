import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import PhoneVerificationScreen from './screen';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';

type PhoneVerificationProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.PhoneVerification>;

const PhoneVerification: FC<PhoneVerificationProps> = ({ route, navigation }) => {
    return <PhoneVerificationScreen route={route} navigation={navigation} />;
};

export default PhoneVerification;

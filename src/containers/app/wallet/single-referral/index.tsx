import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import SingleReferalScreen from './screen';

type SingleReferralProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.SingleReferral>;

const SingleReferral: FC<SingleReferralProps> = ({ route, navigation }) => {
    return <SingleReferalScreen route={route} navigation={navigation} />;
};

export default SingleReferral;

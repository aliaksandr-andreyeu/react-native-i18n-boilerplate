import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import RedeemScreen from './screen';

type RedeemProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.Redeem>;

const Redeem: FC<RedeemProps> = ({ route, navigation }) => {
    return <RedeemScreen route={route} navigation={navigation} />;
};

export default Redeem;

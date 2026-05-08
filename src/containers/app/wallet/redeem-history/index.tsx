import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import RedeemHistoryScreen from './screen';

type RedeemHistoryProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.RedeemHistory>;

const RedeemHistory: FC<RedeemHistoryProps> = ({ route, navigation }) => {
    return <RedeemHistoryScreen route={route} navigation={navigation} />;
};

export default RedeemHistory;

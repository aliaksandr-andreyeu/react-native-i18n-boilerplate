import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase } from '@react-navigation/native';
import RewardsWalletScreen from './screen';

type RewardsProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.RewardsWallet>;

const RewardsWallet: FC<RewardsProps> = ({ route, navigation }) => {
  return <RewardsWalletScreen route={route} navigation={navigation} />;
};

export default RewardsWallet;

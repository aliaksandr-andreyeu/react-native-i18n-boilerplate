import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase } from '@react-navigation/native';
import DepositForUnverifiedScreen from './screen';

type DepositForUnverifiedProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.DepositForUnverified
>;

const DepositForUnverified: FC<DepositForUnverifiedProps> = ({ route, navigation }) => {
  return <DepositForUnverifiedScreen route={route} navigation={navigation} />;
};

export default DepositForUnverified;

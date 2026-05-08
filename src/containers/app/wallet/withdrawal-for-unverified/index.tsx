import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase } from '@react-navigation/native';
import WithdrawalForUnverifiedScreen from './screen';

type WithdrawalForUnverifiedProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.WithdrawalForUnverified
>;

const WithdrawalForUnverified: FC<WithdrawalForUnverifiedProps> = ({ route, navigation }) => {
  return <WithdrawalForUnverifiedScreen route={route} navigation={navigation} />;
};

export default WithdrawalForUnverified;

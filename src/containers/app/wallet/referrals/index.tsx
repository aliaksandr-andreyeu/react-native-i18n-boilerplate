import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase } from '@react-navigation/native';
import ReferralsScreen from './screen';

type ReferralsProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.Referrals>;

const Referrals: FC<ReferralsProps> = ({ route, navigation }) => {
  return <ReferralsScreen route={route} navigation={navigation} />;
};

export default Referrals;

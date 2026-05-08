import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import SignalsListScreen from './screen';

type SignalsListProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.SignalsList>;

const SignalsList: FC<SignalsListProps> = ({ route, navigation }) => {
  return <SignalsListScreen route={route} navigation={navigation} />;
};

export default SignalsList;

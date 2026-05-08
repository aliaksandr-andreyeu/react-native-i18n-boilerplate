import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import WelcomeAccountDetailsScreen from './screen';

type WelcomeAccountDetailsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.WelcomeAccountDetails>;

const WelcomeAccountDetails: FC<WelcomeAccountDetailsProps> = ({ route, navigation }) => {
  return <WelcomeAccountDetailsScreen route={route} navigation={navigation} />;
};

export default WelcomeAccountDetails;

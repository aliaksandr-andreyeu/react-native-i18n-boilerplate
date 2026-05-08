import React, { FC } from 'react';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import LinkedAccountScreen from './screen';

type LinkedAccountsProps = StackScreenProps<CommonRootParamsList, COMMON_ROUTE_NAMES.LinkedAccounts>;

const LinkedAccounts: FC<LinkedAccountsProps> = ({ route, navigation }) => {
  return <LinkedAccountScreen route={route} navigation={navigation} />;
};

export default LinkedAccounts;

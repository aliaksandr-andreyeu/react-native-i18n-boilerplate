import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import SelectDateScreen from './screen';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';

type AssetDetailsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.SelectDate>;

const SelectDate: FC<AssetDetailsProps> = ({ route, navigation }) => {
  return <SelectDateScreen route={route} navigation={navigation} />;
};

export default SelectDate;

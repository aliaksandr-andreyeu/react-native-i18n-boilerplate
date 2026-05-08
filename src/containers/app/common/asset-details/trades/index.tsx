import React, { FC } from 'react';
import AssetDetailsTradesScreen from './screen';
import { StackScreenProps } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';

type AssetDetailsProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.AssetDetails>;

const AssetDetailsTrades: FC<AssetDetailsProps> = ({ navigation, route }) => {
  return <AssetDetailsTradesScreen navigation={navigation} route={route} />;
};

export default AssetDetailsTrades;

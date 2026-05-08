import React from 'react';
import PromotionDetailsScreen from './screen';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';

type PromotionDetailsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.PromotionDetails>;

const PromotionDetails: React.FC<PromotionDetailsProps> = ({ navigation, route }) => {
  return <PromotionDetailsScreen route={route} navigation={navigation} />;
};

export default PromotionDetails;

import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import ReferralRewardsScreen from './screen';

type ReferralRewardsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.ReferralRewards>;

const ReferralRewards: FC<ReferralRewardsProps> = ({ route, navigation }) => {
  return <ReferralRewardsScreen route={route} navigation={navigation} />;
};

export default ReferralRewards;

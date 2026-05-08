import { PORTFOLIO_ROUTE_NAMES, PortfolioRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import PositionsScreen from './screen';

type PositionsProps = StackScreenProps<PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Positions>;

const Positions: React.FC<PositionsProps> = ({ navigation, route }) => {
  return <PositionsScreen navigation={navigation} route={route} />;
};

export default Positions;

import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { PORTFOLIO_ROUTE_NAMES, PortfolioRootParamsList } from '@/navigation/app/stacks';
import PortfolioScreen from './screen';

type PortfolioProps = StackScreenProps<PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Portfolio>;

const Portfolio: FC<PortfolioProps> = ({ route, navigation }) => {
  return <PortfolioScreen route={route} navigation={navigation} />;
};

export default Portfolio;

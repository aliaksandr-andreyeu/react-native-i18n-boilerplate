import { PORTFOLIO_ROUTE_NAMES, PortfolioRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import HistoryScreen from './screen';

type HistoryProps = StackScreenProps<PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.History>;
const History: React.FC<HistoryProps> = ({ navigation, route }) => {
  return <HistoryScreen route={route} navigation={navigation} />;
};

export default History;

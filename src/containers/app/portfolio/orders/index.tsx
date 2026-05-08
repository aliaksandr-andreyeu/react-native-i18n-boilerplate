import { PORTFOLIO_ROUTE_NAMES, PortfolioRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import OrdersScreen from './screen';

type OrdersProps = StackScreenProps<PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Orders>;

const Orders: React.FC<OrdersProps> = ({ navigation, route }) => {
  return <OrdersScreen navigation={navigation} route={route} />;
};

export default Orders;

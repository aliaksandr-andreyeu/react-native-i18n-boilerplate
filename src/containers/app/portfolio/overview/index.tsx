import React, { FC, useCallback, useState } from 'react';
import { PORTFOLIO_ROUTE_NAMES, PortfolioRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import OverviewSceen from './screen';
import { useAppSelector } from '@/hooks';
import { useFocusEffect } from '@react-navigation/native';
import { actions } from '@/store';

type OverviewProps = StackScreenProps<PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Overview>;

const {
  portfolio: { useGetDealsAccountsQuery }
} = actions;

const Overview: FC<OverviewProps> = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo, selectedAccount } = portfolio || {};
  const { id: userId } = userInfo || {};

  const [getDealsAccounts] = useGetDealsAccountsQuery();

  const getDealsAccountsHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      await getDealsAccounts(userId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const refreshHandler = async () => {
    setRefreshing(true);
    try {
      await getDealsAccountsHandler();
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDealsAccountsHandler();
    }, [route, navigation, userId, selectedAccount])
  );

  return <OverviewSceen onRefresh={refreshHandler} refreshing={refreshing} navigation={navigation} route={route} />;
};

export default Overview;

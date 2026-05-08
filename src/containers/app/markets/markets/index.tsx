import React, { FC, useCallback } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MARKETS_ROUTE_NAMES, MarketsRootParamsList } from '@/navigation/app/stacks';
import MarketsScreen from './screen';
import { useAppSelector } from '@/hooks';
import { useFocusEffect } from '@react-navigation/native';
import { actions } from '@/store';

type MarketsProps = StackScreenProps<MarketsRootParamsList, MARKETS_ROUTE_NAMES.Markets>;

const {
  portfolio: { useGetDealsAccountsQuery },
  market: { useGetAllSymbolsQuery, useGetCategoriesQuery }
} = actions;

const Markets: FC<MarketsProps> = ({ route, navigation }) => {
  const portfolio = useAppSelector((state) => state.portfolio);
  const { selectedAccount = 0, userInfo } = portfolio || {};
  const { id: userId } = userInfo || {};

  const market = useAppSelector((store) => store.market);
  const { categories = [] } = market || {};

  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getCategories] = useGetCategoriesQuery();
  const [getAllSymbols] = useGetAllSymbolsQuery();

  const getCategoriesHandler = async () => {
    if (categories.length > 0) {
      return;
    }
    try {
      await getCategories(selectedAccount || 0);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getDealsAccountsHandler = async () => {
    try {
      await getDealsAccounts(userId || 0);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getAllSymbolsHandler = async () => {
    try {
      await getAllSymbols({ accountId: selectedAccount || 0 });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDealsAccountsHandler();
    }, [route, navigation, userId])
  );

  useFocusEffect(
    useCallback(() => {
      getAllSymbolsHandler();
    }, [route, navigation, selectedAccount])
  );

  useFocusEffect(
    useCallback(() => {
      getCategoriesHandler();
    }, [route, navigation, selectedAccount, categories])
  );

  return <MarketsScreen route={route} navigation={navigation} />;
};

export default Markets;

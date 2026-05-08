import React, { FC, useCallback } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import CreatePositionDetailsScreen from './screen';
import { actions } from '@/store';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/hooks';
import { useGetDealsAccountsQuery } from '@/store/api';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';

type CreatePositionDetailsProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.CreatePositionDetails>;

const {
  wallet: { useGetTradingAccountsMutation }
} = actions;

const CreatePositionDetails: FC<CreatePositionDetailsProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { entry, asset, ask, bid, amount } = params || {};

  const { goBack, canGoBack } = navigation || {};
  const canBack = canGoBack();

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { id: userId } = userInfo || {};

  const [getDealsAccounts] = useGetDealsAccountsQuery();
  const [getTradingAccounts] = useGetTradingAccountsMutation();

  const tradingAccount = useAppSelector((state) => state.wallet.accounts.trading);

  const onGoBack = () => {
    if (!canBack) {
      return;
    }
    goBack();
  };

  const getAccountsHandler = async () => {
    if (userId === undefined) {
      return;
    }
    try {
      await getTradingAccounts();
      await getDealsAccounts(userId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (
        entry !== undefined &&
        asset !== undefined &&
        ask !== undefined &&
        bid !== undefined &&
        amount !== undefined
      ) {
        return;
      }
      onGoBack();
    }, [navigation, route, entry, asset, ask, bid, amount])
  );

  useFocusEffect(
    useCallback(() => {
      getAccountsHandler();
    }, [navigation, route, userId])
  );

  return <CreatePositionDetailsScreen account={tradingAccount} route={route} navigation={navigation} />;
};

export default CreatePositionDetails;

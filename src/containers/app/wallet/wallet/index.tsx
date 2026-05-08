import React, { FC, useCallback, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/hooks';
import { actions } from '@/store';
import { WALLET_ROUTE_NAMES, WalletRootParamsList } from '@/navigation/app/stacks';
import WalletScreen from './screen';

type WalletProps = StackScreenProps<WalletRootParamsList, WALLET_ROUTE_NAMES.Wallet>;

const {
  wallet: {
    useGetWalletAccountsMutation,
    useGetTradingAccountsMutation,
    useGetCashbackAccountsMutation,
    useGetRewardsAccountsMutation
  },
  portfolio: { useProfileQuery }
} = actions;

const Wallet: FC<WalletProps> = ({ route, navigation }) => {
  const [getProfile] = useProfileQuery({});

  const [getWalletAccounts] = useGetWalletAccountsMutation();
  const [getTradingAccounts] = useGetTradingAccountsMutation();
  const [getCashbackAccounts] = useGetCashbackAccountsMutation();
  const [getRewardsAccounts] = useGetRewardsAccountsMutation();


  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const getProfileHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getProfile();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getWalletAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getWalletAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getTradingAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getCashbackAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getCashbackAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getRewardsAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getRewardsAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getProfileHandler();
      getWalletAccountsHandler();
      getTradingAccountsHandler();
      getCashbackAccountsHandler();
      getRewardsAccountsHandler();
    }, [route, navigation])
  );

  return <WalletScreen route={route} navigation={navigation} />;
};

export default Wallet;

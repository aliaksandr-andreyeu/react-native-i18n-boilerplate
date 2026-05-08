import React, { FC, useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Wallet, DepositForUnverified } from '@/containers';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useAppSelector } from '@/hooks';
import { useTheme } from '@react-navigation/native';
import { BaseTabsHeader } from '@/components';
import { testIDs } from '@/constants';
import useStyles from './styles';

export enum WALLET_ROUTE_NAMES {
  Wallet = 'Wallet'
}

export type WalletRootParamsList = {
  Wallet: undefined;
};

const Stack = createStackNavigator<WalletRootParamsList & RootRootParamsList>();

const WalletStackNavigator: FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const auth = useAppSelector((store) => store.auth);
  const { accessToken } = auth || {};

  const isAuthorized = useMemo(() => Boolean(accessToken), [accessToken]);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified, firstDepositDate } = userInfo || {};

  const isUnverifiedWithFirstDeposit = useMemo(
    () => isAuthorized && !Boolean(isVerified) && Boolean(firstDepositDate),
    [isAuthorized, isVerified, firstDepositDate]
  );

  const isWalletVisible = useMemo(() => {
    return Boolean(!isAuthorized || (isAuthorized && isVerified) || isUnverifiedWithFirstDeposit);
  }, [isAuthorized, isVerified, isUnverifiedWithFirstDeposit]);

  const screenOptions = {
    headerShadowVisible: false,
    headerStyle: styles.headerStyle,
    header: () => (
      <BaseTabsHeader
        testIDsProps={{
          profileButton: isWalletVisible ? testIDs.wallet.header.profile : testIDs.depositForUnverified.header.profile,
          signInButton: isWalletVisible ? testIDs.wallet.header.signIn : testIDs.depositForUnverified.header.signIn,
          signUpButton: isWalletVisible ? testIDs.wallet.header.signUp : testIDs.depositForUnverified.header.signUp
        }}
      />
    )
  };

  return isWalletVisible ? (
    <Stack.Navigator initialRouteName={WALLET_ROUTE_NAMES.Wallet} screenOptions={screenOptions}>
      <Stack.Screen name={WALLET_ROUTE_NAMES.Wallet} component={Wallet} />
    </Stack.Navigator>
  ) : (
    <Stack.Navigator initialRouteName={ROOT_ROUTE_NAMES.DepositForUnverified} screenOptions={screenOptions}>
      <Stack.Screen name={ROOT_ROUTE_NAMES.DepositForUnverified} component={DepositForUnverified} />
    </Stack.Navigator>
  );
};

export default WalletStackNavigator;

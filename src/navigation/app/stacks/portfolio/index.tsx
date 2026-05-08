import React, { FC, useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Portfolio, DepositForUnverified } from '@/containers';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useTheme } from '@react-navigation/native';
import { useAppSelector } from '@/hooks';
import { BaseTabsHeader } from '@/components';
import { testIDs } from '@/constants';
import useStyles from './styles';

export enum PORTFOLIO_ROUTE_NAMES {
  Portfolio = 'Portfolio',
  History = 'History',
  Orders = 'Orders',
  Overview = 'Overview',
  Positions = 'Positions'
}

export type PortfolioRootParamsList = {
  Portfolio:
    | {
        confirmation:
          | {
              title: string;
              label: string;
              onPress: () => void;
            }
          | undefined;
      }
    | undefined;
  History: undefined;
  Orders: undefined;
  Overview: undefined;
  Positions: undefined;
};

const Stack = createStackNavigator<PortfolioRootParamsList & RootRootParamsList>();

const PortfolioStackNavigator: FC = () => {
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

  const isPortfolioVisible = useMemo(() => {
    return Boolean(!isAuthorized || (isAuthorized && isVerified) || isUnverifiedWithFirstDeposit);
  }, [isAuthorized, isVerified, isUnverifiedWithFirstDeposit]);

  const screenOptions = {
    headerShadowVisible: false,
    headerStyle: styles.headerStyle,
    header: () => (
      <BaseTabsHeader
        testIDsProps={{
          profileButton: isPortfolioVisible
            ? testIDs.portfolio.header.profile
            : testIDs.depositForUnverified.header.profile,
          signInButton: isPortfolioVisible
            ? testIDs.portfolio.header.signIn
            : testIDs.depositForUnverified.header.signIn,
          signUpButton: isPortfolioVisible
            ? testIDs.portfolio.header.signUp
            : testIDs.depositForUnverified.header.signUp
        }}
      />
    )
  };

  return isPortfolioVisible ? (
    <Stack.Navigator initialRouteName={PORTFOLIO_ROUTE_NAMES.Portfolio} screenOptions={screenOptions}>
      <Stack.Screen name={PORTFOLIO_ROUTE_NAMES.Portfolio} component={Portfolio} />
    </Stack.Navigator>
  ) : (
    <Stack.Navigator initialRouteName={ROOT_ROUTE_NAMES.DepositForUnverified} screenOptions={screenOptions}>
      <Stack.Screen name={ROOT_ROUTE_NAMES.DepositForUnverified} component={DepositForUnverified} />
    </Stack.Navigator>
  );
};

export default PortfolioStackNavigator;

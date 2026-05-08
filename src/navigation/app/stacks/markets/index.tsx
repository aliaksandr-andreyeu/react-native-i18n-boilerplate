import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Markets } from '@/containers';
import { useTheme } from '@react-navigation/native';
import { BaseTabsHeader } from '@/components';
import { testIDs } from '@/constants';
import useStyles from './styles';

export enum MARKETS_ROUTE_NAMES {
  Markets = 'Markets'
}

export type MarketsRootParamsList = {
  Markets:
    | {
        assetCategory: string;
      }
    | undefined;
};

const Stack = createStackNavigator<MarketsRootParamsList>();

const MarketsStackNavigator: FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const screenOptions = {
    headerShadowVisible: false,
    headerStyle: styles.headerStyle,
    header: () => (
      <BaseTabsHeader
        testIDsProps={{
          profileButton: testIDs.markets.header.profile,
          signInButton: testIDs.markets.header.signIn,
          signUpButton: testIDs.markets.header.signUp
        }}
      />
    )
  };

  return (
    <Stack.Navigator initialRouteName={MARKETS_ROUTE_NAMES.Markets} screenOptions={screenOptions}>
      <Stack.Screen name={MARKETS_ROUTE_NAMES.Markets} component={Markets} />
    </Stack.Navigator>
  );
};

export default MarketsStackNavigator;

import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { IdeasHub, WinnerAndLosersArticle } from '@/containers';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import useStyles from './styles';
import { TLineChartDataProp } from 'react-native-wagmi-charts';

export enum IDEASHUB_ROUTE_NAMES {
  IdeasHub = 'IdeasHub',
  IdeasCategories = 'IdeasCategories',
  IdeaDetails = 'IdeaDetails',
  WinnerAndLosersArticle = 'WinnerAndLosersArticle'
}

export type IdeasHubRootParamsList = {
  IdeasHub: undefined;
  WinnerAndLosersArticle: {
    profit: number;
    config: { lastClosedPrice: number; digits: number };
    lastTick: { ask: string; bid: string };
    chartData: TLineChartDataProp;
    id: string;
    title: string;
    description: string;
    symbol: string;
    isProfitPlus: boolean;
    imageUrl: string;
    fullName: string;
  };
};

type headerTitleAlign = 'center' | 'left';

const Stack = createStackNavigator<IdeasHubRootParamsList>();

const IdesHubStackNavigator: FC = () => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const screenOptions = {
    headerStyle: styles.headerStyle,
    headerTitle: '',
    headerTitleAlign: 'center' as headerTitleAlign,
    headerShadowVisible: false
  };

  return (
    <Stack.Navigator initialRouteName={IDEASHUB_ROUTE_NAMES.IdeasHub} screenOptions={screenOptions}>
      <Stack.Screen
        name={IDEASHUB_ROUTE_NAMES.IdeasHub}
        component={IdeasHub}
        options={{
          animationEnabled: false
        }}
      />
      <Stack.Screen
        name={IDEASHUB_ROUTE_NAMES.WinnerAndLosersArticle}
        component={WinnerAndLosersArticle}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export default IdesHubStackNavigator;

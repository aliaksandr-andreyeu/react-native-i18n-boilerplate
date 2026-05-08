import React, { FC, useCallback } from 'react';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { testIDs } from '@/constants';
import {
  PortfolioStackNavigator,
  MarketsStackNavigator,
  WalletStackNavigator,
  PulseAIStackNavigator,
  MARKETS_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { useAuthState } from '@/hooks';

export enum APP_ROUTE_NAMES {
  Pulse = 'PulseScene',
  Portfolio = 'PortfolioScene',
  Markets = 'MarketsScene',
  Wallet = 'WalletScene'
}

export type AppRootParamsList = {
  PulseScene: undefined;
  IdesHubScene: undefined;
  PortfolioScene: undefined;
  MarketsScene: undefined | { screen: MARKETS_ROUTE_NAMES };
  WalletScene: undefined;
};

const Tab = createBottomTabNavigator<AppRootParamsList>();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const getPulseIcon = ({ color, focused }: TabIconProps) => {
  if (focused) return <SvgIcon color={color} name={SvgXmlIconNames.pulseActive} size={{ height: 19, width: 22 }} />;
  return <SvgIcon color={color} name={SvgXmlIconNames.pulse} size={{ height: 19, width: 22 }} />;
};

const getIdesHubIcon = ({ color, focused }: TabIconProps) => {
  if (focused) return <SvgIcon color={color} name={SvgXmlIconNames.ideasHubActive} size={IconSize.md} />;
  return <SvgIcon color={color} name={SvgXmlIconNames.ideasHub} size={IconSize.md} />;
};

const getPortfolioIcon = ({ color, focused }: TabIconProps) => {
  if (focused) return <SvgIcon name={SvgXmlIconNames.portfolioIconActive} size={IconSize.md} color={color} />;
  return <SvgIcon name={SvgXmlIconNames.portfolio} size={IconSize.md} color={color} />;
};
const getMarketsIcon = ({ color, focused }: TabIconProps) => {
  if (focused) return <SvgIcon name={SvgXmlIconNames.marketIconActive} size={IconSize.md} color={color} />;
  return <SvgIcon name={SvgXmlIconNames.marketings} size={IconSize.md} color={color} />;
};

const getWalletIcon = ({ color, focused }: TabIconProps) => {
  if (focused) return <SvgIcon name={SvgXmlIconNames.walletIconActive} size={IconSize.md} color={color} />;
  return <SvgIcon name={SvgXmlIconNames.wallet} size={IconSize.md} color={color} />;
};

const TabNavigator: FC = () => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { reset } = useAuthState();

  const { palette } = theme || {};
  const { icon } = palette || {};

  const tabBarLabels = {
    pulse: t('navigation.pulse'),
    ideasHub: t('navigation.ideas-hub'),
    portfolio: t('navigation.portfolio'),
    markets: t('navigation.markets'),
    wallet: t('navigation.wallet')
  };

  const screenOptions: BottomTabNavigationOptions = {
    tabBarActiveTintColor: icon.base.strong,
    tabBarInactiveTintColor: icon.base.secondary,
    tabBarLabelPosition: 'below-icon',
    headerShown: false,
    unmountOnBlur: false,
    tabBarItemStyle: styles.tabBarItemStyle,
    tabBarLabelStyle: styles.tabBarLabelStyle,
    tabBarStyle: styles.tabBarStyle
  };

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [])
  );

  return (
    <Tab.Navigator initialRouteName={APP_ROUTE_NAMES.Pulse} screenOptions={screenOptions} backBehavior={'history'}>
      <Tab.Screen
        name={APP_ROUTE_NAMES.Pulse}
        component={PulseAIStackNavigator}
        options={{
          tabBarLabel: tabBarLabels.pulse,
          tabBarIcon: getPulseIcon,
          tabBarTestID: testIDs.tabBar.pulse
        }}
      />
      <Tab.Screen
        name={APP_ROUTE_NAMES.Portfolio}
        component={PortfolioStackNavigator}
        options={{
          tabBarLabel: tabBarLabels.portfolio,
          tabBarIcon: getPortfolioIcon,
          tabBarTestID: testIDs.tabBar.portfolio
        }}
      />
      <Tab.Screen
        name={APP_ROUTE_NAMES.Markets}
        component={MarketsStackNavigator}
        options={{
          tabBarLabel: tabBarLabels.markets,
          tabBarIcon: getMarketsIcon,
          tabBarTestID: testIDs.tabBar.markets
        }}
      />
      <Tab.Screen
        name={APP_ROUTE_NAMES.Wallet}
        component={WalletStackNavigator}
        options={{
          tabBarLabel: tabBarLabels.wallet,
          tabBarIcon: getWalletIcon,
          tabBarTestID: testIDs.tabBar.wallet
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

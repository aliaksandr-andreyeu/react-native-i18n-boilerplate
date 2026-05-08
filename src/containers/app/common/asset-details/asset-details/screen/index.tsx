import React, { FC, useMemo, memo, useLayoutEffect, useCallback } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { MARKETS_ROUTE_NAMES } from '@/navigation/app/stacks';
import { BaseAssetDetailsTabs, BaseBackButton } from '@/components';
import { useTheme, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AssetDetailsOverview, AssetDetailsTrades } from '@/containers';
import { MaterialTopTabBarProps, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import useStyles from './styles';
import { View } from 'react-native';
import { getAssetName } from '@/helpers';

const Tab = createMaterialTopTabNavigator();

const screenOptions = { animationEnabled: true, lazy: true, swipeEnabled: false };

type AssetDetailsScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.AssetDetails>;

interface AssetDetailsScreenData extends AssetDetailsScreenProps {
  asset: string;
}

const AssetDetailsScreen: FC<AssetDetailsScreenData> = ({ route, navigation, asset }) => {
  const { params } = route || {};
  const { ask, bid, digits } = params || {};

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  //TODO: Denys said we should exclude 'news' and 'info' for now.
  const routes = [
    { index: 0, name: t('screens.asset-details.tabs.overview') },
    { index: 1, name: t('screens.asset-details.tabs.trades') }
    // { index: 2, name: t('screens.asset-details.tabs.news') },
    // { index: 3, name: t('screens.asset-details.tabs.info') }
  ];

  const isGoBack = Boolean(ask === undefined && bid === undefined && digits === undefined);

  const goBack = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Markets,
      params: {
        screen: MARKETS_ROUTE_NAMES.Markets
      }
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: getAssetName(asset),
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: styles.headerStyle,
      headerLeft: () => <BaseBackButton isChevron={false} customBack={isGoBack ? goBack : undefined} />,
      headerRight: () => null
    });
    return () => { };
  }, [navigation, route, asset, goBack]);

  const TabBar = useCallback(({ state, navigation }: MaterialTopTabBarProps) => {
    return <BaseAssetDetailsTabs state={state} navigation={navigation} />;
  }, []);

  const Routes = useMemo(() => {
    return (
      <>
        <Tab.Screen key={`${routes[0].index}-route`} name={routes[0].name} component={AssetDetailsOverview} />
        <Tab.Screen
          key={`${routes[1].index}-route`}
          name={routes[1].name}
          component={() => <AssetDetailsTrades navigation={navigation} route={route} />}
        />
        {/* <Tab.Screen key={`${routes[2].index}-route`} name={routes[2].name} component={AssetDetailsNews} />
             <Tab.Screen key={`${routes[3].index}-route`} name={routes[3].name} component={AssetDetailsInfo} /> */}
      </>
    );
  }, [asset]);

  return (
    <View style={styles.safe}>
      <Tab.Navigator
        backBehavior='history'
        initialRouteName={routes[0].name}
        tabBar={TabBar}
        removeClippedSubviews
        shouldRasterizeIOS
        screenOptions={screenOptions}
      >
        {Routes}
      </Tab.Navigator>
    </View>
  );
};

export default memo(AssetDetailsScreen);

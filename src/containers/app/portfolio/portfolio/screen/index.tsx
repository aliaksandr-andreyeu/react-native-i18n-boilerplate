import React, { FC, useCallback, useLayoutEffect, useEffect, useMemo, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { PORTFOLIO_ROUTE_NAMES, PortfolioRootParamsList } from '@/navigation/app/stacks';
import { StatusBar, Modal, View, Pressable } from 'react-native';
import { BaseTabBar, BaseCalendarButton, AccountsList, BaseText, BaseDateSelector } from '@/components';
import { useTheme, ParamListBase } from '@react-navigation/native';
import useStyles from './styles';
import { testIDs } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { IBarRoutes } from '@/components/atoms/tabbar';
import { useGetDealsAccountsQuery } from '@/store/api';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { MaterialTopTabBarProps, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Overview from '../../overview';
import Orders from '../../orders';
import Positions from '../../positions';
import History from '../../history';
import { actions } from '@/store';
import dateHelper from '@/helpers/dateHelper';
import Animated, { CurvedTransition, FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

type PortfolioScreenProps = StackScreenProps<ParamListBase & PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.Portfolio>;

const {
  portfolio: { setDateRange },
  application: { openModal }
} = actions;

const Tab = createMaterialTopTabNavigator();

const screenOptions = { animationEnabled: false, lazy: true, swipeEnabled: false };

export enum PORTFOLIO_TAB_ROUTE_NAMES {
  Overview = 'Overview',
  Positions = 'Positions',
  Orders = 'Orders',
  History = 'History'
}

export type PortfolioTabParamsList = {
  Overview: undefined;
  Positions: undefined;
  Orders: undefined;
  History: undefined;
};

const PortfolioScreen: FC<PortfolioScreenProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { confirmation } = params || {};
  const { title: confirmTitle, label: confirmLabel, onPress: confirmOnPress } = confirmation || {};

  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);

  const [getDealsAccounts] = useGetDealsAccountsQuery();

  const { dateRange, selectedAccount, userInfo } = useAppSelector((state) => state.portfolio);
  const activeIndex = useAppSelector((store) => store.portfolio.activeTab);
  const { id: userId, isVerified } = userInfo || {};

  const showGuideline = !userInfo.firstDepositDate || !userInfo.lastTradedAt;

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const routes: IBarRoutes[] = [
    { index: 0, name: PORTFOLIO_TAB_ROUTE_NAMES.Overview, label: t('screens.portfolio.tabs.overview') },
    { index: 1, name: PORTFOLIO_TAB_ROUTE_NAMES.Positions, label: t('screens.portfolio.tabs.positions') },
    { index: 2, name: PORTFOLIO_TAB_ROUTE_NAMES.Orders, label: t('screens.portfolio.tabs.orders') },
    { index: 3, name: PORTFOLIO_TAB_ROUTE_NAMES.History, label: t('screens.portfolio.tabs.history') }
  ];

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const openConfirm = () => {
    if (confirmTitle === undefined || confirmLabel === undefined || confirmOnPress === undefined) {
      return;
    }
    StatusBar.setBarStyle('dark-content');
    dispatch(
      openModal({
        title: confirmTitle,
        icon: images.done,
        onClosed: closeConfirm,
        iconSize: {
          width: 90,
          height: 90
        },
        button: {
          text: confirmLabel,
          onPress: () => {
            confirmOnPress && typeof confirmOnPress === 'function' && confirmOnPress();
          }
        }
      })
    );
  };

  const closeConfirm = () => {
    navigation.setParams({ confirmation: undefined });
  };

  useLayoutEffect(() => {
    openConfirm();
  }, [confirmation]);

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

  useEffect(() => {
    const getAssetsAndAccounts = async () => {
      await getDealsAccountsHandler();
    };
    getAssetsAndAccounts();
  }, [userId, selectedAccount]);

  const onDateButtonPress = useCallback(() => setIsDateOpen((p) => !p), [setIsDateOpen]);

  const onAccountPress = useCallback(() => {
    setSheetVisible(true);
  }, [setSheetVisible]);

  useEffect(() => {
    setActiveTab(activeIndex);
    if (activeIndex === 0) setTimeout(() => setSheetVisible(false), 550);
  }, [activeIndex]);

  const TabBar = useCallback(
    (props: MaterialTopTabBarProps) => {
      const handleDate = () => {
        const firstDate = dateHelper.isValid(dateRange[0]) && dateHelper.to(dateRange[0], 'DD MMM YYYY');
        const secondDate = dateHelper.isValid(dateRange[1]) && dateHelper.to(dateRange[1], 'DD MMM YYYY');
        if (firstDate) {
          if (secondDate) return `${firstDate} - ${secondDate}`;
          return firstDate;
        }
        return '';
      };

      const today = dateHelper.current('YYYY-MM-DD');
      const todayFormat = dateHelper.to(today, 'DD MMM YYYY');
      const selectedDate = dateHelper.to(dateRange[0], 'DD MMM YYYY');
      const isToday = todayFormat === selectedDate;
      const hasSecondDate = !!dateRange[1].length;
      const show = hasSecondDate ? true : !isToday;

      return (
        <>
          <BaseTabBar state={props.state} navigation={props.navigation} descriptors={props.descriptors} />
          {isAuthorized && isVerified ? (
            <Animated.View
              testID={testIDs.portfolio.tabWrapper}
              layout={CurvedTransition}
              entering={FadeIn}
              style={[styles.headContainer, activeTab === 3 && { marginTop: 16 }]}
            >
              {activeTab === 3 && (
                <>
                  <View style={{ gap: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <BaseText
                      testID={testIDs.portfolio.selectedDate}
                      style={{ color: theme.palette.text.interaction.basic.accent.default }}
                    >
                      {handleDate()}
                    </BaseText>
                    {show && (
                      <Pressable
                        testID={testIDs.portfolio.clearDate}
                        hitSlop={8}
                        onPress={() => dispatch(setDateRange([today, '', {}]))}
                      >
                        <SvgIcon
                          style={{ top: 1 }}
                          name={SvgXmlIconNames.close}
                          size={IconSize.xxs}
                          color={theme.palette.icon.base.strong}
                        />
                      </Pressable>
                    )}
                  </View>
                  <BaseCalendarButton onPress={onDateButtonPress} />
                </>
              )}
            </Animated.View>
          ) : null}
        </>
      );
    },
    [
      dateRange[0],
      dateRange[1],
      theme.dark,
      activeTab,
      selectedAccount,
      sheetVisible,
      onAccountPress,
      isAuthorized,
      isVerified
    ]
  );

  const Routes = useMemo(() => {
    return (
      <>
        <Tab.Screen
          key={`${routes[0].index}-route`}
          name={routes[0].name}
          options={{ tabBarLabel: routes[0].label }}
          component={Overview as any}
        />

        <Tab.Screen
          key={`${routes[1].index}-route`}
          name={routes[1].name}
          options={{ tabBarLabel: routes[1].label }}
          component={Positions as any}
        />
        <Tab.Screen
          key={`${routes[2].index}-route`}
          name={routes[2].name}
          options={{ tabBarLabel: routes[2].label }}
          component={Orders as any}
        />
        <Tab.Screen
          key={`${routes[3].index}-route`}
          name={routes[3].name}
          options={{ tabBarLabel: routes[3].label }}
          component={History as any}
        />
      </>
    );
  }, [showGuideline, activeTab, routes]);

  const setDRange = (d: any) => {
    dispatch(setDateRange(d));
    setIsDateOpen(false);
  };

  const onRequestClose = () => setIsDateOpen(false);

  return (
    <View style={styles.safe}>
      <View testID={testIDs.portfolio.navigatorTabContainer} style={styles.screen}>
        <Tab.Navigator
          testID={testIDs.portfolio.navigatorTab}
          backBehavior='history'
          initialRouteName={routes[activeIndex || activeTab].name}
          tabBar={TabBar}
          removeClippedSubviews
          shouldRasterizeIOS
          screenOptions={screenOptions}
        >
          {Routes}
        </Tab.Navigator>
      </View>
      <AccountsList visible={sheetVisible} selectedAccountId={selectedAccount} setVisible={setSheetVisible} />
      <Modal animationType='fade' transparent={true} visible={isDateOpen} onRequestClose={onRequestClose}>
        <BaseDateSelector onClose={onRequestClose} onConfirmPress={setDRange} currentDateRange={dateRange} />
      </Modal>
    </View>
  );
};

export default PortfolioScreen;

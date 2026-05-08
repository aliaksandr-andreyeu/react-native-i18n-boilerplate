import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParamListBase, useTheme } from '@react-navigation/native';
import useStyles from './styles';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseRadioButton,
  BaseSearch,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { IBarRoutes } from '@/components/atoms/tabbar';
import { BackHandler, FlatList, TouchableOpacity, View } from 'react-native';
import { BaseRadioButtonType } from '@/components/atoms/radio-button';
import { useTranslation } from 'react-i18next';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import Animated, { CurvedTransition, FadeInUp, FlipInXUp, StretchOutY } from 'react-native-reanimated';
import { config } from '@/constants';
import {
  useGetDepositAccountsMutation,
  useGetDepositPaymentsQuery,
  useGetPaymentMethodConfigsQuery,
  useGetWithdrawAccountsMutation,
  useGetWithdrawPaymentsQuery
} from '@/store/api';
import { useAppSelector, useDepositTracking } from '@/hooks';
import { PSP, ParsedPaymentMethod } from '@/store/slices/wallet/types';
import { Rect } from 'react-native-svg';
import ContentLoader from 'react-content-loader/native';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';

type DepositScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.Deposit>;

const {
  screenWidth,
  screenHeight,
  buttons: { activeOpacity }
} = config;

const DepositScreen: FC<DepositScreenProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [activeRoute, setActiveRoute] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<number>();
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number | string>('...');
  const loginSid = useRef<string>('');

  const tabListRef = useRef<FlatList>(null);

  const updateTracking = useDepositTracking();

  const [getDepositAccounts] = useGetDepositAccountsMutation();
  const [getWithdrawAccounts] = useGetWithdrawAccountsMutation();
  const [getDepositPayments] = useGetDepositPaymentsQuery();
  const [getWithdrawPayments] = useGetWithdrawPaymentsQuery();
  const [getPaymentMethodConfigs] = useGetPaymentMethodConfigsQuery();
  const depositData = useAppSelector((store) => store.wallet.depositPayments);
  const withdrawData = useAppSelector((store) => store.wallet.withdrawPayments);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified } = userInfo || {};

  const configTrading = useAppSelector((store) => store.common.config.trading);
  const walletTypeId = configTrading.walletTypeIds?.find((el) => el);

  const isDeposit = route.params?.isDeposit;

  const data = useMemo(() => (isDeposit ? depositData : withdrawData), [depositData, withdrawData, isDeposit]);

  const theme = useTheme();
  const styles = useStyles(theme);

  const getData = async () => {
    try {
      setIsLoading(true);
      await getPaymentMethodConfigs();

      const getAccount = isDeposit ? getDepositAccounts : getWithdrawAccounts;
      const accounts = await getAccount().unwrap();

      const filteredAccounts = accounts.filter((el) => el.typeId === Number(walletTypeId));

      if (filteredAccounts.length) {
        const firstCanPermission = filteredAccounts.find(
          (item) => item.type.clientPermissions[isDeposit ? 'canDeposit' : 'canWithdraw']
        );
        setBalance(firstCanPermission?.balance || 0);

        if (firstCanPermission) {
          const getPayment = isDeposit ? getDepositPayments : getWithdrawPayments;
          await getPayment(firstCanPermission.loginSid);
          loginSid.current = firstCanPermission.loginSid;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isDeposit && updateTracking({ step: 1 });
  }, [isDeposit]);

  useEffect(() => {
    getData();
  }, [isDeposit, walletTypeId, isVerified]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, []);

  const routes = useMemo((): IBarRoutes[] => {
    const defaultTab = {
      index: 0,
      name: 'All',
      label: 'All'
    };

    const tabsArr = [];
    for (let i = 0; i < data.length; i++) {
      const tab = data[i];
      if (tab.methodGroup) tabsArr.push(tab.methodGroup);
    }

    const uniqueNames = new Set(tabsArr);

    return [
      defaultTab,
      ...[...uniqueNames].map((item, index) => ({
        index: index + 1,
        name: item || '',
        label: item || ''
      }))
    ];
  }, [data]);

  const payments = useMemo((): Partial<PSP & ParsedPaymentMethod>[] => {
    if (data.length === 0) return [];

    if (search.length !== 0) {
      const lowerCase = search.toLowerCase();

      const filteredPayments = data.filter((item) => item.displayName?.toLowerCase?.()?.includes?.(lowerCase));

      const hasSelected = filteredPayments.some((item) => item.id === selectedPayment);
      if (!hasSelected) setSelectedPayment(undefined);

      return filteredPayments;
    } else {
      if (activeRoute === 0) return data;
      const filteredPayments = data.filter((item) => item.methodGroup === routes[activeRoute].name);

      const hasSelected = filteredPayments.some((item) => item.id === selectedPayment);
      if (!hasSelected) setSelectedPayment(undefined);

      return filteredPayments;
    }
  }, [data, search, selectedPayment, activeRoute, routes]);

  const goToAmountEntry = () => {
    if (selectedPayment === undefined) return;
    const provider = data.find((item) => item.id === selectedPayment) || {};
    if (isDeposit) {
      navigation.navigate(ROOT_ROUTE_NAMES.DepositAmountEntry, {
        paymentId: selectedPayment,
        isWithdrawal: false,
        provider: {
          method: provider.methodGroup || '',
          image: provider?.logo || '',
          title: provider.displayName || '',
          id: provider.id || 0
        }
      });
    } else
      navigation.navigate(ROOT_ROUTE_NAMES.WithdrawalAccount, {
        paymentId: selectedPayment,
        loginSid: loginSid.current,
        provider: {
          image: provider?.logo || '',
          title: provider.displayName || ''
        },
        balance
      });
  };

  const onTabPress = useCallback(
    (index: number) => {
      if (activeRoute === index) return;

      setSearch('');
      tabListRef.current?.scrollToIndex({ index, viewOffset: 20, viewPosition: 0.8 });
      setActiveRoute(index);
    },
    [activeRoute]
  );

  const _keyExtractor = useCallback((item: PSP) => `${item.id}-payment`, []);

  const _renderItem = useCallback(
    ({ item }: { item: PSP & ParsedPaymentMethod; index: number }) => {
      const onSelectPayment = () => {
        if (item.id === selectedPayment) setSelectedPayment(undefined);
        else setSelectedPayment(item.id);
      };

      const hasLogo = Boolean(item.logo);

      return (
        <BaseRadioButton
          icon={
            hasLogo ? (
              <BaseImage resizeMode='cover' source={{ uri: item.logo }} style={styles.img} />
            ) : (
              <SvgIcon name={SvgXmlIconNames.bankCard} />
            )
          }
          type={BaseRadioButtonType.secondary}
          contentStyle={styles.radioStyle}
          isSelected={item.id === selectedPayment}
          checkBoxWrapperStyle={IconSize.sm}
          label={item.displayName}
          subTitle={item.description}
          onPress={onSelectPayment}
        />
      );
    },
    [selectedPayment]
  );

  const Seperator = useCallback(() => {
    return <View style={styles.seperator} />;
  }, [theme.dark]);

  const EmptyTabs = useCallback(
    ({ children }: { children: JSX.Element }) => {
      if (!isLoading) return children;

      const rows = new Array(6).fill(null);

      const cardWidth = Math.floor((screenWidth - 34) / 4);

      return (
        <ContentLoader
          speed={2}
          width={screenWidth}
          height={screenHeight}
          viewBox={`0 0 ${screenWidth} ${screenHeight}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={theme.palette.graphite['050']}
        >
          <Rect width={screenWidth - 40} rx={8} ry={8} y={40} x={20} height={38} />
          {rows.map((_, index) => {
            const x = index * 12 + index * cardWidth + 20;
            return <Rect key={`${index}-placeholder`} rx={8} ry={8} y={108} x={x} width={cardWidth} height={32} />;
          })}
          <Rect width={screenWidth - 40} rx={8} ry={8} y={168} x={20} height={screenHeight} />
        </ContentLoader>
      );
    },
    [isLoading]
  );

  const _TabKeyExtractor = useCallback((item: IBarRoutes, index: number) => `${item.name}-${index}`, []);

  const _TabRenderItem = useCallback(
    ({ item }: { item: IBarRoutes }) => {
      const onPress = () => onTabPress(item.index);

      return (
        <BaseButton
          style={styles.tab}
          label={item.name}
          size={BaseButtonSize.small}
          type={item.index === activeRoute ? BaseButtonType.primary : undefined}
          onPress={onPress}
        />
      );
    },
    [activeRoute]
  );

  const onClear = useCallback(() => setSearch(''), []);

  const EmptyList = useCallback(
    ({ search }: { search: string }) => {
      return (
        <View style={styles.emptyList}>
          <BaseImage resizeMode='contain' style={styles.searchImg} source={images.search} />
          <View style={styles.textContainer}>
            <BaseText style={styles.textAlign} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.deposit.no-result', { search })}
            </BaseText>
            <BaseText style={styles.textAlign}>{t('screens.deposit.adjust-search')}</BaseText>
          </View>
          <TouchableOpacity onPress={onClear} activeOpacity={activeOpacity} hitSlop={5}>
            <BaseText variant={BaseTextVariant.textSemiBold} style={styles.clear}>
              {t('screens.deposit.clear-search')}
            </BaseText>
          </TouchableOpacity>
        </View>
      );
    },
    [t]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader hideProgressBar leftIconType={SvgXmlIconNames.arrowLeft} stepsCount={0} currentStep={0} />
      <BaseText style={styles.title} variant={BaseTextVariant.title}>
        {isDeposit ? t('screens.deposit.title') : t('screens.withdrawal.request-withdrawal')}
      </BaseText>
      <BaseText style={styles.balance} variant={BaseTextVariant.small}>
        {t('screens.withdrawal.wallet-balance', { balance })}
      </BaseText>

      {isLoading || (
        <View style={styles.searchContainer}>
          <BaseSearch
            value={search}
            hasClear={search.length > 0}
            onChangeText={setSearch}
            onClear={onClear}
            containerStyle={styles.searchBar}
            placeholder={t('screens.deposit.search')}
          />
        </View>
      )}
      {search.length === 0 && (
        <View style={styles.tabBar}>
          <EmptyTabs>
            <Animated.FlatList
              entering={FlipInXUp}
              exiting={StretchOutY.duration(100)}
              layout={CurvedTransition}
              data={routes}
              overScrollMode={'never'}
              bounces={false}
              horizontal
              ref={tabListRef}
              contentContainerStyle={styles.tabContent}
              style={styles.tabStyle}
              showsHorizontalScrollIndicator={false}
              keyExtractor={_TabKeyExtractor}
              renderItem={_TabRenderItem}
            />
          </EmptyTabs>
        </View>
      )}

      <Animated.ScrollView
        layout={CurvedTransition}
        entering={FadeInUp}
        key={`${activeRoute}-tab`}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.FlatList
          data={payments as ArrayLike<PSP & ParsedPaymentMethod>}
          scrollEnabled={false}
          style={[styles.list, payments.length === 0 && styles.resetStyle]}
          ListEmptyComponent={<EmptyList search={search} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={Seperator}
          renderItem={_renderItem}
          keyExtractor={_keyExtractor}
        />
      </Animated.ScrollView>

      <View style={styles.button}>
        {selectedPayment !== undefined && (
          <BaseButton
            disabled={selectedPayment === undefined}
            type={BaseButtonType.primary}
            label={t('screens.deposit.continue')}
            onPress={goToAmountEntry}
            style={styles.btn}
          />
        )}
        <BaseText style={styles.secure} variant={BaseTextVariant.small}>
          {t('screens.common.fully-secured')}
        </BaseText>
      </View>
    </SafeAreaView>
  );
};

export default DepositScreen;

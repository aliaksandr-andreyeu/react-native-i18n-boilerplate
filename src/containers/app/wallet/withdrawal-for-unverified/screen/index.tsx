import { useAppSelector } from '@/hooks';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WALLET_ROUTE_NAMES } from '@/navigation/app/stacks';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useFocusEffect, ParamListBase } from '@react-navigation/native';
import useStyles from './styles';
import { BaseButton, BaseButtonType, BaseImage, BaseRadioButton, BaseText, BaseTextVariant } from '@/components';
import { BackHandler, TouchableOpacity, View } from 'react-native';
import { BaseRadioButtonType } from '@/components/atoms/radio-button';
import { useTranslation } from 'react-i18next';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import Animated, { CurvedTransition, FadeInUp } from 'react-native-reanimated';
import { config } from '@/constants';
import {
  useGetPaymentMethodConfigsQuery,
  useGetWithdrawAccountsMutation,
  useGetWithdrawPaymentsQuery
} from '@/store/api';
import { PSP, ParsedUnverifiedPaymentMethod } from '@/store/slices/wallet/types';
import { Rect } from 'react-native-svg';
import ContentLoader from 'react-content-loader/native';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';

type WithdrawalForUnverifiedScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.WithdrawalForUnverified
>;

const { screenWidth, screenHeight, headerBar } = config;

const WithdrawalForUnverifiedScreen: FC<WithdrawalForUnverifiedScreenProps> = ({ route, navigation }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    colors,
    palette: { graphite, background }
  } = theme;

  const [selectedPayment, setSelectedPayment] = useState<number | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);

  const loginSid = useRef<string>('');

  const [getWithdrawAccounts] = useGetWithdrawAccountsMutation();
  const [getWithdrawPayments] = useGetWithdrawPaymentsQuery();
  const [getPaymentMethodConfigs] = useGetPaymentMethodConfigsQuery();

  const { withdrawPayments = [], unverifiedPaymentMethods = [] } = useAppSelector((store) => store.wallet);

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified } = userInfo || {};

  const configTrading = useAppSelector((store) => store.common.config.trading);
  const walletTypeId = configTrading.walletTypeIds?.find((el) => el);

  const data = useMemo(() => {
    if (unverifiedPaymentMethods?.length && withdrawPayments?.length) {
      const paymentMethodsMap = new Map(
        unverifiedPaymentMethods.filter((el) => el?.action === 'withdrawal').map((item) => [item.systemId, item])
      );
      const newWithdrawPaymentsAsArray = [...withdrawPayments] as Partial<PSP & ParsedUnverifiedPaymentMethod>[];

      for (let i = 0; i < withdrawPayments.length; i++) {
        const payment = withdrawPayments[i];

        const stringID = payment?.id?.toString() || '';

        const config = paymentMethodsMap.get(stringID);

        if (config) {
          const { displayName, logo, systemId, displayDescription, available } = config;
          newWithdrawPaymentsAsArray[i] = {
            available: Boolean(available),
            ...payment,
            ...(displayName && { displayName }),
            ...(displayDescription && { displayDescription }),
            ...(logo && { logo }),
            ...(!!systemId && { systemId })
          };
        }
      }

      return newWithdrawPaymentsAsArray.filter((method) => method?.available);
    }

    return [];
  }, [withdrawPayments, unverifiedPaymentMethods]);

  const isData = useMemo(() => {
    return Boolean(data && Array.isArray(data) && data.length > 0);
  }, [data]);

  const { setOptions, goBack, canGoBack } = navigation || {};

  const canBack = canGoBack();

  const goToWallet = () => {
    navigation.replace(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Wallet,
      params: {
        screen: WALLET_ROUTE_NAMES.Wallet
      }
    });
  };

  const goToBack = () => {
    if (!canBack) {
      goToWallet();
      return;
    }
    goBack();
  };

  const goToAmountEntry = () => {
    if (selectedPayment === undefined) return;
    const provider = data.find((item) => item.id === selectedPayment) || {};

    navigation.navigate(ROOT_ROUTE_NAMES.WithdrawalAccount, {
      paymentId: selectedPayment,
      loginSid: loginSid.current,
      provider: { image: provider?.logo || '', title: provider.displayName || '' },
      balance
    });
  };

  const HeaderLeft = useCallback(() => {
    return (
      <TouchableOpacity activeOpacity={headerBar.buttons.activeOpacity} style={styles.arrowIcon} onPress={goToBack}>
        <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} color={colors.primary} />
      </TouchableOpacity>
    );
  }, [colors, goToBack, styles]);

  useFocusEffect(
    useCallback(() => {
      setOptions({
        headerShadowVisible: false,
        headerTitle: '',
        headerStyle: [styles.headerStyle, { backgroundColor: theme.palette.graphite['050'] }],
        headerLeft: () => <HeaderLeft />,
        headerRight: () => null
      });
      return () => {};
    }, [setOptions, route, accessToken, theme])
  );

  const getData = async () => {
    try {
      setIsLoading(true);
      await getPaymentMethodConfigs();

      const accounts = await getWithdrawAccounts().unwrap();
      const filteredAccounts = accounts.filter((el) => el.typeId === Number(walletTypeId));

      if (filteredAccounts.length) {
        const firstCanPermission = filteredAccounts.find((item) => item.type.clientPermissions['canWithdraw']);

        setBalance(firstCanPermission?.balance || 0);

        if (firstCanPermission) {
          await getWithdrawPayments(firstCanPermission.loginSid);
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
    getData();
  }, [walletTypeId, isVerified]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, []);

  const _keyExtractor = useCallback((item: PSP) => `${item.id}-payment`, []);

  const _renderItem = useCallback(
    ({ item }: { item: PSP & ParsedUnverifiedPaymentMethod; index: number }) => {
      const { id, logo, available, displayDescription, displayName } = item || {};

      const onSelectPayment = () => {
        if (id === selectedPayment) {
          setSelectedPayment(undefined);
        } else setSelectedPayment(id);
      };

      const hasLogo = Boolean(logo);

      return (
        <BaseRadioButton
          icon={
            hasLogo ? (
              <BaseImage resizeMode='cover' source={{ uri: logo }} style={styles.img} />
            ) : (
              <SvgIcon name={SvgXmlIconNames.bankCard} />
            )
          }
          type={BaseRadioButtonType.secondary}
          contentStyle={styles.radioStyle}
          isSelected={id === selectedPayment}
          checkBoxWrapperStyle={IconSize.sm}
          label={displayName}
          subTitle={displayDescription || ''}
          onPress={onSelectPayment}
        />
      );
    },
    [selectedPayment, setSelectedPayment, t, styles, theme]
  );

  const Separator = useCallback(() => {
    return <View style={styles.seperator} />;
  }, [styles]);

  const EmptyList = useCallback(() => {
    if (isLoading) {
      return (
        <ContentLoader
          speed={2}
          width={screenWidth}
          height={screenHeight}
          viewBox={`0 0 ${screenWidth} ${screenHeight}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={theme.palette.graphite['050']}
        >
          <Rect width={screenWidth - 40} rx={8} ry={8} y={0} x={0} height={screenHeight} />
        </ContentLoader>
      );
    }
    return (
      <View style={styles.emptyList}>
        <BaseImage resizeMode='contain' style={styles.searchImg} source={images.search} />
        <View style={styles.textContainer}>
          <BaseText style={styles.textAlign} variant={BaseTextVariant.captionSemiBold}>
            {t('screens.deposit.no-psp-found')}
          </BaseText>
        </View>
      </View>
    );
  }, [t, isLoading, screenWidth, screenHeight, styles, theme]);

  return (
    <SafeAreaView style={styles.safe}>
      <BaseText style={styles.title} variant={BaseTextVariant.title}>
        {t('screens.withdrawal.title')}
      </BaseText>
      <Animated.ScrollView
        layout={CurvedTransition}
        entering={FadeInUp}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollBox}
      >
        <Animated.FlatList
          data={data as ArrayLike<PSP & ParsedUnverifiedPaymentMethod>}
          scrollEnabled={false}
          style={[styles.list, !isData && styles.resetStyle]}
          ListEmptyComponent={<EmptyList />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={Separator}
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

export default WithdrawalForUnverifiedScreen;

import { useAppSelector } from '@/hooks';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES, WALLET_ROUTE_NAMES } from '@/navigation/app/stacks';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useFocusEffect, ParamListBase } from '@react-navigation/native';
import useStyles from './styles';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseRadioButton,
  BaseText,
  BaseTextVariant
} from '@/components';
import { BackHandler, TouchableOpacity, View } from 'react-native';
import { BaseRadioButtonType } from '@/components/atoms/radio-button';
import { useTranslation } from 'react-i18next';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import Animated, { CurvedTransition, FadeInUp } from 'react-native-reanimated';
import { config, testIDs } from '@/constants';
import { useGetDepositAccountsMutation, useGetDepositPaymentsQuery } from '@/store/api';
import { PSP, ParsedUnverifiedPaymentMethod } from '@/store/slices/wallet/types';
import { Rect } from 'react-native-svg';
import ContentLoader from 'react-content-loader/native';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';

type DepositForUnverifiedScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.DepositForUnverified
>;

const { screenWidth, screenHeight, headerBar } = config;

const maxDepositAmount = '$100';

const DepositForUnverifiedScreen: FC<DepositForUnverifiedScreenProps> = ({ route, navigation }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    colors,
    palette: { graphite, background }
  } = theme;

  const [selectedPayment, setSelectedPayment] = useState<number | undefined>(undefined);
  const [availablePayment, setAvailablePayment] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loginSid = useRef<string>('');

  const [getDepositAccounts] = useGetDepositAccountsMutation();
  const [getDepositPayments] = useGetDepositPaymentsQuery();

  const { depositPayments = [], unverifiedPaymentMethods = [] } = useAppSelector((store) => store.wallet);

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified, firstDepositDate } = userInfo || {};

  const isUnverifiedWithFirstDeposit = !Boolean(isVerified) && Boolean(firstDepositDate);

  const configTrading = useAppSelector((store) => store.common.config.trading);
  const walletTypeId = configTrading.walletTypeIds?.find((el) => el);

  const data = useMemo(() => {
    if (unverifiedPaymentMethods?.length && depositPayments?.length) {
      const paymentMethodsMap = new Map(
        unverifiedPaymentMethods.filter((el) => el?.action === 'deposit').map((item) => [item.systemId, item])
      );
      const newDepositPaymentsAsArray = [...depositPayments] as Partial<PSP & ParsedUnverifiedPaymentMethod>[];

      for (let i = 0; i < depositPayments.length; i++) {
        const payment = depositPayments[i];

        const stringID = payment?.id?.toString() || '';

        const config = paymentMethodsMap.get(stringID);

        if (config) {
          const { displayName, logo, systemId, displayDescription, available } = config;
          newDepositPaymentsAsArray[i] = {
            available: Boolean(available),
            ...payment,
            ...(displayName && { displayName }),
            ...(displayDescription && { displayDescription }),
            ...(logo && { logo }),
            ...(!!systemId && { systemId })
          };
        } else {
          newDepositPaymentsAsArray[i] = {
            ...payment
          };
        }
      }

      return newDepositPaymentsAsArray.sort((prev, next) =>
        prev?.available === next?.available ? 0 : prev?.available ? -1 : 1
      );
    }

    return depositPayments || [];
  }, [depositPayments, unverifiedPaymentMethods]);

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

  const goProfile = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Common, {
      screen: COMMON_ROUTE_NAMES.Profile
    });
  }, [navigation]);

  const goCompleteVerification = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Common, { screen: COMMON_ROUTE_NAMES.Verification });
  }, [navigation]);

  const goSignUp = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Auth, { screen: AUTH_ROUTE_NAMES.BonusSignUp });
  }, [navigation]);

  const goToAmountEntry = () => {
    if (selectedPayment === undefined) return;
    const provider = data.find((item) => item.id === selectedPayment) || {};

    navigation.navigate(ROOT_ROUTE_NAMES.DepositAmountEntry, {
      paymentId: selectedPayment,
      isWithdrawal: false,
      provider: {
        image: provider?.logo || '',
        title: provider.displayName || '',
        id: provider?.id || 0,
        method: 'Crypto'
      }
    });
  };

  const HeaderRight = useCallback(() => {
    if (isUnverifiedWithFirstDeposit) {
      return null;
    }
    return (
      <TouchableOpacity
        hitSlop={headerBar.buttons.hitSlop}
        testID={testIDs.depositForUnverified.header.profile}
        activeOpacity={headerBar.buttons.activeOpacity}
        style={styles.profileIcon}
        onPress={goProfile}
      >
        <SvgIcon name={SvgXmlIconNames.person} size={IconSize.sm} color={graphite['900']} />
      </TouchableOpacity>
    );
  }, [isUnverifiedWithFirstDeposit, t, goProfile, graphite, styles]);

  const HeaderLeft = useCallback(() => {
    if (isUnverifiedWithFirstDeposit) {
      return (
        <TouchableOpacity activeOpacity={headerBar.buttons.activeOpacity} style={styles.arrowIcon} onPress={goToBack}>
          <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} color={colors.primary} />
        </TouchableOpacity>
      );
    }

    return <SvgIcon style={styles.logoIcon} name={SvgXmlIconNames.logo} size={IconSize.lg} color={colors.accent} />;
  }, [colors, goToBack, isUnverifiedWithFirstDeposit, styles]);

  useFocusEffect(
    useCallback(() => {
      setOptions({
        headerShadowVisible: false,
        headerTitle: '',
        headerStyle: [styles.headerStyle, { backgroundColor: theme.palette.graphite['050'] }],
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />
      });
      return () => { };
    }, [setOptions, route, accessToken, theme])
  );

  const getData = async () => {
    try {
      setIsLoading(true);

      const accounts = await getDepositAccounts().unwrap();
      const filteredAccounts = accounts.filter((el) => el.typeId === Number(walletTypeId));

      if (filteredAccounts.length) {
        const firstCanPermission = filteredAccounts.find((item) => item.type.clientPermissions['canDeposit']);

        if (firstCanPermission) {
          await getDepositPayments(firstCanPermission.loginSid);
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
        setAvailablePayment(available);

        if (id === selectedPayment) {
          setSelectedPayment(undefined);
        } else setSelectedPayment(id);
      };

      const hasLogo = Boolean(logo);

      const backgroundColor = available ? background.tag.base.positive : background.interaction.context.cashback.strong;
      const suffixDesc = available ? t('screens.deposit.verify-id-later') : t('screens.deposit.verify-id-first');

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
          labelSuffix={
            <View
              style={[
                styles.labelSuffixBox,
                {
                  backgroundColor
                }
              ]}
            >
              <BaseText variant={BaseTextVariant.tiny} style={styles.labelSuffixDesc}>
                {suffixDesc}
              </BaseText>
            </View>
          }
          onPress={onSelectPayment}
        />
      );
    },
    [selectedPayment, setSelectedPayment, setAvailablePayment, t, styles, theme]
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
        {t('screens.deposit.title')}
      </BaseText>
      <BaseText style={styles.balance} variant={BaseTextVariant.small}>
        {t('screens.deposit.deposit-and-withdraw-amount', { amount: maxDepositAmount })}
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
        {isData ? (
          <BaseText style={styles.completeVerification} variant={BaseTextVariant.small}>
            {t('screens.deposit.complete-id-verification')}
          </BaseText>
        ) : null}
      </Animated.ScrollView>
      <View style={styles.button}>
        {selectedPayment !== undefined && (
          <BaseButton
            disabled={selectedPayment === undefined}
            type={BaseButtonType.primary}
            label={t('screens.deposit.continue')}
            onPress={availablePayment ? goToAmountEntry : goCompleteVerification}
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

export default DepositForUnverifiedScreen;

import React, { FC, useCallback, useMemo, useLayoutEffect, useState, useRef, useEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import {
  AUTH_ROUTE_NAMES,
  COMMON_ROUTE_NAMES,
  PULSEAI_ROUTE_NAMES,
  WALLET_ROUTE_NAMES,
  WalletRootParamsList
} from '@/navigation/app/stacks';
import {
  BackHandler,
  FlatList,
  InteractionManager,
  ListRenderItemInfo,
  ScrollView,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import {
  BaseText,
  BaseTextVariant,
  BaseHelpButton,
  BaseTradingBanner,
  BaseSwitch,
  WelcomeBanner,
  BaseImage,
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseGuideButton,
  SheetBackdrop,
  BaseVerifyBanner,
  BaseSeparator,
  RewardWallet
} from '@/components';
import { useTheme, ParamListBase } from '@react-navigation/native';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { config, testIDs } from '@/constants';
import { MainWallet, WalletCard } from '../../components';
import { UserAccount } from '@/store/slices/wallet/types';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import useAsyncStorage from '@/hooks/asyncstorage';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { actions } from '@/store';
import { useGetAllSymbolsQuery } from '@/store/api';
import { usePostHog } from 'posthog-react-native';
import { feature_flag_promo_welcome_account, getAccountName } from '@/constants/static';
import { IFeatureFlag } from '@/store/slices/application/types';
import Config from 'react-native-config';
import { AnyPressActions } from '../../components/main-wallet';

const { WELCOME_TYPE_ID, CONTEST_TYPE_ID, DEMO_TYPE_ID } = Config;

const DEFAULT_AVAILABLE_AMOUNT = 100;
const DEFAULT_AMOUNT = 68.5;

type WalletScreenProps = StackScreenProps<ParamListBase & WalletRootParamsList, WALLET_ROUTE_NAMES.Wallet>;

type AccountTypes = 'welcome' | 'demo' | 'marketings' | 'contest';

interface AccountTypeData {
  icon: SvgXmlIconNames;
  iconColor: string | undefined;
  iconWrapColor: string | undefined;
}

type TradingAccountTypeData = Record<AccountTypes, AccountTypeData>;

const {
  headerBar: {
    buttons: { activeOpacity }
  },
  screenWidth
} = config;

const {
  wallet: { setBalance, setTradingAccount },
  portfolio: { setSelectedAccount },
  market: { setSignals, setCategories, setAllSymbols, setSymbols }
} = actions;

const maxBalanceForUnverified = 100;

const WalletScreen: FC<WalletScreenProps> = ({ route, navigation }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite, base, icon }
  } = theme;

  const posthog = usePostHog();

  const [getAllSymbols] = useGetAllSymbolsQuery();

  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { country, isVerified, firstDepositDate, lastTradedAt, id: userId } = userInfo || {};

  const promoWelcome = useAppSelector((store) => store.application.promoWelcome);
  const { conditionsCreditAmount: promoBonus = 0 } = promoWelcome || {};

  const wallet = useAppSelector((state) => state.wallet);
  const { accounts, tradingAccounts } = wallet || {};

  const {
    wallet: walletAccount,
    trading: tradingAccount,
    cashback: cashbackAccount,
    rewards: rewardsAccount
  } = accounts || {};

  const sortedTradingAccounts = useMemo(() => {
    const selectedLogin = tradingAccount.login;
    const tAccounts = [...tradingAccounts];
    return tAccounts.length > 1
      ? tAccounts.sort((a, b) => {
          if (a.login === selectedLogin) return -1;
          if (b.login === selectedLogin) return 1;
          if (a.login !== b.login) return +b.login - +a.login;
          if (a.typeId !== b.typeId) return a.typeId - b.typeId;
          return a.type.displayOrder - b.type.displayOrder;
        })
      : tAccounts;
  }, [tradingAccounts, tradingAccount.login]);

  const { set } = useAsyncStorage<'wallet-steps' | 'default-trading-account'>();

  const [toolTipVisible, setToolTipVisible] = useState<Record<number, boolean>>({});
  const [userWallet, setUserWallet] = useState<UserAccount>();
  const [userIB, setUserIB] = useState<UserAccount>();
  const [userMainWallet, setUserMainWallet] = useState<UserAccount>();
  const [balanceLive, setBalanceLive] = useState({
    balance: 0,
    loss: 0,
    equity: 0,
    currency: 'Not_Currency'
  });

  const [maxBalanceForUnverifiedExceeded, setMaxBalanceForUnverifiedExceeded] = useState<boolean>(false);

  const [selectedTradingLogin, setSelectedTradingLogin] = useState<string>('');
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetIsOpen = useRef<boolean>(false);

  const bottomSheetFlagRef = useRef<BottomSheetModal>(null);
  const bottomSheetUnauthorizedRef = useRef<BottomSheetModal>(null);
  const bottomSheetZeroBalanceRef = useRef<BottomSheetModal>(null);

  const lastToolTipStep = useRef<number>(1);

  const listRef = useRef<FlatList>(null);

  // const handleToolTip = async () => {
  //   try {
  //     const hasValue = await get('wallet-steps');
  //     lastToolTipStep.current = 1;

  //     if (!hasValue) setToolTipVisible({ 1: true });
  //     set('wallet-steps', 'true');
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const isFeatureEnabled = posthog.isFeatureEnabled(feature_flag_promo_welcome_account);
  const featureFlagValue = posthog.getFeatureFlagPayload(feature_flag_promo_welcome_account) as IFeatureFlag;

  const restricted_countries = useMemo(
    () => featureFlagValue?.promotion?.restricted_countries,
    [featureFlagValue?.promotion?.restricted_countries]
  );

  const isRestricedCountry = useMemo(
    () => restricted_countries && restricted_countries.includes(country),
    [restricted_countries, country]
  );
  const flagIsEnabled = useMemo(() => isFeatureEnabled && !isRestricedCountry, [isRestricedCountry, isFeatureEnabled]);

  const unverifiedFeatureIsEnabled = useMemo(() => isFeatureEnabled && !isVerified, [isVerified, isFeatureEnabled]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetIsOpen.current) {
        bottomSheetRef.current?.dismiss();
        bottomSheetFlagRef.current?.dismiss();
        bottomSheetZeroBalanceRef.current?.dismiss();
      } else navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, [navigation]);

  useLayoutEffect(() => {
    setUserWallet(cashbackAccount);
  }, [cashbackAccount]);

  useLayoutEffect(() => {
    const { balance = 0 } = walletAccount || {};
    setUserMainWallet(walletAccount);
    setBalance(balance);
  }, [walletAccount]);

  useLayoutEffect(() => {
    const { balance = 0, equity = 0, credit = 0, currency = 'USD' } = tradingAccount || {};

    const loss = equity - balance - credit;

    const equityAll =
      tradingAccounts
        .filter((item) => `${item.typeId}` !== `${WELCOME_TYPE_ID}`)
        .reduce((acc, sum) => acc + sum.balance, 0) || 0;

    setBalanceLive(() => ({
      balance,
      loss,
      equity: equityAll,
      currency
    }));
  }, [tradingAccount, tradingAccounts, WELCOME_TYPE_ID]);

  useLayoutEffect(() => {
    setUserIB(rewardsAccount);
  }, [rewardsAccount]);

  const onCompleteVerification = useCallback(() => {
    bottomSheetFlagRef.current?.dismiss();

    InteractionManager.runAfterInteractions(() =>
      navigation.navigate(ROOT_ROUTE_NAMES.Common, { screen: COMMON_ROUTE_NAMES.Verification })
    );
  }, [navigation]);

  const onSignUp = useCallback(
    (isSignIn: boolean) => () => {
      bottomSheetUnauthorizedRef.current?.dismiss();
      InteractionManager.runAfterInteractions(() =>
        navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
          screen: isSignIn ? AUTH_ROUTE_NAMES.SignIn : AUTH_ROUTE_NAMES.SignUp
        })
      );
    },
    [navigation]
  );

  const goToDeposit = useCallback(() => {
    bottomSheetZeroBalanceRef.current?.dismiss();
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
    });
  }, [navigation]);

  const totalBalance = useMemo(() => {
    const totalEquity = sortedTradingAccounts.reduce((acc, item) => acc + item.equity, 0);

    const { balance: userMainWalletBalance = 0 } = userMainWallet || {};
    const { balance: userWalletBalance = 0 } = userWallet || {};
    const { balance: userIBBalance = 0 } = userIB || {};

    const total = totalEquity + userMainWalletBalance + userWalletBalance + userIBBalance;
    const roundedTotalBalance = Math.round(total * 100) / 100;

    if (!isVerified) {
      setMaxBalanceForUnverifiedExceeded(Boolean(roundedTotalBalance >= maxBalanceForUnverified));
    }

    const formattedTotal = roundedTotalBalance.toFixed(2);

    return `$${formattedTotal}`;
  }, [
    balanceLive,
    userMainWallet,
    userWallet,
    userIB,
    sortedTradingAccounts,
    isVerified,
    setMaxBalanceForUnverifiedExceeded
  ]);

  const userMainWalletBalance = useMemo(() => {
    const { balance = 0 } = userMainWallet || {};

    const roundedBalance = Math.round((balance || 0) * 100) / 100;
    const formattedBalance = roundedBalance.toFixed(2);

    return `$${formattedBalance}`;
  }, [userMainWallet]);

  const goToRewardsWallet = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.RewardsWallet);
  }, [navigation]);

  const goToReferrals = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Referrals);
  }, [navigation]);

  const renderBanner = useCallback(() => {
    if (!isAuthorized) {
      return (
        <BaseTradingBanner
          title={`${t('screens.common.next-step')}:`}
          subTitle={t('components.molecules.banner.create-account')}
          buttonText={t('components.molecules.banner.sign-up')}
          imageSource={images.idCard}
          onPress={onSignUp(false)}
        />
      );
    }
    if (isAuthorized && isVerified && !firstDepositDate)
      return (
        <BaseTradingBanner
          title={`${t('screens.common.next-step')}:`}
          subTitle={t('screens.wallet.main-wallet-prompt')}
          buttonText={t('screens.wallet.make-deposit')}
          imageSource={images.safe}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
          }}
          testID={testIDs.wallet.screen.tradingBanner.makeDeposit}
        />
      );

    if (isAuthorized && isVerified && firstDepositDate && !balanceLive.equity && !lastTradedAt)
      return (
        <BaseTradingBanner
          title={`${t('screens.common.next-step')}:`}
          subTitle={t('screens.wallet.transfer-funds-trading-account')}
          buttonText={t('screens.wallet.transfer-funds-now')}
          imageSource={images.rocket}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
          }}
          imageStyle={{ right: -22 }}
          testID={testIDs.wallet.screen.tradingBanner.transferFunds}
        />
      );

    if (isAuthorized && isVerified && firstDepositDate && balanceLive.equity && !lastTradedAt)
      return (
        <BaseTradingBanner
          title={t('screens.wallet.start-trading')}
          subTitle={t('screens.wallet.start-trading-now')}
          buttonText={t('screens.wallet.explore-trading-signals')}
          imageSource={images.barChart}
          onPress={() => {
            navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
          }}
          testID={testIDs.wallet.screen.tradingBanner.exploreTrading}
        />
      );

    return null;
  }, [t, lastTradedAt, isVerified, firstDepositDate, isAuthorized, userInfo, balanceLive, onSignUp]);

  const tradingContainer = useMemo(
    (): ViewStyle => ({ width: screenWidth - 40 }),
    [sortedTradingAccounts.length, screenWidth]
  );

  const _tradingKeyExtractor = useCallback((item: UserAccount, index: number) => `${item?.loginSid}-${index}`, []);

  const hasOneTradingAccount = useMemo(() => sortedTradingAccounts?.length === 1, [sortedTradingAccounts.length]);

  const welcomeAccount = useMemo(() => {
    if (!tradingAccounts.length) return false;

    return tradingAccounts.find((item) => `${item.typeId}` === `${WELCOME_TYPE_ID}`);
  }, []);

  const welcomeAccountExpireDate = useMemo(() => {
    if (!welcomeAccount) return undefined;

    return welcomeAccount?.customFields?.custom_expiration_date || '';
  }, [welcomeAccount]);

  const tradingAccountsTypeData: TradingAccountTypeData = useMemo(
    () => ({
      marketings: {
        icon: SvgXmlIconNames.marketings,
        iconColor: base.white,
        iconWrapColor: undefined
      },
      welcome: {
        icon: SvgXmlIconNames.welcome,
        iconColor: graphite['900'],
        iconWrapColor: theme.palette.purple['100']
      },
      contest: {
        icon: SvgXmlIconNames.contest,
        iconColor: graphite['900'],
        iconWrapColor: '#FFAA00' //@@@ TODO Add this YELLOW COLOR to palette when token would updated
      },
      demo: {
        icon: SvgXmlIconNames.cupa,
        iconColor: graphite['900'],
        iconWrapColor: theme.palette.green['400']
      }
    }),
    [theme.dark]
  );

  const _renderTradingItem = useCallback(
    ({ item }: ListRenderItemInfo<UserAccount>) => {
      const equity = item.equity;
      const roundedEquity = Math.round((equity || 0) * 100) / 100;
      const formattedEquity = roundedEquity.toFixed(2);
      const amount = `$${formattedEquity}`;

      const login = item.login;
      const isDefault = tradingAccount.login === login;

      const goToDetails = () => {
        if (isDefault) return navigation.navigate(ROOT_ROUTE_NAMES.TradingAccountOverview, { login });
        setSelectedTradingLogin(login);
        InteractionManager.runAfterInteractions(() => bottomSheetRef.current?.present());
      };

      return (
        <WalletCard
          style={tradingContainer}
          isDefault={isDefault}
          isTrading
          marginLevel={item.marginLevel}
          accountNumber={login}
          onlyAccount={hasOneTradingAccount}
          title={getAccountName(item.typeDisplayName || item.type.title, 'flex', true)}
          amount={amount}
          expire={item.customFields?.custom_expiration_date || ''}
          dynamicImage={!!item.icon?.length}
          icon={item.icon || SvgXmlIconNames.marketings}
          iconWrapColor={item.colour}
          iconColor={theme.palette.base.white}
          onArrowPressed={goToDetails}
          testID={testIDs.wallet.screen.walletCard.whole}
        />
      );
    },
    [
      tradingAccount.login,
      tradingContainer,
      hasOneTradingAccount,
      theme.dark,
      WELCOME_TYPE_ID,
      CONTEST_TYPE_ID,
      DEMO_TYPE_ID,
      tradingAccountsTypeData
    ]
  );

  const onBackButtonPress = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      setToolTipVisible({ [lastToolTipStep.current - 1]: true });
      lastToolTipStep.current = lastToolTipStep.current - 1;
    });
  }, []);
  const onNextButtonPress = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      setToolTipVisible({ [lastToolTipStep.current + 1]: true });
      lastToolTipStep.current = lastToolTipStep.current + 1;
    });
  }, []);

  const onCloseTip = useCallback(() => setToolTipVisible({}), []);

  const onOpenSheet = useCallback(() => (sheetIsOpen.current = true), []);
  const onDismissSheet = useCallback(() => (sheetIsOpen.current = false), []);

  const sheetCurrentTradingData = useMemo(() => {
    return (
      sortedTradingAccounts.find((item) => item?.login === selectedTradingLogin) ||
      ({ type: { title: '' }, login: '' } as UserAccount)
    );
  }, [sortedTradingAccounts, selectedTradingLogin]);

  const onTradingAccountChange = useCallback(
    (value: boolean) => {
      if (value) {
        set('default-trading-account', { [userId]: sheetCurrentTradingData.login });
        dispatch(setSignals([]));
        dispatch(setCategories([]));
        dispatch(setAllSymbols([]));
        dispatch(setSymbols([]));
        dispatch(setTradingAccount(sheetCurrentTradingData));
        dispatch(setSelectedAccount(sheetCurrentTradingData.login));

        listRef.current?.scrollToOffset({ offset: 0 });

        getAllSymbols({ accountId: Number(sheetCurrentTradingData.login) });
      }
    },
    [sheetCurrentTradingData, userId]
  );

  const onSeeTradingDetails = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    InteractionManager.runAfterInteractions(() =>
      navigation.navigate(ROOT_ROUTE_NAMES.TradingAccountOverview, { login: sheetCurrentTradingData.login })
    );
  }, [sheetCurrentTradingData.login]);

  const onUnlockPress = useCallback(() => bottomSheetFlagRef.current?.present(), []);
  const onZeroBalancePress = useCallback(() => bottomSheetZeroBalanceRef.current?.present(), []);
  const onSignUpPress = useCallback(() => bottomSheetUnauthorizedRef.current?.present(), []);

  const navigateToWelcomeAccountDetails = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.WelcomeAccountDetails, { expire: welcomeAccountExpireDate });
  }, [welcomeAccountExpireDate]);

  const ListHeaderComponent = useMemo(() => {
    if (!flagIsEnabled || !welcomeAccount) return null;
    return (
      <BaseGuideButton
        title={t('screens.wallet.trading-guide')}
        onPress={navigateToWelcomeAccountDetails}
        rightIconColor={theme.palette.graphite['600']}
        testID={testIDs.wallet.screen.tradingGuideButton}
      />
    );
  }, [navigateToWelcomeAccountDetails, flagIsEnabled, welcomeAccount, t, theme.dark]);

  const canHistory = useMemo(() => {
    return Boolean((isAuthorized && firstDepositDate) || isVerified);
  }, [isAuthorized, firstDepositDate]);

  const canDeposit = useMemo(() => {
    return Boolean(
      isAuthorized && (isVerified || (!isVerified && firstDepositDate && !maxBalanceForUnverifiedExceeded))
    ); //!unverifiedFeatureIsEnabled
  }, [isAuthorized, isVerified, firstDepositDate, maxBalanceForUnverifiedExceeded]);

  const canWithdrawal = useMemo(() => {
    return Boolean(isAuthorized && firstDepositDate);
  }, [isAuthorized, firstDepositDate]);

  const canTransfer = useMemo(() => {
    return Boolean(
      isAuthorized &&
        ((isVerified && firstDepositDate) || (!isVerified && firstDepositDate && !maxBalanceForUnverifiedExceeded))
    );
  }, [isAuthorized, isVerified, firstDepositDate, maxBalanceForUnverifiedExceeded]);

  const blockWalletActions = useMemo(() => {
    return Boolean(!isAuthorized);
    // //unverifiedFeatureIsEnabled
  }, [isAuthorized]);

  const handleAnyPress = useCallback(
    (action: AnyPressActions) => {
      if (!isAuthorized) {
        return onSignUpPress();
        // } else if (unverifiedFeatureIsEnabled) {
        //   return onUnlockPress();
        // }
      } else if (action === 'history' && !canHistory) {
        return onUnlockPress();
      } else if (action === 'deposit' && !canDeposit) {
        return onUnlockPress();
      } else if (action === 'withdrawal' && !canWithdrawal) {
        return onZeroBalancePress();
      } else if (action === 'transfer') {
        if (!isVerified && firstDepositDate && maxBalanceForUnverifiedExceeded) {
          return onUnlockPress();
        } else if (isVerified && !firstDepositDate) {
          return onZeroBalancePress();
        }
      }
      return undefined;
    },
    [
      canHistory,
      canDeposit,
      canWithdrawal,
      unverifiedFeatureIsEnabled,
      isAuthorized,
      isVerified,
      firstDepositDate,
      onUnlockPress,
      onSignUpPress,
      onZeroBalancePress,
      maxBalanceForUnverifiedExceeded
    ]
  );

  const withBanner = Boolean(renderBanner());

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollBox}
        testID={testIDs.wallet.screen.scrollContent}
      >
        <View style={[styles.topSection, { ...(withBanner ? styles.topSectionWithBanner : {}) }]}>
          <View style={[styles.balance, { ...(withBanner ? styles.balanceWithBanner : {}) }]}>
            <View style={styles.horizontal}>
              <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.title}>
                {t('screens.wallet.title')}
              </BaseText>
              <BaseHelpButton title={t('screens.wallet.title')} text={t('screens.wallet.sum-tooltip')} />
            </View>
            <BaseText variant={BaseTextVariant.amountTitle} testID={testIDs.wallet.screen.totalBalance}>
              {totalBalance}
            </BaseText>
          </View>
          {renderBanner()}
        </View>
        {Boolean(isAuthorized && !isVerified) ? (
          <>
            <BaseSeparator />
            <View style={[styles.section, styles.verifyBanner]}>
              <BaseVerifyBanner />
            </View>
          </>
        ) : null}
        <BaseSeparator />
        <View
          style={[
            styles.section,
            {
              ...((!isAuthorized || !isVerified) && styles.unAuthorizedSection)
            }
          ]}
        >
          <MainWallet
            onAnyPress={handleAnyPress}
            blockActions={blockWalletActions}
            canDeposit={canDeposit}
            canWithdrawal={canWithdrawal}
            canTransfer={canTransfer}
            canHistory={canHistory}
            amount={userMainWalletBalance}
            testID={testIDs.wallet.screen.mainWallet.whole}
          />

          <View style={styles.helpButton140}>
            <BaseHelpButton
              showHelpButton={false}
              isAutoVisible={toolTipVisible[3]}
              onNextButtonPress={onNextButtonPress}
              showStepButtons
              onCloseTip={onCloseTip}
              showBack
              showNext
              onBackButtonPress={onBackButtonPress}
              title='Transfer'
              text={`To start trading, transfer your funds to the Main trading account here.\n\n3/4`}
              testID={testIDs.wallet.screen.helpButton.transfer}
            />
          </View>
          <View style={styles.helpButton80}>
            <BaseHelpButton
              showHelpButton={false}
              isAutoVisible={toolTipVisible[1]}
              onNextButtonPress={onNextButtonPress}
              showStepButtons
              showNext
              onCloseTip={onCloseTip}
              onBackButtonPress={onBackButtonPress}
              title='Main wallet'
              text={`Your deposit has arrived here.\n\n1/4`}
              testID={testIDs.wallet.screen.helpButton.mainWallet}
            />
          </View>
        </View>
        {isVerified || (!isVerified && flagIsEnabled) ? (
          <>
            <BaseSeparator />
            <View style={styles.tradingSection}>
              <View style={styles.helpButton80}>
                <BaseHelpButton
                  showHelpButton={false}
                  isAutoVisible={toolTipVisible[4]}
                  onNextButtonPress={onNextButtonPress}
                  showStepButtons
                  onCloseTip={onCloseTip}
                  showBack
                  arrowPlacement='top'
                  onBackButtonPress={onBackButtonPress}
                  title='Welcome account'
                  text={`Your Welcome account is still here.\n\nTo switch between accounts, long tap on either and choose from the list.\n\n4/4`}
                  testID={testIDs.wallet.screen.helpButton.welcomeAccount}
                />
                <BaseHelpButton
                  showHelpButton={false}
                  isAutoVisible={toolTipVisible[2]}
                  onNextButtonPress={onNextButtonPress}
                  showStepButtons
                  showBack
                  onCloseTip={onCloseTip}
                  arrowPlacement='top'
                  showNext
                  onBackButtonPress={onBackButtonPress}
                  title='Main trading account'
                  text={`This is your main account for accessing all trading features and unlocking the full potential of the platform.\n\n2/4`}
                  testID={testIDs.wallet.screen.helpButton.mainTrading}
                />
              </View>
              {!isVerified && flagIsEnabled && (
                <View style={styles.welcomeBanner}>
                  <WelcomeBanner
                    onUnlockPress={onUnlockPress}
                    bonus={promoBonus}
                    testID={testIDs.wallet.screen.welcomeBanner}
                  />
                </View>
              )}
              {isVerified && (
                <>
                  <FlatList
                    ListHeaderComponent={ListHeaderComponent}
                    ref={listRef}
                    scrollEnabled={false}
                    data={sortedTradingAccounts}
                    keyExtractor={_tradingKeyExtractor}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tradingContent}
                    renderItem={_renderTradingItem}
                  />
                </>
              )}
            </View>
            <BaseSeparator />
            <View style={[styles.section, styles.sectionBottom]}>
              <RewardWallet
                onPress={goToRewardsWallet}
                availableAmount={DEFAULT_AVAILABLE_AMOUNT}
                amount={DEFAULT_AMOUNT}
              />
              <BaseButton
                type={BaseButtonType.secondary}
                size={BaseButtonSize.large}
                style={styles.inviteBtn}
                iconFirst={false}
                icon={<SvgIcon name={SvgXmlIconNames.chevronRight} color={icon.base.contrast} size={IconSize.xs} />}
                label={t('screens.wallet.invite-friends')}
                onPress={goToReferrals}
              />
            </View>
          </>
        ) : null}
      </ScrollView>
      <BottomSheetModal
        ref={bottomSheetRef}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBgStyle}
        onDismiss={onDismissSheet}
        onChange={onOpenSheet}
        enablePanDownToClose
        backdropComponent={SheetBackdrop}
        enableDynamicSizing
      >
        <BottomSheetView style={styles.sheetView} testID={testIDs.wallet.screen.modal.bottomSheetRef}>
          <View style={styles.sheetTop}>
            <View style={styles.sheetTopTextContainer}>
              <BaseText variant={BaseTextVariant.title}>
                {getAccountName(
                  sheetCurrentTradingData.typeDisplayName || sheetCurrentTradingData.type.title,
                  'flex',
                  true
                )}
              </BaseText>
              <BaseText style={styles.sheetAccountNo} variant={BaseTextVariant.small}>
                №{sheetCurrentTradingData.login}
              </BaseText>
            </View>
            <View
              style={[
                styles.sheetTradingIconContainer,
                !!sheetCurrentTradingData.colour && { backgroundColor: sheetCurrentTradingData.colour }
              ]}
            >
              {!!sheetCurrentTradingData.icon ? (
                <BaseImage
                  style={styles.sheetIcon}
                  resizeMode='contain'
                  source={{ uri: sheetCurrentTradingData.icon }}
                />
              ) : (
                <SvgIcon name={SvgXmlIconNames.marketings} color={theme.palette.base.white} size={IconSize.sm} />
              )}
            </View>
          </View>
          <View style={styles.sheetBottom}>
            <View style={styles.sheetBottomDefaultContainer}>
              <View style={styles.sheetDefaultTextContainer}>
                <BaseText>{t('screens.wallet.default-account')}</BaseText>
                <BaseText style={styles.sheetDefaultInfo} variant={BaseTextVariant.small}>
                  {t('screens.wallet.default-account-info')}
                </BaseText>
              </View>
              <BaseSwitch
                onChange={onTradingAccountChange}
                disable={tradingAccount.login === sheetCurrentTradingData.login}
                value={tradingAccount.login === sheetCurrentTradingData.login}
              />
            </View>
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={onSeeTradingDetails}
              style={styles.sheetSeeDetailsContainer}
            >
              <BaseText style={styles.sheetSeeDetails}>{t('screens.wallet.see-account-details')}</BaseText>
              <SvgIcon name={SvgXmlIconNames.chevronRight} color={'#8fa6ae'} size={IconSize.sm} />
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetUnauthorizedRef}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBgStyle}
        onDismiss={onDismissSheet}
        onChange={onOpenSheet}
        enablePanDownToClose
        backdropComponent={SheetBackdrop}
        enableDynamicSizing
      >
        <BottomSheetView testID={testIDs.wallet.screen.modal.bottomSheetUnauthorizedRef}>
          <View style={styles.completeVerificationContainer}>
            <View style={styles.completeImageContainer}>
              <BaseImage source={images.safe} resizeMode='contain' style={styles.keyImage} />
              <BaseText style={[styles.alignCenter, styles.textWidth]} variant={BaseTextVariant.captionSemiBold}>
                {t('screens.wallet.not-signed-up')}
              </BaseText>
            </View>
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.wallet.signup-to-continue')}
              onPress={onSignUp(false)}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetZeroBalanceRef}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBgStyle}
        onDismiss={onDismissSheet}
        onChange={onOpenSheet}
        enablePanDownToClose
        backdropComponent={SheetBackdrop}
        enableDynamicSizing
      >
        <BottomSheetView testID={testIDs.wallet.screen.modal.bottomSheetZeroBalanceRef}>
          <View style={styles.completeVerificationContainer}>
            <View style={styles.completeImageContainer}>
              <BaseImage source={images.safe} resizeMode='contain' style={styles.keyImage} />
              <BaseText style={[styles.alignCenter, styles.textWidth]} variant={BaseTextVariant.captionSemiBold}>
                {t('screens.wallet.access-withdrawal-and-transfer')}
              </BaseText>
            </View>
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.wallet.make-deposit')}
              onPress={goToDeposit}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetFlagRef}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBgStyle}
        onDismiss={onDismissSheet}
        onChange={onOpenSheet}
        enablePanDownToClose
        backdropComponent={SheetBackdrop}
        enableDynamicSizing
      >
        <BottomSheetView testID={testIDs.wallet.screen.modal.bottomSheetFlagRef}>
          <View style={styles.completeVerificationContainer}>
            <View style={styles.completeImageContainer}>
              <BaseImage source={images.safe} resizeMode='contain' style={styles.keyImage} />
              <BaseText variant={BaseTextVariant.captionSemiBold}>{t('screens.wallet.verification-required')}</BaseText>
              <BaseText style={styles.textAlign}>
                {t('screens.wallet.unverified-deposit-withdraw', { amount: `$${maxBalanceForUnverified}` })}
              </BaseText>
            </View>
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.wallet.complete-verification')}
              onPress={onCompleteVerification}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default WalletScreen;

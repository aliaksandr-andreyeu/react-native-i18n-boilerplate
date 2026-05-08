import React, { FC, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { actions } from '@/store';
import TabNavigator, { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { useTranslation } from 'react-i18next';
import { LANG } from '@/localization';
import {
  AuthStackNavigator,
  CommonStackNavigator,
  COMMON_ROUTE_NAMES,
  AUTH_ROUTE_NAMES
} from '@/navigation/app/stacks';
import {
  useAppDispatch,
  useAppSelector,
  useAuthState,
  useCreateAccountsIfNotExists,
  useUpdateLastOsPlatform
} from '@/hooks';
import {
  ChangeAccountType,
  SignalsList,
  SignalDetails,
  AssetDetails,
  Deposit,
  DepositForUnverified,
  DepositAmountEntry,
  PositionInfo,
  SelectDate,
  WebView,
  WithdrawalAccount,
  WithdrawalForUnverified,
  WithdrawalConfirmation,
  TransferScreen,
  CreatePositionDetails,
  WidgetArticle,
  WidgetList,
  RecentActivity,
  RecentActivityDetails,
  WelcomeAccountDetails,
  TradingAccountOverview,
  AllReferrals,
  TradingRecentActivity,
  PromotionDetails,
  EmailVerification,
  ReferralRewards,
  SingleReferral,
  Invite,
  RedeemHistory,
  Referrals,
  RewardsWallet,
  Redeem,
  RecentRewards
} from '@/containers';
import {
  ConfirmData,
  DepositResponse,
  FirstPayloadMakeDeposit,
  SecondPayloadMakeDeposit
} from '@/store/slices/wallet/types';
import { Signals, PositionDetailsForm } from '@/store/slices/market/types';
import { ORDER_TYPES } from '@/types';
import {
  clearUserIdentification,
  getLoggedInBefore,
  getStoredInvitePassed,
  getStoredLastAuthAction,
  handleInitalPage,
  identifyUser
} from '@/helpers';
import { ClientData } from '@/store/api';
import { useTheme } from '@react-navigation/native';
import { BaseLoader } from '@/components';
import { ViewStyle } from 'react-native';
import useAdvertise from '@/hooks/advertise';
import { TransferTypes } from '@/components/molecules/transfer-card';
import useAsyncStorage from '@/hooks/asyncstorage';

export enum ROOT_ROUTE_NAMES {
  App = 'App',
  Auth = 'Auth',
  Common = 'Common',
  ChangeAccountType = 'ChangeAccountType',
  PositionInfo = 'PositionInfo',
  Deposit = 'Deposit',
  DepositForUnverified = 'DepositForUnverified',
  DepositAmountEntry = 'DepositAmountEntry',
  SelectDate = 'SelectDate',
  WebView = 'WebView',
  AssetDetails = 'AssetDetails',
  SignalDetails = 'SignalDetails',
  SignalsList = 'SignalsList',
  WithdrawalAccount = 'WithdrawalAccount',
  WithdrawalForUnverified = 'WithdrawalForUnverified',
  WithdrawalAmountEntry = 'WithdrawalAmountEntry',
  WithdrawalConfirmation = 'WithdrawalConfirmation',
  Transfer = 'Transfer',
  CreatePositionDetails = 'CreatePositionDetails',
  WidgetArticle = 'WidgetArticle',
  WidgetList = 'WidgetList',
  RecentActivity = 'RecentActivity',
  RecentActivityDetails = 'RecentActivityDetails',
  WelcomeAccountDetails = 'WelcomeAccountDetails',
  TradingAccountOverview = 'TradingAccountOverview',
  TradingRecentActivity = 'TradingRecentActivity',
  PromotionDetails = 'PromotionDetails',
  EmailVerification = 'EmailVerification',
  PhoneVerification = 'PhoneVerification',
  ReferralRewards = 'ReferralRewards',
  Referrals = 'Referrals',
  RewardsWallet = 'RewardsWallet',
  AllReferrals = 'AllReferrals',
  SingleReferral = 'SingleReferral',
  Invite = 'Invite',
  RedeemHistory = 'RedeemHistory',
  Redeem = 'Redeem',
  RecentRewards = 'RecentRewards'
}

export type RootRootParamsList = {
  App: undefined | { screen: APP_ROUTE_NAMES; params?: Record<string, any> | undefined };
  Auth: undefined | { screen: AUTH_ROUTE_NAMES; params?: Record<string, any> | undefined };
  Common: undefined | { screen: COMMON_ROUTE_NAMES; params?: Record<string, any> | undefined };
  ChangeAccountType: {
    login: string;
  };
  PositionInfo: {
    accountId?: number;
    closedPositionId?: number;
    positionId?: number;
    positionTicket: number;
    title: string;
    isPosition: boolean;
    isClosed: boolean;
    account?: number | null | undefined;
  };
  Deposit: {
    isDeposit?: boolean | undefined;
  };
  DepositForUnverified: undefined;
  DepositAmountEntry: {
    paymentId: number;
    isWithdrawal: boolean;
    withdrawalRes?: DepositResponse;
    body?: FirstPayloadMakeDeposit;
    provider: { image: string; title: string; id: number; method: string };
  };
  SelectDate: {
    title?: string;
    date?: Date | null;
    updatedValues?: PositionDetailsForm;
    onSubmit: (date: Date, updatedValues?: PositionDetailsForm) => void;
  };
  WebView: {
    transactionId?: string | number;
    redirectUrl: string;
    content?: string | undefined;
    isDeposit: boolean;
    provider: { image: string; title: string; id: number; method: string };
    amount: string | number;
    currency: string;
  };
  AssetDetails: {
    asset: string;
    ask?: number;
    bid?: number;
    digits?: number;
  };
  SignalDetails: {
    data: Signals;
    asset?: string;
  };
  SignalsList: undefined;
  WithdrawalForUnverified: undefined;
  WithdrawalAccount: {
    paymentId: number;
    loginSid: string;
    provider: { image: string; title: string };
    balance: number | string;
  };
  WithdrawalAmountEntry: {
    data: any;
  };
  WithdrawalConfirmation: {
    balance: number;
    confirmData: ConfirmData;
    form: SecondPayloadMakeDeposit;
    provider: { image: string; title: string };
    fields: DepositResponse['form']['fields'];
  };
  Transfer: undefined;
  TradingAccountOverview: {
    login: string;
  };
  CreatePositionDetails: {
    asset: string;
    ask: number;
    bid: number;
    entry: boolean;
    amount: number;
    price?: number;
    signalData?: Signals;
    selectedOrderType?: ORDER_TYPES;
  };
  WidgetArticle: {
    id: number;
    isInvestment?: boolean;
  };
  WidgetList: {
    isInvestment: boolean;
  };
  RecentActivity: undefined;
  RecentActivityDetails: {
    activityId?: string;
    isTransfer: boolean;
    isTrading?: boolean;
    id: string;
    type: string;
    status: string;
    paymentSystem?: string;
    logo?: string;
    account?: string;
    fromAccount?: string;
    toAccount?: string;
    createdAt: string | Date;
    processedAt?: string;
    amount: string;
    currency: string;
    canBeCanceled?: string;
    approveReason?: string;
    declineReason: string | null;
    isCashback?: boolean;
    symbol?: string;
    closeTime?: Date;
    isContest?: boolean;
    isWelcome?: boolean;
  };
  WelcomeAccountDetails: {
    expire?: string | undefined;
  };
  TradingRecentActivity: {
    loginSid?: string;
    login?: string;
    transferType?: TransferTypes;
  };
  PromotionDetails: {
    id?: number;
    promotionId?: number;
  };
  EmailVerification: {
    autoVerify: boolean | undefined;
    hash: string | undefined;
  };
  PhoneVerification: undefined;

  /** BONUS REWARDS */
  RewardsWallet: undefined;
  ReferralRewards: undefined;
  Referrals: undefined;

  /** REFERRALS */
  AllReferrals: undefined;
  SingleReferral: undefined;
  Invite: undefined;
  RedeemHistory: undefined;
  Redeem: undefined;
  RecentRewards: undefined;
};

const Stack = createStackNavigator<RootRootParamsList>();

const screenOptions = {
  headerShown: false
};

const {
  legalDocuments: { useGetPromoWelcomeInfo, useLegalDocumentsQuery },
  common: { useGetConfigQuery, setUserLoggedInBefore },
  market: { useGetAllSymbolsQuery },
  wallet: {
    useAccountTypeConfigsQuery,
    useGetPaymentMethodConfigsQuery,
    useGetUnverifiedPaymentMethodConfigsQuery,
    useGetWalletAccountsMutation,
    useGetTradingAccountsMutation,
    useGetCashbackAccountsMutation,
    useGetRewardsAccountsMutation
  },
  portfolio: { useProfileQuery, useUserProfileMutation, useApplicationsQuery, useGetTradeAssetsQuery },
  auth: { usePing, setSeenIntro },
  ideasHub: { setCustomerIO }
} = actions;

let timeout: ReturnType<typeof setTimeout> | string | number | undefined = undefined;

const AppNavigation: FC = () => {
  const theme = useTheme();

  const {
    i18n: { language }
  } = useTranslation();

  const [loader, setLoader] = useState<boolean>(true);

  const { onStart } = useAuthState();
  const [isInvite, setIsInvite] = useState(false);

  const {
    get,
    storageValues,
    loading: introLoading
  } = useAsyncStorage<'intro' | 'sawWelcome'>({ sawWelcome: true, intro: undefined as unknown as boolean });

  const dispatch = useAppDispatch();
  const userState = useAppSelector((store) => store.auth.userState);

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const checkAdvertising = useAdvertise();
  const { updateLastOsPlatform } = useUpdateLastOsPlatform();

  const common = useAppSelector((state) => state.common);
  const { config } = common || {};
  const { skipPhoneVerification = [] } = config || {};

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo, selectedAccount } = portfolio || {};
  const { isVerified, emailVerified, phoneVerified, id: userId, customFields, email, country } = userInfo || {};
  const { custom_gaid, custom_idfa, custom_last_touch_os, custom_last_touch_platform } = customFields || {};

  const isPhoneVerified = useMemo(() => {
    const shouldSkip =
      skipPhoneVerification?.some((skipCountry) => skipCountry?.toUpperCase() === country?.toUpperCase()) || false;

    if (shouldSkip) {
      return true;
    }

    return phoneVerified;
  }, [phoneVerified, skipPhoneVerification, country]);

  const customerIOEnabled = useAppSelector((state) => state.ideasHub.customerIO);

  const checkAccountsExists = useCreateAccountsIfNotExists();

  const [getConfig] = useGetConfigQuery({
    pollingInterval: 5 * 60 * 1000,
    skipPollingIfUnfocused: false
  });
  const [getAccountConfigs] = useAccountTypeConfigsQuery();

  const [ping] = usePing({
    ...(isAuthorized
      ? {
        pollingInterval: 60 * 1000,
        skipPollingIfUnfocused: false
      }
      : {})
  });

  const [getProfile] = useProfileQuery({
    ...(isAuthorized
      ? {
        pollingInterval: (isVerified ? 60 : 5) * 1000,
        skipPollingIfUnfocused: true
      }
      : {})
  });

  const [getUserProfile] = useUserProfileMutation();

  const [getApplications] = useApplicationsQuery({
    ...(isAuthorized && !isVerified
      ? {
        pollingInterval: 60 * 1000,
        skipPollingIfUnfocused: true
      }
      : {})
  });

  const [getWalletAccounts] = useGetWalletAccountsMutation({
    ...(isAuthorized
      ? {
        pollingInterval: (isVerified ? 60 : 5) * 1000,
        skipPollingIfUnfocused: true
      }
      : {})
  });
  const [getTradingAccounts] = useGetTradingAccountsMutation({
    ...(isAuthorized
      ? {
        pollingInterval: (isVerified ? 60 : 5) * 1000,
        skipPollingIfUnfocused: true
      }
      : {})
  });
  const [getCashbackAccounts] = useGetCashbackAccountsMutation({
    ...(isAuthorized
      ? {
        pollingInterval: (isVerified ? 60 : 5) * 1000,
        skipPollingIfUnfocused: true
      }
      : {})
  });
  const [getRewardsAccounts] = useGetRewardsAccountsMutation({
    ...(isAuthorized
      ? {
        pollingInterval: (isVerified ? 60 : 5) * 1000,
        skipPollingIfUnfocused: true
      }
      : {})
  });

  const [getLegalDocuments] = useLegalDocumentsQuery();
  const [getPromoWelcomeInfo] = useGetPromoWelcomeInfo();
  const [getTradingAssets] = useGetTradeAssetsQuery();
  const [getPaymentMethodConfigs] = useGetPaymentMethodConfigsQuery();

  const [getUnverifiedPaymentMethodConfigs] = useGetUnverifiedPaymentMethodConfigsQuery();

  const [getAllSymbols] = useGetAllSymbolsQuery();

  const customerIoHandler = async () => {
    try {
      if (!isAuthorized && customerIOEnabled) {
        await clearUserIdentification();
        dispatch(setCustomerIO(false));
      }
      if (isAuthorized && !customerIOEnabled && userId && email) {
        await identifyUser(userInfo as never as ClientData, () => {
          dispatch(setCustomerIO(true));
        });
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const checkAccountsExistsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await checkAccountsExists();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getLegalDocumentsHandler = async () => {
    try {
      const documents = await getLegalDocuments(language as LANG).unwrap();

      if (documents?.data?.length === 0) {
        await getLegalDocuments('en' as LANG);
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getPromoWelcomeInfoHandler = async () => {
    try {
      await getPromoWelcomeInfo();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getTradingAssetsHandler = async () => {
    try {
      await getTradingAssets();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getPaymentMethodConfigsHandler = async () => {
    try {
      await getPaymentMethodConfigs();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getUnverifiedPaymentMethodConfigsHandler = async () => {
    if (isVerified) {
      return;
    }
    try {
      await getUnverifiedPaymentMethodConfigs();
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const getProfileHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getProfile();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getUserProfileHandler = async () => {
    if (!isAuthorized || !email) {
      return;
    }
    try {
      await getUserProfile({
        email
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getApplicationsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getApplications({});
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getWalletAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getWalletAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getTradingAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getCashbackAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getCashbackAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getRewardsAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getRewardsAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const pingHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await ping({});
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getConfigHandler = async () => {
    try {
      await getConfig({});
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getAccountConfigsHandler = async () => {
    try {
      await getAccountConfigs();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const checkIsAlreadyLoggedInUser = async () => {
    try {
      const isAlreadyLoggedIn = await getLoggedInBefore();

      dispatch(setUserLoggedInBefore(isAlreadyLoggedIn));
    } catch (error: unknown) {
      console.error(error);
      return null;
    }
  };

  const getAllSymbolsHandler = async () => {
    if (!isAuthorized || !selectedAccount) {
      return;
    }
    try {
      await getAllSymbols({ accountId: Number(selectedAccount) });
    } catch (error) {
      console.error(error);
    }
  };

  const adHandler = async () => {
    if (!userId) {
      return;
    }
    try {
      await checkAdvertising({
        gaid: custom_gaid,
        idfa: custom_idfa
      });
    } catch (error) {
      console.error(error);
    }
  };

  const osPlatformHandler = async () => {
    if (!userId) {
      return;
    }
    try {
      await updateLastOsPlatform({
        os: custom_last_touch_os,
        platform: custom_last_touch_platform
      });
    } catch (error) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    (async () => {
      get('sawWelcome');
      const val = await get('intro');
      dispatch(setSeenIntro(val));
    })();
  }, []);

  useLayoutEffect(() => {
    adHandler();
    osPlatformHandler();
  }, [userId, customFields]);

  useLayoutEffect(() => {
    getConfigHandler();
    getAccountConfigsHandler();
    getLegalDocumentsHandler();
    getPromoWelcomeInfoHandler();
    getTradingAssetsHandler();
    getPaymentMethodConfigsHandler();
  }, [userId]);

  useLayoutEffect(() => {
    getUnverifiedPaymentMethodConfigsHandler();
  }, [isVerified, userId]);

  useLayoutEffect(() => {
    getProfileHandler();
    getApplicationsHandler();
    getWalletAccountsHandler();
    getTradingAccountsHandler();
    getCashbackAccountsHandler();
    getRewardsAccountsHandler();
    checkAccountsExistsHandler();
  }, [isAuthorized, isVerified, userId]);

  useLayoutEffect(() => {
    pingHandler();
    checkIsAlreadyLoggedInUser();
  }, [isAuthorized, userId]);

  useLayoutEffect(() => {
    getUserProfileHandler();
  }, [isAuthorized, email]);

  useLayoutEffect(() => {
    getAllSymbolsHandler();
  }, [isAuthorized, selectedAccount]);

  useLayoutEffect(() => {
    (async () => {
      clearTimeout(timeout);
      await onStart();
      timeout = setTimeout(() => {
        setLoader(false);
      }, 800);
    })();
  }, []);

  useLayoutEffect(() => {
    customerIoHandler();
  }, [customerIOEnabled, userId, email, isAuthorized]);

  const loaderStyle = useMemo(
    (): ViewStyle => ({ backgroundColor: theme.palette.base.white }),
    [theme.palette.base.white]
  );

  const handleInvite = async () => {
    try {
      const [value, lastAction] = await Promise.all([getStoredInvitePassed(userInfo.email), getStoredLastAuthAction()]);
      setIsInvite(!value && lastAction === 'sign-up');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isAuthorized && userInfo.email) handleInvite();
  }, [userInfo.email, isAuthorized, emailVerified]);

  const decision = useMemo(() => {
    if (isAuthorized) {
      if (!emailVerified)
        return {
          rootScreen: ROOT_ROUTE_NAMES.EmailVerification,
          commonScreen: '',
          params: {}
        };
      if (isInvite)
        return {
          rootScreen: ROOT_ROUTE_NAMES.Invite,
          commonScreen: '',
          params: {}
        };
      // else if (!isPhoneVerified)
      //   return {
      //     rootScreen: ROOT_ROUTE_NAMES.PhoneVerification,
      //     commonScreen: '',
      //     params: {}
      //   };
    }
    return handleInitalPage(userState, isAuthorized, storageValues.intro);
  }, [userState, isAuthorized, storageValues.intro, emailVerified, isPhoneVerified, isInvite]);

  const ready = !loader && !introLoading;
  const introHydrated = storageValues.intro !== undefined;

  if (!ready || !introHydrated || (isAuthorized && !email)) {
    return (
      <BaseLoader
        animType={'none'}
        color={theme.palette.graphite['900']}
        active={!ready || !introHydrated || (isAuthorized && !email)}
        style={loaderStyle}
      />
    );
  }

  return (
    <Stack.Navigator
      key={`${emailVerified}-${isAuthorized}-${isInvite}`}
      // key={`${emailVerified}-${isPhoneVerified}-${isAuthorized}`}
      initialRouteName={decision.rootScreen}
      screenOptions={screenOptions}
    >
      {(isAuthorized && !emailVerified) || <Stack.Screen name={ROOT_ROUTE_NAMES.App} component={TabNavigator} />}
      {isAuthorized && !!email?.length && (
        <Stack.Group navigationKey={String(isAuthorized)}>
          {emailVerified || (
            <Stack.Screen
              name={ROOT_ROUTE_NAMES.EmailVerification}
              component={EmailVerification}
              options={{
                headerShown: false,
                gestureEnabled: false
              }}
            />
          )}
          {/* {isPhoneVerified || (
            <Stack.Screen
            name={ROOT_ROUTE_NAMES.PhoneVerification}
            component={PhoneVerification}
            options={{
              headerShown: false,
              gestureEnabled: false
              }}
              />
              )} */}
        </Stack.Group>
      )}
      {isAuthorized && (
        <Stack.Screen
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
          name={ROOT_ROUTE_NAMES.Invite}
          component={Invite}
        />
      )}
      {!isAuthorized && <Stack.Screen name={ROOT_ROUTE_NAMES.Auth} component={AuthStackNavigator} />}
      <Stack.Screen name={ROOT_ROUTE_NAMES.Common} component={CommonStackNavigator} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.Deposit} component={Deposit} />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.DepositForUnverified}
        component={DepositForUnverified}
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerShown: true
        }}
      />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.WithdrawalForUnverified}
        component={WithdrawalForUnverified}
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerShown: true
        }}
      />
      <Stack.Screen name={ROOT_ROUTE_NAMES.DepositAmountEntry} component={DepositAmountEntry} />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.SignalDetails}
        component={SignalDetails}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.SignalsList}
        component={SignalsList}
        options={{
          headerShown: true
        }}
      />
      <Stack.Screen name={ROOT_ROUTE_NAMES.RecentActivity} component={RecentActivity} options={{ headerShown: true }} />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.TradingRecentActivity}
        component={TradingRecentActivity}
        options={{ headerShown: true }}
      />
      <Stack.Screen name={ROOT_ROUTE_NAMES.RecentActivityDetails} component={RecentActivityDetails} />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.PositionInfo}
        component={PositionInfo}
        options={{
          headerShown: false,
          headerTitleAlign: 'center',
          headerShadowVisible: false
        }}
      />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.ChangeAccountType}
        component={ChangeAccountType}
        options={{
          headerShown: false,
          headerTitleAlign: 'center',
          headerShadowVisible: false
        }}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false
        }}
        name={ROOT_ROUTE_NAMES.WebView}
        component={WebView}
      />
      <Stack.Screen name={ROOT_ROUTE_NAMES.SelectDate} component={SelectDate} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.WithdrawalAccount} component={WithdrawalAccount} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.WithdrawalConfirmation} component={WithdrawalConfirmation} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.Transfer} component={TransferScreen} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.TradingAccountOverview} component={TradingAccountOverview} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.WidgetArticle} component={WidgetArticle} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.WidgetList} component={WidgetList} />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.AssetDetails}
        component={AssetDetails}
        options={{
          headerShown: true
        }}
      />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.CreatePositionDetails}
        component={CreatePositionDetails}
        options={{ headerShown: true }}
      />
      <Stack.Screen name={ROOT_ROUTE_NAMES.ReferralRewards} component={ReferralRewards} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.SingleReferral} component={SingleReferral} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.RedeemHistory} component={RedeemHistory} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.Redeem} component={Redeem} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.WelcomeAccountDetails} component={WelcomeAccountDetails} />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.AllReferrals}
        component={AllReferrals}
        options={{
          headerShown: true
        }}
      />
      <Stack.Screen name={ROOT_ROUTE_NAMES.PromotionDetails} component={PromotionDetails} />
      <Stack.Screen name={ROOT_ROUTE_NAMES.Referrals} component={Referrals} />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.RewardsWallet}
        component={RewardsWallet}
        options={{
          headerShown: true
        }}
      />
      <Stack.Screen
        name={ROOT_ROUTE_NAMES.RecentRewards}
        component={RecentRewards}
        options={{
          headerShown: true
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigation;

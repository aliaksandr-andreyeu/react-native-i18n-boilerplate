import React, { FC, useMemo } from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import {
  Welcome,
  Verification,
  EmailVerification,
  Profile,
  ChangePassword,
  TwoFactor,
  ManageWithdrawal,
  LinkedAccounts,
  EmailNotificationsSettings,
  PushNotificationsSettings,
  ChangeEmail,
  CreatePaymentDetail,
  PaymentDetailScreen,
  PersonalDetailsScreen,
  SampleDocuments,
  PhoneVerification,
  ChangePhone
} from '@/containers';
import LegalDocuments from '@/containers/app/common/legal-documents';
import { useAppSelector } from '@/hooks';
import { handleInitalPage } from '@/helpers';

export enum COMMON_ROUTE_NAMES {
  Welcome = 'Welcome',
  Verification = 'Verification',
  Profile = 'Profile',
  TwoFactor = 'TwoFactor',
  LinkedAccounts = 'LinkedAccounts',
  ChangePassword = 'ChangePassword',
  ManageWithdrawal = 'ManageWithdrawal',
  ChangeEmail = 'ChangeEmail',
  EmailNotificationsSettings = 'EmailNotificationsSettings',
  PushNotificationsSettings = 'PushNotificationsSettings',
  PersonalDetails = 'PersonalDetails',
  LegalDocuments = 'LegalDocuments',
  CreatePaymentDetail = 'CreatePaymentDetail',
  PaymentDetail = 'PaymentDetail',
  SampleDocuments = 'SampleDocuments',
  ChangePhone = 'ChangePhone'
}

export type CommonRootParamsList = {
  Welcome: undefined;
  Verification:
    | {
        hash?: string;
        forIdentify?: boolean;
      }
    | undefined;
  Profile: undefined;
  ChangePassword: undefined;
  ChangeEmail: undefined;
  EmailNotificationsSettings: undefined;
  PushNotificationsSettings: undefined;
  PersonalDetails: undefined;
  TwoFactor?: {
    generate: boolean | undefined;
    isDisable?: boolean | undefined;
  };
  ManageWithdrawal: undefined;
  LinkedAccounts: undefined;
  LegalDocuments: undefined;
  CreatePaymentDetail: {
    id: number | undefined;
    loginSid: string;
  };
  PaymentDetail: {
    id: number;
    configId: number;
  };
  SampleDocuments: undefined;
  ChangePhone: undefined;
};

const Stack = createStackNavigator<CommonRootParamsList>();

const CommonStackNavigator: FC = () => {
  const userState = useAppSelector((store) => store.auth.userState);
  const token = useAppSelector((store) => store.auth.accessToken);

  const { emailVerified, phoneVerified } = useAppSelector((state) => state.portfolio.userInfo);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthorized = Boolean(accessToken);

  const initialRouteName = useMemo(
    () => handleInitalPage(userState, !!token?.length).commonScreen as COMMON_ROUTE_NAMES,
    [userState, token]
  );

  const screenOptions = {
    // headerShown: false
  };

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions}>
      {isAuthorized && emailVerified && phoneVerified && (
        <Stack.Screen name={COMMON_ROUTE_NAMES.Welcome} component={Welcome} options={{ headerShown: false }} />
      )}
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.Verification}
        component={Verification}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />

      <Stack.Screen name={COMMON_ROUTE_NAMES.ChangePhone} component={ChangePhone} options={{ headerShown: false }} />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.SampleDocuments}
        component={SampleDocuments}
        options={{ headerShown: false }}
      />
      {isAuthorized && (
        <Stack.Screen name={COMMON_ROUTE_NAMES.Profile} options={{ headerShown: false }} component={Profile} />
      )}
      <Stack.Screen name={COMMON_ROUTE_NAMES.TwoFactor} options={{ headerShown: false }} component={TwoFactor} />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.LinkedAccounts}
        options={{ headerShown: true }}
        component={LinkedAccounts}
      />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.ChangePassword}
        options={{ headerShown: false }}
        component={ChangePassword}
      />
      <Stack.Screen name={COMMON_ROUTE_NAMES.ChangeEmail} options={{ headerShown: false }} component={ChangeEmail} />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.EmailNotificationsSettings}
        options={{ headerShown: false }}
        component={EmailNotificationsSettings}
      />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.ManageWithdrawal}
        options={{ headerShown: false }}
        component={ManageWithdrawal}
      />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.PushNotificationsSettings}
        options={{ headerShown: false }}
        component={PushNotificationsSettings}
      />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.LegalDocuments}
        options={{ headerShown: false }}
        component={LegalDocuments}
      />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.CreatePaymentDetail}
        options={{ headerShown: false }}
        component={CreatePaymentDetail}
      />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.PersonalDetails}
        options={{ headerShown: false }}
        component={PersonalDetailsScreen}
      />
      <Stack.Screen
        name={COMMON_ROUTE_NAMES.PaymentDetail}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
        }}
        component={PaymentDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default CommonStackNavigator;

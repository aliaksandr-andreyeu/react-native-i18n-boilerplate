import React, { FC, useMemo } from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import {
  SignIn,
  EmailSignUp,
  ForgotPassword,
  TwoFactorAuth,
  SignUp,
  CompleteSignUp,
  Intro,
  BonusSignUp
} from '@/containers';
import { BaseBackButton } from '@/components';
import { useAppSelector, useBackHandler } from '@/hooks';
import { SocialService } from '@/types';
import { handleInitalPage } from '@/helpers';

export enum AUTH_ROUTE_NAMES {
  SignIn = 'SignIn',
  ForgotPassword = 'ForgotPassword',
  EmailSignUp = 'EmailSignUp',
  TwoFactorAuth = 'TwoFactorAuth',
  SignUp = 'SignUp',
  CompleteSignUp = 'CompleteSignUp',
  Intro = 'Intro',
  BonusSignUp = 'BonusSignUp'
}

export type AuthRootParamsList = {
  SignIn: undefined;
  ForgotPassword: undefined;
  EmailSignUp:
    | {
        goID?: number | undefined;
        state?: number;
        service?: SocialService;
        code?: string | undefined;
      }
    | undefined;
  TwoFactorAuth: undefined;
  SignUp: { hasBonus?: boolean; goID?: number | undefined };
  CompleteSignUp: {
    email?: string;
    first_name?: string;
    last_name?: string;
    code?: string;
    service: SocialService;
  };
  Intro: undefined;
  BonusSignUp: { goID?: number | undefined } | undefined;
};

const Stack = createStackNavigator<AuthRootParamsList>();

const AuthStackNavigator: FC = () => {
  useBackHandler();

  const seenIntro = useAppSelector((store) => store.auth.seenIntro);
  const userState = useAppSelector((store) => store.auth.userState);
  const token = useAppSelector((store) => store.auth.accessToken);
  const isAuthorized = !!token?.length;

  const initialRouteName = useMemo(() => handleInitalPage(userState, isAuthorized), [userState, isAuthorized]);

  const screenOptions: StackNavigationOptions = {
    headerLeft: () => <BaseBackButton />
  };

  return (
    <Stack.Navigator initialRouteName={initialRouteName.commonScreen as AUTH_ROUTE_NAMES} screenOptions={screenOptions}>
      {seenIntro || <Stack.Screen options={{ headerShown: false }} name={AUTH_ROUTE_NAMES.Intro} component={Intro} />}
      <Stack.Screen
        options={{ headerShown: false, gestureEnabled: false }}
        name={AUTH_ROUTE_NAMES.BonusSignUp}
        component={BonusSignUp}
      />
      <Stack.Screen
        options={{ headerShown: false, gestureEnabled: false }}
        name={AUTH_ROUTE_NAMES.SignUp}
        component={SignUp}
      />
      <Stack.Screen
        name={AUTH_ROUTE_NAMES.CompleteSignUp}
        component={CompleteSignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen name={AUTH_ROUTE_NAMES.SignIn} component={SignIn} options={{ headerShown: false }} />
      <Stack.Screen
        initialParams={initialRouteName.params}
        name={AUTH_ROUTE_NAMES.EmailSignUp}
        component={EmailSignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen name={AUTH_ROUTE_NAMES.TwoFactorAuth} component={TwoFactorAuth} options={{ headerShown: false }} />
      <Stack.Screen
        name={AUTH_ROUTE_NAMES.ForgotPassword}
        component={ForgotPassword}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;

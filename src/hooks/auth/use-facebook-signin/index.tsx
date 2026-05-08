import { useEffect, useLayoutEffect, useState } from 'react';
import { Linking } from 'react-native';
import { api } from '@/constants';
import queryString from 'query-string';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { actions } from '@/store';
import useAsyncStorage from '@/hooks/asyncstorage';
import { ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';

const {
  common: { setFbInitialUrlCheck }

} = actions

interface FacebookSignInProps {
  from: string;
  navigation: StackNavigationProp<AuthRootParamsList & ParamListBase, any, any>
}

export interface FacebookData {
  email?: string;
  first_name?: string;
  last_name?: string;
  code?: string;
}
interface FacebookSignInData {
  facebookSignIn: () => Promise<void>;
  facebookData?: FacebookData;
}

export enum FacebookSignInFrom {
  connect = 'connect',
  signIn = 'singIn',
  signUp = 'signUp'
}

const useFacebookSignIn = ({ from, navigation }: FacebookSignInProps): FacebookSignInData => {
  const [facebookData, setFacebookData] = useState<FacebookData | undefined>(undefined);

  const fbIsChecked = useAppSelector(store => store.common.fbInitialUrlChecked);
  const dispatch = useAppDispatch();

  const { get } = useAsyncStorage<'last-social-click-page'>();



  const getFacebookData = async (token: string | undefined) => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(api.auth.facebookUserData(token), {
        method: 'GET'
      });

      if (!response.ok) {
        return;
      }

      const json = await response.json();

      return json;
    } catch (error: unknown) {
      console.error('getFacebookData: ', error);
    }
  };

  const checkFacebookData = async (urlWithCode: string | null | undefined): Promise<FacebookData | undefined> => {
    if (!urlWithCode) {
      return;
    }

    const formattedUrl = urlWithCode.replace(/#/g, '?');

    const parsedUrl = queryString.parseUrl(formattedUrl);

    const { url, query } = parsedUrl || {};

    if (!url.includes(api.auth.socialRedirectPrefix)) {
      return;
    }

    const { code, access_token } = query || {};

    if (code === undefined || code === null || access_token === undefined || access_token === null) {
      return;
    }

    let fbToken = undefined;
    let fbCode = undefined;

    if (access_token && Array.isArray(access_token) && access_token.length > 0) {
      const firstToken = access_token.find((el) => el);

      if (firstToken === undefined || firstToken === null) {
        return;
      }

      fbToken = firstToken;
    } else if (access_token && typeof access_token === 'string') {
      fbToken = access_token as string;
    }

    if (code && Array.isArray(code) && code.length > 0) {
      const firstCode = code.find((el) => el);


      if (firstCode === undefined || firstCode === null) {
        return;
      }

      fbCode = firstCode;
    } else if (code && typeof code === 'string') {
      fbCode = code as string;
    }

    const data = await getFacebookData(fbToken);
    const { email, first_name, last_name } = data || {};

    return {
      email,
      first_name,
      last_name,
      code: fbCode
    };
  };

  const getInitialURL = async () => {

    const initialUrl = await Linking.getInitialURL();

    const data = await checkFacebookData(initialUrl);

    setFacebookData(data);
  };

  const onReceiveURL = async ({ url }: { url: string }) => {

    const lastScreenClick = await get('last-social-click-page');

    const routes = navigation?.getState?.()?.routes || [];

    const lastRouteName = routes[routes.length - 1]?.name || '';
    const screens: Record<string, any> = {
      'sign-in': AUTH_ROUTE_NAMES.SignIn,
      'sign-up': AUTH_ROUTE_NAMES.SignUp,
      'sign-up-bonus': AUTH_ROUTE_NAMES.BonusSignUp,

    }
    const storedLastScreen = screens?.[lastScreenClick]

    if (storedLastScreen && (lastRouteName !== storedLastScreen)) navigation?.navigate?.(storedLastScreen);

    const data = await checkFacebookData(url);

    setFacebookData(data);
  };

  useLayoutEffect(() => {
    setFacebookData(undefined);
    return () => {
      setFacebookData(undefined);
    };
  }, []);

  useEffect(() => {
    const linkingListener = Linking.addEventListener('url', onReceiveURL);

    if (!fbIsChecked) {
      getInitialURL();
      dispatch(setFbInitialUrlCheck(true));
    }

    return () => {
      linkingListener.remove();
    };
  }, [fbIsChecked, navigation]);

  const facebookSignIn = async () => {
    if (!from) {
      return;
    }

    let url: string | null = null;

    if (from === FacebookSignInFrom.connect) {
      url = api.auth.facebookSignIn(api.auth.facebookConnectRedirect);
    } else if (from === FacebookSignInFrom.signIn || from === FacebookSignInFrom.signUp) {
      url = api.auth.facebookSignIn(api.auth.facebookLoginRedirect);
    }

    if (!url) {
      return;
    }

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };

  return {
    facebookSignIn,
    facebookData
  };
};

export default useFacebookSignIn;

import { Values } from '@/hooks/authState';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES } from '@/navigation/app/stacks';

interface ReturnValue {
  rootScreen: ROOT_ROUTE_NAMES;
  commonScreen: COMMON_ROUTE_NAMES | AUTH_ROUTE_NAMES | '';
  params: any;
}

export const handleInitalPage = (
  userState: Values | null,
  authorized: boolean = false,
  seenIntro: boolean = false
): ReturnValue => {
  const hasUserStateValue = Object.values(userState || {}).some((item) => item?.length > 0);

  if (!hasUserStateValue || !userState) {
    if (seenIntro) {
      return {
        rootScreen: ROOT_ROUTE_NAMES.App,
        params: {},
        commonScreen: ''
      };
    } else if (!authorized)
      return {
        rootScreen: ROOT_ROUTE_NAMES.Auth,
        commonScreen: '',
        params: {}
      };
    else {
      return {
        rootScreen: ROOT_ROUTE_NAMES.App,
        params: {},
        commonScreen: ''
      };
    }
  }

  // if (userState['user-phoneVerify'])
  // return {
  //   rootScreen: ROOT_ROUTE_NAMES.PhoneVerification,
  //   commonScreen: '',
  //   params: {}
  // };
  if (userState['user-emailVerify'])
    return {
      rootScreen: ROOT_ROUTE_NAMES.EmailVerification,
      commonScreen: '',
      params: {}
    };
  else if (userState['last-auth-screen']) {
    return {
      commonScreen: AUTH_ROUTE_NAMES.EmailSignUp,
      rootScreen: ROOT_ROUTE_NAMES.Auth,
      params: {
        state: +userState['last-auth-screen'],
        code: userState['user-code'],
        service: userState['user-service']
      }
    };
  }

  return {
    rootScreen: ROOT_ROUTE_NAMES.App,
    params: {},
    commonScreen: ''
  };
};

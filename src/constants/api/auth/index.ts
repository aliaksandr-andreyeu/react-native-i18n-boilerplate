import type { SocialService } from '@/types';
import Config from 'react-native-config';

const { FACEBOOK_APP_ID } = Config || {};

const auth = {
  refreshToken: '/tokens/refresh',
  socialSignIn: (service: SocialService) => `/oauth/auth/${service}`,
  socialRedirectPrefix: 'https://client.amega.capital',
  googleRedirect: 'https://client.amega.capital/connect/service/google',
  facebookLoginRedirect: 'https://client.amega.capital/login/check-facebook',
  facebookConnectRedirect: 'https://client.amega.capital/connect/service/facebook',
  facebookSignIn: (redirectUrl: string) =>
    `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUrl}&scope=public_profile,email&response_type=code%20token`,
  facebookUserData: (token: string) =>
    `https://graph.facebook.com/me?access_token=${token}&fields=email,first_name,last_name&locale=en_US&format=json`,
  signIn: '/login',
  check2FA: '/2fa-check',
  signUp: '/registration',
  forgotPassword: '/forgot-password-send',
  resetPassword: `/forgot-password-restore`,
  changePassword: '/profile/change-password',
  pinSend: '/pin/send',
  changeEmail: '/profile/change-email',
  signOut: '/logout',
  ping: '/ping',
  partnerId: (id: number) => `/ib/public/link-detail/${id}`,
  updateUser: '/proxy/rest/users/update'
};

export default auth;

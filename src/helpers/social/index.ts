import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { config } from '@/constants';
import Config from 'react-native-config';

const { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } = Config || {};
const { isIOS } = config || {};

export const googleSignIn = async () => {
  try {
    await GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
      webClientId: GOOGLE_WEB_CLIENT_ID,
      ...(isIOS && {
        iosClientId: GOOGLE_IOS_CLIENT_ID
      }),
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      profileImageSize: 120,
      hostedDomain: ''
    });

    const isSignedIn = await GoogleSignin.isSignedIn();

    if (isSignedIn) {
      await GoogleSignin.signOut();
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response: User = await GoogleSignin.signIn();

    return response;
  } catch (error: { code: keyof typeof statusCodes } | any) {
    console.log('googleSignIn error', error);

    // if (isErrorWithCode(error)) {
    switch (error?.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        // user cancelled the login flow
        console.log(statusCodes.SIGN_IN_CANCELLED, 'user cancelled the login flow');
        break;
      case statusCodes.IN_PROGRESS:
        // operation (eg. sign in) already in progress
        console.log(statusCodes.IN_PROGRESS, 'operation (eg. sign in) already in progress');

        const silentResponse: User = await GoogleSignin.signInSilently();

        return silentResponse;
        break;

      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        // play services not available or outdated
        console.log(statusCodes.PLAY_SERVICES_NOT_AVAILABLE, 'play services not available or outdated');
        break;
      default:
      // some other error happened
    }
  }
};

export const googleSignOut = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();

    if (isSignedIn) {
      await GoogleSignin.signOut();
    }
  } catch (error: unknown) {
    console.log('googleSignOut error', error);
  }
};

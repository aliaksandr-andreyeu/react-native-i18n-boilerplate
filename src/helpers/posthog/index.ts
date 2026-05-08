import { ClientData } from '@/store/api';
import { usePostHog } from 'posthog-react-native';
import { Platform } from 'react-native';

export enum PostHogEvents {
  SIGN_UP = 'sign_up',
  SIGN_IN = 'sign_in'
}

const useCustomPostHog = () => {
  const posthog = usePostHog();

  const identify = (userData: ClientData) => {
    if (!userData.id) return;
    try {
      posthog.identify(`${userData.id}`, {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      console.log('PostHog identified succesfully');
    } catch (error) {
      console.error('Posthog identify error', error);
    }
  };

  const trackSignUpPostHog = () => {
    try {
      posthog.capture(PostHogEvents.SIGN_UP, {
        source: 'app',
        platform: Platform.OS
      });
      console.log('PostHog tracking sign up succesfully');
    } catch (error) {
      console.error('Posthog track sign up error', error);
    }
  };

  const trackSignInPostHog = () => {
    try {
      posthog.capture(PostHogEvents.SIGN_IN, {
        source: 'app',
        platform: Platform.OS
      });
      console.log('PostHog tracking sign in succesfully');
    } catch (error) {
      console.error('Posthog track sign in error', error);
    }
  };

  const resetPosthog = () => {
    posthog.reset();
  };

  return {
    identify,
    trackSignUpPostHog,
    trackSignInPostHog,
    resetPosthog
  };
};

export default useCustomPostHog;

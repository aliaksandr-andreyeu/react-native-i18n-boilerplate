import { Values } from '@/hooks/authState';

export interface AuthState {
  accessToken: string | null | undefined;
  cellExpertId: string | undefined;
  intercomLoggedIn: boolean;
  fromLogin: boolean;
  userState: Values | null;
  seenIntro: boolean;
}

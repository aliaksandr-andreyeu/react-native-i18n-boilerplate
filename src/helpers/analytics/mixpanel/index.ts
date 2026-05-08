import { PulseSections } from '@/containers/app/pulse-ai/pulse-ai/screen';
import { PORTFOLIO_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ClientData } from '@/store/api';
import { UserInfo } from '@/store/slices/portfolio/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mixpanel } from 'mixpanel-react-native';
import { Platform as OS } from 'react-native';
import Config from 'react-native-config';
import { v4 } from 'uuid';

export enum MixpanelEventTypes {
  Login = 'Login',
  Register = 'Register',
  CreateOrder = 'Create order',
  ArticleViewed = 'Article viewed',
  SignalDetailsViewed = 'Signal details viewed',
  OnboardingProgressViewed = 'Onboarding progress viewed',
  EmailVerificationStarted = 'Email verification started',
  QuestionnaireStarted = 'Questionnaire started',
  QuestionnaireBlockCompleted = 'Questionnaire block completed',
  DocumentsVerificationStarted = 'Documents verification started',
  DocumentSamplesViewed = 'Document samples viewed',
  DocumentSampleEnlarged = 'Document sample enlarged',
  PromoPageOpened = 'Promo page opened',
  PromoCTAClicked = 'Promo CTA clicked',
  DepositGuideViewed = 'Deposit guide viewed',
  IntercomConversationsStarted = 'Intercom conversations started',
  AppInstall = 'App Install',
  AppOpened = 'App Opened',
  AppUsageTime = 'App Usage Time',
  AppClosed = 'App Closed',
  AppDeleted = 'App Deleted',
  AppUninstall = 'App Uninstall',
  PulseScreenOpen = 'pulse_screen_open',
  PositionScreenOpen = 'position_screen_open',
  PositionOpen = 'position_open',
  SignUpScreenOpen = 'sign_up_screen_open',
  SignInScreenOpen = 'sign_in_screen_open',
  CreateAccountByEmailButtonTap = 'create_account_with_email_button_tap',
  CreateAccountButtonTap = 'create_account_button_tap',
  SignUpSuccess = 'sign_up_success',
  SignInSuccess = 'sign_in_success',
  ExploreModeTap = 'explore_mode_tap',
  SignUpStep1 = 'signup_step1_email_input_open',
  SignUpStep2 = 'signup_step2_phone_input_open',
  SignUpStep3 = 'signup_step3_password_input_open',
  EmailVerificationScreenOpen = 'email_verification_screen_open',
  PhoneVerificationScreenOpen = 'phone_verification_screen_open',
  CongratulationsScreenOpen = 'congrats_popup_open',
  ExploreTheAppButtonTap = 'explore_the_app_tap'
}

export enum TradeSource {
  Signals = 'pulse_signals',
  TopPerformers = 'pulse_top_performers',
  ProfitableTrades = 'pulse_profitable_trades',
  Markets = 'markets'
}

export enum IdentifyMixpanelUserTypes {
  social = 'social',
  normal = 'normal'
}

export type QuestionnaireBlockNames =
  | 'Personal and financial details'
  | 'Knowledge and experience'
  | 'Goals with Amega';
type Articles = 'Market pulse' | 'Top Movers' | 'Asset collections';
type SignalConfidence = 'Low' | 'Medium' | 'High' | '';

type QuestionnaireBlockData = {
  blockName?: QuestionnaireBlockNames;
};

type StartedEvent = Extract<
  MixpanelEventTypes,
  | MixpanelEventTypes.OnboardingProgressViewed
  | MixpanelEventTypes.EmailVerificationStarted
  | MixpanelEventTypes.QuestionnaireStarted
  | MixpanelEventTypes.QuestionnaireBlockCompleted
  | MixpanelEventTypes.DocumentsVerificationStarted
>;

type Direction = 'buy' | 'sell';

interface LimitObject {
  position_value: string;
  currency: string;
  margin: string;
  stop_loss: string;
  take_profit: string;
}
export interface PulseScreenOpenPayload {
  widget: PulseSections;
  is_default: boolean;
  category: string;
}

// position_screen_open
export interface PositionScreenOpenPayload {
  source: TradeSource;
  direction: Direction;
  card_category: string;
}

// position_open
export interface PositionOpenPayload {
  source: TradeSource;
  direction: Direction;
  card_category: string;
  limit?: LimitObject;
}

interface ArticleView {
  contentCategory: Articles;
  contentID: number | string;
  contentTitle: string;
}

interface CreateTracking {
  asset: string;
  usedTradingSignal: boolean;
  orderType: 'market' | 'pending';
  view: 'simplified' | 'advanced';
  signalConfidence: SignalConfidence;
  typeId: number;
}

interface SignalView {
  signalType: 'live' | 'pending';
  asset: string;
  signalConfidence: SignalConfidence;
}

type PromoActions =
  | 'Sign up'
  | 'Verify profile'
  | 'Deposit'
  | 'Trade'
  | 'Join contest'
  | 'Join webinar'
  | 'Register webinar'
  | 'Transfer';

const { MIXPANEL_TOKEN, APP_ENV } = Config || {};

const trackAutomaticEvents = true;
const useNative = true;

const UUID = v4();

// console.error('MIXPANEL_TOKEN', MIXPANEL_TOKEN);

const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents, useNative);
// const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents, false, AsyncStorage);

mixpanel.setLoggingEnabled(true);

const Platform = {
  Platform: OS.select({
    ios: 'iOS',
    android: 'Android'
  })
};

const AppEventMixpanel = {
  ...Platform,
  Environment: APP_ENV,
  session_id: UUID
};

mixpanel.registerSuperProperties(AppEventMixpanel);

export const identifyMixpanelUser = async (
  client: ClientData,
  auth: MixpanelEventTypes.Login | MixpanelEventTypes.Register,
  type?: IdentifyMixpanelUserTypes
) => {
  try {
    const { id: clientId = '', email: clientEmail = '', firstName, lastName, country } = client || {};

    if (!clientId) throw { error: 'USER ID NOT FOUND!' };

    const clientName = `${firstName} ${lastName}`;
    await mixpanel.identify(`${clientId}`);
    mixpanel.getPeople().set('$name', clientName);
    mixpanel.getPeople().set('$email', clientEmail);
    mixpanel.getPeople().set('Country of residence', country);
    mixpanel.track(auth, {
      [auth]: `${auth} successfully${!!type?.length ? ` - ${type}` : ''}`,
      ...AppEventMixpanel
    });

    console.log('mixpanel identified successfully');
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const setUserIdMixpanel = async (client: ClientData | UserInfo) => {
  try {
    const { id: clientId = '', email: clientEmail = '', firstName, lastName, country } = client || {};

    if (!clientId) throw { error: 'USER ID NOT FOUND!' };

    const clientName = `${firstName} ${lastName}`;
    await mixpanel.identify(`${clientId}`);
    mixpanel.getPeople().set('$name', clientName);
    mixpanel.getPeople().set('$email', clientEmail);
    mixpanel.getPeople().set('Country of residence', country);

    console.log('mixpanel set User Id successfully');
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const createOrderMixpanel = (data: CreateTracking) => {
  try {
    mixpanel.track(MixpanelEventTypes.CreateOrder, {
      Asset: data.asset,
      'Trading signal used': data.usedTradingSignal,
      View: data.view,
      'Order type': data.orderType,
      'Signal confidence': data.signalConfidence,
      'Account type': data.typeId,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const articleViewedMixpanel = (data: ArticleView) => {
  try {
    mixpanel.track(MixpanelEventTypes.ArticleViewed, {
      'Content category': data.contentCategory,
      'Content ID': data.contentID,
      'Content title': data.contentTitle,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const signalViewMixpanel = (data: SignalView) => {
  try {
    mixpanel.track(MixpanelEventTypes.SignalDetailsViewed, {
      'Signal type': data.signalType,
      Asset: data.asset,
      'Signal confidence': data.signalConfidence,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const userStartedActionMixpanel = (event: StartedEvent, data?: QuestionnaireBlockData) => {
  try {
    mixpanel.track(event, {
      ...(data && {
        'Block name': data.blockName
      }),
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const sampleDocumentMixpanel = (event: MixpanelEventTypes, category: string) => {
  try {
    mixpanel.track(event, {
      'Document category': category,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const promoPageOpenedMixpanel = (promoName: string | undefined, promoId: number | undefined) => {
  try {
    mixpanel.track(MixpanelEventTypes.PromoPageOpened, {
      'Promo name': promoName || '',
      'Promo id': promoId || 0,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const promoCTAClickedMixpanel = (
  promoName: string | undefined,
  promoId: number | undefined,
  action: PromoActions
) => {
  try {
    mixpanel.track(MixpanelEventTypes.PromoCTAClicked, {
      'Promo name': promoName || '',
      'Promo id': promoId || 0,
      Action: action,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const depositGuideViewedMixpanel = (paymentId: string, paymentName: string, guideName: string) => {
  try {
    mixpanel.track(MixpanelEventTypes.DepositGuideViewed, {
      'Payment provider ID': paymentId || '',
      'Payment provider name': paymentName,
      'Guide name': guideName,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const intercomeStartedMixpanel = (data?: Record<string, any>) => {
  try {
    mixpanel.track(MixpanelEventTypes.IntercomConversationsStarted, {
      ...(data && data),
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error: ', error);
  }
};

export const appInstallMixpanel = (data?: Record<string, any>) => {
  try {
    mixpanel.track(MixpanelEventTypes.AppInstall, {
      ...(data && data),
      ...AppEventMixpanel
    });
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const appOpenedMixpanel = (data?: Record<string, any>) => {
  try {
    mixpanel.track(MixpanelEventTypes.AppOpened, {
      ...(data && data),
      ...AppEventMixpanel
    });
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const appUsageTimeEventMixpanel = () => {
  try {
    mixpanel.timeEvent(MixpanelEventTypes.AppUsageTime);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const appUsageTimeMixpanel = (data?: Record<string, any>) => {
  try {
    mixpanel.track(MixpanelEventTypes.AppUsageTime, {
      ...(data && data),
      ...AppEventMixpanel
    });
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const appClosedMixpanel = (data?: Record<string, any>) => {
  try {
    mixpanel.track(MixpanelEventTypes.AppClosed, {
      ...(data && data),
      ...AppEventMixpanel
    });
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const appDeletedMixpanel = (data?: Record<string, any>) => {
  try {
    mixpanel.track(MixpanelEventTypes.AppDeleted, {
      ...(data && data),
      ...AppEventMixpanel
    });
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const pulseScreenOpenMixpanel = (p: PulseScreenOpenPayload) => {
  try {
    mixpanel.track(MixpanelEventTypes.PulseScreenOpen, {
      widget: p.widget,
      is_default: p.is_default,
      category: p.category,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error (pulse_screen_open): ', error);
  }
};

// POSITION — screen open from CTA
export const positionScreenOpenMixpanel = (p: PositionScreenOpenPayload) => {
  try {
    mixpanel.track(MixpanelEventTypes.PositionScreenOpen, {
      source: p.source,
      direction: p.direction,
      card_category: p.card_category,
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error (position_screen_open): ', error);
  }
};

// POSITION — trade executed
export const positionOpenMixpanel = (p: PositionOpenPayload) => {
  try {
    mixpanel.track(MixpanelEventTypes.PositionOpen, {
      source: p.source,
      direction: p.direction,
      card_category: p.card_category,
      ...(p.limit ? { limit: p.limit } : {}),
      ...AppEventMixpanel
    });
  } catch (error) {
    console.error('mixpanel error (position_open): ', error);
  }
};

export const mixpanelSignUpScreenOpenTracker = (source: string, explore_mode: boolean) => {
  const isPortfolioRoute = Object.values(PORTFOLIO_ROUTE_NAMES).includes(source as PORTFOLIO_ROUTE_NAMES);
  const isPortfolioCheckedValue = isPortfolioRoute ? `Portfolio ${source}` : source;
  const isExploredModeChecked = explore_mode ? `explore_${isPortfolioCheckedValue}` : isPortfolioCheckedValue;

  const logData = {
    ...AppEventMixpanel,
    source: isExploredModeChecked,
    explore_mode
  };

  try {
    mixpanel.track(MixpanelEventTypes.SignUpScreenOpen, logData);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const mixpanelSignInScreenOpenTracker = (source: string, explore_mode: boolean) => {
  const logData = {
    ...AppEventMixpanel,
    source,
    explore_mode
  };
  try {
    mixpanel.track(MixpanelEventTypes.SignInScreenOpen, logData);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const mixpanelCreateAccountButtonPressTracker = (source: string) => {
  const logData = {
    ...AppEventMixpanel,
    source
  };
  try {
    mixpanel.track(MixpanelEventTypes.CreateAccountButtonTap, logData);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const mixpanelSignUpSuccessTracker = (type: string, sso: boolean, platform: string, retrieve_bonus: boolean) => {
  const logData = {
    ...AppEventMixpanel,
    type,
    sso,
    platform,
    retrieve_bonus
  };
  try {
    mixpanel.track(MixpanelEventTypes.SignUpSuccess, logData);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const mixpanelSignInSuccessTracker = (type: string, sso: boolean, platform: string) => {
  const logData = {
    ...AppEventMixpanel,
    type,
    sso,
    platform
  };
  try {
    mixpanel.track(MixpanelEventTypes.SignInSuccess, logData);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const mixpanelExploreModeTappedTracker = (source: string) => {
  const logData = {
    ...AppEventMixpanel,
    source
  };
  try {
    mixpanel.track(MixpanelEventTypes.ExploreModeTap, logData);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export const mixpanelScreenOpenTracker = (eventName: MixpanelEventTypes, source?: string, type?: string) => {
  const logData = {
    ...AppEventMixpanel,
    ...(source ? { source } : {}),
    ...(type ? { type } : {})
  };
  try {
    console.log('mixpanel: ', eventName);
    mixpanel.track(eventName, logData);
  } catch (error: unknown) {
    console.error('mixpanel error: ', error);
  }
};

export default mixpanel;

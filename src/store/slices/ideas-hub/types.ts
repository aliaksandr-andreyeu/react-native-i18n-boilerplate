import { IdeaData } from '@/types';

type ImageFormat = {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  url: string;
};

type PreviewImageAttributes = {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: ImageFormat;
    small: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: string | null;
  createdAt: string;
  updatedAt: string;
};

type PreviewImageData = {
  id: number;
  attributes: PreviewImageAttributes;
};

type PreviewImage = {
  data: PreviewImageData | null;
};

type TradingAssetAttributes = {
  name: string;
  fullName: string;
  systemName: string;
  seoText: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  marketHours: string | null;
  marketHoursNotes: string | null;
  locale: string;
  assetUnitOfMeasure: string | null;
  assetUnitOfMeasureDigits: string | null;
  acuityProductName: string | null;
};

type TradingAssetData = {
  id: number;
  attributes: TradingAssetAttributes;
};

type TradingAssets = {
  data: TradingAssetData[];
};

type WidgetAttributes = {
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  previewImage: PreviewImage;
  trading_assets: TradingAssets;
};

export interface Widget {
  id: number;
  attributes: WidgetAttributes;
}

export interface WinnersAndLosers {
  profit: number;
  config: { lastClosedPrice: number };
  chartData: {
    ts: number;
    c: number;
  }[];
  id: number;
  createdAt: string;
  title: string;
  description: string;
  symbol: string;
  lastTick: { ask: number; bid: number };
  fullName: string;
}

export interface WatchWidget {
  image: string;
  title: string;
  description: string;
  id: number;
  createdAt: string;
  assets: {
    id: number;
    name: string;
    fullName: string;
    systemName: string;
    createdAt: string;
    locale: string;
  }[];
  categories: {
    id: number;
    title: string;
    createdAt: string;
  }[];
  category: string;
}

type AppBannerBackgroundImageFormats = {
  thumbnail: {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    path: string | null;
    width: number;
    height: number;
    size: number;
    sizeInBytes: number;
    url: string;
  };
};

type AppBannerBackgroundImage = {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
      formats: AppBannerBackgroundImageFormats;
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string | null;
      provider: string;
      provider_metadata: unknown | null;
      createdAt: string;
      updatedAt: string;
    };
  };
};

export type PromoBanner = {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  ctaButtonLabel: string;
  ctaMobileDeepLink: string | null;
  ctaWebsiteUrl: string | null;
  ctaWebClientAreaUrl: string | null;
  appBannerBackgroundImage: AppBannerBackgroundImage;
};

export type PromoLayout =
  | 'contest-leaderboard'
  | 'info-block'
  | 'hero-banner'
  | 'countdown-timer'
  | 'faq-section'
  | 'competition-cta'
  | 'legal-docs'
  | 'deposit-cta'
  | 'verify-profile-cta'
  | 'webinar-registration-cta'
  | 'trade-cta'
  | 'upcoming-events-countdown'
  | 'upcoming-events-topics'
  | 'info-table'
  | 'testimonials'
  | 'upcoming-events-countdown';

export enum PromoRestrictionsLogic {
  allMatch = 'all match',
  atLeastOne = 'at least one'
}

export enum PromoRestrictionOperator {
  equals = 'equal',
  doesntEqual = 'not equal',
  isOneOf = 'is one of',
  isNotOneOf = 'is not one of'
}

export interface VisibilityRestrictions {
  restrictionsLogic: PromoRestrictionsLogic | null;
  restriction: {
    attribute: string;
    conditionValue: string;
    operator: PromoRestrictionOperator;
  }[];
}

export type ContestAttributes = {
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  primaryPromoColour: string;
  secondaryPromoColour: string;
  slug: string;
  sortOrder: number | null;
  tertiaryPromoColour: string;
  promoBanner: PromoBanner;
  bannerTextColor: string;
  beginOn: Date;
  endOn: Date;
  bannerButtonColour: string;
  bannerButtonLabelColour: string;
  visibilityRestrictions: {
    id: number;
    restrictionsLogic: PromoRestrictionsLogic;
    restriction: {
      id: number;
      attribute: string;
      conditionValue: string;
      operator: PromoRestrictionOperator;
    }[];
  }[];
};

export interface ContestData {
  id: number;
  attributes: ContestAttributes;
}

export interface ContestList {
  data: ContestData[];
}

export interface ParsedPromoData {
  tagline: string;
  title: string;
  subTitle: string;
  id: number;
  buttonLabel: string;
  primaryColor: string;
  bgImage: string;
  ctaMobileDeepLink: string;
  sortOrder: number;
  bannerTextColor: string;
  bannerButtonColour: string;
  bannerButtonLabelColour: string;
  beginOn: string | null;
  endOn: string | null;
  visibilityRestrictions: VisibilityRestrictions;
}

export type PromoPage =
  | HeroBanner
  | CountdownTimer
  | ContestLeaderboard
  | InfoBlock
  | FAQSection
  | CompetitionCTA
  | LegalDocs
  | TradeCTA
  | WebinarRegistrationCTA
  | DepositCTA
  | VerifyAccountCTA
  | UpcomingEventsTopics
  | InfoTable
  | PromoTestimonals
  | UpcomingEventsCountdown;

export interface HeroBanner {
  id: number;
  __component: 'layout.hero-banner';
  title: string;
  subtitle: string;
  tagline: string;
  termsAndConditionsLabel: string;
  appBackground: Media;
  termsAndConditionsLink: Link;
}

export interface CountdownTimer {
  id: number;
  __component: 'layout.countdown-timer';
  title: string;
  countdownExpirationDateTime: string;
}

export interface ContestLeaderboard {
  id: number;
  __component: 'layout.contest-leaderboard';
  title: string;
  tradingCompetitionID: number;
  prizeList: Prize[];
  contestAccountCategory: string;
}

export interface Prize {
  id: number;
  place: number;
  prizeAmount: number;
}

export interface InfoBlock {
  id: number;
  __component: 'layout.info-block';
  title: string;
  bulletPointStyle: 'icons' | 'numbers';
  boxStyle: 'simple' | 'with-border';
  infoBlockElement: InfoBlockElement[];
}

export interface InfoBlockElement {
  id: number;
  primaryText: string | null;
  secondaryText: string;
  icon?: any;
}

export interface FAQSection {
  id: number;
  __component: 'layout.faq-section';
  faqList: FAQ[];
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface CompetitionCTA {
  id: number;
  __component: 'layout.competition-cta';
  tradingCompetitionID: string;
  contestAccountCategory: string;
}

export interface DepositCTA {
  id: number;
  __component: 'layout.deposit-cta';
  enabled: boolean;
}
export interface DepositCTAData {
  id: number;
  enabled: boolean;
}
export interface VerifyAccountCTA {
  id: number;
  __component: 'layout.verify-profile-cta';
  verifiedUserText: string;
}
export interface VerifyAccountCTAData {
  id: number;
  verifiedUserText: string;
}
export interface TradeCTA {
  id: number;
  __component: 'layout.trade-cta';
  enabled: boolean;
}
export interface TradeCTAData {
  id: number;
  enabled: boolean;
}
export interface WebinarRegistrationInterval {
  id: number;
  registrationDateStart: Date;
  registrationDateEnd: Date;
  zoomWebinarId: string;
}

export interface WebinarRegistrationCTA {
  id: number;
  __component: 'layout.webinar-registration-cta';
  zoomWebinarId: string;
  phoneRequired: boolean;
  webinarRegistrationInterval?: WebinarRegistrationInterval[] | undefined | null;
}

export interface WebinarRegistrationCTAData {
  id: number;
  zoomWebinarId: string;
  phoneRequired: boolean;
  webinarRegistrationInterval?: WebinarRegistrationInterval[] | undefined | null;
}

export interface UpcomingEventElement {
  id: 13;
  eventTitle: string;
  eventDateTime: Date;
}

export interface UpcomingEventsCountdown {
  id: number;
  __component: 'layout.upcoming-events-countdown';
  countdownTitle: string;
  eventScheduleElement: UpcomingEventElement[];
}

export interface UpcomingEventsCountdownData {
  id: number;
  countdownTitle: string;
  eventScheduleElement: UpcomingEventElement[];
}

export interface LegalDocs {
  id: number;
  __component: 'layout.legal-docs';
  title: string;
  promoLegalDocs: {
    data: LegalDoc[];
  };
}

export interface TopicEventScheduleElement {
  id: number;
  primaryText: string;
  secondaryText: string;
  day: string;
  time: string;
}

export interface UpcomingEventsTopics {
  id: number;
  __component: 'layout.upcoming-events-topics';
  title: string;
  eventElement: TopicEventScheduleElement[];
}

export interface UpcomingEventsTopicsData {
  id: number;
  title: string;
  eventElement: TopicEventScheduleElement[];
}

export interface InfoTableRow {
  id: number;
  primaryText: string;
  secondaryText: string;
}

export interface InfoTable {
  id: number;
  __component: 'layout.info-table';
  title: string;
  infoTableRow: InfoTableRow[];
}
export interface InfoTableData {
  id: number;
  title: string;
  infoTableRow: InfoTableRow[];
}

export interface TestimonialElement {
  id: number;
  title: string;
  description: string;
}

export interface PromoTestimonals {
  id: 1;
  __component: 'layout.testimonials';
  title: string;
  testimonialElement: TestimonialElement[];
}
export interface PromoTestimonalsData {
  id: 1;
  title: string;
  testimonialElement: TestimonialElement[];
}

export interface LegalDoc {
  id: number;
  attributes: {
    title: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    translationKey: string | null;
    locale: string;
    grouping: string;
    beginOn: string | null;
    endOn: string | null;
    generalTermsAndConditions: boolean | null;
  };
}

interface Media {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
      formats: {
        thumbnail: MediaFormat;
      };
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string | null;
      provider: string;
      provider_metadata: unknown | null;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

interface Link {
  data: {
    id: number;
    attributes: {
      title: string;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      translationKey: string | null;
      locale: string;
      grouping: string;
      generalTermsAndConditions: boolean | null;
    };
  };
}

export interface PromoDetails<T> {
  data: {
    id: number;
    attributes: {
      name: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      locale: string;
      primaryPromoColour: string;
      secondaryPromoColour: string;
      slug: string;
      sortOrder: number | null;
      tertiaryPromoColour: string;
      promoPage: T | PromoPage[];
      bannerTextColor: string;
      bannerButtonColour: string;
      bannerButtonLabelColour: string;
      visibilityRestrictions: {
        id: number;
        restrictionsLogic: PromoRestrictionsLogic;
        restriction: {
          id: number;
          attribute: string;
          conditionValue: string;
          operator: PromoRestrictionOperator;
        }[];
      }[];
    };
  };
}

export interface ParsedPromoDetailData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  primaryPromoColour: string;
  secondaryPromoColour: string;
  slug: string;
  sortOrder: number | null;
  tertiaryPromoColour: string;
  bannerTextColor: string;
  bannerButtonColour: string;
  bannerButtonLabelColour: string;
  'hero-banner'?: HeroBannerData[];
  'countdown-timer'?: CountdownTimerData[];
  'contest-leaderboard'?: ContestLeaderboardData[];
  'info-block'?: InfoBlockData[];
  'faq-section'?: FAQSectionData[];
  'competition-cta'?: CompetitionCTAData[];
  'legal-docs'?: LegalDocsData[];
  'trade-cta'?: TradeCTAData[];
  'deposit-cta'?: DepositCTAData[];
  'verify-profile-cta'?: VerifyAccountCTAData[];
  'webinar-registration-cta'?: WebinarRegistrationCTAData[];
  'upcoming-events-topics'?: UpcomingEventsTopicsData[];
  'info-table'?: InfoTableData[];
  testimonials?: PromoTestimonalsData[];
  'upcoming-events-countdown'?: UpcomingEventsCountdownData[];
  visibilityRestrictions: {
    restrictionsLogic: PromoRestrictionsLogic | null;
    restriction: {
      attribute: string;
      conditionValue: string;
      operator: PromoRestrictionOperator;
    }[];
  };
}

export interface HeroBannerData {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  termsAndConditionsLabel: string;
  image: string;
  termsAndConditionsLink: LinkData;
}

export interface CountdownTimerData {
  id: number;
  title: string;
  countdownExpirationDateTime: string;
}

export interface ContestLeaderboardData {
  id: number;
  title: string;
  tradingCompetitionID: number;
  prizeList: PrizeData[];
  contestAccountCategory: string;
}

export interface PrizeData {
  id: number;
  place: number;
  prizeAmount: number;
}

export interface InfoBlockData {
  id: number;
  title: string;
  bulletPointStyle: 'icons' | 'numbers';
  boxStyle: 'simple' | 'with-border';
  infoBlockElement: InfoBlockElementData[];
}

export interface InfoBlockElementData {
  id: number;
  primaryText: string | null;
  secondaryText: string;
  icon?: any;
}

export interface InfoBlockIcon {
  infoBlockElementId: number;
  url: string | null;
}

export interface PromoIconArgs {
  id: number;
  layout?: string;
  field?: string;
  iconField?: string;
}

export interface TestimonialIcon {
  testimonialElementId: number;
  url: string | null;
}

export interface FAQSectionData {
  id: number;
  faqList: FAQData[];
}

export interface FAQData {
  id: number;
  question: string;
  answer: string;
}

export interface CompetitionCTAData {
  id: number;
  tradingCompetitionID: string;
  contestAccountCategory: string;
}

export interface LegalDocsData {
  id: number;
  title: string;
  promoLegalDocs: LegalDocumentData[];
}

export interface LegalDocumentData {
  id: number;
  title: string;
  sortOrder: number;
  beginOn: string | null;
  endOn: string | null;
}

export interface MediaData {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
      formats: {
        thumbnail: MediaFormatData;
      };
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string | null;
      provider: string;
      provider_metadata: unknown | null;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface MediaFormatData {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

export interface LinkData {
  data: {
    id: number;
    attributes: {
      title: string;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      translationKey: string | null;
      locale: string;
      grouping: string;
      generalTermsAndConditions: boolean | null;
    };
  };
}

interface DocumentAttributes {
  id: number;
  attributes: {
    title: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    translationKey: string | null;
    locale: string;
    grouping: string;
    beginOn: string | null;
    endOn: string | null;
    generalTermsAndConditions: boolean | null;
    documentFile: {
      data: {
        id: number;
        attributes: DocumentFileAttributes;
      };
    };
    localizations: {
      data: Localization[];
    };
  };
}

interface DocumentFileAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: unknown | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
}

interface Localization {
  id: number;
  attributes: LocalizationAttributes;
}

interface LocalizationAttributes {
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  translationKey: string | null;
  locale: string;
  grouping: string;
  generalTermsAndConditions: boolean | null;
}

export type DocumentList = DocumentAttributes[];

export interface ParsedPromoLegalDocs {
  id: number;
  title: string;
  sortOrder: number;
  beginOn: string | null;
  endOn: string | null;
  url: string;
}

export interface PromoContest {
  id: number;
  name: string;
  registrationPeriodFrom: string;
  registrationPeriodTo: string;
  contestPeriodFrom: string;
  contestPeriodTo: string;
  canParticipate: boolean;
  live: boolean;
  running: boolean;
  finished: boolean;
  leaderCalcType: string;
}

export interface ContestLeader {
  position: number;
  participant: string;
  login: string;
  performance: string;
}

export interface IdeasHubState {
  categoryIdeas: Record<string, IdeaData[]>;
  watchWidgets: WatchWidget[];
  customerIO: boolean;
  promotions: ParsedPromoData[];
}

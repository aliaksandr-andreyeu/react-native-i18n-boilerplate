import {
  CompetitionCTA,
  ContestData,
  ContestLeaderboard,
  ContestLeaderboardData,
  CountdownTimer,
  CountdownTimerData,
  DepositCTA,
  DocumentList,
  FAQSection,
  FAQSectionData,
  HeroBanner,
  InfoBlock,
  InfoBlockData,
  InfoBlockIcon,
  InfoTable,
  InfoTableData,
  LegalDocs,
  LegalDocsData,
  ParsedPromoData,
  ParsedPromoDetailData,
  ParsedPromoLegalDocs,
  PromoDetails,
  PromoLayout,
  PromoPage,
  PromoTestimonals,
  PromoTestimonalsData,
  TradeCTA,
  UpcomingEventsCountdown,
  UpcomingEventsCountdownData,
  UpcomingEventsTopics,
  UpcomingEventsTopicsData,
  VerifyAccountCTA,
  WatchWidget,
  WebinarRegistrationCTA,
  WebinarRegistrationCTAData,
  Widget
} from '@/store/slices/ideas-hub/types';
import { RawIdeaData, IdeaData, RawIdeaCategoryData, IdeaCategoryData } from './types';
import { getCMSImageUrl } from '@/helpers';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';

dayjs.extend(isBetween);

export const ideaCategoriesParser = (rawCategories: RawIdeaCategoryData[]): IdeaCategoryData[] =>
  rawCategories?.map((el: RawIdeaCategoryData) => ({
    id: el?.id,
    title: el?.attributes?.title || '',
    createdAt: el?.attributes?.createdAt
  })) || [];

export const ideaDetailsParser = (rawIdeas: RawIdeaData[]): IdeaData => {
  const parsedData =
    rawIdeas?.map((el: RawIdeaData) => {
      const categories =
        el?.attributes?.ca_investment_idea_categories?.data?.map((el) => {
          const { id, attributes } = el || {};
          const { title, createdAt } = attributes || {};
          return {
            id,
            title: title || '',
            createdAt
          };
        }) || [];
      const assets =
        el?.attributes?.trading_assets?.data?.map((el) => {
          const { id, attributes } = el || {};
          const { name, fullName, systemName, createdAt, locale } = attributes || {};
          return {
            id,
            name: name || '',
            fullName: fullName || '',
            systemName: systemName || '',
            createdAt,
            locale
          };
        }) || [];

      return {
        id: el?.id,
        title: el?.attributes?.title || '',
        description: el?.attributes?.description || '',
        shortDescription: el?.attributes?.shortDescription || '',
        image: getCMSImageUrl(el?.attributes?.previewImage?.data?.attributes?.url),
        ideasNumber: el?.attributes?.trading_assets?.data?.length || 0,
        categories,
        assets
      };
    }) || [];

  return (parsedData.find((el) => el) || {}) as IdeaData;
};

export const ideasParser = (rawIdeas: RawIdeaData[]): IdeaData[] =>
  rawIdeas?.map((el: RawIdeaData) => ({
    id: el?.id,
    title: el?.attributes?.title || '',
    shortTitle: el?.attributes?.shortTitle || '',
    description: el?.attributes?.description || '',
    shortDescription: el?.attributes?.shortDescription || '',
    image: getCMSImageUrl(el?.attributes?.previewImage?.data?.attributes?.url),
    ideasNumber: el?.attributes?.trading_assets?.data?.length || 0,
    verticalTextAlignment: el?.attributes?.verticalTextAlignment || 'bottom',
    featured: el?.attributes?.featured || false
  })) || [];

export const widgetsParser = (widgets: Partial<Widget>[]): WatchWidget[] => {
  const data = widgets?.map((item) => {
    const categories =
      item?.attributes?.trading_assets?.data?.map((el) => {
        const { id, attributes } = el || {};
        const { fullName, createdAt } = attributes || {};
        return {
          id,
          title: fullName || '',
          createdAt
        };
      }) || [];
    const assets =
      item?.attributes?.trading_assets?.data?.map((el) => {
        const { id, attributes } = el || {};
        const { name, fullName, systemName, createdAt, locale } = attributes || {};
        return {
          id,
          name: name || '',
          fullName: fullName || '',
          systemName: systemName || '',
          createdAt,
          locale
        };
      }) || [];

    return {
      id: item?.id || -1,
      title: item?.attributes?.title || '',
      image: getCMSImageUrl(item?.attributes?.previewImage?.data?.attributes?.url) || '',
      description: item?.attributes?.description || '',
      category: '',
      assets,
      categories,
      createdAt: item?.attributes?.createdAt || ''
    };
  });

  return data;
};

export const promoParser = (promos: Partial<ContestData>[]): ParsedPromoData[] => {
  if (!promos?.length) return [];

  const now = dayjs();
  return promos
    .map((item) => {
      let beginOn = item?.attributes?.beginOn || (null as string | null);
      let endOn = item?.attributes?.endOn || (null as string | null);
      if (beginOn) {
        beginOn = dayjs(beginOn).toISOString();
      }
      if (endOn) {
        endOn = dayjs(endOn).toISOString();
      }

      return {
        bgImage: getCMSImageUrl(item?.attributes?.promoBanner?.appBannerBackgroundImage?.data?.attributes?.url) || '',
        buttonLabel: item?.attributes?.promoBanner?.ctaButtonLabel || '',
        subTitle: item?.attributes?.promoBanner?.subtitle || '',
        tagline: item?.attributes?.promoBanner?.tagline || '',
        title: item?.attributes?.promoBanner?.title || '',
        id: item?.id || 0,
        primaryColor: item?.attributes?.primaryPromoColour || '',
        ctaMobileDeepLink: item?.attributes?.promoBanner.ctaMobileDeepLink || '',
        sortOrder: item?.attributes?.sortOrder || 0,
        beginOn,
        endOn,
        bannerButtonLabelColour: item?.attributes?.bannerButtonLabelColour || '',
        bannerButtonColour: item?.attributes?.bannerButtonColour || '',
        bannerTextColor: item?.attributes?.bannerTextColor || '',
        visibilityRestrictions: {
          restrictionsLogic: item?.attributes?.visibilityRestrictions?.[0]?.restrictionsLogic || null,
          restriction:
            item?.attributes?.visibilityRestrictions?.[0]?.restriction.map(
              ({ attribute, conditionValue, operator }) => ({
                attribute,
                conditionValue,
                operator
              })
            ) || []
        }
      };
    })
    .filter((item) => {
      const beginOn = item.beginOn;
      const endOn = item.endOn;
      const hasBegin = !!beginOn;
      const hasEnd = !!endOn;

      if (hasBegin && hasEnd) {
        return now.isBetween(dayjs(beginOn), dayjs(endOn), null, '[)');
      }

      if (hasBegin) {
        return now.isAfter(dayjs(beginOn)) || now.isSame(dayjs(beginOn));
      }

      if (hasEnd) {
        return now.isBefore(dayjs(endOn));
      }
      return true;
    })
    .sort((a, b) => {
      return b.sortOrder - a.sortOrder;
    });
};

export const promoDetailsParser = (promo: PromoDetails<PromoPage[]>['data']): ParsedPromoDetailData => {
  const {
    attributes: { promoPage: _, visibilityRestrictions, ...promoAttributes },
    id
  } = promo;

  const promoPage = promo?.attributes?.promoPage?.reduce(
    (acc, item) => {
      const key = item.__component.split('.')[1] as PromoLayout;

      if (!acc[key]) {
        acc[key] = [];
      }

      switch (key) {
        case 'hero-banner':
          acc['hero-banner'].push(transformHeroBanner(item as HeroBanner));
          break;

        case 'countdown-timer':
          acc['countdown-timer'].push(transformCountdownTimer(item as CountdownTimer));
          break;

        case 'contest-leaderboard':
          acc['contest-leaderboard'].push(transformContestLeaderboard(item as ContestLeaderboard));
          break;

        case 'info-block':
          acc['info-block'].push(transformInfoBlock(item as InfoBlock));
          break;

        case 'faq-section':
          acc['faq-section'].push(transformFAQSection(item as FAQSection));
          break;

        case 'competition-cta':
          acc['competition-cta'].push(transformCompetitionCTA(item as CompetitionCTA));
          break;

        case 'legal-docs':
          acc['legal-docs'].push(transformLegalDocs(item as LegalDocs));
          break;

        case 'deposit-cta':
          acc['deposit-cta'].push(transformDepositCTA(item as DepositCTA));
          break;

        case 'trade-cta':
          acc['trade-cta'].push(transformTradeCTA(item as TradeCTA));
          break;

        case 'verify-profile-cta':
          acc['verify-profile-cta'].push(transformVerifyAccountCTA(item as VerifyAccountCTA));
          break;

        case 'webinar-registration-cta':
          acc['webinar-registration-cta'].push(transformWebinarRegistrationCTA(item as WebinarRegistrationCTA));
          break;

        case 'upcoming-events-topics':
          acc['upcoming-events-topics'].push(transformUpcomingEvent(item as UpcomingEventsTopics));
          break;

        case 'info-table':
          acc['info-table'].push(transformInfoTable(item as InfoTable));
          break;

        case 'testimonials':
          acc['testimonials'].push(transformTestimonials(item as PromoTestimonals));
          break;

        case 'upcoming-events-countdown':
          acc['upcoming-events-countdown'].push(transformUpcomingEventCountdown(item as UpcomingEventsCountdown));
          break;

        default:
          break;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  function transformHeroBanner(item: HeroBanner) {
    return {
      id: item?.id || 0,
      title: item?.title || '',
      subtitle: item?.subtitle || '',
      tagline: item?.tagline || '',
      termsAndConditionsLabel: item?.termsAndConditionsLabel || '',
      image: getCMSImageUrl(item?.appBackground?.data?.attributes?.url) || '',
      termsAndConditionsLink: item?.termsAndConditionsLink || ''
    };
  }

  function transformCountdownTimer(item: CountdownTimerData) {
    return {
      id: item?.id || 0,
      title: item?.title || '',
      countdownExpirationDateTime: item?.countdownExpirationDateTime || ''
    };
  }

  function transformContestLeaderboard(item: ContestLeaderboardData) {
    return {
      id: item?.id || 0,
      title: item?.title || '',
      tradingCompetitionID: item?.tradingCompetitionID || '',
      prizeList: item?.prizeList || [],
      contestAccountCategory: item?.contestAccountCategory || ''
    };
  }

  function transformInfoBlock(item: InfoBlockData) {
    return {
      id: item?.id || 0,
      title: item?.title || '',
      bulletPointStyle: item?.bulletPointStyle || 'numbers',
      boxStyle: item?.boxStyle || 'simple',
      infoBlockElement: item?.infoBlockElement || []
    };
  }

  function transformFAQSection(item: FAQSectionData) {
    return {
      id: item?.id || 0,
      faqList: item?.faqList || []
    };
  }

  function transformCompetitionCTA(item: CompetitionCTA) {
    return {
      id: item?.id || 0,
      tradingCompetitionID: item?.tradingCompetitionID || '',
      contestAccountCategory: item?.contestAccountCategory || ''
    };
  }
  function transformDepositCTA(item: DepositCTA) {
    return {
      id: item?.id || 0,
      enabled: item?.enabled || false
    };
  }
  function transformTradeCTA(item: TradeCTA) {
    return {
      id: item?.id || 0,
      enabled: item?.enabled || false
    };
  }
  function transformVerifyAccountCTA(item: VerifyAccountCTA) {
    return {
      id: item?.id || 0,
      verifiedUserText: item?.verifiedUserText || ''
    };
  }
  function transformWebinarRegistrationCTA(item: WebinarRegistrationCTA): WebinarRegistrationCTAData {
    return {
      id: item?.id || 0,
      zoomWebinarId: item?.zoomWebinarId || '',
      phoneRequired: item?.phoneRequired || false,
      webinarRegistrationInterval: item?.webinarRegistrationInterval || undefined
    };
  }

  function transformUpcomingEvent(item: UpcomingEventsTopics): UpcomingEventsTopicsData {
    return {
      title: item?.title || '',
      eventElement: item?.eventElement || [],
      id: item?.id || 0
    };
  }

  function transformInfoTable(item: InfoTable): InfoTableData {
    return {
      id: item?.id || 0,
      infoTableRow: item?.infoTableRow || [],
      title: item?.title || ''
    };
  }

  function transformTestimonials(item: PromoTestimonals): PromoTestimonalsData {
    return {
      id: item?.id || 0,
      title: item?.title || '',
      testimonialElement: item?.testimonialElement || []
    };
  }

  function transformUpcomingEventCountdown(item: UpcomingEventsCountdown): UpcomingEventsCountdownData {
    return {
      id: item?.id || 0,
      countdownTitle: item?.countdownTitle || '',
      eventScheduleElement: item?.eventScheduleElement || []
    };
  }

  function transformLegalDocs(item: LegalDocs): LegalDocsData {
    const legalDocs = item?.promoLegalDocs?.data;
    const promoLegalDocs = legalDocs
      ? item?.promoLegalDocs?.data?.map?.((item) => {
          return {
            id: item?.id || 0,
            title: item?.attributes?.title || '',
            sortOrder: item?.attributes?.sortOrder || 0,
            beginOn: item?.attributes?.beginOn || null,
            endOn: item?.attributes?.endOn || null
          };
        })
      : [];

    return {
      id: item?.id,
      title: item?.title,
      promoLegalDocs
    };
  }

  return {
    id,
    ...promoPage,
    ...promoAttributes,
    visibilityRestrictions: {
      restrictionsLogic: visibilityRestrictions?.[0]?.restrictionsLogic || null,
      restriction:
        visibilityRestrictions?.[0]?.restriction.map(({ attribute, conditionValue, operator }) => ({
          attribute,
          conditionValue,
          operator
        })) || []
    }
  };
};

export const promoIconsParser = (data: PromoDetails<[]>['data'] | null | undefined): InfoBlockIcon[] => {
  if (!data?.attributes?.promoPage) return [];

  return data?.attributes?.promoPage?.flatMap?.((promoPage: any) => {
    const promo = promoPage;
    if (promo?.testimonialElement) {
      return promo.testimonialElement?.map?.((element: any) => ({
        testimonialElementId: element?.id || 0,
        url: getCMSImageUrl(element?.photo?.data?.attributes?.url) || null
      }));
    }
    return (
      promo.infoBlockElement?.map?.((element: any) => ({
        infoBlockElementId: element?.id || 0,
        url: getCMSImageUrl(element?.icon?.data?.attributes?.url) || null
      })) || []
    );
  });
};

export const promoLegalDocsParser = (docs: DocumentList): ParsedPromoLegalDocs[] => {
  if (!docs || !docs?.length) return [];

  const now = dayjs();

  return docs
    ?.map?.((document) => {
      let beginOn = document?.attributes?.beginOn || null;
      let endOn = document?.attributes?.endOn || null;
      if (beginOn) {
        beginOn = dayjs(beginOn).toISOString();
      }
      if (endOn) {
        endOn = dayjs(endOn).toISOString();
      }

      return {
        id: document?.id || 0,
        title: document?.attributes?.title || '',
        sortOrder: document?.attributes?.sortOrder || 0,
        beginOn,
        endOn,
        url: getCMSImageUrl(document?.attributes?.documentFile?.data?.attributes?.url) || ''
      };
    })
    .filter((item) => {
      const beginOn = item?.beginOn;
      const endOn = item?.endOn;
      const hasBegin = !!beginOn;
      const hasEnd = !!endOn;

      if (hasBegin && hasEnd) {
        return now.isBetween(dayjs(beginOn), dayjs(endOn), null, '[)');
      }

      if (hasBegin) {
        return now.isAfter(dayjs(beginOn)) || now.isSame(dayjs(beginOn));
      }

      if (hasEnd) {
        return now.isBefore(dayjs(endOn));
      }
      return true;
    });
};

export const past24HoursTimeISO = () => {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return last24Hours.toISOString();
};

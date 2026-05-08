import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle, BackHandler, Linking, Keyboard } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { config, testIDs, UserTheme } from '@/constants';
import { StackScreenProps } from '@react-navigation/stack';
import Animated, { FadeOut } from 'react-native-reanimated';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import {
  BaseBackButton,
  PromoTimer,
  BasePromoBanner,
  BaseInfoBlock,
  PromoDocs,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseText,
  BaseTextVariant,
  LeaderBoard,
  PromoFAQ,
  BaseCopy,
  UpcomingEventTopics,
  PromoTestimonials,
  PromoNumberSheet,
  BaseLoader
} from '@/components';
import dateHelper from '@/helpers/dateHelper';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useTranslation } from 'react-i18next';
import {
  useGetContestLeadersQuery,
  useGetDemoTradingAccountsMutation,
  useGetPromoContestQuery,
  useGetPromoIconsQuery,
  useGetPromotionDetailsQuery,
  useGetTradingAccountsMutation,
  useParticipateContestMutation,
  useProfileQuery,
  useRegisterForWebinarQuery
} from '@/store/api';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES, IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { actions } from '@/store';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { images } from '@/assets';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { promoCTAClickedMixpanel, promoPageOpenedMixpanel } from '@/helpers';
import { isPromoRestricted } from '@/helpers';
import InfoTable from '@/components/molecules/info-table';
import { InfoBlockIcon, TestimonialIcon, WebinarRegistrationInterval } from '@/store/slices/ideas-hub/types';

type PromotionDetailsScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.PromotionDetails>;

type ButtonTitles =
  | 'sign-up'
  | 'verify-now'
  | 'join-now'
  | 'null'
  | 'register-info'
  | 'joined'
  | 'deposit-now'
  | 'trade-now'
  | 'register-webinar'
  | 'join-webinar'
  | 'transfer-funds';

type CustomActions =
  | 'partipicate'
  | 'join-webinar'
  | 'go-to-deposit'
  | 'go-to-verify'
  | 'go-to-sign-up'
  | 'go-to-trade'
  | 'empty'
  | 'register-for-webinar'
  | 'go-to-transfer'
  | 'register-for-webinar-after-phone';

const { screenWidth } = config;

const {
  application: { openModal }
} = actions;

const PromotionDetailsScreen: React.FC<PromotionDetailsScreenProps> = ({ navigation, route }) => {
  const { params } = route || {};
  const { id = 0, promotionId = 0 } = params || {};

  const promoId = id || promotionId;

  const [showTime, setShowTime] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const sheetIsOpen = useRef<boolean>(false);
  const sheetRef = useRef<BottomSheetModal>(null);

  const {
    t,
    i18n: { language }
  } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { bottom } = useSafeAreaInsets();

  const [getPromotion, { data, isLoading: isPromoLoading }] = useGetPromotionDetailsQuery();
  const { visibilityRestrictions } = data || {};

  const [getPromoContest, { data: promoContest, isFetching: promoContestLoading }] = useGetPromoContestQuery();
  const [getContestLeaders, { data: contestLeaders, isFetching: contestLeadersLoading }] = useGetContestLeadersQuery();
  const [participateContest, { isLoading: participateLoading }] = useParticipateContestMutation();
  const [getTradingAccounts] = useGetTradingAccountsMutation();
  const [getDemoAccounts] = useGetDemoTradingAccountsMutation();
  const [getPromoIcons, { data: promoIcons }] = useGetPromoIconsQuery();
  const [getProfile, { isFetching: profileLoading }] = useProfileQuery();
  const [registerForWebinar, { isLoading: registerForWebinarLoading }] = useRegisterForWebinarQuery();

  const isLoading = Boolean(promotionId && (visibilityRestrictions === undefined || isPromoLoading));

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const dispatch = useAppDispatch();

  const wallet = useAppSelector((store) => store.wallet);
  const { tradingAccounts = [], demoAccounts = [] } = wallet || {};

  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified } = userInfo || {};

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const isAuthorized = !!accessToken;

  const goToIdeasHub = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

  const checkRestrictions = () => {
    const isRestricted = isPromoRestricted(visibilityRestrictions, userInfo);

    if (isRestricted) {
      goToIdeasHub();
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkRestrictions();
    }, [route, navigation, visibilityRestrictions, userInfo])
  );

  const showPopUp = useCallback(
    ({ title = '', subTitle, button, secondaryButton, closeTime, icon, iconSize }: Partial<DefaultModalConfig>) => {
      dispatch(
        openModal({
          title,
          subTitle,
          icon,
          iconSize,
          button,
          secondaryButton,
          closeTime
        })
      );
    },
    []
  );

  const contestIsStarted = useMemo(() => {
    return dateHelper.isBetween(promoContest?.contestPeriodFrom || '', promoContest?.contestPeriodTo || '', dayjs());
  }, [promoContest?.contestPeriodFrom, promoContest?.contestPeriodTo]);

  const canRegister = useMemo(() => {
    return dateHelper.isBetween(
      promoContest?.registrationPeriodFrom || '',
      promoContest?.registrationPeriodTo || '',
      dayjs()
    );
  }, [promoContest?.registrationPeriodFrom, promoContest?.contestPeriodTo]);

  const buttonTitles = useMemo(
    (): Record<ButtonTitles, string> => ({
      'join-now': t('screens.promo-details.join-now'),
      'register-info': t('screens.promo-details.register-info'),
      'sign-up': t('screens.promo-details.sign-up'),
      'verify-now': t('screens.promo-details.verify-now'),
      null: '',
      joined: t('screens.promo-details.joined'),
      'trade-now': t('screens.promo-details.trade-now'),
      'deposit-now': t('screens.promo-details.deposit-now'),
      'register-webinar': t('screens.promo-details.register-webinar'),
      'join-webinar': t('screens.promo-details.join-webinar'),
      'transfer-funds': t('screens.promo-details.transfer-funds')
    }),
    [t]
  );

  const heroBanner = useMemo(() => data?.['hero-banner'], [data?.['hero-banner']]);

  const countdown = useMemo(() => data?.['countdown-timer'], [data?.['countdown-timer']]);

  const infoBlock = useMemo(() => data?.['info-block'], [data?.['info-block']]);

  const faq = useMemo(() => data?.['faq-section'], [data?.['faq-section']]);

  const legalDocs = useMemo(() => data?.['legal-docs'], [data?.['legal-docs']]);

  const leaderBoard = useMemo(() => data?.['contest-leaderboard'], [data?.['contest-leaderboard']]);

  const competitionCTA = useMemo(() => data?.['competition-cta'], [data?.['competition-cta']]);

  const tradeCTA = useMemo(() => data?.['trade-cta'], [data?.['trade-cta']]);

  const depositCTA = useMemo(() => data?.['deposit-cta'], [data?.['deposit-cta']]);

  const verifyProfileCTA = useMemo(() => data?.['verify-profile-cta'], [data?.['verify-profile-cta']]);

  const webinarCTA = useMemo(() => data?.['webinar-registration-cta'], [data?.['webinar-registration-cta']]);

  const upcomingEventTopics = useMemo(() => data?.['upcoming-events-topics'], [data?.['upcoming-events-topics']]);

  const infoTable = useMemo(() => data?.['info-table'], [data?.['info-table']]);

  const testimonials = useMemo(() => data?.testimonials, [data?.testimonials]);

  const upcomingEventCountDowns = useMemo(
    () => data?.['upcoming-events-countdown'],
    [data?.['upcoming-events-countdown']]
  );

  const ctaAccounts = useMemo(() => {
    if (competitionCTA && competitionCTA.length) {
      const category = competitionCTA[0].contestAccountCategory;
      if (category === 'demo') return demoAccounts;
      return tradingAccounts;
    }
    return [];
  }, [demoAccounts, tradingAccounts, competitionCTA]);

  const myLeaderPlace = useMemo(() => {
    if (!contestLeaders || !contestLeaders.length) return undefined;
    const accounts = ctaAccounts.map((item) => item.login);
    const logins = new Map(contestLeaders.map((item) => [item.login, item]));
    for (const value of accounts) {
      const place = logins.get(value);
      if (place) return place;
    }
    return undefined;
  }, [ctaAccounts, contestLeaders]);

  const isRegistered = useMemo(() => {
    let accountType: 'demo' | 'live' = 'demo';
    if (competitionCTA?.[0].contestAccountCategory)
      accountType = competitionCTA[0].contestAccountCategory as 'live' | 'demo';
    if (!contestLeaders || !contestLeaders.length) return undefined;
    const accounts = ctaAccounts.map((item) => item.login);
    const logins = new Set(contestLeaders.map((item) => item.login));
    for (const value of accounts) {
      if (logins.has(value)) {
        const balance = ctaAccounts.find((item) => item.login === value)?.balance || 0;
        return {
          account: value,
          accountType,
          balance
        };
      }
    }
    return undefined;
  }, [contestLeaders, ctaAccounts, competitionCTA]);

  const getCurrentWebinar = (
    webinars: WebinarRegistrationInterval[] | undefined | null,
    webinarDefaultZoomId: string
  ) => {
    if (!webinars?.length) return webinarDefaultZoomId || '';
    const currentDate = dayjs();
    for (let i = 0; i < webinars.length; i++) {
      const webinar = webinars[i];
      const startDate = dayjs(webinar.registrationDateStart);
      const endDate = dayjs(webinar.registrationDateEnd);
      const isBetween = currentDate.isAfter(startDate) && currentDate.isBefore(endDate);
      if (isBetween) {
        return webinar.zoomWebinarId;
      }
    }
    return webinarDefaultZoomId || '';
  };

  const webinarUrl = useMemo(() => {
    return userInfo?.customFields?.custom_webinar_join_url || '';
  }, [userInfo?.customFields?.custom_webinar_join_url]);

  const isRegisteredForWebinar = useMemo(() => {
    if (!webinarCTA || !webinarCTA.length) return false;
    if (!webinarUrl) return false;

    const zoomId = getCurrentWebinar(webinarCTA?.[0]?.webinarRegistrationInterval, webinarCTA?.[0]?.zoomWebinarId);
    if (!webinarUrl.includes(zoomId)) return false;
    return true;
  }, [webinarUrl, webinarCTA, getCurrentWebinar]);

  const buttonFn = useMemo((): { title: string; isInfoText: boolean; customAction: CustomActions } => {
    let title = '';
    let isInfoText = false;
    let customAction: CustomActions = 'empty';

    if (!isAuthorized) {
      return {
        title: buttonTitles['sign-up'],
        isInfoText: false,
        customAction: 'go-to-sign-up'
      };
    }

    const verfyAction = () => {
      title = buttonTitles['verify-now'];
      customAction = 'go-to-verify';
    };

    const makeADeposit = () => {
      title = buttonTitles['deposit-now'];
      customAction = 'go-to-deposit';
    };

    const isCompetition = competitionCTA && !!competitionCTA.length;
    const isDeposit = depositCTA && !!depositCTA.length;
    const isTrade = tradeCTA && !!tradeCTA.length;
    const isWebinar = webinarCTA && !!webinarCTA.length;
    const isVerify = verifyProfileCTA && verifyProfileCTA.length;

    if (isVerify) {
      if (!isVerified) verfyAction();
      else {
        title = verifyProfileCTA[0].verifiedUserText;
        isInfoText = true;
      }
    } else if (isCompetition) {
      if (!isVerified) verfyAction();
      else if (isRegistered) {
        if (!userInfo.firstDepositDate) makeADeposit();
        else if (isRegistered.accountType === 'live' && isRegistered.balance === 0) {
          title = buttonTitles['transfer-funds'];
          customAction = 'go-to-transfer';
        } else {
          title = buttonTitles['joined'];
          isInfoText = true;
        }
      } else if (canRegister) {
        title = buttonTitles['join-now'];
        customAction = 'partipicate';
      } else {
        title = buttonTitles['register-info'];
        isInfoText = true;
      }
    } else if (isDeposit && depositCTA[0].enabled) {
      if (!isVerified) verfyAction();
      else makeADeposit();
    } else if (isTrade && tradeCTA[0].enabled) {
      if (!isVerified) verfyAction();
      else if (!userInfo.firstDepositDate) makeADeposit();
      else {
        title = buttonTitles['trade-now'];
        customAction = 'go-to-trade';
      }
    } else if (isWebinar) {
      if (isRegisteredForWebinar) {
        title = buttonTitles['join-webinar'];
        customAction = 'join-webinar';
      } else {
        title = buttonTitles['register-webinar'];
        if (webinarCTA[0].phoneRequired) customAction = 'register-for-webinar-after-phone';
        else customAction = 'register-for-webinar';
      }
    }

    return {
      title,
      isInfoText,
      customAction
    };
  }, [
    buttonTitles,
    t,
    isAuthorized,
    isVerified,
    canRegister,
    userInfo.id,
    isRegistered,
    competitionCTA,
    depositCTA,
    tradeCTA,
    verifyProfileCTA,
    webinarCTA,
    userInfo.firstDepositDate,
    isRegisteredForWebinar
  ]);

  const getAllData = async (pId: number | undefined, passLoadig: boolean = false, lang: string) => {
    if (pId === undefined) return;
    try {
      passLoadig || setLoading(true);
      let promo = await getPromotion({ pId, lang }).unwrap();
      if (!promo && lang !== 'en') {
        promo = await getPromotion({ pId, lang: 'en' }).unwrap();
      }

      const infoBlockData = promo?.['info-block'];
      const testimonialsData = promo?.testimonials;
      if (testimonialsData && testimonialsData.length) {
        await getPromoIcons({
          id: pId,
          layout: 'layout.testimonials',
          field: 'testimonialElement',
          iconField: 'photo'
        }).unwrap();
      } else if (infoBlockData && infoBlockData.length) {
        const hasIconBlock = infoBlockData.some((item) => item.bulletPointStyle == 'icons');
        if (hasIconBlock) await getPromoIcons({ id: pId }).unwrap();
      }
      await getProfile().unwrap();
      const contestLeaderBoard = promo?.['contest-leaderboard'];
      const contestCTA = promo?.['competition-cta'];
      let ctaCategory = '';
      let leaderBoardCategory = '';
      let tradingCompetitionID;
      const hasContestCTA = contestCTA && contestCTA.length;
      if (hasContestCTA) ctaCategory = contestCTA[0].contestAccountCategory;

      if (contestLeaderBoard && contestLeaderBoard.length) {
        tradingCompetitionID = contestLeaderBoard[0].tradingCompetitionID;
        leaderBoardCategory = contestLeaderBoard[0].contestAccountCategory;
      }

      if (hasContestCTA) {
        if (ctaCategory !== leaderBoardCategory) {
          await Promise.all([getTradingAccounts().unwrap(), getDemoAccounts().unwrap()]);
        } else if (ctaCategory === 'demo') {
          await getDemoAccounts().unwrap();
        } else {
          await getTradingAccounts().unwrap();
        }
      }

      if (tradingCompetitionID !== undefined) {
        await Promise.all([
          getPromoContest(tradingCompetitionID).unwrap(),
          getContestLeaders(tradingCompetitionID).unwrap()
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      passLoadig || setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.name && data.id !== undefined) promoPageOpenedMixpanel(data.name, data.id);
  }, [data?.name, data?.id]);

  useFocusEffect(
    useCallback(() => {
      getAllData(promoId, false, language);
    }, [promoId, userInfo.id, language])
  );

  useEffect(() => {
    const backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetIsOpen.current) {
        sheetRef.current?.dismiss();
        bottomSheetRef.current?.dismiss();
      } else if (navigation.canGoBack() && navigation.isFocused()) {
        navigation.goBack();
      } else {
        goToIdeasHub();
      }
      return true;
    });

    return backhandler.remove;
  }, [navigation]);

  const Seperator = useCallback(() => {
    return (
      <Animated.View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </Animated.View>
    );
  }, [theme.dark]);

  const RenderHeroBanner = useMemo(() => {
    if (!heroBanner || !heroBanner?.length) return null;

    return heroBanner.map((item) => {
      return (
        <View key={`${item.id}-hero-banner`} style={styles.alignCenter}>
          <BasePromoBanner
            testID={testIDs.promotionDetails.heroBanner(item.id)}
            isHero
            bannerButtonColor={data?.bannerButtonColour || ''}
            bannerButtonLabelColor={data?.bannerButtonLabelColour || ''}
            bannerTextColor={data?.bannerTextColor || ''}
            bgColor={data?.primaryPromoColour || ''}
            bgImage={item.image || ''}
            id={item.id}
            subTitle={item.subtitle || ''}
            title={item.title || ''}
            tagLine={item.tagline || ''}
          />
          <Seperator />
        </View>
      );
    });
  }, [theme, heroBanner, data]);

  const RenderCountDown = useMemo(() => {
    if (!showTime || !countdown || !countdown?.length) return null;

    const onTimeFinish = () =>
      setTimeout(() => {
        getAllData(promoId, true, language);
        setShowTime(false);
      }, 300);

    return countdown.map((item) => {
      const diff = dateHelper.diff(dayjs(), item.countdownExpirationDateTime);
      if (diff <= 0) return null;

      const timer = dayjs().add(diff, 'seconds');

      return (
        <View key={`${item.id}-countdown`}>
          <PromoTimer title={item.title || ''} onFinish={onTimeFinish} until={timer ?? 0} />
          <Seperator />
        </View>
      );
    });
  }, [theme.dark, showTime, countdown, promoId, language]);

  const RenderUpcomingCountDown = useMemo(() => {
    if (!upcomingEventCountDowns || !upcomingEventCountDowns.length) return;

    const onTimeFinish = () =>
      setTimeout(() => {
        getAllData(promoId, true, language);
      }, 300);

    return upcomingEventCountDowns.map((item) => {
      const dateData = item.eventScheduleElement.map((date) => date.eventDateTime);
      const closest = dateHelper.getClosest(dateData);
      const diff = dateHelper.diff(dayjs(), closest);

      const timer = dayjs().add(diff, 'seconds');
      return (
        <View key={`${item.id}-upcoming-countdown`}>
          <PromoTimer title={item.countdownTitle || ''} onFinish={onTimeFinish} until={timer ?? 0} />
          <Seperator />
        </View>
      );
    });
  }, [theme.dark, upcomingEventCountDowns, language, promoId]);

  const RenderInfoBlocks = useMemo(() => {
    if (!infoBlock || !infoBlock?.length) return null;

    return infoBlock.map((item) => {
      return (
        <View key={`${item.id}-info-block`}>
          <BaseInfoBlock
            testID={testIDs.promotionDetails.infoBlock(item.id)}
            bgColor={data?.secondaryPromoColour || ''}
            blockElements={item.infoBlockElement || []}
            bulletPointStyle={item.bulletPointStyle || 'numbers'}
            type={item.boxStyle || 'simple'}
            borderColor={data?.tertiaryPromoColour || ''}
            title={item.title || ''}
            promoIcons={(promoIcons as InfoBlockIcon[]) || []}
          />
          <Seperator />
        </View>
      );
    });
  }, [theme.dark, infoBlock, data?.primaryPromoColour, data?.tertiaryPromoColour, promoIcons]);

  const RenderFAQ = useMemo(() => {
    if (!faq || !faq.length) return null;

    return faq.map((item) => {
      return (
        <View key={`${item.id}-faq`}>
          <PromoFAQ faqList={item.faqList || []} />
        </View>
      );
    });
  }, [faq, theme.dark, legalDocs?.length]);

  const RenderLegalDocs = useMemo(() => {
    if (!legalDocs || !legalDocs.length) return null;

    return legalDocs.map((item) => {
      return (
        <PromoDocs key={`${item.id}-legal-docs-components`} title={item.title || ''} promoDocs={item.promoLegalDocs} />
      );
    });
  }, [legalDocs, theme.dark]);

  const onDismiss = useCallback(() => (sheetIsOpen.current = false), []);
  const onAnimate = useCallback(() => (sheetIsOpen.current = true), []);

  const RenderLeaderBoard = useMemo(() => {
    if (!leaderBoard || !leaderBoard.length || !contestLeaders?.length || !contestIsStarted) return null;

    const leaderBoardTitle = leaderBoard[0].title;
    const prizeList = leaderBoard[0].prizeList;
    const leaders = contestLeaders.slice(0, prizeList.length || 0);

    return (
      <>
        <LeaderBoard
          title={leaderBoardTitle || ''}
          leaders={leaders || []}
          myLeaderPlace={myLeaderPlace}
          prizeList={prizeList || []}
          onDismiss={onDismiss}
          onAnimate={onAnimate}
          ref={sheetRef}
        />
        <Seperator />
      </>
    );
  }, [leaderBoard, myLeaderPlace, contestLeaders, contestIsStarted, theme.dark, onAnimate, onDismiss]);

  const RenderUpcomingEventsTopics = useMemo(() => {
    if (!upcomingEventTopics || !upcomingEventTopics.length) return null;

    const eventTopic = upcomingEventTopics[0];

    return (
      <>
        <UpcomingEventTopics events={eventTopic.eventElement || []} title={eventTopic.title || ''} />
        <Seperator />
      </>
    );
  }, [upcomingEventTopics, theme.dark]);

  const RenderInfoTable = useMemo(() => {
    if (!infoTable || !infoTable.length) return null;

    const infoData = infoTable[0];

    return (
      <>
        <InfoTable infoTableRow={infoData.infoTableRow || []} title={infoData.title || ''} />
        <Seperator />
      </>
    );
  }, [infoTable, theme.dark]);

  const RenderTestimonials = useMemo(() => {
    if (!testimonials || !testimonials.length) return null;

    const testimonialsData = testimonials[0];

    return (
      <>
        <PromoTestimonials
          icons={(promoIcons as TestimonialIcon[]) || []}
          testimonials={testimonialsData.testimonialElement || []}
          title={testimonialsData.title || ''}
        />
        <Seperator />
      </>
    );
  }, [testimonials, theme.dark, promoIcons]);

  const loader = useMemo(() => {
    const maxWidth = screenWidth - 40;
    const gap = 52;
    const maxHeight = 1650 + gap;

    return (
      <Animated.ScrollView style={styles.contentLoader} exiting={FadeOut.duration(500)}>
        <ContentLoader
          speed={2}
          width={screenWidth}
          height={maxHeight}
          viewBox={`0 0 ${screenWidth} ${maxHeight}`}
          backgroundColor={'#E2E6F2'}
          foregroundColor={theme.palette.graphite['050']}
        >
          <Rect rx={12} ry={12} x={20} width={maxWidth} height={388} />
          <Rect rx={12} ry={12} y={388 + gap} x={20} width={maxWidth} height={218} />
          <Rect rx={8} ry={8} y={710} x={20} width={150} height={19} />
          <Rect rx={12} ry={12} y={745} x={20} width={maxWidth} height={240} />
          <Rect rx={8} ry={8} y={985 + gap} x={20} width={150} height={19} />
          <Rect rx={12} ry={12} y={1020 + gap} x={20} width={maxWidth} height={194} />
          <Rect rx={12} ry={12} y={1214 + gap + gap} x={20} width={150} height={19} />
          <Rect rx={12} ry={12} y={1249 + gap + gap} x={20} width={maxWidth} height={74} />
          <Rect rx={12} ry={12} y={1331 + gap + gap} x={20} width={maxWidth} height={74} />
          <Rect rx={12} ry={12} y={1413 + gap + gap} x={20} width={maxWidth} height={74} />
        </ContentLoader>
      </Animated.ScrollView>
    );
  }, [theme.dark]);

  const buttonPadding = useMemo((): ViewStyle => ({ paddingBottom: 68 + bottom }), [bottom]);

  const contentPadding = useMemo((): ViewStyle => ({ paddingBottom: 208 + bottom }), [bottom]);

  const onPariticipate = async () => {
    if (!leaderBoard || !leaderBoard.length) return;
    const contestId = leaderBoard[0].tradingCompetitionID;

    try {
      await participateContest(contestId).unwrap();
      promoCTAClickedMixpanel(data?.name, data?.id, 'Join contest');
      if (promoId === undefined) return;
      getAllData(promoId, true, language);

      const cIsStarted = dateHelper.isBetween(
        promoContest?.contestPeriodFrom || '',
        promoContest?.contestPeriodTo || '',
        dayjs()
      );

      showPopUp({
        title: cIsStarted ? t('screens.promo-details.join-success-started') : t('screens.promo-details.join-success'),
        closeTime: 5,
        icon: images.depositSuccess,
        iconSize: {
          width: 115,
          height: 90
        }
      });
    } catch (error) {
      showPopUp({
        title: t('errors.modal-error-title'),
        subTitle: t('errors.modal-error-subtitle'),
        closeTime: 5,
        icon: images.depositError,
        iconSize: {
          width: 115,
          height: 90
        }
      });
      console.error(error);
    }
  };

  const showCta = useMemo(() => {
    if (competitionCTA && competitionCTA.length) {
      if (
        ((competitionCTA[0].contestAccountCategory === 'live' &&
          isRegistered &&
          isRegistered.balance !== 0 &&
          userInfo.lastDepositDate) ||
          (competitionCTA[0].contestAccountCategory === 'demo' && isRegistered)) &&
        contestIsStarted
      )
        return false;
    }
    return true;
  }, [competitionCTA, isRegistered, contestIsStarted, userInfo.lastDepositDate]);

  const buttonIsLoading = useMemo(
    () =>
      participateLoading || promoContestLoading || contestLeadersLoading || profileLoading || registerForWebinarLoading,
    [participateLoading, promoContestLoading, contestLeadersLoading, registerForWebinarLoading, profileLoading]
  );

  const goToTransfer = () => {
    promoCTAClickedMixpanel(data?.name, data?.id, 'Transfer');
    navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
  };

  const goToTrade = () => {
    promoCTAClickedMixpanel(data?.name, data?.id, 'Trade');
    navigation.navigate(APP_ROUTE_NAMES.Markets as any);
  };

  const goToDeposit = () => {
    promoCTAClickedMixpanel(data?.name, data?.id, 'Deposit');
    navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
  };

  const goToSignUp = () => {
    promoCTAClickedMixpanel(data?.name, data?.id, 'Sign up');
    navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
      screen: AUTH_ROUTE_NAMES.BonusSignUp
    });
  };

  const goToVerify = () => {
    promoCTAClickedMixpanel(data?.name, data?.id, 'Verify profile');
    navigation.navigate(ROOT_ROUTE_NAMES.Common, {
      screen: COMMON_ROUTE_NAMES.Verification
    });
  };

  const onJoinWebinar = () => {
    try {
      promoCTAClickedMixpanel(data?.name, data?.id, 'Join webinar');
      requestAnimationFrame(async () => {
        const link = webinarUrl;
        if (!link) return;
        const canOpen = await Linking.canOpenURL(link);
        if (!canOpen) return;
        Linking.openURL(link);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const completeWebinarRegistration = useCallback(
    async (phone?: string | undefined) => {
      const hasPhone = !!phone?.length;

      if (hasPhone) {
        const keyboardIsOpen = Keyboard.isVisible();
        if (keyboardIsOpen) {
          Keyboard.dismiss();
          setTimeout(() => bottomSheetRef.current?.dismiss(), 350);
        } else bottomSheetRef.current?.dismiss();
      }

      try {
        if (!userInfo.email || !webinarCTA || !webinarCTA.length) return;

        const webinarId = getCurrentWebinar(
          webinarCTA?.[0]?.webinarRegistrationInterval,
          webinarCTA?.[0]?.zoomWebinarId
        );

        await registerForWebinar({
          email: userInfo.email,
          webinarId,
          ...(hasPhone && { phone })
        }).unwrap();

        promoCTAClickedMixpanel(data?.name, data?.id, 'Register webinar');

        await getProfile().unwrap();

        showPopUp({
          title: t('screens.promo-details.all-set'),
          subTitle: t('screens.promo-details.have-access-webinar'),
          closeTime: 5,
          icon: images.depositSuccess,
          iconSize: {
            width: 115,
            height: 90
          }
        });
      } catch (error) {
        showPopUp({
          title: t('errors.modal-error-title'),
          subTitle: t('errors.modal-error-subtitle'),
          closeTime: 5,
          icon: images.depositError,
          iconSize: {
            width: 115,
            height: 90
          }
        });
        console.error(error);
      }
    },
    [userInfo.email, webinarCTA, data?.name, data?.id, t]
  );

  const onRegisterForWebinar = async () => bottomSheetRef.current?.present();

  const actionMap: Record<CustomActions, () => void> = useMemo(
    () => ({
      'go-to-deposit': goToDeposit,
      'go-to-sign-up': goToSignUp,
      'go-to-trade': goToTrade,
      'go-to-verify': goToVerify,
      partipicate: onPariticipate,
      'join-webinar': onJoinWebinar,
      'register-for-webinar': completeWebinarRegistration,
      'go-to-transfer': goToTransfer,
      'register-for-webinar-after-phone': onRegisterForWebinar,
      empty: () => { }
    }),
    [
      leaderBoard,
      promoId,
      t,
      language,
      promoContest?.contestPeriodFrom,
      promoContest?.contestPeriodTo,
      navigation,
      webinarUrl,
      userInfo.email,
      webinarCTA,
      data?.name,
      data?.id,
      getCurrentWebinar
    ]
  );

  const showCopy = useMemo(() => {
    if (!webinarCTA || !webinarCTA.length || !webinarUrl || !isRegisteredForWebinar) return false;
    return true;
  }, [webinarCTA, webinarUrl, isRegisteredForWebinar]);

  if (isLoading) {
    return <BaseLoader active={true} />;
  }

  return (
    <SafeAreaView>
      <BaseBackButton
        isChevron={false}
        customBack={() => {
          if (navigation.canGoBack() && navigation.isFocused()) {
            navigation.goBack();
          } else if (promotionId) {
            goToIdeasHub();
          } else {
            goToIdeasHub();
          }
        }}
      />
      {loading ? (
        loader
      ) : (
        <>
          {showCta && (
            <View testID={testIDs.promotionDetails.actionContainer} style={[styles.btnContainer, buttonPadding, buttonFn.isInfoText && styles.infoContainer]}>
              {buttonFn.isInfoText ? (
                <BaseText testID={testIDs.promotionDetails.infoText} style={styles.info} variant={BaseTextVariant.small}>
                  {buttonFn.title}
                </BaseText>
              ) : (
                <Animated.View style={styles.btnGap}>
                  <BaseButton
                    testID={testIDs.promotionDetails.actionButton(buttonFn.customAction || 'empty')}
                    disabled={buttonIsLoading}
                    loading={buttonIsLoading}
                    onPress={actionMap[buttonFn.customAction || 'empty']}
                    label={buttonFn.title}
                    size={BaseButtonSize.large}
                    type={BaseButtonType.primary}
                  />
                  {showCopy && (
                    <BaseCopy
                      copy={webinarUrl}
                      text={t('screens.promo-details.copy-link')}
                      toastText={t('screens.promo-details.copied')}
                    />
                  )}
                </Animated.View>
              )}
            </View>
          )}
          <Animated.ScrollView testID={testIDs.promotionDetails.scrollView} contentContainerStyle={contentPadding}>
            {RenderHeroBanner}
            {RenderCountDown}
            {RenderUpcomingCountDown}
            {RenderUpcomingEventsTopics}
            {RenderLeaderBoard}
            {RenderInfoBlocks}
            {RenderInfoTable}
            {RenderTestimonials}
            {RenderFAQ}
            {RenderLegalDocs}
          </Animated.ScrollView>
        </>
      )}
      <PromoNumberSheet
        ref={bottomSheetRef}
        completeWebinarRegistration={completeWebinarRegistration}
        onAnimate={onAnimate}
        onDismiss={onDismiss}
        countryCode={userInfo.country}
      />
    </SafeAreaView>
  );
};

const useStyles = ({ palette: { graphite, base } }: UserTheme) =>
  StyleSheet.create({
    alignCenter: { alignItems: 'center' },
    seperatorContainer: {
      width: screenWidth,
      height: 44,
      backgroundColor: graphite[100],
      gap: 8,
      marginTop: 10
    },
    seperatorUp: {
      width: '100%',
      height: 20,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 20,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    },
    btnContainer: {
      paddingTop: 12,
      backgroundColor: '#F7F8FACC',
      paddingHorizontal: 20,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 99
    },
    info: {
      textAlign: 'center',
      color: graphite['600']
    },
    infoContainer: { backgroundColor: graphite['050'], paddingTop: 20, paddingHorizontal: 24, alignItems: 'center' },
    contentLoader: { zIndex: 99 },
    btnGap: {
      gap: 12
    }
  });

export default PromotionDetailsScreen;

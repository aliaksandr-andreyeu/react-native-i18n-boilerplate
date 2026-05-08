import React, { FC, useCallback, useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { IDEASHUB_ROUTE_NAMES, COMMON_ROUTE_NAMES, CommonRootParamsList, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ParamListBase, useFocusEffect, StackActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { useAppSelector } from '@/hooks';
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import RNRestart from 'react-native-restart';
import { MixpanelEventTypes, userStartedActionMixpanel } from '@/helpers';
import { ToastType, useToast } from '@/providers';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { config } from '@/constants';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseHelpButton,
  BaseImage,
  BaseText,
  BaseTextVariant
} from '@/components';
import Animated, {
  Easing,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';

export enum QuestionnaireStatus {
  APPROVED = 'approved'
}

enum SumSubReviewStatusType {
  COMPLETED = 'completed'
}

enum ReviewStatus {
  NONE = 'none',
  INIT = 'init',
  PENDING = 'pending',
  PRECHECKED = 'prechecked',
  QUEUED = 'queued',
  COMPLETED = 'completed',
  ONHOLD = 'onHold'
}

enum ReviewAnswer {
  NONE = 'none',
  GREEN = 'GREEN',
  RED = 'RED'
}

enum ReviewRejectType {
  NONE = 'none',
  FINAL = 'FINAL',
  RETRY = 'RETRY'
}

interface SumSubStatus {
  reviewStatus: ReviewStatus;
  reviewResult: {
    reviewAnswer: ReviewAnswer;
    rejectLabels: string[];
    reviewRejectType: ReviewRejectType;
    moderationComment: string;
    clientComment: string;
  };
}

const {
  headerBar: {
    buttons: { hitSlop, activeOpacity }
  }
} = config;

type VerificationScreenProps = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.Verification>;

interface VerificationScreenData extends VerificationScreenProps {
  sumSubStatus: SumSubStatus;
  verifyEmail: () => void;
  getSumSubToken: () => Promise<string | undefined>;
  getSumSubStatus: () => Promise<void>;
}

const VerificationScreen: FC<VerificationScreenData> = ({
  route,
  navigation,
  sumSubStatus,
  getSumSubToken,
  getSumSubStatus
}) => {
  const [loading, setLoading] = useState(false);
  const scale = useSharedValue(1);

  const { openToast } = useToast();

  const { goBack, canGoBack } = navigation || {};
  const canBack = canGoBack();

  const {
    t,
    i18n: { language }
  } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const forIdentify = route.params?.forIdentify || false;

  const user = useAppSelector((state) => state.portfolio.userInfo);

  useEffect(() => {
    if (user.isVerified) navigation.dispatch(StackActions.pop());
  }, [user.isVerified]);

  const checkIdentityStatus = () => {
    const { reviewStatus, reviewResult } = sumSubStatus || {};

    const { reviewAnswer, moderationComment, clientComment, rejectLabels = [] } = reviewResult || {};

    if (moderationComment) {
      openToast({
        desc: moderationComment,
        type: ToastType.info
      });
    } else if (clientComment) {
      openToast({
        desc: clientComment,
        type: ToastType.info
      });
    } else if (rejectLabels.includes('BAD_PROOF_OF_IDENTITY')) {
      openToast({
        desc: t('screens.verification.provide-valid-id-document'),
        type: ToastType.error
      });
    } else if (rejectLabels.includes('BAD_PROOF_OF_ADDRESS')) {
      openToast({
        desc: t('screens.verification.provide-valid-proof-address'),
        type: ToastType.error
      });
    }

    // const isSumSubDefaultStatus = [ReviewStatus.NONE, ReviewStatus.INIT].includes(reviewStatus);
    // const isSumSubWaitingStatus = [
    //   ReviewStatus.PENDING,
    //   ReviewStatus.PRECHECKED,
    //   ReviewStatus.QUEUED,
    //   ReviewStatus.ONHOLD
    // ].includes(reviewStatus);
    // const isSumSubErrorStatus = reviewStatus === ReviewStatus.COMPLETED && reviewAnswer === ReviewAnswer.RED;
    // const isSumSubSuccessStatus = reviewStatus === ReviewStatus.COMPLETED && reviewAnswer === ReviewAnswer.GREEN;

    // switch (true) {
    //   case isSumSubDefaultStatus:
    //     return setIdentityStatus(VerificationStepTypes.DEFAULT);
    //   case isSumSubWaitingStatus:
    //     return setIdentityStatus(VerificationStepTypes.WAITING);
    //   case isSumSubErrorStatus:
    //     return setIdentityStatus(VerificationStepTypes.ERROR);
    //   case isSumSubSuccessStatus:
    //     return setIdentityStatus(VerificationStepTypes.SUCCESS);
    // }
  };

  useFocusEffect(
    useCallback(() => {
      userStartedActionMixpanel(MixpanelEventTypes.OnboardingProgressViewed);
    }, [route, navigation])
  );

  useFocusEffect(
    useCallback(() => {
      checkIdentityStatus();
    }, [route, navigation, sumSubStatus])
  );

  const launchSumSubSDK = (token: string | undefined) => {
    if (!token) {
      return;
    }

    let sumSubSDK = SNSMobileSDK.init(token, () => {
      return getSumSubToken()
        .then((res) => {
          return res;
        })
        .catch((err) => {
          console.log('error', err);
        });
    })
      .withTheme({
        universal: {
          colors: {}
        }
      })
      .withHandlers({
        // Optional callbacks you can use to get notified of the corresponding events
        onStatusChanged: (event: any) => {
          console.log('SumSub SDK onStatusChanged: [' + event.prevStatus + '] => [' + event.newStatus + ']');
        },
        onEvent: (message) => console.log('SumSub SDK onEvent: ', message),
        onActionResult: (result) => {
          console.log('SumSub SDK onActionResult: [' + result + ']');
        },
        onLog: (event: any) => {
          console.log('SumSub SDK onLog: [' + event.message + ']');
        }
      })
      // .withDebug(true)
      ?.withLocale?.(language || 'en') // Optional, for cases when you need to override the system locale
      .build();

    sumSubSDK
      ?.launch()
      .then((result: any) => {
        console.log('SumSub SDK State: ' + JSON.stringify(result));

        getSumSubStatus();
      })
      .catch((err: any) => {
        console.log('SumSub SDK Error: ' + JSON.stringify(err));
        RNRestart.restart();
      });
  };

  const goToIdentityVerification = async () => {
    try {
      setLoading(true);
      const token = await getSumSubToken();
      userStartedActionMixpanel(MixpanelEventTypes.DocumentsVerificationStarted);
      launchSumSubSDK(token);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (forIdentify) goToIdentityVerification();
  }, [forIdentify]);

  useEffect(() => {
    scale.value = withDelay(
      1000,
      withSequence(
        withTiming(1.03, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      )
    );
  }, []);

  const goToIdeasHub = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

  const onGoBack = () => {
    if (!canBack) {
      goToIdeasHub();
      return;
    }
    goBack();
  };

  const Desc = useCallback(
    ({ desc, index }: { desc: string; index: number }) => {
      return (
        <Animated.View
          style={styles.desc}
          entering={FadeInRight.duration(200)
            .delay((index + 1) * 200)
            .easing(Easing.inOut(Easing.ease))}
        >
          <View style={styles.descIconContainer}>
            <SvgIcon name={SvgXmlIconNames.checkVerified} color={theme.palette.icon.base.contrast} size={IconSize.md} />
          </View>
          <BaseText style={styles.flex} variant={BaseTextVariant.titleXXS}>
            {desc}
          </BaseText>
        </Animated.View>
      );
    },
    [theme.dark]
  );

  const animStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          onPress={onGoBack}
          style={styles.headerButton}
        >
          <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
        </TouchableOpacity>
        <BaseText variant={BaseTextVariant.caption}>{t('screens.verification.title')}</BaseText>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
        <View style={styles.topContainer}>
          <View style={styles.helpBox}>
            <BaseText style={styles.helpDesc}>{t('screens.verification.why-verify-identity')}</BaseText>
            <BaseHelpButton text={t('screens.verification.question-mark-text')} />
          </View>
          <View style={styles.identifyContainer}>
            <View style={styles.verifyTop}>
              <BaseImage style={styles.verifyImage} source={images.verifyUser} />
              <BaseText style={styles.flex} variant={BaseTextVariant.caption}>
                {t('screens.verification.verify-and-trade')}
              </BaseText>
            </View>
            <View style={styles.descContainer}>
              <Desc index={0} desc={t('screens.verification.desc_1')} />
              <Desc index={1} desc={t('screens.verification.desc_2')} />
              <Desc index={2} desc={t('screens.verification.desc_3')} />
            </View>
          </View>
        </View>
        <Animated.View style={animStyle}>
          <BaseButton
            size={BaseButtonSize.large}
            type={BaseButtonType.primary}
            label={t('screens.verification.continue')}
            loading={loading}
            onPress={goToIdentityVerification}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerificationScreen;

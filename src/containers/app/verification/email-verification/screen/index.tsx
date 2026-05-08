import React, { FC, useLayoutEffect, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ScrollView, View, TouchableOpacity, BackHandler, InteractionManager } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES } from '@/navigation/app/stacks';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useFocusEffect, StackActions, useIsFocused } from '@react-navigation/native';
import { openInbox } from 'react-native-email-link';
import {
  BaseButton,
  BaseButtonLoading,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseText,
  BaseTextVariant,
  SheetBackdrop,
  UnRecievedEmail
} from '@/components';
import { useTranslation } from 'react-i18next';
import { config } from '@/constants';
import useStyles from './styles';
import { useAppDispatch, useAppSelector, useAppState, useAuthState } from '@/hooks';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { actions } from '@/store';
import {
  MixpanelEventTypes,
  mixpanelScreenOpenTracker,
  setStoredVerifyEmail,
  userStartedActionMixpanel
} from '@/helpers';
import { IUnRecievedRef } from '@/components/molecules/unrecieved-email';
import { ToastType, useToast } from '@/providers';
import { useSignOut } from '@/store/api';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import useCustomPostHog from '@/helpers/posthog';

const {
  headerBar: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

type EmailVerificationScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.EmailVerification>;

let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

const {
  verification: { startCountdown, decrementRemainingSeconds, resetCountdown, useVerifyEmail, setCountdown }
} = actions;

const EmailVerificationScreen: FC<EmailVerificationScreenProps> = ({ route, navigation }) => {
  const [error, setError] = useState<string>('');
  const [wentBackgroundAt, setBackgroundTime] = useState<number | null>(null);

  const { top } = useSafeAreaInsets();
  const { openToast, closeToast } = useToast();
  const [signOut, { isLoading: signingOut }] = useSignOut();
  const { resetPosthog } = useCustomPostHog();
  const { reset } = useAuthState();

  const sheetRef = useRef<IUnRecievedRef>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetIsOpen = useRef<boolean>(false);

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const theme = useTheme();
  const styles = useStyles(theme);

  const autoVerify = route?.params?.autoVerify ?? true;
  const autoVerifySent = useRef<boolean>(false);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { email } = userInfo || {};

  const { remainingSeconds } = useAppSelector((state) => state.verification);

  const isDisabled = Boolean(remainingSeconds > 0);

  const [verifyEmail, verifyEmailResponse] = useVerifyEmail();
  const { isSuccess, isLoading, isError } = verifyEmailResponse || {};

  const { change } = useAuthState();

  const appState = useAppState();

  const setInitialState = () => {
    setError('');
    change('user-emailVerify', 'true');
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
        change('user-emailVerify', '');
      };
    }, [route, navigation])
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetIsOpen.current) bottomSheetRef.current?.dismiss();
      return true;
    });
    userStartedActionMixpanel(MixpanelEventTypes.EmailVerificationStarted);
    mixpanelScreenOpenTracker(MixpanelEventTypes.EmailVerificationScreenOpen);
    return backHandler.remove;
  }, []);

  useEffect(() => {
    if (appState === 'active' && wentBackgroundAt) {
      const diff = Math.floor((Date.now() - wentBackgroundAt) / 1000.0);

      dispatch(setCountdown(Math.max(0, remainingSeconds - diff)));
    }
    if (appState === 'background') {
      setBackgroundTime(Date.now());
    }
  }, [appState]);

  const onGoBack = useCallback(async () => {
    await signOut().unwrap();
    bottomSheetRef.current?.dismiss();
    resetPosthog();
    reset();
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        navigation.dispatch(
          StackActions.replace(ROOT_ROUTE_NAMES.Auth, {
            screen: AUTH_ROUTE_NAMES.SignIn
          })
        );
      });
    }, 0);
  }, [navigation]);

  const verifyEmailHandler = async () => {
    if (isDisabled) {
      return;
    }
    try {
      await verifyEmail({})
      autoVerifySent.current = true;
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (autoVerify && !autoVerifySent.current) {
      verifyEmailHandler();
      if (!isDisabled) setStoredVerifyEmail();
    }
  }, [autoVerify, isDisabled]);

  const openInboxHandler = () => {
    openInbox();
  };

  const loadTimer = () => {
    if (remainingSeconds === 0) {
      return;
    }
    intervalId && clearInterval(intervalId);

    intervalId = setInterval(() => {
      dispatch(decrementRemainingSeconds());
    }, 1000);
  };

  const startTimer = () => {
    dispatch(startCountdown());

    intervalId && clearInterval(intervalId);

    intervalId = setInterval(() => {
      dispatch(decrementRemainingSeconds());
    }, 1000);
  };

  const resetTimer = () => {
    if (remainingSeconds > 0) {
      return;
    }

    intervalId && clearInterval(intervalId);

    dispatch(resetCountdown());
  };

  const pageIsFocused = useIsFocused();

  useEffect(() => {
    if (!pageIsFocused) dispatch(resetCountdown());
  }, [pageIsFocused]);

  useFocusEffect(
    useCallback(() => {
      loadTimer();
      resetTimer();
      return () => {
        intervalId && clearInterval(intervalId);
      };
    }, [route, navigation, remainingSeconds])
  );

  const errorResponseHandler = () => {
    if (!isError) {
      return;
    }
    const { error } = verifyEmailResponse || {};
    if (!error) {
      return null;
    }
    const { message } = (error || {}) as { message: string };
    setError(message || t('errors.common'));
  };

  const successResponseHandler = () => {
    if (!isSuccess) {
      return;
    }
    startTimer();
  };

  const errorToastHandler = () => {
    if (!error) {
      closeToast();
      return;
    }

    openToast({
      desc: error,
      type: ToastType.error,
      onClose: () => {
        setError('');
      }
    });
  };

  useLayoutEffect(() => {
    errorResponseHandler();
  }, [isError]);

  useLayoutEffect(() => {
    successResponseHandler();
  }, [isSuccess]);

  useLayoutEffect(() => {
    errorToastHandler();
  }, [error]);

  const buttonLabel = useMemo(() => {
    if (remainingSeconds) {
      return t('screens.email-verification.resend-email-in-countdown', { countdown: remainingSeconds });
    }
    return t('screens.email-verification.resend-email');
  }, [remainingSeconds, t]);

  const onDidNotReceiveEmail = useCallback(() => sheetRef.current?.present(), []);

  const onAnimate = useCallback(() => (sheetIsOpen.current = true), []);
  const onDismiss = useCallback(() => (sheetIsOpen.current = false), []);

  const openSheet = useCallback(() => bottomSheetRef.current?.present(), []);
  const closeSheet = useCallback(() => bottomSheetRef.current?.dismiss(), []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          onPress={openSheet}
          disabled={signingOut}
          style={styles.headerButton}
        >
          <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} />
        </TouchableOpacity>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
        <BaseText variant={BaseTextVariant.authSubTitle}>{t('screens.email-verification.title')}</BaseText>
        <BaseText variant={BaseTextVariant.authSmall}>{t('screens.email-verification.subTitle', { email })}</BaseText>
      </ScrollView>
      <View style={styles.buttonBox}>
        <BaseButton
          type={BaseButtonType.link}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.email-verification.did-not-receive')}
          onPress={onDidNotReceiveEmail}
        />
        <BaseButton
          type={BaseButtonType.primary}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.email-verification.check-my-inbox')}
          onPress={openInboxHandler}
        />
        <BaseButton
          loading={isLoading || signingOut}
          loadingType={BaseButtonLoading.ellipsis}
          disabled={isDisabled || signingOut}
          type={BaseButtonType.accent}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={buttonLabel}
          onPress={verifyEmailHandler}
        />
      </View>
      <UnRecievedEmail navigation={navigation} ref={sheetRef} />
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        topInset={top}
        enableContentPanningGesture={false}
        backdropComponent={SheetBackdrop}
        onAnimate={onAnimate}
        onDismiss={onDismiss}
        style={styles.sheetBorder}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.sheetView}>
          <View style={[styles.gap16, styles.bottomSheetPaddingTop]}>
            <BaseImage source={images.signOut} style={styles.signOutImage} resizeMode='cover' />
            <View style={styles.gap8}>
              <BaseText style={[styles.textCenterAlign, styles.margin]} variant={BaseTextVariant.captionSemiBold}>
                {t('screens.phone-verification.are-you-sure')}
              </BaseText>
              <BaseText style={[styles.textCenterAlign, styles.margin]}>
                {t('screens.phone-verification.logout-desc')}
              </BaseText>
            </View>
          </View>
          <View style={styles.sheetButtons}>
            <BaseButton
              type={BaseButtonType.accent}
              size={BaseButtonSize.large}
              loading={signingOut}
              loadingType={BaseButtonLoading.ellipsis}
              label={t('screens.phone-verification.sign-out')}
              onPress={onGoBack}
            />
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.phone-verification.stay')}
              onPress={closeSheet}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default EmailVerificationScreen;

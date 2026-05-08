import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, COMMON_ROUTE_NAMES } from '@/navigation/app/stacks';
import {
  AppState,
  BackHandler,
  EmitterSubscription,
  InteractionManager,
  NativeEventSubscription,
  SafeAreaView,
  StyleSheet,
  TouchableHighlight,
  View
} from 'react-native';
import { UserTheme } from '@/constants';
import {
  BaseBackButton,
  BaseButton,
  BaseButtonLoading,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseInput,
  BaseText,
  BaseTextVariant,
  KeyboardDismissButton,
  SheetBackdrop,
  UnRecievedEmail
} from '@/components';
import { StackActions, useFocusEffect, useIsFocused, useTheme } from '@react-navigation/native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import Clipboard from '@react-native-clipboard/clipboard';
import { ActionType, usePinSend, useProfileQuery, useSignOut, useVerifyPhoneMutation } from '@/store/api';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAuthState } from '@/hooks';
import { actions } from '@/store';
import { MixpanelEventTypes, mixpanelScreenOpenTracker, rgba } from '@/helpers';
import { ContactMessageType, DidNotReceiveActions, IUnRecievedRef } from '@/components/molecules/unrecieved-email';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {
  verification: { decrementRemainingSeconds, startCountdown, resetCountdown }
} = actions;

type PhoneVerificationProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.PhoneVerification>;

let intervalId: ReturnType<typeof setInterval> | undefined = undefined;
const PhoneVerificationScreen: FC<PhoneVerificationProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const { top } = useSafeAreaInsets();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetIsOpen = useRef<boolean>(false);

  const [error, setError] = useState<string>('');

  const [code, setCode] = useState<string>('');
  const [hasCopied, setHasCopied] = useState<string>('');

  const correctSheetRef = useRef<IUnRecievedRef>(null);
  const contactSheetRef = useRef<IUnRecievedRef>(null);

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);

  const { reset, change } = useAuthState();

  const firstTime = useRef<boolean>(true);

  const [verifyPhone, verifyResponse] = useVerifyPhoneMutation();
  const [sendPin, sendPinResponse] = usePinSend();
  const [signOut, { isLoading: signingOut }] = useSignOut();
  const [getProfile] = useProfileQuery();
  const { isSuccess, isLoading: pinLoading, isError } = sendPinResponse || {};

  const { remainingSeconds } = useAppSelector((state) => state.verification);

  const dispatch = useAppDispatch();

  const handleBack = useCallback(async () => {
    await signOut().unwrap();
    bottomSheetRef.current?.dismiss();
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

  const goToWelcome = useCallback(async () => {
    await getProfile();
    bottomSheetRef.current?.dismiss();
    reset();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: ROOT_ROUTE_NAMES.Common,
          params: {
            name: COMMON_ROUTE_NAMES.Welcome
          }
        }
      ]
    });
  }, [navigation]);

  useEffect(() => {
    mixpanelScreenOpenTracker(MixpanelEventTypes.PhoneVerificationScreenOpen);
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetIsOpen.current) bottomSheetRef.current?.dismiss();
      return true;
    });
    return backHandler.remove;
  }, []);

  const checkCode = async () => {
    const has = await Clipboard.hasString();
    if (has) {
      const text = await Clipboard.getString();
      if (text) setHasCopied(text);
      else setHasCopied('');
    } else setHasCopied('');
  };

  useFocusEffect(
    useCallback(() => {
      let listener: EmitterSubscription;
      let appState: NativeEventSubscription;
      checkCode();
      appState = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          checkCode();
          listener = Clipboard.addListener(checkCode);
        }
      });
      change('user-phoneVerify', '');

      return () => {
        if (appState) appState.remove();
        if (listener) listener.remove();
      };
    }, [])
  );

  const resendPin = useCallback(async () => await sendPin({ action: ActionType.VERIFY_PHONE, method: 'phone' }), []);

  useEffect(() => {
    (async () => {
      if (remainingSeconds === 0 && firstTime.current) {
        await resendPin();
        firstTime.current = false;
      }
    })();
  }, [resendPin, remainingSeconds]);

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
    dispatch(resetCountdown());
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

  const errorResponseHandler = () => {
    if (!isError) {
      return;
    }
    const { error } = sendPinResponse || {};
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

  useLayoutEffect(() => {
    errorResponseHandler();
  }, [isError, sendPinResponse?.error, t]);

  useLayoutEffect(() => {
    successResponseHandler();
  }, [isSuccess]);

  const pageIsFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      loadTimer();
      resetTimer();
      return () => {
        if (!pageIsFocused) dispatch(resetCountdown());
        intervalId && clearInterval(intervalId);
      };
    }, [route, navigation, remainingSeconds, pageIsFocused])
  );

  const onTextChange = useCallback(
    (text: string) => {
      if (error) setError('');
      setCode(text);
    },
    [error]
  );

  const onPaste = () => {
    setCode(hasCopied);
    setHasCopied('');
  };

  const isResendDisabled = useMemo(
    () => Boolean(remainingSeconds > 0) || pinLoading || verifyResponse.isLoading,
    [remainingSeconds, pinLoading, verifyResponse.isLoading]
  );

  const buttonLabel = useMemo(() => {
    if (remainingSeconds) {
      return t('screens.phone-verification.resend-pin-in', { time: remainingSeconds });
    }
    return t('screens.phone-verification.resend-pin');
  }, [remainingSeconds, t]);

  const onVerifyPhone = useCallback(async () => {
    try {
      const res = await verifyPhone({ pin: code }).unwrap();
      if (res.success) goToWelcome();
      else setError(t('screens.phone-verification.incorrect-pin'));
    } catch (error) {
      console.error(error);
      setError(t('screens.phone-verification.incorrect-pin'));
    }
  }, [code]);

  const disabledContinue = useMemo(
    () => code.length === 0 || verifyResponse.isLoading,
    [code, verifyResponse.isLoading]
  );

  const onAction = useCallback(
    (_: ContactMessageType, action?: DidNotReceiveActions) => {
      switch (action) {
        case 'correct':
          correctSheetRef.current?.dismiss();
          setTimeout(() => InteractionManager.runAfterInteractions(contactSheetRef.current?.present), 200);
          break;

        case 'incorrect':
          correctSheetRef.current?.dismiss();
          setTimeout(
            () =>
              InteractionManager.runAfterInteractions(() => {
                navigation.navigate(ROOT_ROUTE_NAMES.Common, {
                  screen: COMMON_ROUTE_NAMES.ChangePhone
                });
              }),
            200
          );
          break;
      }
    },
    [navigation]
  );

  const onAnimate = useCallback(() => (sheetIsOpen.current = true), []);
  const onDismiss = useCallback(() => (sheetIsOpen.current = false), []);

  const openSheet = useCallback(() => bottomSheetRef.current?.present(), []);
  const closeSheet = useCallback(() => bottomSheetRef.current?.dismiss(), []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.flex, styles.scrollContent]}>
        <View>
          <BaseBackButton isChevron={false} customBack={openSheet} />
          <View style={styles.otpContainer}>
            <View style={styles.textContainer}>
              <BaseText style={styles.textAlign} variant={BaseTextVariant.authSubTitle}>
                {t('screens.phone-verification.verify-phone')}
              </BaseText>
              <BaseText style={styles.subTitle} variant={BaseTextVariant.small}>
                {t('screens.phone-verification.we-sent-to-phone', { phone: userInfo.phone || '' })}
              </BaseText>
            </View>
            <View style={styles.otpGuideContainer}>
              <View>
                <BaseInput
                  autoComplete='sms-otp'
                  autoCapitalize='none'
                  autoCorrect={false}
                  title={t('screens.phone-verification.pin-sent')}
                  required
                  value={code}
                  error={!!error}
                  onChange={onTextChange}
                />
                {!!error?.length && (
                  <BaseText variant={BaseTextVariant.extraSmall} style={styles.errorText}>
                    {error}
                  </BaseText>
                )}
                {!!hasCopied && (
                  <Animated.View entering={ZoomIn}>
                    <TouchableHighlight underlayColor={'#D5C2FF'} onPress={onPaste} style={styles.pasteContainer}>
                      <View style={styles.pasteContainerInside}>
                        <SvgIcon
                          name={SvgXmlIconNames.paste}
                          color={theme.palette.graphite['900']}
                          size={IconSize.sm}
                        />
                        <BaseText>{t('screens.common.paste')}</BaseText>
                      </View>
                    </TouchableHighlight>
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <BaseButton
            type={BaseButtonType.link}
            size={BaseButtonSize.large}
            label={t('screens.phone-verification.did-not-receive')}
            onPress={correctSheetRef.current?.present}
          />
          <BaseButton
            type={BaseButtonType.primary}
            size={BaseButtonSize.large}
            loading={verifyResponse.isLoading}
            loadingType={BaseButtonLoading.ellipsis}
            disabled={disabledContinue}
            label={t('screens.phone-verification.continue')}
            onPress={onVerifyPhone}
          />
          <BaseButton
            type={BaseButtonType.accent}
            size={BaseButtonSize.large}
            disabled={isResendDisabled || signingOut}
            loadingType={BaseButtonLoading.ellipsis}
            label={buttonLabel}
            loading={pinLoading || signingOut}
            onPress={resendPin}
          />
        </View>
      </View>
      <KeyboardDismissButton disabled={disabledContinue} onPress={onVerifyPhone} />
      <UnRecievedEmail onAction={onAction} type='phone-correct' ref={correctSheetRef} navigation={navigation} />
      <UnRecievedEmail onAction={onAction} type='phone' ref={contactSheetRef} navigation={navigation} />
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
              onPress={handleBack}
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

export default PhoneVerificationScreen;

const useStyles = ({ palette: { text, background, graphite, icon } }: UserTheme) =>
  StyleSheet.create({
    safe: {
      flex: 1
    },
    flex: {
      flex: 1
    },
    scrollContent: {
      paddingBottom: 88,
      justifyContent: 'space-between'
    },
    buttonContainer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 34,
      backgroundColor: rgba(background.base.secondary, 0.8),
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      gap: 12
    },
    errorText: {
      color: text.status.negative,
      marginHorizontal: 20,
      marginTop: 8
    },
    otpContainer: {
      paddingTop: 20,
      paddingHorizontal: 20,
      gap: 32
    },
    otpGuideContainer: {
      gap: 16
    },
    pasteContainer: {
      shadowOffset: {
        width: 0,
        height: 3
      },
      alignSelf: 'center',
      borderRadius: 25,
      overflow: 'hidden',
      marginTop: 80
    },
    pasteContainerInside: {
      backgroundColor: background.interaction.basic.secondary.default,
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 12
    },
    textAlign: {
      textAlign: 'left'
    },
    subTitle: {
      color: text.title.secondary
    },
    textContainer: {
      gap: 8
    },
    gap16: { gap: 16 },
    gap8: { gap: 8 },
    signOutImage: { width: '100%', height: 243 },
    handleStyle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    handleIndicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetView: {
      backgroundColor: graphite['050'],
      gap: 48
    },
    sheetBorder: {
      borderRadius: 24,
      overflow: 'hidden'
    },
    margin: {
      marginHorizontal: 20
    },
    bottomSheetPaddingTop: {
      paddingTop: 64
    },
    sheetButtons: {
      marginTop: 12,
      marginHorizontal: 20,
      marginBottom: 34,
      gap: 12
    },
    textCenterAlign: {
      textAlign: 'center'
    }
  });

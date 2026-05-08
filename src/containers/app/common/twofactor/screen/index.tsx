import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableOpacityProps,
  Platform,
  Linking,
  BackHandler,
  EmitterSubscription,
  AppState,
  NativeEventSubscription,
  Keyboard,
  TouchableHighlight,
  ViewStyle
} from 'react-native';
import {
  BaseActivityLoader,
  BaseBackButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseInput,
  BaseText,
  BaseTextVariant,
  KeyboardDismissButton,
  OtpInput,
  SheetBackdrop
} from '@/components';
import { ParamListBase } from '@react-navigation/native';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import Clipboard from '@react-native-clipboard/clipboard';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector, useCommonStyles } from '@/hooks';
import { actions } from '@/store';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import {
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useGenerateTwoFactorBackupCodesMutation,
  useGetTwoFactorManualCodeMutation
} from '@/store/api/profile';
import { OtpInputRefMethods } from '@/components/molecules/otp-input';
import { useTranslation } from 'react-i18next';
import { BaseError } from '@/store/slices';
import { ActionType, usePinSend } from '@/store/api';

type ITwoFactorScreen = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.TwoFactor>;

const {
  screenWidth,
  buttons: { activeOpacity },
  appLinks: { googleAuthAndroid, googleAuthIOS },
  fonts: { unbounded }
} = config;

const {
  application: { openModal },
  portfolio: { setUserInfo },
  profile: { setLastBackUpCodes }
} = actions;

const code_length = 6;
const TwoFactorScreen: React.FC<ITwoFactorScreen> = ({ navigation, route }) => {
  const { bottom } = useSafeAreaInsets();

  const [step, setStep] = useState<number>(0);
  const [code, setCode] = useState<string>('');
  const [hasCopied, setHasCopied] = useState<string>('');
  const [showCodes, setShowCodes] = useState<boolean>(false);
  const [disablePin, setDisablePin] = useState<string>('');
  const [disableTwoFAError, setDisableTwoFAError] = useState<boolean>(false);

  const otpRef = useRef<OtpInputRefMethods>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const showedSuccessEnabledPopup = useRef<boolean>(false);
  const openedForGenerate = useRef<boolean>(false);
  const lastStep = useRef<number>(0);
  const disableSuccess = useRef<boolean>(false);
  const isDisableSheetOpenedOnce = useRef<boolean>(false);

  const client = useAppSelector((store) => store.portfolio.userInfo);

  const lastBackUpCodes = useAppSelector((store) => store.profile.lastBackupCodes);

  const [sendPin, { isLoading: sendPinLoading }] = usePinSend();

  const [generateNewBackupCodes, { data: generateNewBackupCodesData, isLoading: generateNewBackupCodesLoading }] =
    useGenerateTwoFactorBackupCodesMutation();

  const [disableTwoFactor, { isLoading: disableTwoFactorLoading }] = useDisableTwoFactorMutation();

  const [
    enableTwoFactor,
    { data: enableTwoFactorData, isLoading: enableTwoFactorLoading, error: enableTwoFactorError }
  ] = useEnableTwoFactorMutation();

  const [
    getManualCode,
    { data: manualCodeData, isLoading: manualCodeLoading, isUninitialized: manualCodeIsUninitialized }
  ] = useGetTwoFactorManualCodeMutation();

  const isLoading = useMemo(
    () =>
      manualCodeLoading ||
      enableTwoFactorLoading ||
      sendPinLoading ||
      generateNewBackupCodesLoading ||
      disableTwoFactorLoading,
    [manualCodeLoading, enableTwoFactorLoading, sendPinLoading, generateNewBackupCodesLoading, disableTwoFactorLoading]
  );

  const isGenerate = route.params?.generate || false;
  const isDisable = route.params?.isDisable || false;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const openSheet = () => bottomSheetRef.current?.present();
  const closeSheet = () => bottomSheetRef.current?.dismiss();

  const goToProfile = () => navigation.canGoBack() && navigation.isFocused() && navigation.goBack();

  const handleBack = () => {
    if ([0, 2].includes(lastStep.current)) goToProfile();
    else setStep((p) => p - 1);
    return true;
  };

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

  useEffect(() => {
    if (generateNewBackupCodesData && generateNewBackupCodesData.codes && generateNewBackupCodesData.codes.length) {
      dispatch(setLastBackUpCodes(generateNewBackupCodesData.codes));
    }
  }, [generateNewBackupCodesData]);

  useEffect(() => {
    if (isDisable && client.twoFactorAuthEnabled && step === 2 && !disableSuccess.current && !isLoading) {
      !isDisableSheetOpenedOnce.current &&
        setTimeout(() => {
          bottomSheetRef.current?.present();
        }, 350);
      isDisableSheetOpenedOnce.current = true;
    }
  }, [isDisable, client.twoFactorAuthEnabled, step, isLoading]);

  useEffect(() => {
    const error = enableTwoFactorError as never as { data: { message: string } };

    lastStep.current = step;
    if (isDisable && client.twoFactorAuthEnabled && step !== 3 && !disableSuccess.current) {
      !lastBackUpCodes.length && generateNewBackupCodes();
      openedForGenerate.current = true;
      setStep(2);
    } else if (isGenerate && step !== 3 && client.twoFactorAuthEnabled) {
      !openedForGenerate.current && generateNewBackupCodes();
      setStep(2);
      openedForGenerate.current = true;
    } else if (step === 0 && manualCodeIsUninitialized) getManualCode();
    else if (step === 1 && error?.data?.message && error?.data?.message.includes('Please call')) {
      getManualCode();
      setStep(1);
    } else if (step === 1 && enableTwoFactorData?.codes?.length) {
      dispatch(
        setUserInfo({
          ...client,
          twoFactorAuthEnabled: true
        })
      );
      setStep(2);
    } else if (step === 2 && !showedSuccessEnabledPopup.current) {
      showedSuccessEnabledPopup.current = true;
      showPopUp({
        title: t('screens.common.two-factor-success-enabled'),
        subTitle: t('screens.common.two-factor-success-enabled-desc'),
        closeTime: 5,
        icon: images.depositSuccess,
        iconSize: {
          width: 115,
          height: 90
        }
      });
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);

    return backHandler.remove;
  }, [
    step,
    isGenerate,
    manualCodeIsUninitialized,
    enableTwoFactorData,
    client,
    enableTwoFactorError,
    isDisable,
    t,
    lastBackUpCodes
  ]);

  const checkCode = async () => {
    const has = await Clipboard.hasString();
    if (has) {
      const text = await Clipboard.getString();
      if (text && text.length === code_length && !isNaN(text as never as number)) setHasCopied(text);
      else setHasCopied('');
    } else setHasCopied('');
  };

  useEffect(() => {
    let listener: EmitterSubscription;
    let appState: NativeEventSubscription;
    if (step === 1) {
      checkCode();
      appState = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          checkCode();
          listener = Clipboard.addListener(checkCode);
        }
      });
    } else setHasCopied('');

    return () => {
      if (appState) appState.remove();
      if (listener) listener.remove();
    };
  }, [step]);

  const openLink = useCallback(async () => {
    const link =
      Platform.select({
        ios: googleAuthIOS,
        android: googleAuthAndroid
      }) || '';
    try {
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) Linking.openURL(link);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const Seperator = useCallback(() => {
    return (
      <View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </View>
    );
  }, [theme.dark]);

  const Guide = useCallback(
    ({ number, desc }: { number: string | number; desc: string }) => {
      return (
        <View style={styles.ruleContainer}>
          <View style={styles.numberContainer}>
            <BaseText style={styles.blackText} variant={BaseTextVariant.widgetTitle}>
              {number}
            </BaseText>
          </View>
          <BaseText style={styles.textAlign}>{desc}</BaseText>
        </View>
      );
    },
    [theme.dark]
  );

  const InstallButton = useCallback(
    ({ onPress }: { onPress: TouchableOpacityProps['onPress'] }) => {
      return (
        <TouchableHighlight underlayColor={theme.palette.yellow[300]} style={styles.authButton} onPress={onPress}>
          <View style={styles.authButtonInside} >
            <Image style={styles.btnImg} source={images.googleAuth} resizeMode='contain' />
            <BaseText>{t('screens.common.install-google-auth')}</BaseText>
          </View>
        </TouchableHighlight>
      );
    },
    [theme.dark]
  );

  const BackUpCode = useCallback(
    ({ code, show }: { code: number; show?: boolean }) => {
      const onPress = () => Clipboard.setString(`${code}`);

      return (
        <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity} style={styles.backupContainer}>
          <Animated.View key={`${code}-${show}`} entering={FadeIn} exiting={FadeOut} style={styles.flex}>
            <BaseText numberOfLines={1} style={[styles.gray700Text]} variant={BaseTextVariant.small}>
              {show ? code : '••••••••'}
            </BaseText>
          </Animated.View>
          <TouchableOpacity hitSlop={8} activeOpacity={activeOpacity} onPress={onPress}>
            <SvgIcon name={SvgXmlIconNames.copy} size={IconSize.xs} color={theme.palette.purple[800]} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [theme.dark]
  );

  const CopyContainer = useCallback(
    ({ code }: { code: string }) => {
      const onPress = () => Clipboard.setString(code);

      return (
        <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress} style={styles.copyContainer}>
          <BaseText style={[styles.textAlign, styles.flex]} variant={BaseTextVariant.small}>
            {code}
          </BaseText>
          <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress} hitSlop={8}>
            <SvgIcon name={SvgXmlIconNames.copy} size={IconSize.xs} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [theme.dark]
  );

  const safePaddingBottom = useMemo((): ViewStyle => ({ paddingBottom: 122 + bottom }), [bottom]);

  const FirstStep = useCallback(
    ({ manualCode }: { manualCode: string }) => {
      const onNext = () => setStep((p) => p + 1);

      return (
        <View style={styles.flex}>
          <BaseBackButton isChevron={false} customBack={handleBack} />
          <ScrollView contentContainerStyle={safePaddingBottom}>
            <View style={styles.headContainer}>
              <View style={styles.textContainer}>
                <BaseText style={styles.textAlign} variant={BaseTextVariant.authTitle}>
                  {t('screens.common.enable-two-factor')}
                </BaseText>
                <BaseText style={styles.textAlign} variant={BaseTextVariant.small}>
                  {t('screens.common.sign-in-with-your-password')}
                </BaseText>
              </View>
              <Image style={styles.img} source={images.twoFactor} />
            </View>
            <Seperator />
            <View style={styles.guideContainer}>
              <BaseText style={styles.textAlign} variant={BaseTextVariant.captionSemiBold}>
                {t('screens.common.how-to-enable-two-factor')}
              </BaseText>
              <View>
                <Guide number={1} desc={t('screens.common.install-guide-one')} />
                <View style={styles.authButtonContainer}>
                  <InstallButton onPress={openLink} />
                </View>
                <View style={styles.secondGuide}>
                  <Guide number={2} desc={t('screens.common.install-guide-two')} />
                  <CopyContainer code={manualCode} />
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('components.molecules.verification-banner.next-step')}
              onPress={onNext}
            />
          </View>
        </View>
      );
    },
    [theme.dark, step, t, safePaddingBottom]
  );

  const onOtpNext = useCallback(() => {
    Keyboard.dismiss();
    enableTwoFactor({ code });
    otpRef.current?.clear();
    setCode('');
  }, [code]);

  const SecondStep = useCallback(
    ({ copied, otpCode, error }: { copied: string; otpCode: string; error: string }) => {
      const onNext = () => {
        enableTwoFactor({ code: otpCode });
        setCode('');
      };

      const onTextChange = (text: string) => setCode(text);

      const onPaste = () => {
        otpRef.current?.setValue(copied);
        setCode(copied);
        setHasCopied('');
      };

      return (
        <View style={[styles.flex, styles.scrollContent, { justifyContent: 'space-between' }]}>
          <View>
            <BaseBackButton isChevron={false} customBack={handleBack} />
            <View style={styles.otpContainer}>
              <BaseText style={styles.textAlign} variant={BaseTextVariant.captionSemiBold}>
                {t('screens.common.how-to-enable-two-factor')}
              </BaseText>
              <View style={styles.otpGuideContainer}>
                <Guide number={3} desc={t('screens.common.enter-code-below')} />
                <View>
                  <OtpInput ref={otpRef} hasError={!!error} onChange={onTextChange} />
                  {error && (
                    <BaseText variant={BaseTextVariant.extraSmall} style={styles.errorText}>
                      {error.includes('Invalid code') ? t('screens.common.incorrect-code') : error}
                    </BaseText>
                  )}
                  {!!copied && (
                    <Animated.View entering={ZoomIn}>
                      <TouchableHighlight underlayColor={'#D5C2FF'} onPress={onPaste} style={styles.pasteContainer}>
                        <View style={styles.pasteContainerInside} >
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
          <View style={[styles.buttonContainer]}>
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              disabled={otpCode.length !== code_length || isNaN(otpCode as never as number)}
              label={t('screens.common.enable-two-factor-btn')}
              onPress={onNext}
            />
          </View>
        </View>
      );
    },
    [theme.dark, step, t]
  );

  const ThirdStep = useCallback(
    ({ show, codes = [] }: { show: boolean; codes: number[] }) => {
      const onShowCodes = () => setShowCodes((prev) => !prev);

      const disable = async () => {
        sendPin({ method: 'email', action: ActionType.DISABLE_2FA });
        closeSheet();
        setStep(3);
      };

      return (
        <>
          <View style={[styles.flex, styles.scrollContent, { justifyContent: 'space-between' }]}>
            <ScrollView contentContainerStyle={styles.codeContent}>
              <BaseBackButton isChevron={false} customBack={handleBack} />
              <View style={styles.codeTextContainer}>
                <BaseText style={styles.textAlign} variant={BaseTextVariant.authSubTitle}>
                  {t('screens.common.two-factor-enabled')}
                </BaseText>
                <BaseText style={[styles.gray1000Text, styles.textAlign]} variant={BaseTextVariant.small}>
                  {t('screens.common.two-factor-enabled-info')}
                </BaseText>
              </View>
              <View style={styles.backupcodesContainer}>
                {codes.map((item, index) => {
                  return <BackUpCode key={`${item}-${index}`} show={show} code={item} />;
                })}
              </View>
            </ScrollView>
            <View style={styles.backupButtonsContainer}>
              <BaseButton
                type={BaseButtonType.primary}
                size={BaseButtonSize.large}
                label={show ? t('screens.common.hide-codes') : t('screens.common.show-codes')}
                onPress={onShowCodes}
              />
              <BaseButton
                type={BaseButtonType.accent}
                size={BaseButtonSize.large}
                label={t('screens.common.disable-two-factor')}
                onPress={openSheet}
              />
            </View>
          </View>
          <BottomSheetModal
            ref={bottomSheetRef}
            enableDynamicSizing
            backdropComponent={SheetBackdrop}
            handleStyle={styles.handleStyle}
            handleIndicatorStyle={styles.handleIndicator}
          >
            <BottomSheetView style={styles.sheetView}>
              <View style={styles.gap16}>
                <Image source={images.disconnect} style={styles.disconnect} />
                <View style={styles.gap8}>
                  <BaseText style={[styles.textCenterAlign, styles.margin]} variant={BaseTextVariant.captionSemiBold}>
                    {t('screens.common.want-disable-two-factor')}
                  </BaseText>
                  <BaseText style={[styles.textCenterAlign, styles.margin]}>
                    {t('screens.common.re-enable-two-factor')}
                  </BaseText>
                </View>
              </View>
              <View style={styles.sheetButtons}>
                <BaseButton
                  type={BaseButtonType.accent}
                  size={BaseButtonSize.large}
                  label={t('screens.common.disable-two-factor')}
                  onPress={disable}
                />
                <BaseButton
                  type={BaseButtonType.primary}
                  size={BaseButtonSize.large}
                  label={t('screens.common.cancel')}
                  onPress={closeSheet}
                />
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </>
      );
    },
    [theme.dark, step, t]
  );

  const disableTwoFactorFn = async (pin: string) => {
    try {
      const disabledTwoFA = await disableTwoFactor({ method: 'email', pin }).unwrap();
      if (disabledTwoFA) {
        disableSuccess.current = true;
        setDisableTwoFAError(false);
        dispatch(
          setUserInfo({
            ...client,
            twoFactorAuthEnabled: false
          })
        );
        setDisablePin('');
        getManualCode();
        goToProfile();
        setTimeout(() => {
          showPopUp({
            title: t('screens.common.disable-two-factor-success'),
            subTitle: t('screens.common.disable-tow-factor-success-sub'),
            closeTime: 5,
            icon: images.depositSuccess,
            iconSize: {
              width: 115,
              height: 90
            }
          });
        }, 350);
      } else setDisableTwoFAError(true);
    } catch (error) {
      setDisableTwoFAError(true);
      console.error(error);
    }
  };

  const FourthStep = useCallback(
    ({ pin = '', pinError }: { pin: string; pinError: boolean }) => {
      const onDisableTwoFactor = () => disableTwoFactorFn(pin);
      const onChangePin = (val: string) => {
        setDisableTwoFAError(false);
        setDisablePin(val);
      };

      return (
        <View style={styles.flex}>
          <BaseBackButton isChevron={false} customBack={handleBack} />
          <View style={[styles.margin, styles.disableContainer]}>
            <View>
              <View style={[styles.gap8, styles.paddingVertical12]}>
                <BaseText variant={BaseTextVariant.authSubTitle}>
                  {t('screens.common.disable-two-factor-title')}
                </BaseText>
                <BaseText style={styles.textSecondary} variant={BaseTextVariant.small}>
                  {t('screens.common.disable-two-factor-desc', { email: client.email })}
                </BaseText>
              </View>
              <View style={styles.paddingTop16}>
                <BaseInput
                  title={t('screens.common.pin-we-sent-you')}
                  required
                  error={pinError}
                  value={pin}
                  onChange={onChangePin}
                />
                {pinError && (
                  <BaseText variant={BaseTextVariant.extraSmall} style={styles.errorText}>
                    {t('screens.common.incorrect-pin')}
                  </BaseText>
                )}
              </View>
            </View>
            <BaseButton
              disabled={!pin.length}
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.common.disable-two-factor')}
              onPress={onDisableTwoFactor}
            />
          </View>
        </View>
      );
    },
    [client.email, t]
  );

  const Loader = useCallback(() => {
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.loaderContainer}>
        <BaseActivityLoader
          animating={true}
          activeColor={theme.palette.green['400']}
          color={theme.palette.purple[200]}
        />
      </Animated.View>
    );
  }, [theme.dark]);

  const twoFactorError = useMemo(() => (enableTwoFactorError || {}) as BaseError, [enableTwoFactorError]);

  const codes = useMemo((): number[] => {
    if (!isDisable && !isGenerate && enableTwoFactorData?.codes?.length) return enableTwoFactorData.codes;
    else if (isDisable) return lastBackUpCodes;
    else if (isGenerate) return generateNewBackupCodesData?.codes || [];
    return [];
  }, [isDisable, isGenerate, enableTwoFactorData, lastBackUpCodes, generateNewBackupCodesData]);

  return (
    <SafeAreaView style={styles.safe}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {step === 0 && <FirstStep manualCode={manualCodeData?.manualCode || ''} />}
          {step === 1 && (
            <SecondStep
              error={twoFactorError?.data?.errors?.children?.code?.errors?.[0] || ''}
              otpCode={code}
              copied={hasCopied}
            />
          )}
          {(step === 1 || step === 3) && (
            <KeyboardDismissButton
              disabled={
                step === 1 ? code.length !== code_length || isNaN(code as never as number) : disablePin.length === 0
              }
              onPress={step === 1 ? onOtpNext : () => disableTwoFactorFn(disablePin)}
            />
          )}
          {step === 2 && <ThirdStep show={showCodes} codes={codes} />}
          {step === 3 && <FourthStep pin={disablePin} pinError={disableTwoFAError} />}
        </>
      )}
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, yellow, base, purple, icon }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flex: 1
    },
    flex: {
      flex: 1
    },
    margin: {
      marginHorizontal: 20
    },
    ruleContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      marginRight: 40
    },
    guideContainer: {
      paddingTop: 20,
      gap: 24,
      marginHorizontal: 20
    },
    numberContainer: {
      height: 30,
      width: 30,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: yellow[300]
    },
    textContainer: {
      gap: 8,
      alignItems: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 20
    },
    headContainer: {
      borderRadius: 12,
      backgroundColor: yellow[100],
      paddingTop: 9,
      gap: 16,
      marginHorizontal: 20
    },
    seperatorContainer: {
      width: screenWidth,
      height: 44,
      backgroundColor: '#E1DFE5',
      gap: 8,
      marginTop: 4
    },
    seperatorUp: {
      width: '100%',
      height: 18,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 18,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    },
    textAlign: {
      textAlign: 'left'
    },
    blackText: {
      color: graphite['900']
    },
    img: {
      height: 205,
      width: '100%'
    },
    btnImg: {
      width: 16,
      height: 16
    },
    authButton: {
      overflow: 'hidden',
      borderRadius: 8,
      alignSelf: 'center',
      ...shadow6Style
    },
    authButtonInside: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: yellow[200],
      borderRadius: 8,
      overflow: 'hidden',

    },
    authButtonContainer: {
      marginTop: 16,
      marginBottom: 24
    },
    copyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: base.white,
      ...shadow6Style
    },
    secondGuide: {
      gap: 16
    },
    scrollContent: {
      paddingBottom: 88
    },
    buttonContainer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 34,
      backgroundColor: 'rgba(247, 248, 250, 0.8)',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%'
    },
    codeInput: {
      borderWidth: 0,
      height: 50,
      backgroundColor: base.white,
      borderRadius: 10,
      ...shadow6Style
    },
    focusedCodeInput: {
      borderWidth: 1,
      borderColor: purple[800]
    },
    pinCodeText: {
      color: graphite['900'],
      fontWeight: '700',
      fontSize: 20,
      fontFamily: unbounded.medium
    },
    error: {
      height: 50,
      backgroundColor: base.white,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#C80030',
      ...shadow6Style
    },
    errorText: {
      color: '#C80030',
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
      ...shadow6Style,
      marginTop: 16,
      borderRadius: 25,
      alignSelf: 'center',
      overflow: 'hidden'

    },
    pasteContainerInside: {
      gap: 2,
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: purple['100'],
    },
    backupContainer: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    },
    gray700Text: {
      color: '#8fa6ae'
    },
    gray1000Text: {
      color: '#5D7278'
    },
    backupcodesContainer: {
      paddingVertical: 12,
      marginHorizontal: 20,
      backgroundColor: base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    codeTextContainer: {
      gap: 8,
      marginHorizontal: 20,
      paddingVertical: 12
    },
    backupButtonsContainer: {
      marginHorizontal: 20,
      gap: 12
    },
    textCenterAlign: {
      textAlign: 'center'
    },
    sheetButtons: {
      marginTop: 12,
      marginHorizontal: 20,
      marginBottom: 34,
      gap: 12
    },
    gap16: { gap: 16 },
    gap8: { gap: 8 },
    disconnect: { width: '100%', height: 243 },
    handleStyle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    handleIndicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetView: {
      paddingTop: 64,
      backgroundColor: graphite['050'],
      gap: 48
    },
    loaderContainer: { flex: 1, backgroundColor: graphite['050'], alignItems: 'center', justifyContent: 'center' },
    codeContent: { paddingBottom: 24 },
    disableContainer: { justifyContent: 'space-between', flex: 1, paddingBottom: 34 },
    paddingTop16: { paddingTop: 16 },
    textSecondary: {
      color: graphite['600']
    },
    paddingVertical12: { paddingVertical: 12 }
  });
};

export default TwoFactorScreen;

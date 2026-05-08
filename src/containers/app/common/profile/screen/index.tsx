import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextStyle,
  Image,
  InteractionManager,
  BackHandler,
  ListRenderItemInfo,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStyles from './styles';
import { StackActions, ParamListBase, useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { COMMON_ROUTE_NAMES, CommonRootParamsList, AUTH_ROUTE_NAMES } from '@/navigation/app/stacks';
import {
  BaseButton,
  BaseButtonLoading,
  BaseButtonSize,
  BaseButtonType,
  BaseRadioButton,
  BaseText,
  BaseTextVariant,
  SheetBackdrop
} from '@/components';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { actions } from '@/store';
import { useAppDispatch, useAppSelector, useIntercom } from '@/hooks';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { config, testIDs } from '@/constants';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import NotificationLanguages from '@/components/templates/app/notification-language';
import { FlatList } from 'react-native-gesture-handler';
import { BaseRadioButtonType } from '@/components/atoms/radio-button';
import { LANG } from '@/localization';
import CountryFlagIcon from '@/assets/icons/countries-flags';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomPostHog } from '@/helpers';

type ProfileScreenProps = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.Profile>;

interface ILanguages {
  id: LANG;
  language: string;
  icon: React.ReactElement;
}

enum BottomSheetTypes {
  TwoFA = 'TwoFA',
  SignOut = 'SignOut',
  NotificationsLang = 'NotificationsLang'
}

const {
  buttons: { activeOpacity },
  isIOS,
  isAndroid,
  androidAppVersion,
  iosAppVersion,
  iosVersionCode,
  androidVersionCode
} = config;

const {
  application: { openModal },
  auth: { useSignOut },
  portfolio: { useChangeLanguageMutation, setUserInfo }
} = actions;

const hitSlop = { bottom: 10, left: 10, right: 10, top: 10 };

const languages: ILanguages[] = [
  { id: LANG.MS, language: 'Bahasa Melayu', icon: <CountryFlagIcon name='ms' /> },
  { id: LANG.EN, language: 'English', icon: <CountryFlagIcon name='en' /> },
  { id: LANG.ES, language: 'Español', icon: <CountryFlagIcon name='es' /> },
  { id: LANG.VI, language: 'Tiếng Việt', icon: <CountryFlagIcon name='vi' /> },
  { id: LANG.TH, language: 'แบบไทย', icon: <CountryFlagIcon name='th' /> },
  { id: LANG.PT, language: 'Português', icon: <CountryFlagIcon name='pt' /> },
  { id: LANG.IT, language: 'Italiano', icon: <CountryFlagIcon name='it' /> }
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const insets = useSafeAreaInsets();
  const { top = 0 } = insets || {};

  const common = useAppSelector((store) => store.common);
  const { config } = common || {};
  const { socialAuth } = config || {};

  const isSocialAuthEnabled = useMemo(() => {
    if (isAndroid) return socialAuth.android;
    if (isIOS) return socialAuth.ios;
    return false;
  }, [isAndroid, isIOS, socialAuth]);

  const windowDimensions = useWindowDimensions();
  const { height = 0 } = windowDimensions || {};

  const {
    t,
    i18n: { language: appLanguage, changeLanguage }
  } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const languageBottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetIsOpen = useRef<boolean>(false);
  const [currentBottomSheetView, setCurrentBottomSheetView] = useState<BottomSheetTypes>(BottomSheetTypes.TwoFA);
  const [tempLanguage, setTempLanguage] = useState<LANG>(appLanguage as LANG);

  const [
    changeNotificationLanguage,
    { isLoading: changeLanguageLoading, isError: isChangeLanguageError, isSuccess: isChangeLanguageSuccess }
  ] = useChangeLanguageMutation();

  const dispatch = useAppDispatch();
  const { intercomPresent } = useIntercom();

  const openSheet = useCallback((bottomSheetViewType: BottomSheetTypes) => {
    setCurrentBottomSheetView(bottomSheetViewType);
    bottomSheetRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => bottomSheetRef.current?.dismiss(), []);

  const onAnimate = useCallback(() => (sheetIsOpen.current = true), []);
  const onDismiss = useCallback(() => (sheetIsOpen.current = false), []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetIsOpen.current) bottomSheetRef.current?.dismiss();
      else navigation.isFocused() && navigation.canGoBack() && navigation.goBack();
      return true;
    });
    return handler.remove;
  }, []);

  const disableTwoFactor = useCallback(async () => {
    try {
      closeSheet();
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate(COMMON_ROUTE_NAMES.TwoFactor, { isDisable: true, generate: false });
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const profile = useAppSelector((store) => store.portfolio.userInfo);

  const [signOut, response] = useSignOut();
  const { isLoading: isSignOutLoading } = response || {};

  const { resetPosthog } = useCustomPostHog();

  const onBack = useCallback(() => navigation.canGoBack() && navigation.goBack(), []);

  const signOutHandler = async () => {
    setLoading(true);
    try {
      await signOut().unwrap();
      bottomSheetRef.current?.close();
      resetPosthog();
    } catch (error: unknown) {
      console.log(error);
    } finally {
      navigation.dispatch(
        StackActions.replace(ROOT_ROUTE_NAMES.Auth, {
          screen: AUTH_ROUTE_NAMES.SignIn
        })
      );
      setLoading(false);
    }
  };

  const Button = useCallback(
    ({
      title = '',
      hideArrow = false,
      onPress,
      loading,
      labelStyle,
      rightText = '',
      testID = ''
    }: {
      title: string;
      hideArrow?: boolean;
      loading?: boolean;
      onPress?: () => void;
      labelStyle?: TextStyle;
      rightText?: string;
      testID: keyof typeof testIDs.profile | '';
    }) => {
      return (
        <TouchableOpacity
          testID={testID === '' ? undefined : testIDs.profile[testID]}
          style={styles.row}
          activeOpacity={activeOpacity}
          onPress={onPress}
        >
          <BaseText style={[styles.infoText, labelStyle]}>{title}</BaseText>
          <View style={styles.buttonRight}>
            {!!rightText?.length && (
              <BaseText style={styles.buttonRightText} variant={BaseTextVariant.small}>
                {rightText}
              </BaseText>
            )}
            {(!hideArrow || loading) && (
              <View style={styles.horizontal}>
                {loading ? (
                  <ActivityIndicator size={'small'} />
                ) : (
                  <SvgIcon color={'#8fa6ae'} name={SvgXmlIconNames.chevronRight} size={IconSize.xsm} />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    []
  );

  const navigateToChangePhone = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.ChangePhone);
  }, []);

  const navigateToPersonalDetails = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.PersonalDetails);
  }, []);

  const navigateToChangePassword = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.ChangePassword);
  }, []);

  const navigateToChangeEmail = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.ChangeEmail);
  }, []);

  const navigateToEmailNotificationsSettings = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.EmailNotificationsSettings);
  }, []);

  const navigateToPushNotificationsSettings = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.PushNotificationsSettings);
  }, []);

  const goToTwoFactor = useCallback(() => {
    if (profile.twoFactorAuthEnabled) openSheet(BottomSheetTypes.TwoFA);
    else navigation.navigate(COMMON_ROUTE_NAMES.TwoFactor);
  }, [profile.twoFactorAuthEnabled]);

  const goToLinkedAccount = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.LinkedAccounts);
  }, [navigation]);

  const goToLegalDocuments = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.LegalDocuments);
  }, []);

  const onPressNotificationsLanguageHandler = useCallback(() => {
    openSheet(BottomSheetTypes.NotificationsLang);
  }, []);

  const generateNewBackupCodes = useCallback(() => {
    closeSheet();
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(COMMON_ROUTE_NAMES.TwoFactor, { generate: true });
    });
  }, []);

  const handleSignOut = async () => {
    InteractionManager.runAfterInteractions(async () => {
      await signOutHandler();
    });
  };
  const showSignOutButtonSheet = () => openSheet(BottomSheetTypes.SignOut);

  const renderBottomSheetView = () => {
    return <BottomSheetView style={styles.sheetView}>{renderBottomSheetContent()}</BottomSheetView>;
  };

  const render2FABottomSheetView = () => (
    <>
      <View style={[styles.gap16, styles.bottomSheetPaddingTop]}>
        <Image source={images.twoFactor} style={styles.authImage} />
        <View style={styles.gap8}>
          <BaseText style={[styles.textCenterAlign, styles.margin]} variant={BaseTextVariant.captionSemiBold}>
            {t('screens.profile.bottomSheet.twoFA.headline')}
          </BaseText>
          <BaseText style={[styles.textCenterAlign, styles.margin]}>
            {t('screens.profile.bottomSheet.twoFA.description')}
          </BaseText>
        </View>
      </View>
      <View style={styles.sheetButtons}>
        <BaseButton
          type={BaseButtonType.primary}
          size={BaseButtonSize.large}
          label={t('screens.profile.bottomSheet.twoFA.primaryBtn')}
          onPress={generateNewBackupCodes}
        />
        <BaseButton
          type={BaseButtonType.accent}
          size={BaseButtonSize.large}
          loadingType={BaseButtonLoading.ellipsis}
          label={t('screens.profile.bottomSheet.twoFA.secondaryBtn')}
          onPress={disableTwoFactor}
        />
      </View>
    </>
  );

  const renderSignOutBottomSheetView = () => (
    <>
      <View style={[styles.gap16, styles.bottomSheetPaddingTop]}>
        <Image source={images.signOut} style={styles.signOutImage} resizeMode='cover' />
        <View style={styles.gap8}>
          <BaseText style={[styles.textCenterAlign, styles.margin]} variant={BaseTextVariant.captionSemiBold}>
            {t('screens.profile.bottomSheet.signOut.headline')}
          </BaseText>
        </View>
      </View>
      <View style={styles.sheetButtons}>
        <BaseButton
          type={BaseButtonType.accent}
          size={BaseButtonSize.large}
          loading={isSignOutLoading || loading}
          loadingType={BaseButtonLoading.ellipsis}
          label={t('screens.profile.bottomSheet.signOut.secondaryBtn')}
          onPress={handleSignOut}
        />
        <BaseButton
          type={BaseButtonType.primary}
          size={BaseButtonSize.large}
          label={t('screens.profile.bottomSheet.signOut.primaryBtn')}
          onPress={closeSheet}
        />
      </View>
    </>
  );

  const renderNotificationsLangBottomSheetView = () => <NotificationLanguages onSubmit={closeSheet} />;

  const renderBottomSheetContent = () => {
    switch (currentBottomSheetView) {
      case BottomSheetTypes.TwoFA:
        return render2FABottomSheetView();

      case BottomSheetTypes.SignOut:
        return renderSignOutBottomSheetView();

      case BottomSheetTypes.NotificationsLang:
        return renderNotificationsLangBottomSheetView();

      default:
        return null;
    }
  };

  const goToWithdrawalPayments = useCallback(() => {
    navigation.navigate(COMMON_ROUTE_NAMES.ManageWithdrawal);
  }, []);

  const openSupportChat = () => {
    intercomPresent();
  };

  const _renderLanguage = useCallback(
    ({ item }: ListRenderItemInfo<ILanguages>) => {
      const changeAppLanguage = () => setTempLanguage(item.id);

      return (
        <BaseRadioButton
          icon={item.icon}
          type={BaseRadioButtonType.secondary}
          contentStyle={{ marginBottom: 0, borderRadius: 0, backgroundColor: 'white' }}
          isSelected={item.id === tempLanguage}
          checkBoxWrapperStyle={IconSize.sm}
          label={item.language}
          onPress={changeAppLanguage}
        />
      );
    },
    [tempLanguage]
  );

  const _languageKeyExtractor = useCallback((item: any) => `${item.id}-language`, []);

  const onLanguageClose = useCallback(() => {
    sheetIsOpen.current = false;
    setTempLanguage(appLanguage as LANG);
  }, [appLanguage]);

  const changeLanguageHandler = async (language: string) => {
    try {
      await changeNotificationLanguage({
        language: language
      });
    } catch (error: unknown) {
      // showError();
    }
  };

  const updateProfileLanguage = (language: string) => {
    dispatch(
      setUserInfo({
        ...profile,
        language: language
      })
    );
  };

  const showError = () => {
    dispatch(
      openModal({
        title: t('errors.modal-error-title'),
        subTitle: t('errors.modal-error-subtitle'),
        closeTime: 5,
        icon: images.depositError,
        iconSize: {
          width: 96,
          height: 90
        }
      })
    );
  };

  useEffect(() => {
    if (isChangeLanguageSuccess) {
      updateProfileLanguage(tempLanguage);
    }

    // if (isChangeLanguageError) {
    //   showError();
    // }

    if (isChangeLanguageSuccess || isChangeLanguageError) {
      changeLanguage(tempLanguage);

      languageBottomSheetRef.current?.dismiss();
    }
  }, [isChangeLanguageSuccess, isChangeLanguageError]);

  const onChangeLanguage = async () => {
    AsyncStorage.setItem('app-language', tempLanguage);

    if (appLanguage !== tempLanguage) {
      await changeLanguageHandler(tempLanguage);
    }
  };

  const onOpenAppLanguage = useCallback(() => {
    requestAnimationFrame(() => languageBottomSheetRef.current?.present());
  }, []);

  const selectedLanguage = useMemo(
    () => languages.find((item) => item.id === appLanguage)?.language || '',
    [appLanguage]
  );

  const maxHeight = height - top - (StatusBar.currentHeight || 0) - 24;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} hitSlop={hitSlop} activeOpacity={activeOpacity}>
            <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} color={theme.palette.graphite['900']} />
          </TouchableOpacity>
          <BaseButton
            type={BaseButtonType.primary}
            style={styles.btn}
            labelStyle={styles.label}
            size={BaseButtonSize.small}
            label={t('screens.profile.help')}
            onPress={openSupportChat}
          />
        </View>
        <ScrollView contentContainerStyle={styles.scrollBox}>
          <View style={styles.head}>
            {profile?.isVerified && (
              <BaseText style={styles.txt} variant={BaseTextVariant.title}>
                {`${profile.firstName} ${profile.lastName}`}
              </BaseText>
            )}
          </View>
          <View style={styles.section}>
            <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.profile.account')}
            </BaseText>
            <View style={styles.buttonsList}>
              <Button
                testID='personalDetails'
                title={t('screens.profile.personalDetails')}
                onPress={navigateToPersonalDetails}
              />
              <Button
                testID='paymentDetails'
                onPress={goToWithdrawalPayments}
                title={t('screens.profile.paymentDetails')}
              />
              {/* <Button title={t('screens.profile.documentsUpload')} /> */}
              <Button
                testID='legalDocuments'
                title={t('screens.profile.legalDocuments')}
                onPress={goToLegalDocuments}
              />
            </View>
          </View>
          <View style={styles.section}>
            <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.profile.securityPrivacy')}
            </BaseText>
            <View style={styles.buttonsList}>
              <Button testID='changePhone' title={t('screens.profile.change-phone')} onPress={navigateToChangePhone} />
              <Button testID='changeEmail' title={t('screens.profile.changeEmail')} onPress={navigateToChangeEmail} />
              <Button
                testID='changePassword'
                title={t('screens.profile.changePassword')}
                onPress={navigateToChangePassword}
              />
              <Button
                testID='manage2FactorAuthentication'
                onPress={goToTwoFactor}
                title={t('screens.profile.manage2FA')}
              />
              {isSocialAuthEnabled && (
                <Button
                  testID='manageLinkedAccounts'
                  onPress={goToLinkedAccount}
                  title={t('screens.profile.manageLinkedAccounts')}
                />
              )}
            </View>
          </View>
          <View style={styles.section}>
            <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
              {t('screens.profile.notifications')}
            </BaseText>
            <View style={styles.buttonsList}>
              <Button
                testID='emailNotifications'
                title={t('screens.profile.emailNotifications')}
                onPress={navigateToEmailNotificationsSettings}
              />
              <Button
                testID='pushNotifications'
                title={t('screens.profile.pushNotifications')}
                onPress={navigateToPushNotificationsSettings}
              />
              <Button
                testID='notificationsLanguage'
                title={t('screens.profile.notificationsLanguage')}
                onPress={onPressNotificationsLanguageHandler}
              />
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.buttonsList}>
              <Button
                testID='appLanguage'
                title={t('screens.profile.app-language')}
                onPress={onOpenAppLanguage}
                rightText={selectedLanguage}
              />
              <Button
                testID='singOut'
                title={t('screens.profile.signOut')}
                hideArrow
                labelStyle={{ color: theme.palette.purple[800] }}
                onPress={showSignOutButtonSheet}
              />
            </View>
          </View>
          <View style={styles.sectionBottom}>
            <BaseText>
              {t('screens.profile.version', {
                version: isAndroid
                  ? `${androidAppVersion} (${androidVersionCode})`
                  : `${iosAppVersion} (${iosVersionCode})`
              })}
            </BaseText>
          </View>
        </ScrollView>
      </View>
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        enableContentPanningGesture={false}
        backdropComponent={SheetBackdrop}
        onAnimate={onAnimate}
        onDismiss={onDismiss}
        style={styles.sheetBorder}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        {renderBottomSheetView()}
      </BottomSheetModal>
      <BottomSheetModal
        ref={languageBottomSheetRef}
        enableDynamicSizing
        backdropComponent={SheetBackdrop}
        onAnimate={onAnimate}
        onDismiss={onLanguageClose}
        handleStyle={styles.handleStyle}
        backgroundStyle={styles.languageSheetBg}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView>
          <View
            style={[
              styles.languageSheetTop,
              {
                maxHeight
              }
            ]}
          >
            <View style={styles.languageSheetUp}>
              <BaseText variant={BaseTextVariant.captionSemiBold}>{t('screens.profile.select-app-language')}</BaseText>
              <View style={styles.languageSheetList}>
                <FlatList
                  data={languages}
                  keyExtractor={_languageKeyExtractor}
                  showsVerticalScrollIndicator={false}
                  renderItem={_renderLanguage}
                />
                {changeLanguageLoading && (
                  <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.loading}>
                    <ActivityIndicator
                      color={theme.palette.graphite['900']}
                      size={isIOS ? 'small' : 'large'}
                      animating={true}
                    />
                  </Animated.View>
                )}
              </View>
            </View>
            <View style={styles.languageSheetButton}>
              <BaseButton
                type={BaseButtonType.primary}
                size={BaseButtonSize.large}
                label={t('screens.profile.select')}
                onPress={onChangeLanguage}
              />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

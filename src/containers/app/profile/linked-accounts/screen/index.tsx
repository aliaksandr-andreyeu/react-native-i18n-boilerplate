import React, { useLayoutEffect, FC, useCallback, useRef, useState, useMemo } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import {
  BaseImage,
  BaseBackButton,
  BaseText,
  BaseTextVariant,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseButtonLoading,
  BaseActivityLoaderSize,
  SheetBackdrop
} from '@/components';
import { useTheme, useFocusEffect, ParamListBase } from '@react-navigation/native';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { useTranslation } from 'react-i18next';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { useAppDispatch, useAppSelector, useBackHandler, useFacebookSignIn, FacebookSignInFrom } from '@/hooks';
import { googleSignIn } from '@/helpers';
import { SocialService } from '@/types';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import useStyles from './styles';
import { StackScreenProps } from '@react-navigation/stack';
import { config, api } from '@/constants';
import { actions } from '@/store';

const {
  application: { openModal },
  portfolio: { useProfileQuery },
  profile: { useSocialConnect, useSocialDisconnect, useUpdateCustomFields }
} = actions;

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

type LinkedAccountsScreenProps = StackScreenProps<
  ParamListBase & CommonRootParamsList,
  COMMON_ROUTE_NAMES.LinkedAccounts
>;

const LinkedAccountsScreen: FC<LinkedAccountsScreenProps> = ({ navigation, route }) => {
  useBackHandler();

  const { facebookSignIn, facebookData } = useFacebookSignIn({ from: FacebookSignInFrom.connect });
  const { code: facebookCode } = facebookData || {};


  const [fbCode, setFbCode] = useState<string | undefined>(undefined);

  const [isGoogleLoading, setGoogleLoading] = useState<boolean>(false);
  const [isFacebookLoading, setFacebookLoading] = useState<boolean>(false);

  const [provider, setProvider] = useState<string | undefined>(undefined);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [getProfile] = useProfileQuery();
  const [socialConnect] = useSocialConnect();
  const [socialDisonnect] = useSocialDisconnect();
  const [updateCustomFields] = useUpdateCustomFields();

  const setInitialState = () => {
    setFacebookLoading(false);
    setGoogleLoading(false);
    setFbCode(undefined);
  };

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};

  const isGoogleConnected = useMemo(() => {
    const { customFields } = userInfo || {};
    const { custom_google_profile_connected } = customFields || {};

    return Boolean(custom_google_profile_connected === 'true');
  }, [userInfo]);

  const isFacebookConnected = useMemo(() => {
    const { customFields } = userInfo || {};
    const { custom_facebook_profile_connected } = customFields || {};

    return Boolean(custom_facebook_profile_connected === 'true');
  }, [userInfo]);

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
      };
    }, [route, navigation])
  );

  const currentProvider = useMemo(() => {
    if (provider === SocialService.google) {
      return t('screens.linked-accounts.google');
    } else if (provider === SocialService.facebook) {
      return t('screens.linked-accounts.facebook');
    } else {
      return '';
    }
  }, [t, provider]);

  const openSheet = () => bottomSheetRef.current?.present();
  const closeSheet = () => {
    bottomSheetRef.current?.dismiss();
    setProvider(undefined);
  };
  const showPopUp = useCallback(({ title = '', closeTime, icon, iconSize }: Partial<DefaultModalConfig>) => {
    dispatch(
      openModal({
        title,
        icon,
        iconSize,
        closeTime
      })
    );
  }, []);

  const checkFacebookCode = useCallback(() => {
    if (!facebookCode) {
      return;
    }
    setFbCode(facebookCode);
  }, [facebookCode, setFbCode]);

  useLayoutEffect(() => {
    facebookConnectHandler();
  }, [fbCode]);

  useFocusEffect(
    useCallback(() => {
      checkFacebookCode();
    }, [route, navigation, facebookCode])
  );

  const googleConnectHandler = async () => {
    try {
      const userInfo = await googleSignIn();
      const { serverAuthCode } = userInfo || {};

      if (!serverAuthCode) {
        return;
      }

      setGoogleLoading(true);

      const socialConnectResponse = await socialConnect({
        service: SocialService.google,
        code: serverAuthCode
      }).unwrap();

      const updateCustomFieldsResponse = await updateCustomFields({
        customFields: {
          custom_google_profile_connected: 'true'
        }
      }).unwrap();

      await getProfile();
    } catch (error: unknown) {
      console.log(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleDisconnectHandler = async () => {
    try {
      setGoogleLoading(true);

      const socialDisonnectResponse = await socialDisonnect({
        service: SocialService.google
      }).unwrap();

      const updateCustomFieldsResponse = await updateCustomFields({
        customFields: {
          custom_google_profile_connected: 'false'
        }
      }).unwrap();

      await getProfile();

      const { customFields } = updateCustomFieldsResponse || {};
      const { custom_google_profile_connected } = customFields || {};

      closeSheet();

      if (Boolean(custom_google_profile_connected === 'false')) {
        showPopUp({
          title: t('screens.linked-accounts.provider-disconnected', { provider: t('screens.linked-accounts.google') }),

          closeTime: 5,
          icon: images.depositSuccess,
          iconSize: {
            width: 115,
            height: 90
          }
        });
      }
    } catch (error: unknown) {
      console.log(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const facebookConnectHandler = async () => {
    if (!fbCode) {
      return;
    }

    console.log('@@@@@@@@@@@@@@@@@@ fbCode', fbCode);

    try {
      setFacebookLoading(true);

      await socialConnect({
        service: SocialService.facebook,
        code: fbCode,
        redirect: api.auth.facebookConnectRedirect
      }).unwrap();

      await updateCustomFields({
        customFields: {
          custom_facebook_profile_connected: 'true'
        }
      }).unwrap();

      await getProfile();
    } catch (error: unknown) {
      console.log(error);
    } finally {
      setFacebookLoading(false);
    }
  };

  const facebookDisconnectHandler = async () => {
    try {
      setFacebookLoading(true);

      const socialDisonnectResponse = await socialDisonnect({
        service: SocialService.facebook
      }).unwrap();

      const updateCustomFieldsResponse = await updateCustomFields({
        customFields: {
          custom_facebook_profile_connected: 'false'
        }
      }).unwrap();

      await getProfile();

      const { customFields } = updateCustomFieldsResponse || {};
      const { custom_facebook_profile_connected } = customFields || {};

      closeSheet();

      if (Boolean(custom_facebook_profile_connected === 'false')) {
        showPopUp({
          title: t('screens.linked-accounts.provider-disconnected', {
            provider: t('screens.linked-accounts.facebook')
          }),

          closeTime: 5,
          icon: images.depositSuccess,
          iconSize: {
            width: 115,
            height: 90
          }
        });
      }
    } catch (error: unknown) {
      console.log(error);
    } finally {
      setFacebookLoading(false);
      setFbCode(undefined);
    }
  };

  const goToFacebookSignIn = useCallback(async () => {
    setFbCode(undefined);

    await facebookSignIn();
  }, [facebookSignIn, setFbCode]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: t('screens.linked-accounts.title'),
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: styles.headerStyle,
      headerLeft: () => <BaseBackButton isChevron={false} />,
      headerRight: () => null
    });
    return () => { };
  }, [navigation, route]);

  const AccountButton = useCallback(
    ({ service }: { service: SocialService }) => {
      const isGoogle = service === SocialService.google;
      const isFacebook = service === SocialService.facebook;

      const checkLinked = () => {
        if (isGoogle) {
          return isGoogleConnected;
        } else if (isFacebook) {
          return isFacebookConnected;
        } else {
          return false;
        }
      };

      const isLinked = checkLinked();

      const onPress = async () => {
        if (isGoogle) {
          if (isLinked) {
            setProvider(SocialService.google);

            openSheet();
          } else {
            await googleConnectHandler();
          }
        } else if (isFacebook) {
          if (isLinked) {
            setProvider(SocialService.facebook);

            openSheet();
          } else {
            goToFacebookSignIn();
          }
        }
      };

      return isLinked ? (
        <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity} hitSlop={hitSlop}>
          <BaseText variant={BaseTextVariant.text}>{t('screens.linked-accounts.disconnect')}</BaseText>
        </TouchableOpacity>
      ) : (
        <BaseButton
          style={styles.socialButton}
          type={BaseButtonType.primary}
          size={BaseButtonSize.extraSmall}
          label={t('screens.linked-accounts.connect')}
          onPress={onPress}
          loading={isGoogle ? isGoogleLoading : isFacebookLoading}
          loadingType={BaseButtonLoading.ellipsis}
          loadingSize={BaseActivityLoaderSize.small}
        />
      );
    },
    [isGoogleConnected, isFacebookConnected, isGoogleLoading, isFacebookLoading]
  );

  const currentDisconnectHandler =
    provider === SocialService.google
      ? googleDisconnectHandler
      : provider === SocialService.facebook
        ? facebookDisconnectHandler
        : () => { };

  const currentLoading =
    provider === SocialService.google
      ? isGoogleLoading
      : provider === SocialService.facebook
        ? isFacebookLoading
        : false;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
        <View style={styles.descBox}>
          <BaseText variant={BaseTextVariant.small} style={styles.desc}>
            {t('screens.linked-accounts.desc')}
          </BaseText>
        </View>
        <View style={styles.socialBox}>
          <View style={styles.socialCard}>
            <TouchableOpacity style={styles.socialItem} activeOpacity={activeOpacity} hitSlop={hitSlop}>
              <View style={styles.logoBox}>
                <SvgIcon name={SvgXmlIconNames.googleColor} size={IconSize.sm} />
                <BaseText variant={BaseTextVariant.small}>{t('screens.linked-accounts.google')}</BaseText>
              </View>
              <AccountButton service={SocialService.google} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialItem} activeOpacity={activeOpacity} hitSlop={hitSlop}>
              <View style={styles.logoBox}>
                <SvgIcon name={SvgXmlIconNames.facebookColor} size={IconSize.sm} />
                <BaseText variant={BaseTextVariant.small}>{t('screens.linked-accounts.facebook')}</BaseText>
              </View>
              <AccountButton service={SocialService.facebook} />
            </TouchableOpacity>
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
            <View style={styles.sheetViewContent}>
              <BaseImage resizeMode={'contain'} source={images.disconnect} style={styles.disconnect} />
              <View style={styles.sheetViewText}>
                <BaseText style={styles.textAlignCenter} variant={BaseTextVariant.captionSemiBold}>
                  {t('screens.linked-accounts.want-disconnect-provider', { provider: currentProvider })}
                </BaseText>
                <BaseText style={styles.textAlignCenter}>{t('screens.linked-accounts.relink-again-later')}</BaseText>
              </View>
            </View>
            <View style={styles.sheetButtons}>
              <BaseButton
                type={BaseButtonType.accent}
                size={BaseButtonSize.large}
                label={t('screens.linked-accounts.disconnect-provider', { provider: currentProvider })}
                onPress={currentDisconnectHandler}
                loading={currentLoading}
                loadingType={BaseButtonLoading.ellipsis}
              />
              <BaseButton
                type={BaseButtonType.primary}
                size={BaseButtonSize.large}
                label={t('screens.linked-accounts.go-back')}
                onPress={closeSheet}
              />
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LinkedAccountsScreen;

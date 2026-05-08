import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ParamListBase } from '@react-navigation/native';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import useStyles from './styles';
import { StackScreenProps } from '@react-navigation/stack';
import { AccountDelete, BaseButtonType, BaseText, BaseTextVariant, ProgressHeader } from '@/components';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useAppDispatch, useAppSelector, useBackHandler } from '@/hooks';
import { useGetApplicationConfigs, useProfileQuery } from '@/store/api';
import { countryList } from '@/constants/static';
import { config } from '@/constants';
import Clipboard from '@react-native-clipboard/clipboard';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DefaultModalConfig } from '@/store/slices/application/types';
import { actions } from '@/store';

type PersonalDetailsScreenProps = StackScreenProps<
  ParamListBase & CommonRootParamsList,
  COMMON_ROUTE_NAMES.PersonalDetails
>;

const {
  buttons: { activeOpacity }
} = config;

const {
  application: { openModal }
} = actions;

const PersonalDetailsScreen: React.FC<PersonalDetailsScreenProps> = ({ navigation }) => {
  const {
    t,
    i18n: { language }
  } = useTranslation();

  const [getApplicationConfigs, { data: configData, isLoading: configLoading }] = useGetApplicationConfigs();

  useBackHandler();

  const sheetRef = useRef<BottomSheetModal>(null);

  const theme = useTheme();
  const styles = useStyles(theme);

  const [getProfile] = useProfileQuery();
  const userInfo = useAppSelector((store) => store.portfolio.userInfo);

  const dispatch = useAppDispatch();

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
    getApplicationConfigs(language);
    getProfile();
  }, [language]);

  const deletionData = useMemo(() => {
    if (!configData) return {};
    return configData.find((item: any) => ['delete_profile', 'cancel_delete_profile'].includes(item.type)) || {};
  }, [configData]);

  const isDeletionType = useMemo(() => deletionData.id === 59, [deletionData.type]);

  const onActionPress = useCallback(() => sheetRef.current?.present?.(), []);

  const onDeleteProfile = useCallback(async () => {
    try {
      if (configLoading) return;

      sheetRef.current?.dismiss();

      showPopUp({
        title: t('screens.personal-details.deletion-sent'),
        subTitle: t('screens.personal-details.deletion-sent-info'),
        closeTime: 5,
        icon: images.depositSuccess,
        iconSize: {
          width: 115,
          height: 90
        },
        button: {
          text: t('screens.personal-details.cancel-deletion'),
          type: BaseButtonType.primary,
          onPress: () => {
            dispatch(openModal(null));
            setTimeout(async () => {
              try {
                getApplicationConfigs(language);
                showPopUp({
                  title: t('screens.personal-details.deletion-canceled'),
                  subTitle: t('screens.personal-details.deletion-canceled-info'),
                  closeTime: 5,
                  icon: images.depositSuccess,
                  iconSize: {
                    width: 115,
                    height: 90
                  }
                });
              } catch (error) {
                console.error(error);
              }
            }, 500);
          }
        }
      });
      getApplicationConfigs(language);
    } catch (error) {
      console.error(error);
    }
  }, [language, configLoading]);

  const onCancelDelete = useCallback(async () => {
    try {
      if (configLoading) return;
      getApplicationConfigs(language);

      showPopUp({
        title: t('screens.personal-details.deletion-canceled'),
        subTitle: t('screens.personal-details.deletion-canceled-info'),
        closeTime: 5,
        icon: images.depositSuccess,
        iconSize: {
          width: 115,
          height: 90
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, [configLoading, deletionData?.id, language]);

  const disableDeletion = useMemo(() => {
    if (!deletionData.type) return true;
    return false;
  }, [deletionData?.type]);

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        leftIconType={SvgXmlIconNames.arrowLeft}
        title={t('screens.personal-details.title')}
        stepsCount={0}
        currentStep={0}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.section}>
          {userInfo?.isVerified && <View style={styles.row}>
            <BaseText variant={BaseTextVariant.tiny} style={styles.formTitle}>
              {t('screens.personal-details.name')}
            </BaseText>
            <BaseText variant={BaseTextVariant.tag}>
              {userInfo.firstName || t('screens.personal-details.unknown')}{' '}
              {userInfo.lastName || t('screens.personal-details.unknown')}
            </BaseText>
          </View>}
          <View style={styles.row}>
            <BaseText variant={BaseTextVariant.tiny} style={styles.formTitle}>
              {t('screens.personal-details.email')}
            </BaseText>
            <BaseText variant={BaseTextVariant.tag}>{userInfo.email || t('screens.personal-details.unknown')}</BaseText>
          </View>
          <View style={styles.row}>
            <BaseText variant={BaseTextVariant.tiny} style={styles.formTitle}>
              {t('screens.personal-details.phone-number')}
            </BaseText>
            <BaseText variant={BaseTextVariant.tag}>{userInfo.phone || t('screens.personal-details.unknown')}</BaseText>
          </View>
          <TouchableOpacity
            style={styles.rowWithIcon}
            activeOpacity={activeOpacity}
            onPress={() => Clipboard.setString(`${userInfo.id}`)}
          >
            <View>
              <BaseText variant={BaseTextVariant.tiny} style={styles.formTitle}>
                {t('screens.personal-details.customer-ID')}
              </BaseText>
              <BaseText variant={BaseTextVariant.tag}>{userInfo.id}</BaseText>
            </View>
            <SvgIcon name={SvgXmlIconNames.copy} size={IconSize.xs} color={theme.palette.purple[800]} />
          </TouchableOpacity>
          <View style={styles.row}>
            <BaseText variant={BaseTextVariant.tiny} style={styles.formTitle}>
              {t('screens.personal-details.country-of-residence')}
            </BaseText>
            <BaseText variant={BaseTextVariant.tag}>
              {userInfo.country
                ? countryList[userInfo.country as keyof object] || userInfo.country
                : t('screens.personal-details.unknown')}
            </BaseText>
          </View>
        </View>
        <AccountDelete
          navigation={navigation}
          ref={sheetRef}
          disable={disableDeletion}
          type={deletionData.type}
          onPress={isDeletionType ? onActionPress : onCancelDelete}
          onSheetPress={onDeleteProfile}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalDetailsScreen;

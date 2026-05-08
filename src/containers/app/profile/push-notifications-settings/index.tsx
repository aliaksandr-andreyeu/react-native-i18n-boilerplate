import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ParamListBase } from '@react-navigation/native';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import useStyles from './styles';
import { StackScreenProps } from '@react-navigation/stack';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseSwitch,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { images, SvgXmlIconNames } from '@/assets';
import { useAppDispatch, useAppSelector, useBackHandler } from '@/hooks';
import { actions } from '@/store';

const {
  application: { openModal },
  auth: { useCustomerEmailPreferences, useSetCustomerSettings }
} = actions;

type PushNotificationsSettingsScreenProps = StackScreenProps<
  ParamListBase & CommonRootParamsList,
  COMMON_ROUTE_NAMES.PushNotificationsSettings
>;

export interface ITopics {
  description: string;
  id: number;
  name: string;
  subscribed: boolean;
}

export interface IPreferences {
  key: number;
  value: boolean;
}

const PushNotificationsSettingsScreen: React.FC<PushNotificationsSettingsScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  useBackHandler();

  const theme = useTheme();
  const styles = useStyles(theme);

  const dispatch = useAppDispatch();

  const [topics, setTopics] = useState<ITopics[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [initialTopics, setInitialTopics] = useState<ITopics[] | undefined>();

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);
  const [getEmailPreferences, emailPreferencesResponse] = useCustomerEmailPreferences();
  const [setCustomerSettings] = useSetCustomerSettings();

  const getEmailPreferencesHandler = async () => {
    try {
      const data = await getEmailPreferences({ email: userInfo.email }).unwrap();
      if (data) {
        const dataList = data?.customer?.topics?.filter((item: ITopics) => {
          return item.name.toLowerCase().includes('push');
        });
        setTopics(dataList);
        setInitialTopics(dataList);
      } else {
        setTopics([]);
        setInitialTopics([]);
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const setCustomerSettingsHandler = async () => {
    if (!topics) return;

    setLoading(true);

    let data = {};
    topics.forEach((topic) => {
      data = { ...data, [`cio_subscription_preferences.topics.topic_${topic.id}`]: topic.subscribed };
    });
    const body = {
      type: 'person',
      identifiers: {
        email: userInfo.email
      },
      action: 'identify',
      attributes: data
    };

    try {
      await setCustomerSettings(body).unwrap();

      setInitialTopics(topics);
      setShowConfirmButton(false);

      dispatch(
        openModal({
          title: t('screens.push-notifications-settings.update_success'),
          onClosed: navigation.goBack,
          closeTime: 5,
          icon: images.depositSuccess,
          iconSize: {
            width: 90,
            height: 90
          }
        })
      );
    } catch (error) {
      console.error('setCustomerSettingsHandler Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmailPreferencesHandler();
  }, []);

  const checkForChanges = useCallback(() => {
    if (!topics || !initialTopics) return false;
    return topics.some((topic, index) => topic.subscribed !== initialTopics[index].subscribed);
  }, [topics, initialTopics]);

  useEffect(() => {
    setShowConfirmButton(checkForChanges());
  }, [topics, checkForChanges]);

  const translations: Record<string, string> = useMemo(
    () => ({
      Promotions: t('screens.push-notifications-settings.promotions'),
      Reminders: t('screens.push-notifications-settings.reminders'),
      'Important market updates': t('screens.push-notifications-settings.important-market-updates'),
      'Trading updates': t('screens.push-notifications-settings.trading-updates')
    }),
    [t]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader
        leftIconType={SvgXmlIconNames.arrowLeft}
        title={t('screens.push-notifications-settings.title')}
        stepsCount={0}
        currentStep={0}
      />
      {emailPreferencesResponse.isLoading ? (
        <View style={styles.container}>
          <ActivityIndicator size='small' color={theme.palette.graphite['900']} style={styles.indicator} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.textWrap}>
                <BaseText variant={BaseTextVariant.tag}>{t('screens.push-notifications-settings.system')}</BaseText>
                <BaseText style={styles.subTitle} variant={BaseTextVariant.caption}>
                  {t('screens.push-notifications-settings.system_description')}
                </BaseText>
              </View>
              <BaseSwitch disabled value={true} />
            </View>
            {topics?.map((topic) => {
              const translationKey = `screens.push-notifications-settings.description_${topic.id}`;
              const topicName = topic.name?.split('-')[0]?.trim();
              const translatedTopicName = translations[topicName] || topicName;
              return (
                <View style={styles.row} key={topic.id}>
                  <View style={styles.textWrap}>
                    <BaseText variant={BaseTextVariant.tag}>{translatedTopicName}</BaseText>
                    <BaseText style={styles.subTitle} variant={BaseTextVariant.caption}>
                      {i18n.exists(translationKey) ? t(translationKey) : topic.description}
                    </BaseText>
                  </View>
                  <BaseSwitch
                    value={!!topic.subscribed}
                    onChange={(value) => {
                      const dataList = topics.map((item: ITopics) => {
                        return {
                          ...item,
                          subscribed: item.id === topic.id ? value : item.subscribed
                        };
                      });
                      setTopics(dataList);
                    }}
                  />
                </View>
              );
            })}
          </View>
          {showConfirmButton && (
            <BaseButton
              label={t('screens.push-notifications-settings.confirm')}
              type={BaseButtonType.primary}
              style={styles.button}
              size={BaseButtonSize.large}
              loading={loading}
              onPress={setCustomerSettingsHandler}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PushNotificationsSettingsScreen;

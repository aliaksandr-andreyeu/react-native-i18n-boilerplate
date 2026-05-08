import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, StatusBar, useWindowDimensions, InteractionManager } from 'react-native';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseText, BaseTextVariant } from '@/components';
import { useChangeLanguageMutation, useGetSupportedLanguagesQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { IconSize, images } from '@/assets';
import BaseRadioButton, { BaseRadioButtonType } from '@/components/atoms/radio-button';
import { useTheme } from '@react-navigation/native';
import useStyles from './styles';
import { actions } from '@/store';
import CountryFlagIcon from '@/assets/icons/countries-flags';
import { LanguageItem } from '@/store/slices/application/types';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationLanguages = ({ onSubmit }: { onSubmit: () => void }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const {
    application: { openModal },
    portfolio: { setUserInfo }
  } = actions;

  const insets = useSafeAreaInsets();
  const { top = 0 } = insets || {};

  const windowDimensions = useWindowDimensions();
  const { height = 0 } = windowDimensions || {};

  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const profile = useAppSelector((store) => store.portfolio.userInfo);
  const [selectedLanguage, setSelectedLanguage] = useState(profile.language);
  const supportedLanguages = useAppSelector((store) => store.application.languages);
  const [getSupportedLanguages, { isLoading: getSupportedLanguagesLoading, isError: getSupportedLanguagesError }] =
    useGetSupportedLanguagesQuery();
  const [changeLanguage, { isLoading: changeLanguageLoading, isError: changeLanguageError, isSuccess }] =
    useChangeLanguageMutation();

  useEffect(() => {
    getSupportedLanguages();
  }, []);

  const selectedLanguageIndex = supportedLanguages.findIndex((item) => item.language == profile.language);

  useEffect(() => {
    if (flatListRef.current && selectedLanguageIndex >= 0) {
      flatListRef.current.scrollToIndex({
        index: selectedLanguageIndex,
        animated: true
      });
    }
  }, [selectedLanguageIndex]);

  useEffect(() => {
    if (!getSupportedLanguagesLoading && !changeLanguageLoading) {
      if (isSuccess) {
        updateProfileLanguage(selectedLanguage);
      }

      if (getSupportedLanguagesError || changeLanguageError) {
        showError();
      }
    }
  }, [isSuccess, getSupportedLanguagesError, changeLanguageError, getSupportedLanguagesLoading, changeLanguageLoading]);

  const onSelectLanguage = useCallback((language: string) => {
    setSelectedLanguage(language);
  }, []);

  const onSelectLanguageSubmit = useCallback(() => {
    changeLanguage({
      language: selectedLanguage
    });
  }, [selectedLanguage]);

  const updateProfileLanguage = useCallback((language: string) => {
    dispatch(
      setUserInfo({
        ...profile,
        language: language
      })
    );
    onSubmit();
  }, []);

  const showError = useCallback(() => {
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
    onSubmit();
  }, []);

  const onScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: info.index, animated: true });
      }
    }, 0);
  }, []);

  const renderItem = ({ item }: { item: LanguageItem }) => {
    const onSelectLanguageHandler = () => onSelectLanguage(item.language);
    return (
      <BaseRadioButton
        icon={<CountryFlagIcon name={item.language} />}
        type={BaseRadioButtonType.secondary}
        contentStyle={styles.radioStyle}
        isSelected={selectedLanguage == item.language}
        checkBoxWrapperStyle={IconSize.sm}
        label={item.name}
        onPress={onSelectLanguageHandler}
      />
    );
  };

  const keyExtractor = (item: LanguageItem, arrayIndex: number) => `${item.language}-${arrayIndex}s`;

  const maxHeight = height - top - (StatusBar.currentHeight || 0) - 24;

  return (
    <View
      style={[
        styles.container,
        {
          maxHeight
        }
      ]}
    >
      {getSupportedLanguagesLoading || changeLanguageLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator style={styles.loading} size={'large'} />
        </View>
      ) : (
        <>
          <View style={styles.content}>
            <BaseText variant={BaseTextVariant.captionSemiBold}>
              {t('screens.profile.selectNotificationsLanguage.headline')}
            </BaseText>
            <View style={styles.list}>
              <FlatList
                ref={flatListRef}
                data={supportedLanguages}
                onScrollToIndexFailed={onScrollToIndexFailed}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
          <BaseButton
            type={BaseButtonType.primary}
            size={BaseButtonSize.large}
            label={t('screens.profile.selectNotificationsLanguage.buttonTitle')}
            onPress={onSelectLanguageSubmit}
          />
        </>
      )}
    </View>
  );
};

export default NotificationLanguages;

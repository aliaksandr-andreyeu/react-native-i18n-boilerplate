import React, { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector, useBackHandler, useDateRange } from '@/hooks';
import { useLegalDocumentsQuery } from '@/store/api';
import { useNavigation, useTheme } from '@react-navigation/native';
import { FlatList, VirtualizedList, View, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStyles from './styles';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseText, BaseTextVariant, ProgressHeader } from '@/components';
import { actions } from '@/store';
import { getLegalRemoteDocumentFileURL } from '@/helpers/remoteFiles';
import { legalDocument, legalDocumentSections } from '@/store/slices/legal-documents/types';
import { useTranslation } from 'react-i18next';
import { LANG } from '@/localization';
import dayjs from 'dayjs';

const {
  application: { openModal }
} = actions;

const LegalDocumentsScreen: React.FC = () => {



  useBackHandler();

  const theme = useTheme();
  const styles = useStyles(theme);
  const navigation = useNavigation();


  const [getLegalDocuments, { isError, isLoading }] = useLegalDocumentsQuery();


  const data = useAppSelector((state) => state.legalDocuments.legalDocuments);
  const dispatch = useAppDispatch();



  const {
    t,
    i18n: { language }
  } = useTranslation();

  const handleDocuments = async () => {
    try {
      const documents = await getLegalDocuments(language as LANG);
      if (!documents.data?.length) getLegalDocuments('en' as LANG);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleDocuments();
  }, [language]);

  const getItemCount = useCallback((data: legalDocumentSections[]) => data.length, []);
  const getItem = useCallback((data: legalDocumentSections[], index: number) => data[index], []);

  const { addData, newData } = useDateRange();



  const filteredData = useMemo(() => {
    return data.map((item: any) => {
      const key = item?.title?.replace(/\s/g, '');
      const groupData = newData[`${key}.attributes`] ?? item?.data;
      return {
        ...item,
        data: groupData
      };
    });
  }, [newData, data]);


  useEffect(() => {
    if (!data?.length) return;
    data.forEach((group: any) => {
      const title = group?.title?.replace(/\s/g, '');
      addData(group.data, `${title}.attributes`);
    });
  }, [data])



  useEffect(() => {
    if (isError) {
      showErrorPopUp();
    }
  }, [isError]);

  const showErrorPopUp = useCallback(() => {
    dispatch(
      openModal({
        title: t('errors.modal-error-title'),
        subTitle: t('errors.modal-error-subtitle'),
        icon: images.depositError,
        iconSize: {
          width: 96,
          height: 90
        },
        button: {
          text: t('errors.modal-got-it'),
          onPress: () => navigation.canGoBack() && navigation.goBack()
        }
      })
    );
  }, []);


  const handleDocumentPress = useCallback(async (item: legalDocument) => {
    try {
      const fileURL = getLegalRemoteDocumentFileURL(item.attributes.documentFile.data.attributes.url);
      const canOpen = await Linking.canOpenURL(fileURL);
      if (canOpen) Linking.openURL(fileURL);
    } catch (error) {
      console.log(error);
      showErrorPopUp();
    }
  }, []);

  const renderItem = ({ item }: { item: legalDocument }) => (
    <TouchableOpacity onPress={() => handleDocumentPress(item)}>
      <View style={styles.document}>
        <SvgIcon name={SvgXmlIconNames.fileColored} size={IconSize.sm} />
        <BaseText key={item.attributes.id} variant={BaseTextVariant.small} style={styles.documentTitle}>
          {item.attributes.title}
        </BaseText>
      </View>
    </TouchableOpacity>
  );

  const renderSection = ({ item, index }: { item: legalDocumentSections; index: number }) => {
    if (!item?.data?.length) return null;

    return (
      <View style={index == data.length - 1 ? styles.lastSection : styles.section}>
        <View style={styles.list}>
          <FlatList
            key={item.title}
            data={item.data}
            renderItem={renderItem}
            keyExtractor={(subItem) => item.title + subItem.id}
            horizontal={false}
          />
        </View>
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.head}>
      <BaseText variant={BaseTextVariant.authSmall} style={styles.documentTitle}>
        {t('screens.legal-documents.headline')}
      </BaseText>
    </View>
  );

  if (isLoading)
    return <ActivityIndicator size='small' color={theme.palette.graphite['900']} style={styles.indicator} />;


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ProgressHeader
          style={styles.header}
          leftIconType={SvgXmlIconNames.arrowLeft}
          title={t('screens.legal-documents.header')}
          stepsCount={0}
          currentStep={0}
        />
        <VirtualizedList
          data={filteredData}
          ListHeaderComponent={renderListHeader}
          keyExtractor={(item, index) => item.title + index}
          renderItem={renderSection}
          getItem={getItem}
          getItemCount={getItemCount}
        />
      </View>
    </SafeAreaView>
  );
};

export default LegalDocumentsScreen;

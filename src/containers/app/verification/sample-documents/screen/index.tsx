import { SvgXmlIconNames } from '@/assets';
import {
  AnimatedDot,
  BaseBackButton,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseImage,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { config } from '@/constants';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { ParamListBase } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  SectionList,
  SectionListData,
  Modal,
  Pressable,
  ListRenderItemInfo,
  ViewToken
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks';
import { getCMSImageUrl } from '@/helpers';
import Animated, {
  FadeInLeft,
  FadeInUp,
  FadeOutDown,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { FlatList, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStyles from './styles';
import { MixpanelEventTypes, sampleDocumentMixpanel } from '@/helpers';

type SampleDocumentsScreenProps = StackScreenProps<
  ParamListBase & CommonRootParamsList,
  COMMON_ROUTE_NAMES.SampleDocuments
>;

interface DocumentTab {
  id: number;
  name: string;
}

interface SectionImageData {
  id: number;
  image: string | undefined;
  documentName: string;
  width: number;
  height: number;
  documentImageLabel?: string;
  documentCategory: string;
}

interface SectionData {
  title: string;
  data: SectionImageData[];
}

interface ListViewData {
  image: string | undefined;
  id: number;
  documentImageLabel: string | undefined;
  documentName: string;
  width: number;
  height: number;
}

const { isIOS, screenWidth, screenHeight } = config;

const translations: Record<string, string> = {
  'Proof of identity': 'proof-of-identity',
  'Proof of residence': 'proof-of-residence'
};

const AnimatedGestureFlatList = Animated.createAnimatedComponent<any>(FlatList);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const halfScreenWithPadding = (screenWidth - 52) / 2;
const translationPath = 'screens.document-samples.';
const SampleDocumentsScreen: React.FC<SampleDocumentsScreenProps> = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<number>(0);

  const viewedDocs = useRef<Record<string, number[]>>({});

  const storedTabData = useRef<Record<string, SectionData[]>>({});

  const storedMixpanelAction = useRef<Record<string, boolean>>({});

  const scroll = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scroll.value = event.contentOffset.x;
  });

  const { top, bottom } = useSafeAreaInsets();

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const sampleDocuments = useAppSelector((store) => store.legalDocuments.sampleDocuments);

  const trackActionMixpanel = (event: MixpanelEventTypes, category: string) => {
    if (!storedMixpanelAction.current[category]) {
      sampleDocumentMixpanel(event, category);
      storedMixpanelAction.current[category] = true;
    }
  };

  const translate = (key: string) => t(translationPath + key);

  const tabs = useMemo((): DocumentTab[] => {
    if (!sampleDocuments.length) return [];
    const tArray = [];
    const temp = new Set();
    for (let i = 0; i < sampleDocuments.length; i++) {
      const { documentCategory, id } = sampleDocuments[i];
      const has = temp.has(documentCategory);
      if (has) continue;
      temp.add(documentCategory);
      tArray.push({ id, name: documentCategory });
    }

    setCurrentTab(tArray?.[0]?.name || '');
    trackActionMixpanel(MixpanelEventTypes.DocumentSamplesViewed, tArray?.[0]?.name || '');
    return tArray;
  }, [sampleDocuments]);

  const currentTabDocumentImages = useMemo(() => {
    const currentData = sampleDocuments.filter((item) => item.documentCategory === currentTab) || [];

    return currentData;
  }, [currentTab, sampleDocuments]);

  const currentTabViewList = useMemo(() => {
    const list: ListViewData[] = [];

    for (let i = 0; i < currentTabDocumentImages.length; i++) {
      const { documentName, documentImage } = currentTabDocumentImages[i];
      for (let j = 0; j < documentImage.length; j++) {
        const {
          id,
          documentImageLabel,
          documentImageFile: {
            data: {
              attributes: {
                url,
                formats: {
                  thumbnail: { width, height }
                }
              }
            }
          }
        } = documentImage[j];
        const image = getCMSImageUrl(url);
        const obj: ListViewData = {
          image,
          id,
          documentImageLabel,
          documentName,
          width,
          height
        };
        list.push(obj);
      }
    }

    return list;
  }, [currentTabDocumentImages]);

  const sectionData = useMemo(() => {
    const storedData = storedTabData.current?.[currentTab];
    if (storedData && storedData.length) return storedData;

    const mapData = new Map<string, SectionData>();

    for (let i = 0; i < currentTabDocumentImages.length; i++) {
      const { documentName, documentImage, documentCategory } = currentTabDocumentImages[i];
      for (let j = 0; j < documentImage.length; j++) {
        const doc = documentImage[j];
        const {
          id,
          documentImageLabel,
          documentImageFile: {
            data: {
              attributes: {
                url,
                formats: {
                  thumbnail: { width, height }
                }
              }
            }
          }
        } = doc;
        const image = getCMSImageUrl(url);
        const obj: SectionImageData = {
          documentName,
          height,
          width,
          id,
          image,
          documentImageLabel,
          documentCategory
        };
        const hasDocumentName = mapData.get(documentName);
        if (hasDocumentName) hasDocumentName.data.push(obj);
        else mapData.set(documentName, { data: [obj], title: documentName });
      }
    }

    const data = [...mapData.values()];
    storedTabData.current[currentTab] ??= data;
    return data;
  }, [currentTabDocumentImages, currentTab]);

  const Tabs = useCallback(
    ({ documentTabs, active }: { documentTabs: DocumentTab[]; active: string }) => {
      return (
        <ScrollView
          horizontal
          style={isIOS ? undefined : styles.alignSelf}
          contentContainerStyle={styles.tabContent}
          showsHorizontalScrollIndicator={false}
        >
          {documentTabs.map((item) => {
            const name = item.name;
            const onPress = () => {
              setCurrentTab(name);
              trackActionMixpanel(MixpanelEventTypes.DocumentSamplesViewed, name || '');
            };
            const selected = active === name;
            const backgroundColor = selected ? theme.palette.graphite['900'] : theme.palette.base.white;
            const color = selected ? theme.palette.base.white : theme.palette.graphite['900'];
            return (
              <BaseButton
                type={BaseButtonType.primary}
                style={[styles.tabButtonStyle, { backgroundColor }]}
                labelStyle={{ color }}
                onPress={onPress}
                size={BaseButtonSize.extraSmall}
                key={`${item.id}-tab`}
                label={translate(translations[name])}
              />
            );
          })}
        </ScrollView>
      );
    },
    [theme.dark, t]
  );

  const GuideStep = useCallback(
    ({ desc, number }: { desc: string; number: number }) => {
      return (
        <Animated.View entering={FadeInLeft.delay(number * 120)} style={styles.ruleContainer}>
          <BaseText style={styles.blackText}>•</BaseText>
          <BaseText style={styles.textAlignLeft}>{desc}</BaseText>
        </Animated.View>
      );
    },
    [theme.dark]
  );

  const _renderItem = useCallback(() => null, []);

  const _renderHeader = useCallback(
    ({ section: { title } }: { section: SectionListData<SectionImageData, SectionData> }) => {
      return (
        <Animated.View key={title} entering={FadeInUp} exiting={FadeOutDown}>
          <BaseText variant={BaseTextVariant.titleXXS}>{title}</BaseText>
        </Animated.View>
      );
    },
    []
  );

  const _renderSectionFooter = useCallback(
    ({ section: { data, title } }: { section: SectionListData<SectionImageData, SectionData> }) => {
      return (
        <View key={`${title}-footer`} style={styles.sectionFooter}>
          {data.map((item) => {
            const { image: uri, height, width, id, documentCategory } = item;
            const heigthIsLarger = height > width;
            const onPress = () => {
              setModalVisible(id);
              sampleDocumentMixpanel(MixpanelEventTypes.DocumentSampleEnlarged, documentCategory);
            };
            return (
              <AnimatedPressable onPress={onPress} entering={FadeInUp} exiting={FadeOutDown} key={`${id}-${uri}-image`}>
                <BaseImage
                  source={{ uri }}
                  resizeMode='stretch'
                  style={{ width: halfScreenWithPadding, height: heigthIsLarger ? 224 : 97 }}
                />
              </AnimatedPressable>
            );
          })}
        </View>
      );
    },
    [theme.dark]
  );

  const ListViewDots = useCallback(
    ({ listLength }: { listLength: number }) => {
      const emptyArr = new Array(listLength).fill(null);
      return (
        <View style={styles.dotContainer}>
          {emptyArr.map((_, index) => {
            return (
              <AnimatedDot
                key={`${index}-dot`}
                inputRange={[index - 1, index, index + 1]}
                outputRange={[theme.palette.purple[200], theme.palette.green['400'], theme.palette.purple[200]]}
                maxWidth={screenWidth}
                dotStyle={styles.dotStyle}
                scroll={scroll}
              />
            );
          })}
        </View>
      );
    },
    [theme.dark, screenWidth]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: screenWidth, offset: screenWidth * index, index }),
    []
  );

  const _listKeyExtractor = useCallback(
    (item: ListViewData) => `${item.id}-${item.image}-${item.documentName}-list-image`,
    []
  );

  const _listRenderItem = useCallback(
    ({
      item: { height, width, image: uri, documentImageLabel, documentName, id }
    }: ListRenderItemInfo<ListViewData>) => {
      const heigthIsLarger = height > width;
      const title = `${documentName}${!!documentImageLabel?.length ? ` (${documentImageLabel})` : ''}`;
      const finalHeight = heigthIsLarger ? (screenHeight * 60) / 100 : (screenHeight * 26) / 100;
      return (
        <View style={styles.listItem}>
          <BaseText style={styles.docTitle} variant={BaseTextVariant.captionSemiBold}>
            {title}
          </BaseText>
          <ImageZoom
            resizeMode='stretch'
            style={[styles.imageZoom, { height: finalHeight }]}
            isPanEnabled
            isPinchEnabled
            uri={uri}
          />
        </View>
      );
    },
    [theme.dark]
  );

  const initialScroll = useMemo(
    () => currentTabViewList.findIndex((item) => item.id === modalVisible) || 0,
    [currentTabViewList, modalVisible]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken>; changed: Array<ViewToken> }) => {
      const category = viewableItems[0].item.category;
      let viewed = viewedDocs.current?.[category];
      if (viewed) {
        for (let i = 0; i < viewableItems.length; i++) {
          const view = viewableItems[i];
          if (view.index !== null) {
            if (viewed.includes(view.index)) continue;
            sampleDocumentMixpanel(MixpanelEventTypes.DocumentSampleEnlarged, view.item.documentCategory);
            viewedDocs.current[category] = [...viewed, view.index];
          }
        }
      } else {
        viewedDocs.current[category] = [];
        viewed = [];
        for (let i = 0; i < viewableItems.length; i++) {
          const view = viewableItems[i];
          if (view.index !== null) {
            if (viewed.includes(view.index)) continue;
            sampleDocumentMixpanel(MixpanelEventTypes.DocumentSampleEnlarged, view.item.documentCategory);
            viewed.push(view.index);
          }
        }
        viewedDocs.current[category] = viewed;
      }
    },
    []
  );

  const ListWithHoc = gestureHandlerRootHOC(() => {
    return (
      <AnimatedGestureFlatList
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={scrollHandler}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        pinchGestureEnabled
        horizontal
        data={currentTabViewList}
        keyExtractor={_listKeyExtractor}
        renderItem={_listRenderItem}
      />
    );
  });

  const _sectionKeyExtractor = useCallback((item: SectionImageData) => `${item.id}-doc`, []);

  const customBack = useCallback(() => {
    scroll.value = 0;
    setModalVisible(0);
  }, []);

  const onCloseModal = useCallback(() => setModalVisible(0), []);

  const verifyIdentity = useCallback(async () => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.pop(2);
      navigation.replace(COMMON_ROUTE_NAMES.Verification, { forIdentify: true });
    }
  }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <Modal
        statusBarTranslucent={true}
        visible={!!modalVisible}
        transparent
        animationType='fade'
        onRequestClose={onCloseModal}
      >
        <View style={[styles.modalContainer, { paddingTop: isIOS ? top : 40 }]}>
          <BaseBackButton
            color={theme.palette.base.white}
            customBack={customBack}
            containerStyle={styles.backButtonStyle}
            isClose={true}
          />
          <View style={styles.modalListCenter}>
            <ListWithHoc />
            <ListViewDots listLength={currentTabViewList.length || 0} />
          </View>
        </View>
      </Modal>
      <ProgressHeader
        leftIconType={SvgXmlIconNames.arrowLeft}
        currentStep={0}
        stepsCount={0}
        title={translate('header')}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.guideGeneral}>
          <View style={[styles.guideInfoContainer, styles.shadow]}>
            <View style={styles.stepsContainer}>
              <GuideStep number={1} desc={translate('guide-one')} />
              <GuideStep number={2} desc={translate('guide-two')} />
              <GuideStep number={3} desc={translate('guide-three')} />
              <GuideStep number={4} desc={translate('guide-four')} />
            </View>
          </View>
        </View>
        <View>
          <View style={styles.infoContainer}>
            <BaseText style={styles.grayText} variant={BaseTextVariant.small}>
              {translate('info')}
            </BaseText>
          </View>
          <Tabs documentTabs={tabs} active={currentTab} />
          <SectionList
            scrollEnabled={false}
            contentContainerStyle={styles.sectionContent}
            keyExtractor={_sectionKeyExtractor}
            renderSectionHeader={_renderHeader}
            renderSectionFooter={_renderSectionFooter}
            renderItem={_renderItem}
            sections={sectionData}
          />
        </View>
      </ScrollView>
      <View
        style={{
          paddingTop: 12,
          paddingBottom: 34,
          paddingHorizontal: 16,
          backgroundColor: 'rgba(247, 248, 250, 0.8)',
          position: 'absolute',
          bottom,
          width: '100%'
        }}
      >
        <BaseButton
          type={BaseButtonType.primary}
          fullWidth={true}
          size={BaseButtonSize.large}
          label={t('screens.verification.verify-identity')}
          onPress={verifyIdentity}
        />
      </View>
    </SafeAreaView>
  );
};

export default SampleDocumentsScreen;

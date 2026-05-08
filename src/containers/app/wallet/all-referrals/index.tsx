import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { View, Pressable, Modal, SectionList, SectionListData, SectionListRenderItemInfo } from 'react-native';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { ParamListBase, useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import {
  BaseText,
  BaseTextVariant,
  BaseBackButton,
  BaseCalendarButton,
  BaseDateSelector,
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseImage,
  BaseDivider,
  BaseReferralCard
} from '@/components';
import dateHelper from '@/helpers/dateHelper';
import dayjs from 'dayjs';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import useStyles from './styles';
import { config } from '@/constants';

const { screenWidth } = config;

type AllReferralsProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.AllReferrals>;

type RowItem = { id: number | string; name: string; earned: number; lots?: number; date: string; avatar?: string };

const AllReferrals: React.FC<AllReferralsProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dRange, setDRange] = useState<any>([null, null]);
  const [activeTab, setActiveTab] = useState<number>(0); // 0=Traded, 1=Verified Only, 2=Unverified

  // ---- Mock data with dates (replace with API) ----
  const todayISO = dateHelper.to(dayjs(), 'YYYY-MM-DD');
  const yesterdayISO = dateHelper.to(dayjs().subtract(1, 'day'), 'YYYY-MM-DD');
  const olderISO = dateHelper.to(dayjs().subtract(3, 'day'), 'YYYY-MM-DD');

  const tradedData: RowItem[] = [
    { id: 1, name: '#115872', lots: 6.2, earned: 18.4, date: todayISO, avatar: '' },
    { id: 2, name: '#127501', lots: 3.0, earned: 0.1, date: olderISO, avatar: '' },
    { id: 3, name: '#127501', lots: 3.0, earned: 0.75, date: olderISO, avatar: '' }
  ];

  const verifiedData: RowItem[] = [
    { id: 4, name: '#220001', lots: 0.0, earned: 0, date: todayISO, avatar: '' },
    { id: 5, name: '#220002', lots: 0.0, earned: 0, date: yesterdayISO }
  ];

  const unverifiedData: RowItem[] = [
    { id: 6, name: '#330001', lots: 0.0, earned: 0, date: yesterdayISO },
    { id: 7, name: '#330002', lots: 0.0, earned: 0, date: olderISO }
  ];

  const onDateButtonPress = useCallback(() => setIsDateOpen((p) => !p), []);
  const onRequestClose = () => setIsDateOpen(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      headerTitle: t('screens.all-referrals.title'),
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: styles.headerStyle,
      headerLeft: () => <BaseBackButton isChevron={false} />,
      headerRight: () => null
    });
  }, [navigation, route, styles, t]);

  const handleDateLabel = () => {
    const [start, end] = dRange;
    const firstDate = start && dateHelper.isValid(start) ? dateHelper.to(start, 'DD MMM YYYY') : null;
    const secondDate = end && dateHelper.isValid(end) ? dateHelper.to(end, 'DD MMM YYYY') : null;
    if (firstDate) return secondDate ? `${firstDate} - ${secondDate}` : firstDate;
    return t('components.date-picker.all-time'); // no filter label
  };

  const onConfirmDateRange = (range: any) => {
    setDRange([range[0] || null, range[1] || null]);
    setIsDateOpen(false);
  };

  const clearDate = () => setDRange([null, null]);
  const showClear = !!dRange[0] || !!dRange[1];

  const renderEmpty = useCallback(() => {
    return (
      <View style={styles.emptyList}>
        <BaseImage resizeMode='contain' style={styles.searchImg} source={images.search} />
        <BaseText style={styles.emptyText} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.all-referrals.empty')}
        </BaseText>
        <BaseText>{t('screens.all-referrals.empty-subtitle')}</BaseText>
      </View>
    );
  }, [styles, t]);

  const tabRoutes = [
    { index: 0, label: t('screens.all-referrals.tabs.all') },
    { index: 1, label: t('screens.all-referrals.tabs.verified') },
    { index: 2, label: t('screens.all-referrals.tabs.unverified') }
  ];

  // Choose base data per tab
  const baseData: RowItem[] = useMemo(() => {
    switch (activeTab) {
      case 0:
        return tradedData;
      case 1:
        return verifiedData;
      case 2:
        return unverifiedData;
      default:
        return [];
    }
  }, [activeTab]);

  // Optional: apply date range filter
  const filteredData: RowItem[] = useMemo(() => {
    const [start, end] = dRange;
    if (!start && !end) return baseData;

    const ts = (iso: string) => dateHelper.toStartUnix(iso); // start-of-day seconds
    const startTs = start ? dateHelper.toStartUnix(start) : -Infinity;
    const endTs = end ? dateHelper.toEndUnix(end) : Infinity;

    return baseData.filter((it) => {
      const v = ts(it.date);
      return v >= startTs && v <= endTs;
    });
  }, [baseData, dRange]);

  // Build SectionList sections grouped by date
  const sections = useMemo(() => {
    const groups: Record<string, RowItem[]> = {};
    filteredData.forEach((it) => {
      if (!groups[it.date]) groups[it.date] = [];
      groups[it.date].push(it);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => dateHelper.toStartUnix(b) - dateHelper.toStartUnix(a));

    const toLabel = (iso: string) => {
      if (iso === todayISO) return 'Today';
      if (iso === yesterdayISO) return 'Yesterday';
      return dateHelper.to(iso, 'D MMMM YYYY');
    };

    return sortedDates.map((iso) => ({
      title: toLabel(iso),
      data: groups[iso]
    }));
  }, [filteredData, t, todayISO, yesterdayISO]);

  const keyExtractor = useCallback((item: RowItem) => String(item.id), []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<RowItem> }) => (
      <BaseText style={styles.dateText} variant={BaseTextVariant.captionSemiBold}>
        {section.title}
      </BaseText>
    ),
    []
  );

  const renderItem = useCallback(
    ({ section, index }: SectionListRenderItemInfo<RowItem>) => {
      if (index !== 0) return null;
      const items = section.data as RowItem[];

      return (
        <>
          <View style={styles.sectionBox}>
            {items.map((item, i) => (
              <>
                <BaseReferralCard
                  onPress={() => navigation.navigate(ROOT_ROUTE_NAMES.SingleReferral)}
                  index={i}
                  key={`${item.id}-${i}`}
                  title={item.name}
                  avatar={item.avatar}
                  subTitle={'6.2 lots'}
                  amount='+$18.40'
                />
                {items.length - 1 === i || <View style={styles.separator} />}
              </>
            ))}
          </View>
          <BaseDivider />
        </>
      );
    },
    [styles, screenWidth]
  );

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <BaseText variant={BaseTextVariant.h1Bold}>$100.73</BaseText>
        <BaseText variant={BaseTextVariant.small} style={styles.description}>
          {t('screens.all-referrals.subtitle')}
        </BaseText>
      </View>

      <View style={styles.dateSelectContainer}>
        <View style={styles.dateSelect}>
          <BaseText style={styles.blueText}>{handleDateLabel()}</BaseText>
          {showClear && (
            <Pressable hitSlop={8} onPress={clearDate}>
              <SvgIcon
                style={{ top: 1 }}
                name={SvgXmlIconNames.close}
                size={IconSize.xxs}
                color={theme.palette.blue[500]}
              />
            </Pressable>
          )}
        </View>
        <BaseCalendarButton onPress={onDateButtonPress} />
      </View>

      <View style={styles.tabsContainer}>
        {tabRoutes.map((tab) => {
          const selected = activeTab === tab.index;
          return (
            <BaseButton
              key={tab.index}
              type={BaseButtonType.primary}
              size={BaseButtonSize.extraSmall}
              style={[styles.tabButton, { backgroundColor: selected ? '#269B56' : theme.palette.base.white }]}
              numberOfLines={1}
              labelStyle={{
                ...styles.btnLabel,
                color: selected ? theme.palette.base.white : theme.palette.graphite['900']
              }}
              onPress={() => setActiveTab(tab.index)}
              label={tab.label}
            />
          );
        })}
      </View>
      <SectionList
        sections={sections as unknown as SectionListData<RowItem>[]}
        keyExtractor={keyExtractor}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.4}
        // onEndReached={() => {
        //   // Wire your pagination here PER TAB if needed
        //   // e.g., if (activeTab === 0) loadMoreTraded();
        // }}
      />

      <Modal animationType='fade' transparent={true} visible={isDateOpen} onRequestClose={onRequestClose}>
        <BaseDateSelector onClose={onRequestClose} onConfirmPress={onConfirmDateRange} currentDateRange={dRange} />
      </Modal>
    </View>
  );
};

export default AllReferrals;

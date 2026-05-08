import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  SectionList,
  SafeAreaView,
  SectionListRenderItemInfo,
  SectionListData
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseCalendarButton,
  BaseDateSelector,
  BaseImage,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import dateHelper from '@/helpers/dateHelper';
import { useCommonStyles } from '@/hooks';
import { buildSections, formatTwoDecimals } from '@/helpers';
import { MyRewardDetail } from '../../components';
import { useTranslation } from 'react-i18next';

type ReferralRewardsScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.ReferralRewards>;

type DummyData = {
  assetName: string;
  date: string;
  id: string;
  type: string;
  price: string;
  lot: string;
};

const { screenWidth } = config;

function generateGroupedDummyData(groups: number[]): DummyData[] {
  const assetNames = ['BTC', 'ETH', 'AAPL', 'TSLA', 'GOOG', 'AMZN', 'MSFT', 'XRP', 'SOL', 'NVDA'];
  const types = ['Standard', 'UnKnown'];
  const data: DummyData[] = [];

  groups.forEach((groupSize) => {
    const date = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString();

    for (let i = 0; i < groupSize; i++) {
      const assetName = assetNames[Math.floor(Math.random() * assetNames.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const price = (Math.random() * 1000 + 10).toFixed(2);
      const lot = (Math.random() * 10 + 1).toFixed(2);
      const id = String(Math.floor(10000 + Math.random() * 90000));

      data.push({
        assetName,
        date,
        id,
        type,
        price,
        lot
      });
    }
  });

  return data;
}

const ReferralRewardsScreen: React.FC<ReferralRewardsScreenProps> = ({}) => {
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<any[]>([]);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const onRequestClose = useCallback(() => setIsDateOpen(false), []);

  const setDRange = useCallback((d: any) => {
    setDateRange(d);
    setIsDateOpen(false);
  }, []);

  const shownDate = useMemo(() => {
    if (!dateRange.length) return t('components.date-picker.all-time');
    const firstDate = dateHelper.isValid(dateRange[0]) && dateHelper.to(dateRange[0], 'DD MMM YYYY');
    const secondDate = dateHelper.isValid(dateRange[1]) && dateHelper.to(dateRange[1], 'DD MMM YYYY');
    if (firstDate) {
      if (secondDate) return `${firstDate} - ${secondDate}`;
      return firstDate;
    }
    return t('components.date-picker.all-time');
  }, [dateRange, t]);

  const isClearable = useMemo(() => dateRange.length > 0, [dateRange]);

  const onDateButtonPress = useCallback(() => setIsDateOpen((p) => !p), []);

  const onClearDate = useCallback(() => setDateRange([]), []);

  const dummySections = useMemo(() => generateGroupedDummyData([3, 5, 7, 6, 5, 3, 4]), []);

  const sections = useMemo(() => buildSections(dummySections, dateRange), [dummySections, dateRange]);

  const Seperator = useMemo(() => {
    return (
      <View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </View>
    );
  }, [theme.dark]);

  const SeperatorComponent = useCallback(
    ({ leadingItem, section }: any) => {
      if (!sections.length) return null;
      const sectionIndex = sections.findIndex((s) => s.key === section.key);
      const isLastSection = sectionIndex === sections.length - 1;

      if (leadingItem && !isLastSection) return Seperator;
      return null;
    },
    [theme.dark, sections]
  );

  const _renderItem = useCallback(
    ({ item, index, section }: SectionListRenderItemInfo<DummyData>) => {
      const isFirst = index === 0;
      const isLast = index === section.data.length - 1;
      return (
        <View style={[styles.cardRow, isFirst && styles.cardTop, isLast && styles.cardBottom]}>
          <MyRewardDetail assetName={item.assetName} date={item.date} price={item.price} lot={item.lot} />
          {!isLast && <View style={styles.cardSeparator} />}
        </View>
      );
    },
    [theme.dark]
  );

  const _renderTitle = useCallback(
    ({ section }: SectionListData<any, any>) => {
      return (
        <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.sectionTitle}>
          {section.title}
        </BaseText>
      );
    },
    [theme.dark]
  );

  const _keyExtractor = useCallback((item: DummyData, index: number) => `${item.id}-${index}`, []);

  const _listEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyTop}>
        <BaseImage style={styles.img} source={images.search} />
        <BaseText variant={BaseTextVariant.captionSemiBold}>
          {dateRange.length > 0
            ? t('screens.referral-rewards.no-rewards')
            : t('screens.referral-rewards.no-rewards-yet')}
        </BaseText>
      </View>
    );
  }, [theme.dark, t, dateRange]);

  const listIsEmpty = useMemo(() => {
    if (!sections.length) return true;
    const sectionsArrayLengthAreEmpty = sections.every((item) => item.data.length === 0);
    return sectionsArrayLengthAreEmpty;
  }, [sections]);

  const currentEarning = useMemo(() => {
    if (!sections.length) return 0;
    let sum = 0;
    for (const section of sections) {
      for (const item of section.data) {
        sum += +item.price;
      }
    }
    return sum.toFixed(2);
  }, [sections]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressHeader
          title={t('screens.referral-rewards.title')}
          hideProgressBar
          currentStep={0}
          stepsCount={0}
          leftIconType={SvgXmlIconNames.arrowLeft}
        />
        {listIsEmpty || (
          <View style={styles.header}>
            <BaseText variant={BaseTextVariant.title}>${formatTwoDecimals(currentEarning)}</BaseText>
            <BaseText style={styles.grayText} variant={BaseTextVariant.small}>
              {t('screens.referral-rewards.referral-earnings')}
            </BaseText>
          </View>
        )}
        <View style={styles.dateContainer}>
          <View style={styles.shownDateContainer}>
            <BaseText style={styles.date}>{shownDate}</BaseText>
            {isClearable && (
              <Pressable hitSlop={8} onPress={onClearDate}>
                <SvgIcon
                  style={styles.icon}
                  name={SvgXmlIconNames.close}
                  size={IconSize.xxs}
                  color={theme.palette.icon.base.strong}
                />
              </Pressable>
            )}
          </View>
          <BaseCalendarButton onPress={onDateButtonPress} />
        </View>
        <Modal animationType='fade' transparent={true} visible={isDateOpen} onRequestClose={onRequestClose}>
          <BaseDateSelector onClose={onRequestClose} onConfirmPress={setDRange} currentDateRange={dateRange as any} />
        </Modal>
        <SectionList
          sections={sections}
          ListEmptyComponent={_listEmptyComponent}
          style={styles.list}
          keyExtractor={_keyExtractor}
          renderSectionHeader={_renderTitle}
          renderItem={_renderItem}
          SectionSeparatorComponent={SeperatorComponent}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
        {listIsEmpty && (
          <BaseButton
            type={BaseButtonType.primary}
            size={BaseButtonSize.large}
            style={styles.inviteBtn}
            label={t('screens.referral-rewards.invite-friends')}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base, text }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flex: 1
    },
    container: {
      flex: 1
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8
    },
    inviteBtn: {
      marginHorizontal: 20,
      bottom: 34
    },
    emptyContainer: {
      justifyContent: 'space-between'
    },
    emptyTop: {
      top: 12,
      gap: 16,
      alignItems: 'center'
    },
    img: {
      width: 90,
      height: 90
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20
    },
    shownDateContainer: { gap: 8, flexDirection: 'row', alignItems: 'center' },
    icon: { top: 1 },
    date: { color: text.interaction.basic.accent.default },
    list: {
      marginTop: 12
    },
    listContent: {
      paddingBottom: 100
    },
    sectionTitle: {
      marginHorizontal: 20,
      marginBottom: 16
    },
    cardRow: {
      backgroundColor: base.white,
      marginHorizontal: 20,
      ...shadow6Style
    },
    cardSeparator: {
      height: 0.6,
      backgroundColor: '#D9E1E4',
      marginLeft: 16,
      marginRight: 16
    },
    cardTop: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 12
    },
    cardBottom: {
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      paddingBottom: 12
    },
    seperatorContainer: {
      width: screenWidth,
      height: 44,
      backgroundColor: '#E1DFE5',
      gap: 8
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
    grayText: {
      color: text.title.secondary
    }
  });
};

export default ReferralRewardsScreen;

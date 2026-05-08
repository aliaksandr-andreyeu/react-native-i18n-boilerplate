import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BaseCalendarButton,
  BaseDateSelector,
  BaseImage,
  BaseText,
  BaseTextVariant,
  ProgressHeader
} from '@/components';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import dateHelper from '@/helpers/dateHelper';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { useCommonStyles } from '@/hooks';
import { BaseReferralCard } from '../../components';
import Pagination from '@cherry-soft/react-native-basic-pagination';
import dayjs from 'dayjs';
import { filterItemsByDate, formatTwoDecimals } from '@/helpers';

type SingleReferalScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.SingleReferral>;

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const totalItems = 50;
const itemsPerPage = 5;
const lastPage = totalItems / itemsPerPage;

type Item = {
  assetName: string;
  date: string;
  earning: number;
  lot: string;
  key: string;
};

export function generateItems(count: number): Item[] {
  const assets = ['13123', '23423', '93128', '09213', '04523'];
  const items: Item[] = [];

  for (let i = 0; i < count; i++) {
    const assetName = `#${assets[Math.floor(Math.random() * assets.length)]}`;

    const dateObj = dayjs()
      .subtract(Math.floor(Math.random() * 30), 'day')
      .hour(Math.floor(Math.random() * 24))
      .minute(Math.floor(Math.random() * 60));
    const date = dateObj.format('DD.MM.YY [·] HH:mm');

    const earningValue = Math.random() * 10;
    const earning = earningValue;

    const lotValue = (Math.random() * 2 + 0.01).toFixed(2);
    const lot = `${lotValue} lot`;

    items.push({
      assetName,
      date,
      earning,
      lot,
      key: `${i}-referral`
    });
  }

  return items;
}

const SingleReferalScreen: React.FC<SingleReferalScreenProps> = ({}) => {
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const onRequestClose = useCallback(() => setIsDateOpen(false), []);

  const setDRange = useCallback((d: any) => {
    setPage(1);
    setDateRange(d);
    setIsDateOpen(false);
  }, []);

  const isClearable = useMemo(() => dateRange.length > 0, [dateRange]);

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

  const onDateButtonPress = useCallback(() => setIsDateOpen((p) => !p), []);

  const onClearDate = useCallback(() => setDateRange([]), []);

  const generatedItems = useMemo(() => generateItems(totalItems), []);

  const filteredItems = useMemo(() => filterItemsByDate(generatedItems, ...dateRange), [generatedItems, dateRange]);

  const referrals = useMemo(() => {
    return filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [page, filteredItems]);

  const totalEarnings = useMemo(() => filteredItems.reduce((acc, curr) => (acc += curr.earning), 0), [filteredItems]);

  const InfoContainer = useCallback(
    ({ field, value, canCopy }: { canCopy?: boolean; field: string; value: string }) => {
      const onCopyPress = () => Clipboard.setString(`${value}`);

      return (
        <View style={styles.infoRow}>
          <BaseText style={styles.rowTitle} variant={BaseTextVariant.small}>
            {field}
          </BaseText>
          <View style={styles.infoRight}>
            <BaseText style={styles.rowDescription} variant={BaseTextVariant.small}>
              {value}
            </BaseText>
            {canCopy && (
              <TouchableOpacity activeOpacity={activeOpacity} hitSlop={hitSlop} onPress={onCopyPress}>
                <SvgIcon color={theme.palette.icon.base.strong} name={SvgXmlIconNames.copy} size={IconSize.xsm} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [theme.dark]
  );

  const disabled = useMemo(() => {
    switch (page) {
      case 1:
        return 'left';

      case lastPage:
        return 'right';

      default:
        return undefined;
    }
  }, [page]);

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader
        title={t('screens.single-referral.title')}
        hideProgressBar
        currentStep={0}
        stepsCount={0}
        leftIconType={SvgXmlIconNames.arrowLeft}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topContainer}>
          <View style={styles.topTextContainer}>
            <BaseText variant={BaseTextVariant.h1__SG}>${formatTwoDecimals(totalEarnings?.toFixed(2))}</BaseText>
            <SvgIcon name={SvgXmlIconNames.person} size={{ width: 20, height: 20 }} />
          </View>
          <BaseText style={styles.grayText1} variant={BaseTextVariant.referralEarnings}>
            {t('screens.single-referral.referral-earnings')}
          </BaseText>
        </View>
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
        <View style={[styles.infoContainer, styles.gap12]}>
          <InfoContainer field='ID' value='#115872' canCopy />
          <InfoContainer field={t('screens.single-referral.lots-traded')} value='34' />
          <InfoContainer field={t('screens.single-referral.status')} value='Traded' />
          <InfoContainer field={t('screens.single-referral.registered')} value='05 May 2024' />
        </View>
        {!!referrals.length && (
          <View style={styles.tradesContainer}>
            {referrals.map((props, index) => (
              <BaseReferralCard {...props} isLastItem={index === referrals.length - 1} />
            ))}
          </View>
        )}
      </ScrollView>
      {/* <Pagination
        pagesToDisplay={3}
        textStyle={styles.txt}
        btnStyle={styles.btn}
        containerStyle={styles.paginationContainer}
        totalItems={filteredItems?.length || 0}
        pageSize={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        activeBtnStyle={styles.activeBtn}
        activeTextStyle={styles.activeText}
        disabled={disabled}
      /> */}
    </SafeAreaView>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { text, background, border }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flex: 1
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 8
    },
    shownDateContainer: { gap: 8, flexDirection: 'row', alignItems: 'center' },
    icon: { top: 1 },
    date: { color: text.interaction.basic.accent.default },
    topContainer: {
      rowGap: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      paddingRight: 25
    },
    topTextContainer: {
      flexDirection: 'row',
      flex: 1,
      gap: 8,
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    img: {
      borderRadius: 24,
      width: 32,
      height: 32
    },
    imgContainer: {
      padding: 8
    },
    grayText1: {
      color: theme.palette.graphite[600]
    },
    grayText2: {
      color: '#6E7783'
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    infoRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    infoContainer: {
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: background.card.primary,
      marginHorizontal: 20,
      ...shadow6Style
    },
    tradesContainer: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: background.card.primary,
      marginHorizontal: 20,
      ...shadow6Style
    },
    gap12: {
      marginBottom: 8
    },
    content: {
      paddingBottom: 12
    },
    txt: {
      ...BaseTextVariant.titleXXS,
      color: text.base.primary
    },
    paginationContainer: {
      gap: 8,
      marginVertical: 0,
      paddingVertical: 0,
      paddingBottom: 0,
      paddingTop: 12,
      marginBottom: 20,
      marginTop: 0
    },
    btn: {
      width: 32,
      height: 32,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: border.base.divider,
      backgroundColor: background.card.primary,
      paddingHorizontal: 0,
      paddingVertical: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    activeBtn: {
      borderColor: border.interaction.input
    },
    activeText: {
      color: text.interaction.basic.accent.default
    },
    greenText: {
      color: '#269B56'
    },
    rowTitle: {
      color: theme.palette.graphite[900]
    },
    rowDescription: {
      color: theme.palette.graphite[600]
    }
  });
};

export default SingleReferalScreen;

import {
  BaseBackButton,
  BaseCalendarButton,
  BaseDateSelector,
  BaseImage,
  BasePortfolioEmptyContainer,
  BaseText,
  BaseTextVariant
} from '@/components';
import { RootRootParamsList, ROOT_ROUTE_NAMES } from '@/navigation/app';
import { ParamListBase, useTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Modal,
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  TouchableOpacity,
  View
} from 'react-native';
import { ERewardType, RecentRewardsHistoryDataItem, RewardsHistoryData } from '..';
import { useStyles } from './styles';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import moment from 'moment';
import GroupBar from '@/components/atoms/group-bar';
import { useAppSelector } from '@/hooks';
import type { DateRange } from '../../recent-activity';
import { useTranslation } from 'react-i18next';
import { config } from '@/constants';
import dateHelper from '@/helpers/dateHelper';

type RewardsScreenData = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.RecentRewards>;

interface IRecentRewardsListProps extends RewardsScreenData {
  data: RewardsHistoryData[];
  dataToGroupBar: { name: string; label: string }[];
  changeActiveItem: (itemName: string) => void;
  activeItem?: string;
  dateRange: DateRange;
  setDateRange: (range: any) => void;
}

const RecentRewardsScreen: FC<IRecentRewardsListProps> = ({
  route,
  navigation,
  data,
  dataToGroupBar,
  activeItem,
  changeActiveItem,
  dateRange,
  setDateRange
}) => {
  const styles = useStyles();

  const {
    t,
    i18n: { language }
  } = useTranslation();
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const { palette } = useTheme();

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { registrationDate } = userInfo || {};

  const {
    components: {
      buttons: { activeOpacity, hitSlop }
    }
  } = config;

  const EmptyDataComponent = useCallback(() => {
    const firstDate = dateRange[0];

    return (
      <View style={[styles.emptyBox, !firstDate && { paddingHorizontal: 0 }]}>
        <View style={styles.emptyTextBox}>
          {firstDate ? (
            <>
              <BaseImage source={images.search} style={styles.emptyImg} />
              <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.textAlign}>
                {t('screens.recent-activity.no-activity')}
              </BaseText>
              <BaseText style={styles.textAlign}>{t('screens.recent-activity.change-filters')}</BaseText>
            </>
          ) : (
            <BasePortfolioEmptyContainer
              showButton
              style={{ top: '50%' }}
              buttonText={t('screens.recent-activity.make-deposit')}
              title={t('screens.recent-activity.no-transaction')}
              onPress={() => null}
              subTitle={t('screens.recent-activity.start-deposit')}
            />
          )}
        </View>
      </View>
    );
  }, [t, styles, dateRange]);

  const _renderHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <View>
        <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.headerTitle}>
          {title}
        </BaseText>
      </View>
    ),
    []
  );

  const choseIcon = (type: ERewardType) => {
    let name = '';
    switch (type) {
      case ERewardType.CASHBACK:
        name = SvgXmlIconNames.money;
        break;
      case ERewardType.REFERRAL:
        name = SvgXmlIconNames.people;
        break;
      case ERewardType.STANDARD:
        name = SvgXmlIconNames.gift;
        break;
      default:
        name = SvgXmlIconNames.money;
    }
    return <SvgIcon size={{ width: 20, height: 20 }} name={name as SvgXmlIconNames} />;
  };

  const formatDate = (date: string | Date) => {
    const momentDate = moment(date);
    const formattedDate = momentDate.clone().format('DD.MM.YY');
    const formattedTime = momentDate.clone().format('HH:mm');
    return { formattedDate, formattedTime };
  };

  const _renderItem = useCallback(
    ({ item, index }: SectionListRenderItemInfo<{ items: RecentRewardsHistoryDataItem[] }, RewardsHistoryData>) => (
      <View style={[styles.container, index !== item.items.length - 1 && { marginBottom: 16 }]}>
        {item.items.map((el, i) => (
          <View key={el.id} style={[styles.itemWrapper, i !== item.items.length - 1 && styles.itemWithBorder]}>
            <View style={styles.iconWrapper}>{choseIcon(el.type)}</View>
            <View style={styles.textContentWrapper}>
              <BaseText style={styles.title} variant={BaseTextVariant.titleXXS}>
                {el.title}
              </BaseText>
              <BaseText variant={BaseTextVariant.extraSmallSemiBold} style={styles.description}>
                {[formatDate(el.date).formattedDate, formatDate(el.date).formattedTime, el.type].join(' · ')}
              </BaseText>
            </View>
            <View style={styles.valueWrapper}>
              <BaseText variant={BaseTextVariant.text} style={styles.value}>
                +${el.value}
              </BaseText>
            </View>
          </View>
        ))}
      </View>
    ),
    []
  );

  const onRequestClose = () => setIsDateOpen(false);

  const setDRange = (d: any) => {
    setDateRange(d);
    setIsDateOpen(false);
  };

  const clearDateRange = useCallback(() => {
    setDateRange([]);
  }, [setDateRange]);

  const isClearable = useMemo(() => dateRange.length > 0, [dateRange]);

  const handleDate = () => {
    if (!dateRange.length) return t('components.date-picker.all-time');
    const firstDate = dateHelper.isValid(dateRange[0]) && dateHelper.to(dateRange[0], 'DD MMM YYYY');
    const secondDate = dateHelper.isValid(dateRange[1]) && dateHelper.to(dateRange[1], 'DD MMM YYYY');
    if (firstDate) {
      if (secondDate) return `${firstDate} - ${secondDate}`;
      return firstDate;
    }
    return t('components.date-picker.all-time');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => <BaseBackButton isChevron={false} />,
      headerStyle: { backgroundColor: 'transparent' },
      headerShadowVisible: false
    });
  }, [route, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [route, navigation]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.box}>
        <BaseText style={styles.primaryText} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.recent-rewards.title')}
        </BaseText>
      </View>
      <View style={styles.datePickerBox}>
        <View style={styles.datePickerDate}>
          <BaseText style={styles.datePickerDateText}>{handleDate()}</BaseText>
          {isClearable && (
            <TouchableOpacity
              style={styles.datePickerDateBtn}
              activeOpacity={activeOpacity}
              hitSlop={hitSlop}
              onPress={() => clearDateRange()}
            >
              <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} color={palette.purple['500']} />
            </TouchableOpacity>
          )}
        </View>
        <BaseCalendarButton
          onPress={() => {
            setIsDateOpen(true);
          }}
        />
      </View>
      <GroupBar data={dataToGroupBar} activeItem={activeItem} changeActiveItem={changeActiveItem} />
      <SectionList
        contentContainerStyle={styles.rewardsWrapper}
        sections={data as SectionListData<RecentRewardsHistoryDataItem, RewardsHistoryData[]>}
        ListEmptyComponent={EmptyDataComponent}
        renderItem={_renderItem as any}
        renderSectionHeader={_renderHeader}
      />
      <Modal animationType='fade' transparent={true} visible={isDateOpen} onRequestClose={onRequestClose}>
        <BaseDateSelector
          onClose={onRequestClose}
          onConfirmPress={setDRange}
          currentDateRange={dateRange}
          minDate={registrationDate ? moment(registrationDate).format('YYYY-MM-DD') : undefined}
        />
      </Modal>
    </View>
  );
};
export default RecentRewardsScreen;

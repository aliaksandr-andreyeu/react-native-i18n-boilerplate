import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, SectionList, View } from 'react-native';
import {
  AUTH_ROUTE_NAMES,
  COMMON_ROUTE_NAMES,
  PORTFOLIO_ROUTE_NAMES,
  PortfolioRootParamsList,
  PULSEAI_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { ParamListBase, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';
import { useStyles } from './styles';
import { useGetDealsInfoQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { DealData, DealsInfo } from '@/store/slices/portfolio/types';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import {
  BaseButtonType,
  BaseDealCard,
  BasePortfolioEmptyContainer,
  BaseText,
  BaseTextVariant,
  BaseTradingBanner
} from '@/components';
import { actions } from '@/store';
import dateHelper from '@/helpers/dateHelper';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { images } from '@/assets';
import { useTranslation } from 'react-i18next';
import { useWelcomeBonusAvailability } from '@/hooks/custom';
import { testIDs } from '@/constants';

type HistoryScreenProps = StackScreenProps<ParamListBase & PortfolioRootParamsList, PORTFOLIO_ROUTE_NAMES.History>;

const _keyExtractor = (item: DealsInfo & ParsedTradingAssets) => `${item.ticket}-list-item`;

const {
  portfolio: { resetDealsInfo, setHasLastDeal }
} = actions;

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isFirst = useRef<boolean>(true);
  const page = useRef<number>(1);
  const lastRequestRef = useRef<{ abort: () => void }>();
  const [balanceLive, setBalanceLive] = useState({ equity: 0 });

  const [getDealsInfo, { originalArgs, isFetching, data }] = useGetDealsInfoQuery();

  const { isWelcomeBonusAvailable, promoBonus } = useWelcomeBonusAvailability();

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const application = useAppSelector((state) => state.application);
  const { promoWelcome } = application || {};
  const { welcomeAccountTypeId } = promoWelcome || {};

  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);
  const dealsInfo =
    (useAppSelector((store) => store.portfolio.dealsSorted) as (DealData & ParsedTradingAssets)[]) || [];
  const dateRange = useAppSelector((store) => store.portfolio.dateRange);
  const userInfo = useAppSelector((store) => store.portfolio.userInfo);
  const hasLastDeal = useAppSelector((store) => store.portfolio.hasLastDeal);
  const tradingAccounts = useAppSelector((state) => state.wallet.tradingAccounts);

  const isDeposit = !!userInfo.firstDepositDate;
  const isFund = !!userInfo.lastTradedAt;
  const showGuideline = !isDeposit || !isFund;

  const emptyText = useMemo((): { title: string; subTitle: string; started: boolean } => {
    if (!isDeposit || !isFund)
      return {
        title: t('screens.portfolio.no-data.title'),
        subTitle: t('screens.portfolio.no-data.subTitle'),
        started: false
      };

    return { title: '', subTitle: '', started: true };
  }, [isDeposit, isFund, t]);

  const hasNextPage = useMemo(() => {
    if (data?.length === 0) return false;
    if (page.current === 1 || !isFetching) return true;
    return false;
  }, [originalArgs?.page, dateRange[0], dateRange[1], isFetching, page.current, data?.length]);

  const getDealsData = (p: number = 0, account?: number | undefined, hasLast: boolean | undefined = undefined) => {
    if (page.current >= 2 && dealsInfo.length === 0) return;
    if (hasLast === undefined) {
      if (!hasNextPage || !selectedAccount || !hasLastDeal) return;
    }
    const dateStart = dateRange[0];
    const dateEnd = !!dateRange[1]?.length ? dateRange[1] : dateRange[0];

    const userAccount = account || selectedAccount;

    if (!userAccount) {
      return;
    }

    if (userInfo.id) {
      lastRequestRef.current = getDealsInfo({
        userId: userInfo.id,
        accountId: account || selectedAccount,
        from: dateHelper.toStartUnix(dateStart),
        to: dateHelper.toEndUnix(dateEnd),
        page: p || page.current,
        recordsPerPage: 50
      });
    }

    if (p) page.current = 2;
    else page.current++;
  };

  const reset = (account?: number | undefined) => {
    if (lastRequestRef.current) lastRequestRef.current?.abort?.();
    page.current = 1;
    dispatch(setHasLastDeal(true));
    dispatch(resetDealsInfo());
    getDealsData(1, account, true);
  };

  const theme = useTheme();
  const styles = useStyles(theme);

  const onEndReached = () => {
    getDealsData(0, selectedAccount as number);
  };

  useFocusEffect(
    useCallback(() => {
      if (!isFirst.current && dateRange[0]) {
        reset(undefined);
      } else isFirst.current = false;
    }, [dateRange[0], dateRange[1], selectedAccount, userInfo.id])
  );

  useLayoutEffect(() => {
    if (tradingAccounts && tradingAccounts.length === 0) {
      return;
    }

    const equity = tradingAccounts
      .filter((account) => account.typeId !== welcomeAccountTypeId)
      .reduce((acc, current) => {
        const { equity: currentEquity = 0 } = current || {};
        return acc + currentEquity;
      }, 0);

    setBalanceLive(() => ({ equity }));
  }, [tradingAccounts]);

  const _renderItem = useCallback(({ item }: { item: DealsInfo & ParsedTradingAssets }) => {
    const onItemPress = (ticket: number) => {
      navigation.navigate(ROOT_ROUTE_NAMES.PositionInfo, {
        positionTicket: ticket,
        title: item.symbol,
        isPosition: true,
        isClosed: true
      });
    };

    return <BaseDealCard testID={testIDs.portfolio.history.dealCard(item.ticket)} onDealPress={onItemPress} data={item} />;
  }, []);

  const _renderHeader = useCallback(({ section: { title } }: { section: { title: string } }) => {
    return <BaseText testID={testIDs.portfolio.history.seectionHeaderText(title)} variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>;
  }, []);

  const Seperator = useCallback(() => {
    return (
      <View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </View>
    );
  }, [theme.dark]);

  const ListFooterComponent = useCallback(() => {
    if (isFetching)
      return <ActivityIndicator testID={testIDs.portfolio.history.indicator} style={styles.loader} color={theme.palette.graphite['900']} size={'large'} />;
    return null;
  }, [isFetching, theme.dark]);

  const renderGuideline = useCallback(() => {
    let guidelineData = {
      bannerSubTitle: '',
      bannerButtonText: '',
      bannerImageStyle: {},
      bannerImage: images.safe,
      onPress: () => { }
    };
    if (!isAuthorized) {
      guidelineData = {
        bannerSubTitle: t('components.molecules.banner.create-account'),
        bannerButtonText: t('components.molecules.banner.sign-up'),
        bannerImageStyle: styles.idCardImage,
        bannerImage: images.idCard,
        onPress: () => {
          navigation.navigate<any>(ROOT_ROUTE_NAMES.Auth, {
            screen: AUTH_ROUTE_NAMES.BonusSignUp
          });
        }
      };
    } else if (!userInfo.isVerified) {
      guidelineData = {
        bannerSubTitle: isWelcomeBonusAvailable
          ? t('screens.portfolio.promo-bonus-baner', { amount: promoBonus })
          : t('components.molecules.banner.complete-verification-sub'),
        bannerButtonText: t('components.molecules.banner.complete-verification'),
        bannerImageStyle: styles.blackKeyImage,
        bannerImage: images.blackKey,
        onPress: () => {
          navigation.navigate<any>(ROOT_ROUTE_NAMES.Common, {
            screen: COMMON_ROUTE_NAMES.Verification
          });
        }
      };
    } else {
      if (!userInfo.firstDepositDate)
        guidelineData = {
          bannerSubTitle: t('screens.portfolio.deposit-now'),
          bannerButtonText: t('screens.portfolio.fund-now'),
          bannerImageStyle: styles.safeImage,
          bannerImage: images.safe,
          onPress: () => {
            navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
          }
        };
      else {
        if (!balanceLive.equity)
          guidelineData = {
            bannerSubTitle: t('screens.portfolio.transfer-funds-trading-account-dive-into-markets'),
            bannerButtonText: t('screens.portfolio.transfer-funds-now'),
            bannerImageStyle: styles.rocketImage,
            bannerImage: images.rocket,
            onPress: () => {
              navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
            }
          };
        else {
          guidelineData = {
            bannerSubTitle: t('screens.portfolio.deposit-now'),
            bannerButtonText: t('screens.portfolio.explore-trading-signals'),
            bannerImageStyle: styles.barchartImage,
            bannerImage: images.barChart,
            onPress: () => {
              navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
            }
          };
        }
      }
    }
    return (
      <BaseTradingBanner
        style={styles.guidelineBanner}
        title={`${t('screens.common.next-step')}:`}
        subTitle={guidelineData.bannerSubTitle}
        buttonText={guidelineData.bannerButtonText}
        imageSource={guidelineData.bannerImage}
        imageStyle={guidelineData.bannerImageStyle}
        leftSectionStyle={{ marginRight: 112 }}
        buttonType={BaseButtonType.primary}
        onPress={guidelineData?.onPress}
      />
    );
  }, [t, userInfo, balanceLive, isWelcomeBonusAvailable, promoBonus, isAuthorized]);

  const Empty = useCallback(() => {
    if (isFetching) return null;
    const goToSignals = () => navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
    return (
      <BasePortfolioEmptyContainer
        buttonText={t('screens.portfolio.no-data.explore')}
        subTitle={emptyText.subTitle || t('screens.portfolio.no-data.no-closed')}
        showButton={emptyText.started ? true : false}
        title={emptyText.title || t('screens.portfolio.no-data.title')}
        style={{ top: '50%' }}
        onPress={goToSignals}
      />
    );
  }, [isFetching, t, emptyText]);

  return (
    <View style={styles.container}>
      <SectionList
        testID={testIDs.portfolio.history.sectionList}
        sections={dealsInfo}
        style={styles.list}
        key={dealsInfo.length === 0 ? 'new-list-key' : 'list-with-data'}
        snapToInterval={50}
        decelerationRate={'fast'}
        maxToRenderPerBatch={30}
        ListEmptyComponent={Empty}
        ListFooterComponent={ListFooterComponent}
        updateCellsBatchingPeriod={100}
        renderSectionFooter={Seperator}
        windowSize={20}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={[styles.listContent, dealsInfo.length === 0 && { paddingLeft: 0 }]}
        showsVerticalScrollIndicator={false}
        keyExtractor={_keyExtractor}
        renderSectionHeader={_renderHeader}
        renderItem={_renderItem}
      />
      {showGuideline && renderGuideline()}
    </View>
  );
};

export default HistoryScreen;

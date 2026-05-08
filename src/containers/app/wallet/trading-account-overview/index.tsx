import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParamListBase, useTheme } from '@react-navigation/native';
import useStyles from './styles';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseHelpButton,
  BaseLoader,
  BaseRadioButton,
  BaseSwitch,
  BaseText,
  BaseTextVariant,
  BaseTradingBanner,
  ProgressHeader,
  SheetBackdrop,
  SimpleCountDown
} from '@/components';
import { useTranslation } from 'react-i18next';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BackHandler, ScrollView, TextStyle, TouchableOpacity, View } from 'react-native';
import { config } from '@/constants';
import { useChangeAccountLeverageMutation, useGetTradingAccountsMutation, useTradeAccountInfoQuery } from '@/store/api';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { PORTFOLIO_TAB_ROUTE_NAMES } from '@/containers/app/portfolio/portfolio/screen';
import { actions } from '@/store';
import { PORTFOLIO_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import getCurrency, { Currencies } from '@/helpers/currency';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import TradingActivities from '../components/trading-activities';
import { UserAccount } from '@/store/slices/wallet/types';
import useAsyncStorage from '@/hooks/asyncstorage';
import dateHelper from '@/helpers/dateHelper';
import dayjs from 'dayjs';
import Config from 'react-native-config';
import { detectDateFormat, formatTwoDecimals } from '@/helpers';
import { TransferTypes } from '@/components/molecules/transfer-card';
import Clipboard from '@react-native-clipboard/clipboard';
import { getAccountName } from '@/constants/static';

type TradingAccountOverviewScreenProps = StackScreenProps<
  ParamListBase & RootRootParamsList,
  ROOT_ROUTE_NAMES.TradingAccountOverview
>;

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const {
  portfolio: { setActiveTab, setSelectedAccount },
  wallet: { setTradingAccount }
} = actions;

const { WELCOME_TYPE_ID, CONTEST_TYPE_ID } = Config;

let timeout: number | undefined = undefined;
const TradingAccountOverviewScreen: FC<TradingAccountOverviewScreenProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { login = '' } = params || {};

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);
  const { palette } = theme || {};

  const dispatch = useAppDispatch();

  const BottomSheetRef = useRef<BottomSheetModal>(null);
  const sheetState = useRef<boolean>(false);
  const [selectedLeverage, setLeverage] = useState(0);
  const [balanceLive, setBalanceLive] = useState({ equity: 0 });
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const isFirstCheck = useRef<boolean>(true);

  const { set } = useAsyncStorage<'default-trading-account'>();

  const portfolio = useAppSelector((state) => state.portfolio);
  const { tradeAccountInfo, userInfo, selectedAccount } = portfolio || {};

  const wallet = useAppSelector((store) => store.wallet);
  const { tradingAccounts, accountConfigs } = wallet || {};

  const isDefaultAccount = Boolean(Number(login) === Number(selectedAccount));

  const tradingAccount = useMemo(
    () => tradingAccounts.find((item) => item?.login === login) || ({} as UserAccount),
    [tradingAccounts, login]
  );

  const { type } = tradingAccount || {};
  const { id: typeId } = type || {};

  const currentAccountConfig = useMemo(
    () => accountConfigs.find((config) => config?.systemTypeId === String(typeId)),
    [accountConfigs, typeId]
  );

  const isDeposit = !!userInfo.firstDepositDate;
  const isFund = !!userInfo.lastTradedAt;

  const showGuideline = useMemo(() => !isDeposit || !isFund, [isDeposit, isFund]);

  useLayoutEffect(() => {
    const setDelayedSelected = (value: boolean) => {
      clearTimeout(timeout);
      setTimeout(() => setIsSelected(value), 1000);
    };

    if (isDefaultAccount) {
      if (isFirstCheck.current) {
        setIsSelected(true);
      } else setDelayedSelected(true);
    } else setDelayedSelected(false);

    isFirstCheck.current = false;
  }, [selectedAccount, isDefaultAccount]);

  useLayoutEffect(() => {
    if (!tradingAccount) {
      return;
    }

    const { equity = 0 } = tradingAccount || {};

    setBalanceLive(() => ({ equity }));
  }, [tradingAccount]);

  const [getTradeAccountInfo] = useTradeAccountInfoQuery();
  const [changeAccountLeverage, changeLeverageResponse] = useChangeAccountLeverageMutation();
  const [getTradingAccounts] = useGetTradingAccountsMutation({});

  const floatingProfit = useMemo(() => {
    return tradeAccountInfo.positions?.reduce((sum, position) => sum + (position.profit + position.storage), 0) || 0;
  }, [tradeAccountInfo.positions]);

  const getTradingAccountsHandler = async () => {
    try {
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userInfo?.id) getTradeAccountInfo({ userId: userInfo?.id, accountId: login });
  }, [userInfo.id, login]);

  useEffect(() => {
    getTradingAccountsHandler();
  }, [changeLeverageResponse.isSuccess]);

  useLayoutEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetState.current) BottomSheetRef.current?.dismiss();
      else navigation.canGoBack() && navigation.goBack();
      return true;
    });

    return backHandler.remove;
  }, []);

  const onOpen = useCallback((index: number) => {
    if (index !== -1) {
      sheetState.current = true;
    } else {
      sheetState.current = false;
    }
  }, []);

  const InfoRow = useCallback(
    ({
      title = '',
      desc = '',
      value = '',
      isBold = false,
      showPen = false,
      showArrow = false,
      onPress,
      tooltipText,
      toolTipTitle,
      canCopy
    }: {
      title: string;
      desc?: string;
      value?: string | number;
      isBold?: boolean;
      showPen?: boolean;
      showArrow?: boolean;
      onPress?: () => void;
      tooltipText?: string;
      toolTipTitle?: string;
      canCopy?: boolean;
    }) => {
      const onCopyPress = () => {
        Clipboard.setString(`${value}`);
      };

      const { icon, text } = palette || {};

      let valueStyle: TextStyle = styles.infoValue;

      if (isBold) {
        valueStyle = styles.rowBoldText;
      }
      if (showPen) {
        valueStyle = { ...valueStyle, color: text.interaction.basic.accent.default };
      }
      return (
        <TouchableOpacity style={styles.row} activeOpacity={activeOpacity} onPress={onPress} disabled={!onPress}>
          <View style={[styles.horizontal, styles.left]}>
            <BaseText
              style={[
                styles.infoText,
                !!showArrow ? { fontSize: 14, color: text.interaction.basic.accent.default } : {}
              ]}
            >
              {title}
            </BaseText>
            {tooltipText && (
              <BaseHelpButton
                style={styles.toolTip}
                title={toolTipTitle || title}
                text={tooltipText}
                color={icon.base.secondary}
              />
            )}
          </View>
          <View style={[styles.horizontal, styles.right]}>
            {desc && <BaseText style={styles.descText}>{desc}</BaseText>}
            {showPen && (
              <View style={styles.icon}>
                <SvgIcon color={icon.base.strong} name={SvgXmlIconNames.pencil} size={IconSize.xs} />
              </View>
            )}
            {showArrow ? (
              <View style={styles.icon}>
                <SvgIcon color={icon.base.secondary} name={SvgXmlIconNames.chevronRight} size={IconSize.xsm} />
              </View>
            ) : (
              <BaseText style={valueStyle}>{value}</BaseText>
            )}
            {canCopy && (
              <TouchableOpacity
                style={{ top: 2 }}
                activeOpacity={activeOpacity}
                hitSlop={hitSlop}
                onPress={onCopyPress}
              >
                <SvgIcon color={icon.base.strong} name={SvgXmlIconNames.copy} size={IconSize.xsm} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [palette]
  );

  const goToChangeAccountType = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.ChangeAccountType, { login });
  }, [navigation, login]);

  const ManageAccount = useCallback(() => {
    const { accountTypeChangeEnabled = false, typeDisplayName = '' } = currentAccountConfig || {};

    if (!accountTypeChangeEnabled) {
      return null;
    }

    return (
      <View style={styles.container}>
        <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.text}>
          {t('screens.trading-account-overview.manage-account')}
        </BaseText>
        <View style={styles.infoWrap}>
          <InfoRow
            title={t('screens.trading-account-overview.change-account-type')}
            desc={typeDisplayName}
            onPress={goToChangeAccountType}
            showArrow
          />
        </View>
      </View>
    );
  }, [t, styles, currentAccountConfig, goToChangeAccountType]);

  const navigateToPositionScreen = useCallback(() => {
    BottomSheetRef.current?.dismiss();
    dispatch(setActiveTab(1));

    navigation.replace(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Portfolio,
      params: {
        screen: PORTFOLIO_ROUTE_NAMES.Positions,
        params: {
          screen: PORTFOLIO_TAB_ROUTE_NAMES.Positions
        }
      }
    });
  }, [navigation]);

  const openLeverageBottomSheet = useCallback(() => {
    BottomSheetRef.current?.present();
    if (selectedLeverage !== tradingAccount?.leverage) setLeverage(tradingAccount?.leverage || 0);
  }, [selectedLeverage, tradingAccount?.leverage]);

  const onLeverageSelected = useCallback(() => {
    BottomSheetRef.current?.dismiss();
    if (tradingAccount?.loginSid)
      changeAccountLeverage({ loginSid: tradingAccount?.loginSid, leverage: selectedLeverage });
  }, [selectedLeverage, tradingAccount?.loginSid]);

  const currencySymbol = getCurrency((tradingAccount?.currency as Currencies) || 'USD').symbol;

  const RenderGuideline = useCallback(() => {
    let guidelineData = {
      bannerSubTitle: '',
      bannerButtonText: '',
      bannerImageStyle: {},
      bannerImage: images.safe,
      onPress: () => { }
    };
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
  }, [t, userInfo, balanceLive]);

  const onTradingAccountChange = useCallback(
    (value: boolean) => {
      if (value) {
        dispatch(setTradingAccount(tradingAccount));
        set('default-trading-account', { [userInfo.id]: login });
        dispatch(setSelectedAccount(login));
      }
    },
    [tradingAccount, login, userInfo.id]
  );

  const expire = useMemo(() => {
    return tradingAccount.customFields?.custom_expiration_date || '';
  }, [tradingAccount.customFields?.custom_expiration_date]);

  const hasExpire = useMemo(() => !!expire?.length, [expire]);

  const until = useMemo(() => {
    if (!hasExpire) return 0;

    const format = detectDateFormat(expire);

    return dateHelper.diff(dayjs(), expire, format);
  }, [expire, hasExpire]);

  const transferType = useMemo((): TransferTypes => {
    if (`${tradingAccount.typeId}` === `${CONTEST_TYPE_ID}`) return 'contest';
    else if (`${tradingAccount.typeId}` === `${WELCOME_TYPE_ID}`) return 'welcome';
    return 'default';
  }, [tradingAccount.typeId, CONTEST_TYPE_ID, WELCOME_TYPE_ID]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ProgressHeader
          hideProgressBar
          style={styles.header}
          leftIconType={SvgXmlIconNames.arrowLeft}
          stepsCount={0}
          currentStep={0}
        />
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
          <View style={styles.top}>
            <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.title}>
              {getAccountName(tradingAccount.typeDisplayName, 'flex')}
            </BaseText>
            <BaseText variant={BaseTextVariant.authSubTitle}>${(tradingAccount?.equity || 0).toFixed(2)}</BaseText>
          </View>
          {(isDefaultAccount && isSelected) || (
            <View style={[styles.container, { zIndex: 99 }]}>
              <View style={styles.sheetSelectorContainer}>
                <View style={styles.sheetBottomDefaultContainer}>
                  <View style={styles.sheetDefaultTextContainer}>
                    <BaseText>{t('screens.wallet.default-account')}</BaseText>
                    <BaseText style={styles.sheetDefaultInfo} variant={BaseTextVariant.small}>
                      {t('screens.wallet.default-account-info')}
                    </BaseText>
                  </View>
                  <BaseSwitch onChange={onTradingAccountChange} disable={isDefaultAccount} value={isDefaultAccount} />
                </View>
              </View>
            </View>
          )}
          {hasExpire && (
            <View style={styles.container}>
              <View style={styles.sheetSelectorContainer}>
                <View style={styles.sheetBottomDefaultContainer}>
                  <BaseText style={styles.grayText} variant={BaseTextVariant.small}>
                    {t('components.simple-countdown.expires-in')}
                  </BaseText>
                  <SimpleCountDown
                    textStyle={BaseTextVariant.titleXXS}
                    lastDate={expire}
                    style={{ bottom: 1.5 }}
                    digitWidth={18.5}
                    until={until}
                  />
                </View>
              </View>
            </View>
          )}
          <View style={styles.container}>
            <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.text}>
              {t('screens.trading-account-overview.account-details')}
            </BaseText>
            {/* <AssetChart tradingSessionSchedule={[]} price={'0'} dailyChange={'0'} dailyChangePercent={'0'} /> */}
            <View style={styles.infoWrap}>
              <InfoRow canCopy title={t('screens.trading-account-overview.trading-id')} value={tradingAccount.login} />
              <InfoRow
                title={t('screens.trading-account-overview.password')}
                value={t('screens.trading-account-overview.sent-to-your-email')}
              />
              <InfoRow
                canCopy
                title={t('screens.trading-account-overview.server-name')}
                value={'mt5.amega.capital'}
                toolTipTitle={t('screens.trading-account-overview.what-is-server-name')}
                tooltipText={t('screens.trading-account-overview.server-name-tooltip')}
              />
              <InfoRow
                title={t('screens.trading-account-overview.equity')}
                value={currencySymbol + (tradingAccount?.equity || 0).toFixed(2)}
                isBold
                tooltipText={t('screens.trading-account-overview.equity-tooltip')}
              />
              <InfoRow
                title={t('screens.trading-account-overview.maxLeverage')}
                value={`1:${tradingAccount?.leverage || 0}`}
                showPen
                onPress={openLeverageBottomSheet}
                tooltipText={t('screens.trading-account-overview.maxLeverage-tooltip')}
              />
              <InfoRow
                title={t('screens.trading-account-overview.reservedMargin')}
                value={`${currencySymbol}${formatTwoDecimals(tradingAccount?.margin || 0)}`}
                tooltipText={t('screens.trading-account-overview.reservedMargin-tooltip')}
              />
              <InfoRow
                title={t('screens.trading-account-overview.freeMargin')}
                value={`${currencySymbol}${formatTwoDecimals(tradingAccount?.marginFree || 0)}`}
                tooltipText={t('screens.trading-account-overview.freeMargin-tooltip')}
              />
              {tradingAccount?.credit ? (
                <InfoRow
                  title={t('screens.trading-account-overview.credit')}
                  value={currencySymbol + (tradingAccount?.credit).toFixed(2)}
                />
              ) : null}
              <InfoRow
                title={t('screens.trading-account-overview.marginLevel')}
                value={(tradingAccount?.marginLevel || 0).toFixed(2) + '%'}
                tooltipText={t('screens.trading-account-overview.marginLevel-tooltip')}
              />
              <InfoRow
                title={t('screens.trading-account-overview.floatingPnl')}
                value={(floatingProfit >= 0 ? '' : '-') + currencySymbol + Math.abs(floatingProfit).toFixed(2)}
                isBold
                tooltipText={t('screens.trading-account-overview.floatingPnl-tooltip')}
              />
            </View>
            <View style={styles.infoWrap}>
              <InfoRow
                title={t('screens.trading-account-overview.openPositions')}
                value={tradeAccountInfo.positions?.length || 0}
              />
              {isDefaultAccount ? (
                <InfoRow
                  title={t('screens.trading-account-overview.goToPortfolio')}
                  onPress={navigateToPositionScreen}
                  showArrow
                />
              ) : null}
            </View>
          </View>
          {showGuideline && (
            <View style={[styles.container, { paddingHorizontal: 0 }]}>
              <RenderGuideline />
            </View>
          )}
          <ManageAccount />
          {tradingAccount?.type?.category === 'demo' || (
            <TradingActivities
              transferType={transferType}
              loginSid={tradingAccount.loginSid}
              navigation={navigation}
              route={route}
            />
          )}
        </ScrollView>
      </View>
      <BottomSheetModal
        ref={BottomSheetRef}
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        handleIndicatorStyle={styles.indicator}
        onChange={onOpen}
        backgroundStyle={styles.sheetBgStyle}
        enablePanDownToClose
        backdropComponent={SheetBackdrop}
        enableDynamicSizing
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetScrollView}>
          <BaseText style={styles.bottomSheetTitle} variant={BaseTextVariant.captionSemiBold}>
            {t('screens.trading-account-overview.selectLeverageSize')}
          </BaseText>
          {tradeAccountInfo.positions?.length ? (
            <View>
              <BaseText style={styles.bottomSheetSubTitle}>
                {t('screens.trading-account-overview.changeLeverageWarning')}
              </BaseText>
              <BaseRadioButton label={`1:${tradingAccount?.leverage || 0}`} isSelected />
              <BaseButton
                style={styles.bottomSheetButton}
                label={t('screens.trading-account-overview.okay')}
                size={BaseButtonSize.large}
                type={BaseButtonType.primary}
                onPress={() => {
                  BottomSheetRef.current?.dismiss();
                }}
              />
              {isDefaultAccount ? (
                <BaseButton
                  style={styles.bottomSheetButton}
                  size={BaseButtonSize.large}
                  label={t('screens.trading-account-overview.goToOpenPositions')}
                  type={BaseButtonType.accent}
                  onPress={navigateToPositionScreen}
                />
              ) : null}
            </View>
          ) : (
            <View>
              {tradingAccount?.type?.leverages &&
                tradingAccount.type.leverages
                  ?.slice(0)
                  .reverse()
                  .map((leverage, index) => {
                    return (
                      <BaseRadioButton
                        key={index}
                        label={`1:${leverage}`}
                        isSelected={selectedLeverage === leverage}
                        onPress={() => {
                          setLeverage(leverage);
                        }}
                      />
                    );
                  })}
              <BaseButton
                label={t('screens.trading-account-overview.select')}
                style={styles.bottomSheetButton}
                type={BaseButtonType.primary}
                onPress={onLeverageSelected}
              />
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BaseLoader active={changeLeverageResponse.isLoading} />
    </SafeAreaView>
  );
};

export default TradingAccountOverviewScreen;

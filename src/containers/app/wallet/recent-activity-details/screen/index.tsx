import React, { FC, Fragment, useCallback, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  BaseText,
  BaseTextVariant,
  BaseImage,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseButtonLoading,
  SheetBackdrop
} from '@/components';
import { config } from '@/constants';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { IDEASHUB_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import getSymbolFromCurrency from 'currency-symbol-map';
import { formatNumberToAmount, formatTwoDecimals, localTime } from '@/helpers';
import { useAppSelector, useIntercom } from '@/hooks';
import { actions } from '@/store';
import useStyles from './styles';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { MARKETS_ROUTE_NAMES } from '@/navigation/app/stacks';
import { RecentActivityData } from '@/containers/app/wallet/recent-activity-details';
import dayjs from 'dayjs';
import { UserAccount } from '@/store/slices/wallet/types';
import Config from 'react-native-config';

const { LIVE_TYPE_ID } = Config;

type RecentActivityDetailsScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.RecentActivityDetails>;

interface RecentActivityDetailsScreenData extends RecentActivityDetailsScreenProps {
  data: RecentActivityData;
}

const {
  wallet: { useCancelTransaction }
} = actions;

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const RecentActivityDetailsScreen: FC<RecentActivityDetailsScreenData> = ({ route, navigation, data }) => {
  const [isLoading, setLoading] = useState(false);
  const [isCancelled, setCancelled] = useState(false);

  const {
    id,
    isTransfer,
    isTrading,
    status: initialStatus,
    type,
    fromAccount,
    toAccount,
    amount,
    currency,
    paymentSystem,
    logo,
    declineReason,
    createdAt,
    processedAt,
    isCashback = false,
    symbol,
    closeTime,
    isContest = false,
    toColor,
    fromIcon,
    toIcon,
    fromColor,
    isWelcome = false,
  } = data || {};



  const isDeposit = type === 'deposit';
  const isWithdrawal = type === 'withdrawal';
  const isPspFee = type === 'psp fee';
  const isDormantFee = type === 'Dormant Fee';
  const isFromWallet = isTrading ? fromAccount === 'live' : fromAccount === 'wallet';
  const isToWallet = isTrading ? toAccount === 'live' : toAccount === 'wallet';
  const isFromCashback = fromAccount === 'cashback';
  const isToCashback = toAccount === 'cashback';
  const isCredit = type === 'credit';
  const isFromContest = fromAccount === 'contest';
  const isReward = type === 'reward';
  const isBalanceCorrection = type === 'balance correction';
  const isCashbackCorrection = type === 'cashback correction';
  const isFromWelcome = fromAccount === 'welcome'

  const {
    cashback: cashbackAccount,
    contest: contestAccount,
    demoContest: demoContestAccount,
    rewards: rewardsAccount,
    wallet: walletAccount
  } = useAppSelector((store) => store.wallet.accounts);

  const tradingAccounts = useAppSelector((store) => store.wallet.tradingAccounts);

  const { intercomPresent } = useIntercom();

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [cancelTransaction, cancelTransactionResponse] = useCancelTransaction();
  const {
    isLoading: isCancelLoading,
    isError,
    isSuccess,
    data: cancelTransactionResponseData
  } = cancelTransactionResponse || {};

  const status = useMemo(() => {
    if (isCancelled) {
      return 'cancelled';
    }
    return initialStatus;
  }, [initialStatus, isCancelled]);

  const { t } = useTranslation();

  const { goBack, canGoBack } = navigation || {};
  const canBack = canGoBack();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { purple }
  } = theme || {};

  const openSheet = () => bottomSheetRef.current?.present();
  const closeSheet = () => bottomSheetRef.current?.dismiss();

  const goToIdeasHub = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  }, [navigation]);

  const onGoBack = () => {
    if (!canBack) {
      return goToIdeasHub();
    }
    goBack();
  };

  const cancelTransactionHandler = async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      await cancelTransaction({ id });
    } catch (error: unknown) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const setInitialState = () => {
    setLoading(false);
    setCancelled(false);
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
    }, [route, navigation])
  );

  const checkCancellation = useCallback(() => {
    if (!isSuccess) {
      return;
    }

    const { status } = cancelTransactionResponseData || {};

    if (status === 'cancelled') {
      setCancelled(true);
      closeSheet();
    }
  }, [isSuccess, cancelTransactionResponseData]);

  useLayoutEffect(() => {
    checkCancellation();
  }, [isSuccess, cancelTransactionResponseData]);

  useLayoutEffect(() => {
    if (!isError) {
      return;
    }
    closeSheet();
  }, [isError]);

  const backButtonComponent = useMemo(() => {
    return (
      <TouchableOpacity activeOpacity={activeOpacity} hitSlop={hitSlop} onPress={onGoBack} style={styles.backButton}>
        <SvgIcon name={SvgXmlIconNames.close} size={IconSize.sm} />
      </TouchableOpacity>
    );
  }, [onGoBack, styles]);

  const amountValue = useMemo(() => {
    const sanitizeVal = Math.abs(Number(amount));
    const amountVal = isCashback ? sanitizeVal : Math.round(sanitizeVal * 100) / 100;
    const formattedVal = formatNumberToAmount(formatTwoDecimals(amountVal));

    const symbol = getSymbolFromCurrency(currency);

    return `${symbol ? symbol : ''}${formattedVal}${symbol ? '' : ` ${currency}`}`;
  }, [currency, amount, isCashback]);

  const amountComponent = useMemo(() => {
    let sign = '';

    if (isWelcome) {
      sign = isFromWelcome ? '-' : '+';
    } else if (isContest) {
      sign = isFromContest ? '-' : '+';
    } else if (isCredit) {
      sign = +amount < 0 ? '-' : '+';
    } else if (isReward || isBalanceCorrection) {
      sign = +amount < 0 ? '-' : '+';
    } else if (isCashback) {
      if (isCashbackCorrection || (isCashback && symbol)) sign = '+';
      else if (isFromCashback) sign = '-';
    } else if (isTransfer) {
      if (isFromWallet) {
        sign = '-';
      } else if (isToWallet) {
        sign = '+';
      }
    } else {
      if (isWithdrawal || isPspFee || isDormantFee) {
        sign = '-';
      } else if (isDeposit) {
        sign = '+';
      }
    }
    return <BaseText variant={BaseTextVariant.title}>{`${sign}${amountValue}`}</BaseText>;
  }, [
    isTransfer,
    isFromWallet,
    isToWallet,
    isWithdrawal,
    isPspFee,
    isDormantFee,
    isDeposit,
    amountValue,
    isFromCashback,
    isToCashback,
    isCredit,
    amount,
    isContest,
    isFromContest,
    isReward,
    isBalanceCorrection,
    isCashbackCorrection,
    isWelcome,
    isFromWelcome
  ]);

  const descComponent = useMemo(() => {
    const getFormattedAccount = (accountValue: string | undefined) => {
      if (isCredit) return t('screens.recent-activity-details.credit');
      else if (isBalanceCorrection) return t('screens.recent-activity.balance-correction');
      else if (isReward) return t('screens.recent-activity.reward');
      else if (isCashbackCorrection) return t('screens.recent-activity-details.cashback-correction');
      else if (isCashback && symbol) return t('screens.recent-activity-details.cashback');
      else if (isTransfer) {
        if (accountValue === 'demoContest') {
          return t('screens.recent-activity.demo-contest-account');
        } else if (accountValue === 'contest') {
          return t('screens.recent-activity.contest-account');
        } else if (['live', 'welcome'].includes(accountValue as string)) {
          return t('screens.recent-activity-details.trading-account-title');
        } else if (accountValue === 'wallet') {
          return t('screens.recent-activity-details.wallet-account-title');
        } else if (accountValue === 'cashback') {
          return t('screens.recent-activity-details.cashback-account-title');
        } else if (accountValue === 'ib') {
          return t('screens.recent-activity-details.rewards-account-title');
        } else {
          return t('screens.recent-activity-details.archived-account-title');
        }
      } else {
        if (isDeposit) {
          return accountValue
            ? t('screens.recent-activity-details.deposit-via', { psp: accountValue })
            : t('screens.recent-activity-details.deposit');
        } else if (isWithdrawal) {
          return accountValue
            ? t('screens.recent-activity-details.withdrawal-via', { psp: accountValue })
            : t('screens.recent-activity-details.withdrawal');
        } else if (isPspFee) {
          return t('screens.recent-activity-details.payment-provider-fee');
        } else if (isDormantFee) {
          return t('screens.recent-activity-details.dormant-fee');
        } else {
          return null;
        }
      }
    };

    const formattedFromAccount = getFormattedAccount(fromAccount);
    const formattedToAccount = getFormattedAccount(toAccount);
    const formattedAccount = getFormattedAccount(paymentSystem);

    return isTransfer ? (
      <View style={styles.sectionDescRow}>
        <BaseText variant={BaseTextVariant.small} style={styles.sectionDesc}>
          {formattedFromAccount}
        </BaseText>
        <SvgIcon name={SvgXmlIconNames.arrowRight} size={IconSize.xs} color={'#5D7278'} />
        <BaseText variant={BaseTextVariant.small} style={styles.sectionDesc}>
          {formattedToAccount}
        </BaseText>
      </View>
    ) : (
      <BaseText variant={BaseTextVariant.small} style={styles.sectionDesc}>
        {formattedAccount}
      </BaseText>
    );
  }, [
    isDeposit,
    isWithdrawal,
    isPspFee,
    isTransfer,
    fromAccount,
    toAccount,
    isDormantFee,
    type,
    paymentSystem,
    styles,
    t,
    isCashbackCorrection,
    isReward,
    isBalanceCorrection
  ]);

  const logoComponent = useMemo(() => {
    const iconSize = {
      width: 32,
      height: 32
    };

    if (isPspFee) return <BaseImage style={iconSize} source={images.pspFee} />;
    if (isDormantFee) return <BaseImage style={iconSize} source={images.dormantFee} />;
    if (isCredit) return <BaseImage style={iconSize} source={images.credit} />;
    else if (isBalanceCorrection) return <SvgIcon name={SvgXmlIconNames.balanceCorrection} size={iconSize} />;
    else if (isReward) return <SvgIcon name={SvgXmlIconNames.rewards} size={iconSize} />;
    if (isCashback) {
      if (isCashbackCorrection) {
        return <SvgIcon name={SvgXmlIconNames.cashbackAccount} size={iconSize} />;
      }
    }
    if (isTransfer) {
      let fromLogo = <SvgIcon name={SvgXmlIconNames.closedAccount} size={iconSize} />;
      let toLogo = fromLogo;

      const AccountImage = ({ url, colour }: { url: string; colour: string | null | undefined }) => {
        return <View style={[styles.imageBg, { backgroundColor: colour || theme.palette.purple[500] }]} >
          <BaseImage resizeMode='contain' source={{ uri: url }} style={styles.imageSize} />
        </View>
      };

      if (fromIcon) fromLogo = <AccountImage colour={fromColor} url={fromIcon} />;
      else {
        if (fromAccount === 'demoContest') {
          const url = demoContestAccount?.[0]?.icon;
          if (url) fromLogo = <AccountImage colour={fromColor || demoContestAccount?.[0]?.colour} url={url} />;
          else fromLogo = <SvgIcon name={SvgXmlIconNames.demoContestRound} size={IconSize.md} />;

        } else if (fromAccount === 'contest') {
          const url = contestAccount?.[0]?.icon;
          if (url) fromLogo = <AccountImage colour={fromColor || contestAccount?.[0]?.colour} url={url} />;
          else fromLogo = <SvgIcon name={SvgXmlIconNames.contestRound} size={IconSize.md} />;

        } else if (fromAccount === 'live') {
          const account = tradingAccounts.find(item => `${item.typeId}` === `${LIVE_TYPE_ID}`) || {} as UserAccount;

          if (account?.icon && account.colour) {
            fromLogo = <AccountImage url={account.icon} colour={fromColor || account.colour} />;
          }
          else fromLogo = <SvgIcon name={SvgXmlIconNames.tradingAccount} size={IconSize.md} />;


        } else if (fromAccount === 'wallet') {
          const url = walletAccount?.icon;
          if (url) fromLogo = <AccountImage url={url} colour={fromColor || walletAccount.colour} />;
          else fromLogo = <SvgIcon name={SvgXmlIconNames.walletAccount} size={IconSize.md} />;

        } else if (fromAccount === 'cashback') {
          const url = cashbackAccount?.icon;
          if (url) fromLogo = <AccountImage colour={fromColor || cashbackAccount.colour} url={url} />;
          else fromLogo = <SvgIcon name={SvgXmlIconNames.cashbackAccount} size={IconSize.md} />;

        } else if (fromAccount === 'ib') {
          const url = rewardsAccount?.icon;
          if (url) fromLogo = <AccountImage colour={fromColor || rewardsAccount.colour} url={url} />;
          else fromLogo = <SvgIcon name={SvgXmlIconNames.rewardsAccount} size={IconSize.md} />;
        };
      }



      if (toIcon) toLogo = <AccountImage colour={toColor} url={toIcon} />;
      else {

        if (toAccount === 'demoContest') {
          const url = demoContestAccount?.[0]?.icon;
          if (url) toLogo = <AccountImage colour={toColor || demoContestAccount?.[0]?.colour} url={url} />;
          else toLogo = <SvgIcon name={SvgXmlIconNames.demoContestRound} size={IconSize.md} />;

        } else if (toAccount == 'contest') {
          const url = contestAccount?.[0]?.icon;
          if (url) toLogo = <AccountImage url={url} colour={toColor || contestAccount?.[0]?.colour} />
          else toLogo = <SvgIcon name={SvgXmlIconNames.contestRound} size={IconSize.md} />;

        } else if (toAccount === 'live') {

          const account = tradingAccounts.find(item => `${item.typeId}` === `${LIVE_TYPE_ID}`) || {} as UserAccount;
          if (account?.icon && account.colour) toLogo = <AccountImage url={account.icon} colour={toColor || account.colour} />;
          else toLogo = <SvgIcon name={SvgXmlIconNames.tradingAccount} size={IconSize.md} />;

        } else if (toAccount === 'wallet') {
          if (walletAccount?.icon) toLogo = <AccountImage url={walletAccount.icon} colour={toColor || walletAccount.colour} />;
          else toLogo = <SvgIcon name={SvgXmlIconNames.walletAccount} size={IconSize.md} />;

        } else if (toAccount === 'cashback') {
          if (cashbackAccount?.icon) toLogo = <AccountImage url={cashbackAccount.icon} colour={toColor || cashbackAccount.colour} />
          else toLogo = <SvgIcon name={SvgXmlIconNames.cashbackAccount} size={IconSize.md} />;
        } else if (toAccount === 'ib') {
          if (rewardsAccount?.icon) toLogo = <AccountImage url={rewardsAccount.icon} colour={toColor || rewardsAccount.colour} />
          else toLogo = <SvgIcon name={SvgXmlIconNames.rewardsAccount} size={IconSize.md} />;
        };
      }


      return (
        <Fragment>
          <View style={styles.fromLogoBox}>{fromLogo}</View>
          <View style={styles.toLogoBox}>{toLogo}</View>
        </Fragment>
      );
    } else {
      return logo ? (
        <BaseImage style={styles.logoImg} resizeMode='contain' source={{ uri: logo }} />
      ) : (
        <View style={styles.blankImg} />
      );
    }
  }, [demoContestAccount, contestAccount, tradingAccounts, rewardsAccount, cashbackAccount, walletAccount, isTransfer, fromAccount, toAccount, fromIcon, toIcon, fromColor, toColor, logo, isReward, isBalanceCorrection, isCashback, isCashbackCorrection]);

  const statusComponent = useMemo(() => {
    let accountStatus = null;
    let statusStyle = undefined;

    if (isCashback && symbol) {
      accountStatus = t('screens.recent-activity-details.approved');
    }
    if (status === 'declined') {
      accountStatus = t('screens.recent-activity-details.declined');
      statusStyle = styles.statusDeclined;
    } else if (status === 'cancelled') {
      accountStatus = t('screens.recent-activity-details.cancelled');
      statusStyle = styles.statusDeclined;
    } else if (status === 'pending') {
      accountStatus = t('screens.recent-activity-details.pending');
      statusStyle = styles.statusPending;
    } else if (status === 'approved') {
      accountStatus = t('screens.recent-activity-details.approved');
      statusStyle = undefined;
    }

    const variant =
      status === 'approved' || (isCashback && symbol) ? BaseTextVariant.textSemiBold : BaseTextVariant.small;

    return (
      <View style={styles.sectionBox}>
        <View style={styles.sectionRow}>
          <BaseText variant={BaseTextVariant.small} style={styles.sectionCaption}>
            {t('screens.recent-activity-details.status')}
          </BaseText>
          <View style={styles.sectionRight}>
            <BaseText style={[statusStyle]} variant={variant}>
              {accountStatus}
            </BaseText>
          </View>
        </View>
        {declineReason ? (
          <View style={styles.sectionCol}>
            <BaseText variant={BaseTextVariant.small} style={styles.sectionDesc}>
              {declineReason}
            </BaseText>
          </View>
        ) : null}
      </View>
    );
  }, [status, t, styles, declineReason]);

  const infoComponent = useMemo(() => {
    let infoType = null;

    if (isCashback) {
      if (type === 'cashback correction') infoType = t('screens.recent-activity-details.cashback-correction');
      else if (symbol) infoType = t('screens.recent-activity-details.cashback');
    } else if (isTransfer) {
      infoType = t('screens.recent-activity-details.transfer');
    } else if (isDeposit) {
      infoType = t('screens.recent-activity-details.deposit');
    } else if (isWithdrawal) {
      infoType = t('screens.recent-activity-details.withdrawal');
    } else if (isPspFee) {
      infoType = t('screens.recent-activity-details.payment-provider-fee');
    } else if (isDormantFee) {
      infoType = t('screens.recent-activity-details.dormant-fee');
    }

    const createdDate = createdAt ? moment(createdAt).format('D MMM YYYY, HH:mm') : null;
    const processedDate = processedAt ? moment(processedAt).format('D MMM YYYY, HH:mm') : null;

    const onPress = () => Clipboard.setString(`${id}`);

    return (
      <View style={styles.sectionBox}>
        <View style={styles.sectionRow}>
          <BaseText variant={BaseTextVariant.small} style={styles.sectionCaption}>
            {t('screens.recent-activity-details.id')}
          </BaseText>
          <View style={styles.sectionRight}>
            <BaseText variant={BaseTextVariant.small}>{id}</BaseText>
            <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity} hitSlop={hitSlop}>
              <SvgIcon name={SvgXmlIconNames.copy} size={IconSize.xs} color={purple['500']} />
            </TouchableOpacity>
          </View>
        </View>
        {infoType ? (
          <View style={styles.sectionRow}>
            <BaseText variant={BaseTextVariant.small} style={styles.sectionCaption}>
              {t('screens.recent-activity-details.type')}
            </BaseText>
            <View style={styles.sectionRight}>
              <BaseText variant={BaseTextVariant.small}>{infoType}</BaseText>
            </View>
          </View>
        ) : null}
        {!!closeTime && (
          <View style={styles.sectionRow}>
            <BaseText variant={BaseTextVariant.small} style={styles.sectionCaption}>
              {t('screens.recent-activity-details.close-time')}
            </BaseText>
            <View style={styles.sectionRight}>
              <BaseText variant={BaseTextVariant.small}>{localTime(closeTime, 'DD MMM YYYY, HH:mm')}</BaseText>
            </View>
          </View>
        )}
        {createdDate ? (
          <View style={styles.sectionRow}>
            <BaseText variant={BaseTextVariant.small} style={styles.sectionCaption}>
              {t('screens.recent-activity-details.created')}
            </BaseText>
            <View style={styles.sectionRight}>
              <BaseText variant={BaseTextVariant.small}>{createdDate}</BaseText>
            </View>
          </View>
        ) : null}
        {processedDate ? (
          <View style={styles.sectionRow}>
            <BaseText variant={BaseTextVariant.small} style={styles.sectionCaption}>
              {t('screens.recent-activity-details.processed')}
            </BaseText>
            <View style={styles.sectionRight}>
              <BaseText variant={BaseTextVariant.small}>{processedDate}</BaseText>
            </View>
          </View>
        ) : null}
      </View>
    );
  }, [isTransfer, isDeposit, isWithdrawal, isPspFee, isDormantFee, id, type, createdAt, processedAt, t, styles]);

  const openSupportChat = () => {
    intercomPresent();
  };

  const goToMarket = () => {
    navigation.navigate<any>(APP_ROUTE_NAMES.Markets, { screen: MARKETS_ROUTE_NAMES.Markets });
  };

  const buttonsComponent = useMemo(() => {
    if (type === 'cashback correction') {
      return (
        <View style={styles.buttonsBox}>
          <BaseButton
            size={BaseButtonSize.large}
            label={t('screens.recent-activity-details.continue-trading')}
            labelStyle={styles.secondaryButtonLabel}
            type={BaseButtonType.primary}
            onPress={goToMarket}
          />
        </View>
      );
    }
    if (status === 'declined') {
      return (
        <View style={styles.buttonsBox}>
          <BaseButton
            disabled={true}
            size={BaseButtonSize.large}
            label={t('screens.recent-activity-details.need-assistance')}
            labelStyle={styles.primaryButtonLabel}
            style={styles.primaryButton}
          />
          <BaseButton
            size={BaseButtonSize.large}
            label={t('screens.recent-activity-details.contact-support')}
            labelStyle={styles.secondaryButtonLabel}
            style={styles.secondaryButton}
            onPress={openSupportChat}
          />
        </View>
      );
    }
    if (isWithdrawal && status === 'pending') {
      return (
        <View style={styles.buttonsBox}>
          <BaseButton
            size={BaseButtonSize.large}
            label={t('screens.recent-activity-details.cancel-withdrawal')}
            labelStyle={styles.secondaryButtonLabel}
            style={styles.secondaryButton}
            onPress={openSheet}
          />
        </View>
      );
    }
    return null;
  }, [openSupportChat, openSheet, status, isWithdrawal]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>{backButtonComponent}</View>
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBox}>
              {amountComponent}
              {descComponent}
            </View>
            <View style={styles.sectionIcon}>{logoComponent}</View>
          </View>
          {statusComponent}
          {infoComponent}
        </ScrollView>
        {buttonsComponent}
      </View>
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        backdropComponent={SheetBackdrop}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.sheetView}>
          <View style={styles.sheetViewContent}>
            <BaseImage resizeMode={'contain'} source={images.cancel} style={styles.cancelImg} />
            <View style={styles.sheetViewText}>
              <BaseText style={styles.textAlignCenter} variant={BaseTextVariant.captionSemiBold}>
                {paymentSystem
                  ? t('screens.recent-activity-details.you-sure-want-cancel-withdrawal-psp', {
                    amount: amountValue,
                    psp: paymentSystem
                  })
                  : t('screens.recent-activity-details.you-sure-want-cancel-withdrawal', { amount: amountValue })}
              </BaseText>
            </View>
          </View>
          <View style={styles.sheetButtons}>
            <BaseButton
              type={BaseButtonType.accent}
              size={BaseButtonSize.large}
              label={t('screens.recent-activity-details.cancel-withdrawal')}
              onPress={cancelTransactionHandler}
              loading={isLoading || isCancelLoading}
              loadingType={BaseButtonLoading.ellipsis}
            />
            <BaseButton
              type={BaseButtonType.primary}
              size={BaseButtonSize.large}
              label={t('screens.recent-activity-details.go-back')}
              onPress={closeSheet}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default RecentActivityDetailsScreen;

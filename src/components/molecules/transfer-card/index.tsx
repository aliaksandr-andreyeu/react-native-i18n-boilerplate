import React, { Fragment, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseImage, BaseText, BaseTextVariant } from '@/components';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import getSymbolFromCurrency from 'currency-symbol-map';
import { formatNumberToAmount, formatTwoDecimals, localTime } from '@/helpers';
import { HistoryDataItem } from '@/containers/app/wallet/recent-activity';
import { useAppSelector } from '@/hooks';
import Config from 'react-native-config';
import { UserAccount } from '@/store/slices/wallet/types';

const { LIVE_TYPE_ID } = Config;

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

export type TransferTypes = 'cashback' | 'contest' | 'default' | 'welcome';

interface IBaseTransferCard {
  data: HistoryDataItem & { closeTime?: Date };
  onPress: () => void;
  timeFormat?: string;
  isTrading?: boolean;
  transferType?: TransferTypes;
}

const TransferCard: React.FC<IBaseTransferCard> = ({
  data,
  onPress,
  timeFormat,
  transferType = 'default',
  isTrading = false
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const {
    cashback: cashbackAccount,
    contest: contestAccount,
    demoContest: demoContestAccount,
    rewards: rewardsAccount,
    wallet: walletAccount
  } = useAppSelector((store) => store.wallet.accounts);

  const tradingAccounts = useAppSelector((store) => store.wallet.tradingAccounts);

  const {
    fromAccount,
    toAccount,
    createdAt,
    status,
    amount,
    currency,
    closeTime,
    fromIcon,
    toIcon,
    toColor,
    fromColor
  } = data || {};

  const isFromWallet = isTrading ? fromAccount === 'live' : fromAccount === 'wallet';
  const isToWallet = isTrading ? toAccount === 'live' : toAccount === 'wallet';
  const isFromCashback = fromAccount === 'cashback';
  const isFromContest = fromAccount === 'contest';
  const isToContest = toAccount === 'contest';
  const isCashback = transferType === 'cashback';
  const isFromWelcome = fromAccount === 'welcome';
  const isWelcome = transferType === 'welcome';
  const isContest = transferType === 'contest';

  const time = useMemo(() => {
    const currentTime = (isCashback && data.symbol) ? closeTime : createdAt;
    return localTime(currentTime, timeFormat || 'HH:mm');
  }, [createdAt, closeTime, isCashback, data.symbol, timeFormat]);

  const getStatus = () => {
    if (status === 'declined') {
      return t('screens.recent-activity.declined');
    } else if (status === 'cancelled') {
      return t('screens.recent-activity.cancelled');
    } else if (status === 'pending') {
      return t('screens.recent-activity.pending');
    } else {
      return null;
    }
  };

  const accountStatus = getStatus();
  const statusStyle = status === 'declined' || status === 'cancelled' ? styles.errorStatus : undefined;

  const getAccountLogo = () => {
    let fromLogo = <SvgIcon name={SvgXmlIconNames.closedAccount} size={IconSize.md} />;
    let toLogo = fromLogo;

    const AccountImage = ({ url, colour }: { url: string; colour: string | null | undefined }) => {
      return (
        <View style={[styles.imageBg, { backgroundColor: colour || theme.palette.purple[500] }]}>
          <BaseImage resizeMode='contain' source={{ uri: url }} style={styles.imageSize} />
        </View>
      );
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
        const account = tradingAccounts.find((item) => `${item.typeId}` === `${LIVE_TYPE_ID}`) || ({} as UserAccount);

        if (account?.icon && account.colour) {
          fromLogo = <AccountImage url={account.icon} colour={fromColor || account.colour} />;
        } else fromLogo = <SvgIcon name={SvgXmlIconNames.tradingAccount} size={IconSize.md} />;
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
      }
    }

    if (toIcon) toLogo = <AccountImage colour={toColor} url={toIcon} />;
    else {
      if (toAccount === 'demoContest') {
        const url = demoContestAccount?.[0]?.icon;
        if (url) toLogo = <AccountImage colour={toColor || demoContestAccount?.[0]?.colour} url={url} />;
        else toLogo = <SvgIcon name={SvgXmlIconNames.demoContestRound} size={IconSize.md} />;
      } else if (toAccount == 'contest') {
        const url = contestAccount?.[0]?.icon;
        if (url) toLogo = <AccountImage url={url} colour={toColor || contestAccount?.[0]?.colour} />;
        else toLogo = <SvgIcon name={SvgXmlIconNames.contestRound} size={IconSize.md} />;
      } else if (toAccount === 'live') {
        const account = tradingAccounts.find((item) => `${item.typeId}` === `${LIVE_TYPE_ID}`) || ({} as UserAccount);
        if (account?.icon && account.colour)
          toLogo = <AccountImage url={account.icon} colour={toColor || account.colour} />;
        else toLogo = <SvgIcon name={SvgXmlIconNames.tradingAccount} size={IconSize.md} />;
      } else if (toAccount === 'wallet') {
        if (walletAccount?.icon)
          toLogo = <AccountImage url={walletAccount.icon} colour={toColor || walletAccount.colour} />;
        else toLogo = <SvgIcon name={SvgXmlIconNames.walletAccount} size={IconSize.md} />;
      } else if (toAccount === 'cashback') {
        if (cashbackAccount?.icon)
          toLogo = <AccountImage url={cashbackAccount.icon} colour={toColor || cashbackAccount.colour} />;
        else toLogo = <SvgIcon name={SvgXmlIconNames.cashbackAccount} size={IconSize.md} />;
      } else if (toAccount === 'ib') {
        if (rewardsAccount?.icon)
          toLogo = <AccountImage url={rewardsAccount.icon} colour={toColor || rewardsAccount.colour} />;
        else toLogo = <SvgIcon name={SvgXmlIconNames.rewardsAccount} size={IconSize.md} />;
      }
    }

    return (
      <Fragment>
        <View style={styles.fromLogoBox}>{fromLogo}</View>
        <View style={styles.toLogoBox}>{toLogo}</View>
      </Fragment>
    );
  };

  const accountLogo = getAccountLogo();

  const getFormattedValue = () => {
    const sanitizeVal = Math.abs(Number(amount));
    const amountVal = isCashback ? sanitizeVal : Math.round(sanitizeVal * 100) / 100;
    const formattedVal = formatNumberToAmount(amountVal);

    const symbol = getSymbolFromCurrency(currency);

    const resultVal = `${symbol ? symbol : ''}${formattedVal}${symbol ? '' : ` ${currency}`}`;

    if (isWelcome) {
      if (isFromWelcome) return `-${resultVal}`;
      else return `+${resultVal}`;
    } else if (isContest && isFromContest) {
      return `-${resultVal}`;
    } else if (isContest && isToContest) {
      return `+${resultVal}`;
    } else if (isFromCashback && isCashback) {
      return `-${resultVal}`;
    } else if (isFromWallet) {
      return `-${resultVal}`;
    } else if (isToWallet) {
      return `+${resultVal}`;
    } else {
      return `${resultVal}`;
    }
  };

  const formattedValue = getFormattedValue();

  const getFormattedAccount = (accountValue: string | undefined) => {
    if (accountValue === 'demoContest') {
      return t('screens.recent-activity.demo-contest-account');
    } else if (accountValue === 'contest') {
      return t('screens.recent-activity.contest-account');
    } else if (['live', 'welcome'].includes(accountValue as string)) {
      return t('screens.recent-activity.trading-account-title');
    } else if (accountValue === 'wallet') {
      return t('screens.recent-activity.wallet-account-title');
    } else if (accountValue === 'cashback') {
      return t('screens.recent-activity.cashback-account-title');
    } else if (accountValue === 'ib') {
      return t('screens.recent-activity.rewards-account-title');
    } else {
      return t('screens.recent-activity.archived-account-title');
    }
  };

  const formattedFromAccount = getFormattedAccount(fromAccount);
  const formattedToAccount = getFormattedAccount(toAccount);

  return (
    <TouchableOpacity onPress={onPress} style={styles.sectionItem} activeOpacity={activeOpacity} hitSlop={hitSlop}>
      <View style={styles.sectionItemBody}>
        <View style={styles.logoBox}>{accountLogo}</View>
        <View style={styles.sectionItemData}>
          <View style={styles.sectionItemTitle}>
            <BaseText numberOfLines={1} variant={BaseTextVariant.small}>
              {formattedFromAccount}
            </BaseText>
            <SvgIcon name={SvgXmlIconNames.arrowRight} size={IconSize.xs} color={theme.palette.graphite['900']} />
            <BaseText numberOfLines={1} style={{ flex: 1 }} variant={BaseTextVariant.small}>
              {formattedToAccount}
            </BaseText>
          </View>
          <BaseText style={styles.sectionItemTime} variant={BaseTextVariant.small}>
            {time}
          </BaseText>
        </View>
      </View>
      <View style={styles.sectionItemDetails}>
        <BaseText style={styles.textRight} variant={BaseTextVariant.small}>
          {formatTwoDecimals(formattedValue)}
        </BaseText>
        <BaseText style={[styles.textRight, statusStyle]} variant={BaseTextVariant.tiny}>
          {accountStatus}
        </BaseText>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create({
    sectionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12
    },
    fromLogoBox: {
      position: 'absolute',
      top: 0,
      left: 0
    },
    toLogoBox: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: palette.base.white
    },
    sectionItemBody: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      flex: 1
    },
    logoBox: {
      width: 32,
      height: 32
    },
    sectionItemData: {
      flex: 1
    },
    sectionItemTitle: {
      flexDirection: 'row',
      gap: 2,
      alignItems: 'center'
    },
    sectionItemTime: {
      color: '#4E5F64'
    },
    sectionItemDetails: {
      gap: 4
    },
    textRight: {
      textAlign: 'right'
    },
    errorStatus: {
      color: palette.red['600']
    },
    adjustIcon: {
      left: 3,
      top: 2.5
    },
    imageBg: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12
    },
    imageSize: {
      width: 12,
      height: 12
    }
  });

export default TransferCard;

import React, { Fragment, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseImage, BaseText, BaseTextVariant } from '@/components';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import getSymbolFromCurrency from 'currency-symbol-map';
import { formatNumberToAmount, formatTwoDecimals, localTime } from '@/helpers';
import { HistoryDataItem } from '@/containers/app/wallet/recent-activity';
import { useAppSelector } from '@/hooks';

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

interface IBaseTransactionCard {
  data: HistoryDataItem & { closeTime?: Date };
  onPress: () => void;
  timeFormat?: string;
  isCashback?: boolean;
}

const TransactionCard: React.FC<IBaseTransactionCard> = ({ data, onPress, timeFormat, isCashback = false }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const { type, createdAt, amount, status, logo, paymentSystem, currency, closeTime } = data || {};

  const isDeposit = type === 'deposit';
  const isWithdrawal = type === 'withdrawal';
  const isPspFee = type === 'psp fee';
  const isDormantFee = type === 'Dormant Fee';
  const isCashbackCorrection = type === 'cashback correction';
  const isCredit = type === 'credit';
  const isReward = type === 'reward';
  const isBalanceCorrection = type === 'balance correction';

  const trimmedSymbol = (str?: string): string => {
    if (!str) return '';
    return str.replace(/.VIP|.ISL/gi, '');
  };

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
    if (isCashback) {
      if (isCashbackCorrection) return <SvgIcon name={SvgXmlIconNames.cashbackAccount} size={IconSize.lg} />;
    } else if (isBalanceCorrection) {
      return <SvgIcon name={SvgXmlIconNames.balanceCorrection} size={IconSize.lg} />;
    } else if (isReward) {
      return <SvgIcon name={SvgXmlIconNames.rewards} size={IconSize.lg} />;
    }

    const getTypeIcon = () => {
      if (isDeposit) return <SvgIcon style={styles.transactionIcon} name={SvgXmlIconNames.deposit} size={IconSize.xsm} />;
      else if (isWithdrawal) return <SvgIcon style={styles.transactionIcon} name={SvgXmlIconNames.withdrawal} size={IconSize.xsm} />
      return null;
    }

    const getTypeLogo = () => {
      if (isPspFee) return <BaseImage style={styles.logoImg} resizeMode='contain' source={images.pspFee} />
      else if (isDormantFee) return <BaseImage style={styles.logoImg} resizeMode='contain' source={images.dormantFee} />
      else if (isCredit) return <BaseImage style={styles.logoImg} resizeMode='contain' source={images.credit} />;
      else if (logo) return <BaseImage style={styles.logoImg} resizeMode='contain' source={{ uri: logo }} />;
      return <View style={styles.blankImg} />;
    }

    return (
      <Fragment>
        {getTypeLogo()}
        {getTypeIcon()}
      </Fragment>
    );
  };

  const accountLogo = getAccountLogo();

  const getFormattedValue = () => {
    const sign = Number(amount) < 0 ? '-' : '+';
    const sanitizeVal = Math.abs(Number(amount));

    const amountVal = isCashback ? sanitizeVal : Math.round(sanitizeVal * 100) / 100;
    const formattedVal = formatNumberToAmount(amountVal);

    const symbol = getSymbolFromCurrency(currency);

    const resultVal = `${symbol ? symbol : ''}${formattedVal}${symbol ? '' : ` ${currency}`}`;

    if (isCredit) return `${sign}${resultVal}`;
    else if (isReward || isBalanceCorrection) return `${sign}${resultVal}`;
    else if (isCashbackCorrection) return `+${resultVal}`;
    else if (isWithdrawal || isPspFee || isDormantFee) {
      return `-${resultVal}`;
    } else if (isDeposit) {
      return `+${resultVal}`;
    } else {
      return `${resultVal}`;
    }
  };

  const formattedValue = getFormattedValue();

  const getFormattedAccount = (accountValue: string | undefined) => {
    if (isCredit) return t('screens.recent-activity.credit');
    else if (isReward) return t('screens.recent-activity.reward');
    else if (isBalanceCorrection) return t('screens.recent-activity.balance-correction');
    else if (isCashback) {
      if (isCashbackCorrection) return t('screens.recent-activity-details.cashback-correction');
      return t('screens.recent-activity.cashback-transaction', { symbol: accountValue || trimmedSymbol(data.symbol) });
    } else if (isDeposit) {
      return accountValue
        ? t('screens.recent-activity.deposit-via', { psp: accountValue })
        : t('screens.recent-activity.deposit');
    } else if (isWithdrawal) {
      return accountValue
        ? t('screens.recent-activity.withdrawal-via', { psp: accountValue })
        : t('screens.recent-activity.withdrawal');
    } else if (isPspFee) {
      return t('screens.recent-activity.payment-provider-fee');
    } else if (isDormantFee) {
      return t('screens.recent-activity-details.dormant-fee');
    } else {
      return null;
    }
  };

  const formattedAccount = getFormattedAccount(paymentSystem);

  return (
    <TouchableOpacity onPress={onPress} style={styles.sectionItem} activeOpacity={activeOpacity} hitSlop={hitSlop}>
      <View style={styles.sectionItemBody}>
        <View style={styles.logoBox}>{accountLogo}</View>
        <View style={styles.sectionItemData}>
          <View style={styles.sectionItemTitle}>
            <BaseText style={styles.textWidth} variant={BaseTextVariant.small} numberOfLines={1}>
              {formattedAccount}
            </BaseText>
          </View>
          {!!time.length && (
            <BaseText style={styles.sectionItemTime} variant={BaseTextVariant.small}>
              {time}
            </BaseText>
          )}
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
    sectionItemBody: {
      flexDirection: 'row',
      gap: 8,
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
    textWidth: { width: '100%' },
    logoImg: {
      width: 32,
      height: 32,
      borderRadius: 32,
      overflow: 'hidden'
    },
    blankImg: {
      width: 32,
      height: 32,
      borderRadius: 32,
      overflow: 'hidden',
      backgroundColor: palette.graphite['100']
    },
    transactionIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0
    }
  });

export default TransactionCard;

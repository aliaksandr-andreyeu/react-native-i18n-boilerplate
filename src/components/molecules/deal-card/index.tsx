import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config, testIDs } from '@/constants';
import { BaseImage, BaseText, BaseTextVariant } from '@/components';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import getSymbolFromCurrency from 'currency-symbol-map';
import { formatNumberToAmount, formatTwoDecimals, getAssetName, localTime } from '@/helpers';
import { HistoryDataItem } from '@/containers/app/wallet/recent-activity';

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

interface BaseDealActivityCardProps {
  data: HistoryDataItem;
  onPress: () => void;
  timeFormat?: string;
}

const BaseDealActivityCard: React.FC<BaseDealActivityCardProps> = ({ data, onPress, timeFormat }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const { createdAt, amount, symbol, logo, currency } = data || {};

  const time = localTime(createdAt, timeFormat || 'HH:mm');

  const getAccountLogo = () => {
    return logo ? (
      <BaseImage style={styles.logoImg} resizeMode='contain' source={{ uri: logo }} />
    ) : (
      <View style={styles.blankImg} />
    );
  };

  const accountLogo = getAccountLogo();

  const getFormattedValue = () => {
    const sanitizeVal = Math.abs(Number(amount));

    const amountVal = Math.round(sanitizeVal * 100) / 100;
    const formattedVal = formatNumberToAmount(amountVal);

    const symbol = getSymbolFromCurrency(currency);

    const resultVal = `${symbol ? symbol : ''}${formattedVal}${symbol ? '' : ` ${currency}`}`;

    if (Number(amount) < 0) {
      return `-${resultVal}`;
    } else if (Number(amount) > 0) {
      return `+${resultVal}`;
    } else {
      return `${resultVal}`;
    }
  };

  const formattedValue = getFormattedValue();

  const formattedValueStyle = Number(amount) < 0 ? styles.loss : Number(amount) > 0 ? styles.profit : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.sectionItem}
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      accessibilityRole='button'
    >
      <View style={styles.sectionItemBody}>
        <View style={styles.logoBox}>{accountLogo}</View>
        <View style={styles.sectionItemData}>
          <View style={styles.sectionItemTitle}>
            <BaseText
              style={styles.textWidth}
              variant={BaseTextVariant.small}
              numberOfLines={1}
              testID={testIDs.components.molecules.dealCard.assetName}
            >
              {t('screens.recent-activity.closed-position', { asset: getAssetName(symbol) })}
            </BaseText>
          </View>
          <BaseText
            style={styles.sectionItemTime}
            variant={BaseTextVariant.small}
            testID={testIDs.components.molecules.dealCard.activityTime}
          >
            {time}
          </BaseText>
        </View>
      </View>
      <View style={styles.sectionItemDetails}>
        <BaseText
          style={[styles.textRight, formattedValueStyle]}
          variant={BaseTextVariant.small}
          testID={testIDs.components.molecules.dealCard.activityValue}
        >
          {formatTwoDecimals(formattedValue)}
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
    profit: {
      color: '#159D55'
    },
    loss: {
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

export default BaseDealActivityCard;

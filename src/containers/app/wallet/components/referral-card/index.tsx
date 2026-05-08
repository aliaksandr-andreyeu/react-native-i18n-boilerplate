import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components';
import { formatTwoDecimals } from '@/helpers';

interface IBaseReferralCard {
  assetName: string;
  date: string;
  earning: number;
  lot: string;
  isLastItem?: boolean;
}

const BaseReferralCard: React.FC<IBaseReferralCard> = ({ assetName, date, earning, lot, isLastItem }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={[styles.container, !isLastItem && styles.withBorder]}>
      <View style={styles.gap}>
        <BaseText variant={BaseTextVariant.textSemiBold} style={styles.title}>
          {assetName}
        </BaseText>
        <BaseText style={styles.grayText}>{date}</BaseText>
      </View>
      <View style={styles.gap}>
        {/* <BaseText style={styles.textAlignRight}>+${formatTwoDecimals(earning?.toFixed?.(2))}</BaseText> */}
        <BaseText style={[styles.grayText, styles.textAlignRight, styles.lot]}>{lot}</BaseText>
      </View>
    </View>
  );
};

const useStyles = ({ palette: { graphite } }: UserTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 12,
      gap: 8
    },
    withBorder: {
      borderBottomWidth: 1,
      borderColor: '#D9E1E4'
    },
    lotWrapper: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    lot: {
      color: graphite[400]
    },
    gap: {
      gap: 4
    },
    title: {
      color: graphite['900']
    },
    textAlignRight: {
      textAlign: 'right'
    },
    grayText: {
      color: graphite[400]
    }
  });

export default BaseReferralCard;

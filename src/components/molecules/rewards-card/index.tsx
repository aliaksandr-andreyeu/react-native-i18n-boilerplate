import React, { FC } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { BaseText, BaseTextVariant } from '@/components';

export interface RewardsItemProps {
  id: number;
  date: string;
  currency: string;
  lot: string;
  price: string;

}

interface RewardsCardProps extends RewardsItemProps {
  onPress(): void;
}

const {
  buttons: { activeOpacity }
} = config;

const RewardsCard: FC<RewardsCardProps> = ({ id, date, currency, lot, price, onPress }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={activeOpacity} onPress={onPress}>
      <View style={styles.box}>
        <BaseText style={styles.primaryText} variant={BaseTextVariant.titleXXS}>
          {currency}
        </BaseText>
        <BaseText style={styles.tertiaryText} variant={BaseTextVariant.extraSmall}>
          {date}
        </BaseText>
      </View>
      <View style={styles.box}>
        <BaseText style={[styles.greenText, styles.textAlignRight]} variant={BaseTextVariant.priceRegular}>
          {price}
        </BaseText>
        <BaseText style={[styles.tertiaryText, styles.textAlignRight]} variant={BaseTextVariant.extraSmall}>
          {lot}
        </BaseText>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { text }
  } = theme || {};

  return StyleSheet.create({
    container: {
      gap: 8,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    box: {
      gap: 4
    },
    primaryText: {
      color: text.title.primary
    },
    tertiaryText: {
      color: text.title.hint
    },
    underlineText: {
      textDecorationLine: 'underline'
    },
    textAlignRight: {
      textAlign: 'right',
    },
    greenText: {
      color: "#269B56"
    }
  });
};

export default RewardsCard;

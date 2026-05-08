import React, { FC, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { BaseText, BaseTextVariant } from '@/components';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';

export enum TRANSACTIONS_TYPE {
  Standard = 'Standard',
  Cashback = 'Cashback',
  Referral = 'Referral'
}

export interface RewardsWalletItemProps {
  id: string;
  date: string;
  time: string;
  name: string;
  type: TRANSACTIONS_TYPE;
  price: string;
  lot?: string;
}

interface RewardsWalletCardProps extends RewardsWalletItemProps {}

const {
  buttons: { activeOpacity }
} = config;

const RewardsWalletCard: FC<RewardsWalletCardProps> = ({ date, lot, price, type, name, time }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const iconRewards = useMemo(() => {
    switch (type) {
      case TRANSACTIONS_TYPE.Standard:
        return <SvgIcon name={SvgXmlIconNames.gift} size={IconSize.md} color={'#2A468C'} />;
      case TRANSACTIONS_TYPE.Referral:
        return <SvgIcon name={SvgXmlIconNames.people} size={IconSize.md} color={'#269B56'} />;
      case TRANSACTIONS_TYPE.Cashback:
        return <SvgIcon name={SvgXmlIconNames.money} size={IconSize.md} color={'#F7BF16'} />;
    }
  }, [theme]);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={activeOpacity}>
      <View style={styles.iconBox}>{iconRewards}</View>
      <View style={styles.box}>
        <BaseText style={styles.primaryText} variant={BaseTextVariant.titleXXS}>
          {name}
        </BaseText>
        <BaseText style={styles.hintText} variant={BaseTextVariant.extraSmall}>
          {date} · {time} · {type}
        </BaseText>
      </View>
      <View style={[styles.box, styles.boxRight]}>
        <BaseText style={styles.greenText} variant={BaseTextVariant.textLight}>
          {price}
        </BaseText>
        <BaseText style={styles.tertiaryText} variant={BaseTextVariant.extraSmall}>
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
      height: 56,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    iconBox: {
      height: 56,
      paddingHorizontal: 8,
      justifyContent: 'center',
      alignContent: 'center'
    },
    box: {
      gap: 4,
      justifyContent: 'flex-start',
      flexGrow: 1,
      flexShrink: 0
    },
    boxRight: {
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      flexGrow: 0
    },
    primaryText: {
      color: text.title.primary
    },
    greenText: {
      color: text.status.positive
    },
    hintText: {
      color: text.title.hint
    },
    tertiaryText: {
      color: text.title.tertiary
    }
  });
};

export default RewardsWalletCard;

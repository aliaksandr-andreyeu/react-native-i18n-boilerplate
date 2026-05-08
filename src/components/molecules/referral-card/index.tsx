import React, { FC, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components';
import { config } from '@/constants';

const {
  components: {
    cards: { activeOpacity, hitSlop }
  }
} = config || {};
export interface BaseRefferalCardProps {
  avatar: string | undefined;
  title: string;
  subTitle?: string;
  amount: string;
  index: number;
  onPress?: () => void;
}

const BaseReferralCard: FC<BaseRefferalCardProps> = ({ title, subTitle, amount, index, onPress }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const avatarBg = useMemo(() => {
    const p = theme.palette;
    const colors = [p.blue?.[200], p.purple?.[200], p.yellow?.[200]].filter(Boolean) as string[];
    if (colors.length === 0) return '#E5E7EB';
    return colors[index % colors.length];
  }, [index, theme]);

  const onPressHandler = useMemo(() => {
    return onPress && typeof onPress === 'function' ? onPress : () => {};
  }, [onPress]);

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      onPress={onPressHandler}
      style={styles.sectionRow}
    >
      <View style={styles.sectionRowInner}>
        <View style={styles.sectionRowLeft}>
          <BaseText variant={BaseTextVariant.titleXXS}>{title}</BaseText>
          <BaseText variant={BaseTextVariant.extraSmall} style={styles.sectionRowSubtitle}>
            {subTitle}
          </BaseText>
        </View>
        <BaseText variant={BaseTextVariant.priceRegular} style={styles.sectionRowAmount}>
          {amount}
        </BaseText>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { text, green, blue }
  } = theme || {};
  return StyleSheet.create({
    sectionRow: {
      flexDirection: 'column'
    },
    sectionRowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      justifyContent: 'space-between'
    },
    sectionRowLeft: {
      flex: 1,
      marginRight: 12,
      gap: 2
    },
    sectionRowAvatar: {
      width: 28,
      height: 28,
      position: 'absolute',
      left: 2,
      bottom: -2
    },
    sectionRowSubtitle: {
      color: text.base.tertiary,
      marginTop: 2
    },
    sectionRowAmount: {
      color: green[600],
      textAlign: 'right'
    },
    imageWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: blue[200],
      overflow: 'hidden'
    }
  });
};

export default BaseReferralCard;

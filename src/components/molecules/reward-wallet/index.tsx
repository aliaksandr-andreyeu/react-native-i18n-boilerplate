import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { BaseText, BaseTextVariant, ProgressBar } from '@/components';
import { UserTheme, config } from '@/constants';
import { formatTwoDecimals } from '@/helpers';
import { useCommonStyles } from '@/hooks';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FC } from 'react';
import { StyleSheet, TextStyle, View, ViewStyle, ViewProps, Pressable } from 'react-native';

export interface RewardWalletCardProps extends ViewProps {
  availableAmount: number;
  amount: number;
  onPress?: () => void;
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  iconWrapper: ViewStyle;
  title: TextStyle;
  amountWrapper: ViewStyle;
  amount: TextStyle;
  arrowWrap: ViewStyle;
}

const {
  components: {
    cards: { hitSlop }
  }
} = config;

const RewardWallet: FC<RewardWalletCardProps> = ({ availableAmount, amount, onPress, style }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <Pressable hitSlop={hitSlop} onPress={onPress} style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <SvgIcon name={SvgXmlIconNames.diamond} size={IconSize.md} color='white' />
        </View>
        <BaseText style={styles.title} variant={BaseTextVariant.subTitleSemiBold}>
          {t('components.molecules.rewards-wallet.title')}
        </BaseText>
      </View>
      <View style={styles.amountWrapper}>
        <BaseText style={styles.amount} variant={BaseTextVariant.amountSubTitle}>
          ${formatTwoDecimals(amount)}
        </BaseText>
      </View>
      <ProgressBar value={amount} maxValue={availableAmount} />
      <View style={styles.arrowWrap}>
        <SvgIcon name={SvgXmlIconNames.arrowAngle} size={IconSize.xs} />
      </View>
    </Pressable>
  );
};
export default RewardWallet;

const useStyles = (theme: UserTheme) => {
  const { palette } = theme;
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      backgroundColor: palette.base.white,
      paddingTop: 16,
      paddingBottom: 16,
      borderRadius: 16,
      paddingHorizontal: 16,
      borderWidth: 1.5,
      borderColor: 'transparent',
      ...shadow6Style
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 9,
      marginBottom: 10
    },
    iconWrapper: {
      borderRadius: 8,
      padding: 7,
      backgroundColor: palette.blue[500]
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.graphite['900']
    },
    amountWrapper: {
      flexDirection: 'row',
      marginBottom: 7
    },
    amount: {
      fontSize: 22,
      fontWeight: '500',
      color: palette.graphite['900']
    },
    arrowWrap: {
      marginTop: 3,
      flex: 1,
      alignItems: 'flex-end'
    }
  });
};

import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ParamListBase, useNavigation, useTheme } from '@react-navigation/native';
import { UserTheme, testIDs } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseHelpButton, BaseText, BaseTextVariant } from '@/components';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { config } from '@/constants';
import { StackScreenProps } from '@react-navigation/stack';
import { WALLET_ROUTE_NAMES, WalletRootParamsList } from '@/navigation/app/stacks';
import { formatTwoDecimals } from '@/helpers';

export type AnyPressActions = 'deposit' | 'withdrawal' | 'transfer' | 'history';

interface MainWalletProps {
  amount: string;
  onAnyPress?(action: AnyPressActions): void;
  blockActions?: boolean;
  canDeposit?: boolean;
  canWithdrawal?: boolean;
  canTransfer?: boolean;
  canHistory?: boolean;
  testID?: string;
}

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const MainWallet = ({
  amount,
  onAnyPress,
  blockActions = false,
  canDeposit,
  canWithdrawal,
  canTransfer,
  canHistory,
  testID
}: MainWalletProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  const portfolio = useAppSelector((state) => state.portfolio);
  const { userInfo } = portfolio || {};
  const { isVerified } = userInfo || {};

  const navigation =
    useNavigation<StackScreenProps<ParamListBase & WalletRootParamsList, WALLET_ROUTE_NAMES.Wallet>['navigation']>();

  const {
    palette: { icon }
  } = theme || {};

  return (
    <View style={styles.container} testID={testID || testIDs.wallet.screen.mainWallet.container}>
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <View style={styles.svgWrap}>
            <SvgIcon name={SvgXmlIconNames.bankNote} />
          </View>
          <BaseText style={styles.title}>{t('screens.wallet.main-wallet')}</BaseText>
          <BaseHelpButton
            title={t('screens.wallet.main-wallet')}
            text={t('screens.wallet.main-wallet-tooltip')}
            color={icon?.base?.tertiary}
          />
        </View>
        <TouchableOpacity
          style={styles.recentActivity}
          activeOpacity={activeOpacity}
          hitSlop={hitSlop}
          onPress={() => {
            onAnyPress && onAnyPress('history');
            if (blockActions || !canHistory) {
              return;
            }
            navigation.navigate(ROOT_ROUTE_NAMES.RecentActivity);
          }}
        >
          <SvgIcon name={SvgXmlIconNames.file} color={theme.palette.base.white} />
        </TouchableOpacity>
      </View>
      <BaseText style={styles.amount} variant={BaseTextVariant.amountSubTitle}>
        {formatTwoDecimals(amount)}
      </BaseText>
      <View style={styles.buttonWrap}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => {
            onAnyPress && onAnyPress('deposit');
            if (blockActions || !canDeposit) {
              return;
            }
            if (isVerified) {
              navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
            } else {
              navigation.navigate(ROOT_ROUTE_NAMES.DepositForUnverified);
            }
          }}
        >
          <View style={[styles.round, styles.greenBackground]}>
            <SvgIcon name={SvgXmlIconNames.plus} size={IconSize.sm} />
          </View>
          <BaseText variant={BaseTextVariant.small} style={styles.buttonText}>
            {t('screens.wallet.deposit')}
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => {
            onAnyPress && onAnyPress('withdrawal');
            if (blockActions || !canWithdrawal) {
              return;
            }
            if (isVerified) {
              navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: false });
            } else {
              navigation.navigate(ROOT_ROUTE_NAMES.WithdrawalForUnverified);
            }
          }}
        >
          <View style={[styles.round, styles.rotate90]}>
            <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.md} />
          </View>
          <BaseText variant={BaseTextVariant.small} style={styles.buttonText}>
            {t('screens.wallet.withdraw')}
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onAnyPress && onAnyPress('transfer');
            if (blockActions || !canTransfer) {
              return;
            }
            navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
          }}
          style={styles.button}
          activeOpacity={0.8}
        >
          <View style={styles.round}>
            <SvgIcon name={SvgXmlIconNames.transfer} size={IconSize.sm} />
          </View>
          <BaseText variant={BaseTextVariant.small} style={styles.buttonText}>
            {t('screens.wallet.transfer')}
          </BaseText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  svgWrap: ViewStyle;
  recentActivity: ViewStyle;
  top: ViewStyle;
  topLeft: ViewStyle;
  buttonWrap: ViewStyle;
  rotate90: ViewStyle;
  button: ViewStyle;
  greenBackground: ViewStyle;
  round: ViewStyle;
  title: TextStyle;
  amount: TextStyle;
  buttonText: TextStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      backgroundColor: palette.graphite['900'],
      paddingHorizontal: 16,
      paddingVertical: 24,
      borderRadius: 16
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    topLeft: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.base.white,
      marginLeft: 8
    },
    svgWrap: {
      padding: 7,
      borderRadius: 8,
      backgroundColor: '#6E7783'
    },
    recentActivity: {
      padding: 2
    },
    amount: {
      marginTop: 20,
      color: palette.base.white
    },
    buttonWrap: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20
    },
    button: {
      flex: 1,
      alignItems: 'center'
    },
    round: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      backgroundColor: palette.base.white
    },
    buttonText: {
      marginTop: 8,
      textAlign: 'center',
      color: palette.base.white
    },
    rotate90: {
      transform: [{ rotate: '90deg' }]
    },
    greenBackground: {
      backgroundColor: palette.green['400']
    }
  });

export default MainWallet;

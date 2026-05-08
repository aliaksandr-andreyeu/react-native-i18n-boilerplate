import React, { FC, useState, useCallback } from 'react';
import { ParamListBase, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { View, ActivityIndicator, Pressable, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Currencies } from '@/helpers';
import getCurrency from '@/helpers/currency';
import useStyles from './styles';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Trans, useTranslation } from 'react-i18next';
import {
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseText,
  BaseTextVariant,
  BaseSeparator,
  PieChart,
  RecentRewardsTransactions
} from '@/components';
import { config, testIDs } from '@/constants';
import { useAppSelector } from '@/hooks';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';

const {
  headerBar: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

type RewardsScreenData = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.RewardsWallet>;

const RewardsWalletScreen: FC<RewardsScreenData> = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};
  const isAuthorized = Boolean(accessToken);

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const { palette } = theme || {};
  const { blue, green, yellow, icon } = palette || {};

  const AnimatedIndicator = Animated.createAnimatedComponent(ActivityIndicator);

  const goRedeemHistory = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.RedeemHistory);
  }, [navigation]);

  const goToBack = useCallback(() => {
    const { canGoBack, goBack } = navigation || {};

    const canBack = canGoBack();

    if (canBack) {
      return goBack();
    }

    navigation.navigate(ROOT_ROUTE_NAMES.App, { screen: APP_ROUTE_NAMES.Wallet });
  }, [navigation]);

  const HeaderLeft = useCallback(() => {
    if (!isAuthorized) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={hitSlop}
        testID={testIDs.rewardsWallet.header.goBack}
        activeOpacity={activeOpacity}
        style={[styles.headerIcon, styles.headerLeftIcon]}
        onPress={goToBack}
      >
        <SvgIcon name={SvgXmlIconNames.arrowLeft} size={IconSize.lg} color={icon.base.contrast} />
      </TouchableOpacity>
    );
  }, [isAuthorized, goRedeemHistory, icon, styles]);

  const HeaderRight = useCallback(() => {
    if (!isAuthorized) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={hitSlop}
        testID={testIDs.rewardsWallet.header.transactionsHistory}
        activeOpacity={activeOpacity}
        style={[styles.headerIcon, styles.headerRightIcon]}
        onPress={goRedeemHistory}
      >
        <SvgIcon name={SvgXmlIconNames.transactionsHistory} size={IconSize.md} color={icon.base.contrast} />
      </TouchableOpacity>
    );
  }, [isAuthorized, goRedeemHistory, icon, styles]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: '',
        headerStyle: styles.headerStyle,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />
      });
      return () => {};
    }, [navigation, HeaderRight, HeaderLeft, styles])
  );

  const getData = async () => {
    try {
      setIsLoading(true);
      // Getting data
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  const Available = useCallback(
    ({ balance, currency = 'USD', threshold }: { balance: number; currency: Currencies; threshold: number }) => {
      const remaining = Math.max(0, threshold - balance);
      const progress = threshold > 0 ? Math.min(1, Math.max(0, balance / threshold)) : 1;
      const unlocked = remaining === 0;

      const goToRedeem = () => {
        /** FOR TESTING PURPOSES ONLY. Remove in production
          if (!unlocked) {
          return;
        } */
        navigation.navigate(ROOT_ROUTE_NAMES.Redeem);
      };

      return (
        <View style={styles.availableContainer}>
          <BaseText style={styles.tertiaryText} variant={BaseTextVariant.caption}>
            {t('screens.rewards-wallet.title')}
          </BaseText>
          <BaseText style={[styles.secondaryText, styles.availableText]} variant={BaseTextVariant.small}>
            {t('screens.rewards-wallet.subTitle')}
          </BaseText>
          <BaseText style={[styles.primaryText, styles.availablePrice]} variant={BaseTextVariant.amountTitle}>
            {getCurrency(currency).text(balance.toFixed(2))}
          </BaseText>
          <Pressable hitSlop={hitSlop} style={styles.progressPill} onPress={goToRedeem}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            <BaseText variant={BaseTextVariant.text}>
              {unlocked ? (
                t('screens.rewards-wallet.redeem')
              ) : (
                <Trans
                  i18nKey='screens.rewards-wallet.more-redeem-rich'
                  values={{ amount: `${(+remaining).toFixed(2)}${getCurrency(currency).symbol}` }}
                  components={{ b: <BaseText variant={BaseTextVariant.text} style={styles.amountBold} /> }}
                />
              )}
            </BaseText>
            {!unlocked ? (
              <SvgIcon style={styles.progressLock} name={SvgXmlIconNames.lockPlain} size={IconSize.md} />
            ) : null}
          </Pressable>
        </View>
      );
    },
    [palette, t, navigation, styles]
  );

  const goToReferrals = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Referrals);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      {isLoading ? (
        <AnimatedIndicator
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.indicator}
          color={theme.palette.graphite['900']}
          size={'small'}
        />
      ) : (
        <Animated.ScrollView contentContainerStyle={styles.scroll} entering={FadeIn}>
          <Available
            balance={4.8}
            currency={'USD' as Currencies}
            threshold={100} // minimum withdrawal threshold
          />
          <BaseSeparator />
          <View style={styles.section}>
            <BaseText style={styles.subTitle} variant={BaseTextVariant.captionSmall}>
              {t('screens.rewards-wallet.my-balance')}
            </BaseText>
            <View style={styles.pieChart}>
              <PieChart
                data={[
                  { value: 10, color: blue[800], type: t('screens.rewards-wallet.standard-type') },
                  { value: 100, color: yellow[400], type: t('screens.rewards-wallet.cashback-type') },
                  { value: 100, color: green[600], type: t('screens.rewards-wallet.referral-type') }
                ]}
                withLegend
                goal={1000}
              />
            </View>
          </View>
          <BaseSeparator />
          <View style={styles.section}>
            <BaseText style={styles.subTitle} variant={BaseTextVariant.captionSmall}>
              {t('screens.rewards-wallet.recent-rewards')}
            </BaseText>
            <RecentRewardsTransactions />
            <BaseButton
              type={BaseButtonType.secondary}
              size={BaseButtonSize.large}
              style={styles.inviteBtn}
              iconFirst={false}
              icon={<SvgIcon name={SvgXmlIconNames.chevronRight} color={icon.base.contrast} size={IconSize.xs} />}
              label={t('screens.rewards-wallet.invite-friends')}
              onPress={goToReferrals}
            />
          </View>
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RewardsWalletScreen;

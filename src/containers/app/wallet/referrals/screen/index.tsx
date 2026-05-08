import React, { FC, useState, useCallback, useRef } from 'react';
import { ParamListBase, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Currencies } from '@/helpers';
import getCurrency from '@/helpers/currency';
import useStyles from './styles';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import RewardsCard, { RewardsItemProps } from '@/components/molecules/rewards-card';
import {
  BaseText,
  BaseBackButton,
  BaseTextVariant,
  BaseButton,
  BaseButtonType,
  BaseButtonSize,
  BaseImage,
  BaseReferralCard,
  MyReferralCard,
  InviteFriendSheet
} from '@/components';
import { InviteFriendSheetRef } from '@/components/molecules/invite-friend-sheet';

type ReferralsScreenData = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.Referrals>;

const ReferralsScreen: FC<ReferralsScreenData> = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimpleSteps, setSimpleSteps] = useState<boolean>(true);

  const { t } = useTranslation();

  const inviteFriendRef = useRef<InviteFriendSheetRef>(null);

  const theme = useTheme();
  const styles = useStyles(theme);
  const AnimatedIndicator = Animated.createAnimatedComponent(ActivityIndicator);

  // TODO: Begin test data
  const referralsData: string[] = ['test', 'test1', 'test2'];

  const rewardsData: RewardsItemProps[] = [
    {
      id: 115873,
      date: '25.03.25 · 12:00 · Referral',
      currency: 'EURUSD',
      lot: '0.01 lot',
      price: '+$0.01'
    },
    {
      id: 115874,
      date: '25.03.25 · 12:00 · Referral',
      currency: 'EURUSD',
      lot: '0.01 lot',
      price: '+$0.01'
    },
    {
      id: 115875,
      date: '25.03.25 · 12:00 · Referral',
      currency: 'EURUSD',
      lot: '0.01 lot',
      price: '+$0.01'
    },
    {
      id: 115872,
      date: '25.03.25 at 12:00',
      currency: 'EURUSD',
      lot: '0.01 lot',
      price: '+$0.01'
    },
    {
      id: 115876,
      date: '25.03.25 at 12:00',
      currency: 'EURUSD',
      lot: '0.01 lot',
      price: '+$0.01'
    }
  ];
  // TODO: End test data

  useFocusEffect(
    useCallback(() => {
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
      getData();
    }, [])
  );

  const onCloseSimpleSteps = useCallback(() => setSimpleSteps(false), []);

  const goToRewardsWallet = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.RewardsWallet);
  }, [navigation]);

  const onPressSeeAllReferrals = useCallback(() => navigation.navigate(ROOT_ROUTE_NAMES.AllReferrals), [navigation]);

  const onPressSeeAllRewards = useCallback(() => navigation.navigate(ROOT_ROUTE_NAMES.ReferralRewards), [navigation]);

  const handleOpenInvite = useCallback(() => {
    inviteFriendRef.current?.present();
  }, []);

  const Seperator = useCallback(() => {
    return (
      <Animated.View style={styles.seperatorContainer}>
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </Animated.View>
    );
  }, [theme.dark]);

  const Available = useCallback(
    ({ balance, currency = 'USD', rewardsEmpty }: { balance: number; currency: Currencies; rewardsEmpty: boolean }) => {
      return (
        <>
          <View style={styles.availableContainer}>
            <View style={styles.head}>
              <BaseText style={styles.tertiaryText} variant={BaseTextVariant.caption}>
                {t('screens.referrals.title')}
              </BaseText>
              <BaseText style={[styles.primaryText, styles.availablePrice]} variant={BaseTextVariant.h1Bold}>
                {getCurrency(currency).text(balance.toFixed(2))}
              </BaseText>
            </View>
            {rewardsEmpty && (
              <BaseButton
                type={BaseButtonType.accent}
                style={styles.rewardsBtn}
                labelStyle={styles.rewardsBtnText}
                size={BaseButtonSize.large}
                label={t('screens.referrals.rewards-wallet')}
                onPress={goToRewardsWallet}
              />
            )}
          </View>
          <Seperator />
        </>
      );
    },
    [t, styles, goToRewardsWallet]
  );

  const TimeStats = useCallback(
    ({
      balance,
      currency,
      lots,
      referrals
    }: {
      balance: number;
      currency: Currencies;
      lots: number;
      referrals: number;
    }) => {
      const listTimeStats: { name: string; number: string }[] = [
        {
          name: t('screens.referrals.earned'),
          number: getCurrency(currency).text(balance.toFixed(2))
        },
        {
          name: t('screens.referrals.lots'),
          number: `${lots}`
        },
        {
          name: t('screens.referrals.title'),
          number: `${referrals}`
        }
      ];

      return (
        <>
          <View style={styles.listContainer}>
            <BaseText style={styles.primaryText} variant={BaseTextVariant.captionSmall}>
              {t('screens.referrals.all-time-stats')}
            </BaseText>
            <View style={styles.timeStatsList}>
              {listTimeStats.map((item) => {
                return (
                  <View key={item.name} style={styles.timeStatsItem}>
                    <BaseText style={styles.tertiaryText} variant={BaseTextVariant.text}>
                      {item.name}
                    </BaseText>
                    <BaseText style={styles.primaryText} variant={BaseTextVariant.statsNumber}>
                      {item.number}
                    </BaseText>
                  </View>
                );
              })}
            </View>
          </View>
          <Seperator />
        </>
      );
    },
    [t, styles]
  );

  const SimpleSteps = useCallback(() => {
    if (!isSimpleSteps) {
      return null;
    }

    const listSimpleSteps: { id: number; text: string }[] = [
      {
        id: 1,
        text: t('screens.referrals.share-referral-code')
      },
      {
        id: 2,
        text: t('screens.referrals.your-friends-signup')
      },
      {
        id: 3,
        text: t('screens.referrals.you-earn-trade')
      }
    ];

    return (
      <>
        <View style={styles.listContainer}>
          <View style={styles.simpleStepsTop}>
            <BaseText style={styles.primaryText} variant={BaseTextVariant.captionSmall}>
              {t('screens.referrals.simple-steps-earn')}
            </BaseText>
            <BaseButton
              type={BaseButtonType.accent}
              onPress={onCloseSimpleSteps}
              size={BaseButtonSize.tiny}
              style={styles.simpleStepsClose}
              icon={
                <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xs} color={theme.palette.icon.base.contrast} />
              }
            />
          </View>
          <View style={styles.simpleStepsList}>
            {listSimpleSteps.map((item) => {
              return (
                <View key={item.id} style={styles.simpleStepsItem}>
                  <View style={styles.simpleStepsNumber}>
                    <BaseText style={styles.blueText} variant={BaseTextVariant.widgetH1}>
                      {item.id}
                    </BaseText>
                  </View>
                  <BaseText style={styles.primaryText} variant={BaseTextVariant.text}>
                    {item.text}
                  </BaseText>
                </View>
              );
            })}
          </View>
        </View>
        <Seperator />
      </>
    );
  }, [t, styles, onCloseSimpleSteps]);

  const AllReferrals = useCallback(
    ({ referralsData }: { referralsData: string[] }) => {
      return (
        <>
          <View style={styles.listContainer}>
            <View style={styles.referralHeader}>
              <View style={styles.referralIconContainer}>
                <SvgIcon name={SvgXmlIconNames.referral} size={IconSize.sm} color={theme.palette.base.white} />
              </View>
              <BaseText style={styles.primaryText} variant={BaseTextVariant.captionSmall}>
                {t('screens.referrals.my-referrals')}
              </BaseText>
            </View>
            {Boolean(referralsData.length) ? (
              <>
                <View style={[styles.referralsBox, styles.shadow]}>
                  {referralsData.map((item, i) => (
                    <>
                      <MyReferralCard
                        onPress={() => navigation.navigate(ROOT_ROUTE_NAMES.SingleReferral)}
                        key={`${item}-${i}`}
                        date='25.03.25 · 12:00'
                        id={i + 123132}
                        lot={0.01}
                      />
                      {i == referralsData.length - 1 || (
                        <View key={`${item}-${i}-separator`} style={styles.myReferralSeparator} />
                      )}
                    </>
                  ))}
                </View>
                <BaseButton
                  type={BaseButtonType.link}
                  size={BaseButtonSize.large}
                  style={styles.seeAllLink}
                  labelStyle={styles.seeAll}
                  label={t('screens.referrals.see-all')}
                  onPress={onPressSeeAllReferrals}
                />
              </>
            ) : (
              <View style={styles.referralsEmpty}>
                <BaseImage resizeMode='contain' style={styles.searchImg} source={images.search} />
                <BaseText style={[styles.primaryText, styles.textCenter]} variant={BaseTextVariant.captionSemiBold}>
                  {t('screens.referrals.no-referrals')}
                </BaseText>
                <BaseText style={[styles.primaryText, styles.textCenter]} variant={BaseTextVariant.text}>
                  {t('screens.referrals.invite-friends-earn-rewards')}
                </BaseText>
              </View>
            )}
          </View>
          {Boolean(referralsData.length) && <Seperator />}
        </>
      );
    },
    [t, styles, navigation]
  );

  const MyRewards = useCallback(() => {
    return (
      <>
        <View style={styles.listContainer}>
          <View style={styles.referralHeader}>
            <View style={styles.rewardsIconContainer}>
              <SvgIcon name={SvgXmlIconNames.diamond} size={IconSize.sm} color={theme.palette.base.white} />
            </View>
            <BaseText style={styles.primaryText} variant={BaseTextVariant.captionSmall}>
              {t('screens.referrals.my-referral-rewards')}
            </BaseText>
          </View>
          <View style={[styles.referralsBox, styles.shadow]}>
            <FlatList
              scrollEnabled={false}
              data={rewardsData.slice(0, 3)}
              ItemSeparatorComponent={() => <View style={styles.myReferralSeparator} />}
              renderItem={(item) => (
                <RewardsCard
                  id={item.item.id}
                  currency={item.item.currency}
                  date={item.item.date}
                  lot={item.item.lot}
                  price={item.item.price}
                  onPress={() => navigation.navigate(ROOT_ROUTE_NAMES.ReferralRewards)}
                />
              )}
              keyExtractor={(subItem) => `${subItem.id}`}
            />
          </View>
          <BaseButton
            type={BaseButtonType.link}
            size={BaseButtonSize.large}
            style={styles.seeAllLink}
            label={t('screens.referrals.see-all')}
            labelStyle={styles.seeAll}
            onPress={onPressSeeAllRewards}
          />
        </View>
      </>
    );
  }, [theme.dark, t]);

  return (
    <SafeAreaView style={styles.flex}>
      <BaseBackButton isChevron={false} />
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
          <Available balance={0.5} currency={'USD' as Currencies} rewardsEmpty={Boolean(referralsData.length)} />
          {Boolean(referralsData.length) && (
            <TimeStats balance={124.5} currency={'USD' as Currencies} lots={27.3} referrals={8} />
          )}
          <SimpleSteps />
          <AllReferrals referralsData={referralsData} />
          {Boolean(referralsData.length) && <MyRewards />}
          <BaseButton
            type={BaseButtonType.primary}
            style={styles.inviteBtn}
            labelStyle={styles.primaryText}
            size={BaseButtonSize.large}
            label={t('screens.referrals.invite-friends')}
            onPress={handleOpenInvite}
          />
        </Animated.ScrollView>
      )}

      <InviteFriendSheet navigation={navigation} ref={inviteFriendRef} />
    </SafeAreaView>
  );
};

export default ReferralsScreen;

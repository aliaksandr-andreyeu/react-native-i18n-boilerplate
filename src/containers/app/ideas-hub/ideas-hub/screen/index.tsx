import React, { FC, useCallback, useMemo, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import {
  AUTH_ROUTE_NAMES,
  COMMON_ROUTE_NAMES,
  IDEASHUB_ROUTE_NAMES,
  IdeasHubRootParamsList,
  PULSEAI_ROUTE_NAMES
} from '@/navigation/app/stacks';
import { ScrollView, View } from 'react-native';
import {
  BaseRefreshControl,
  SignalsWidget,
  BaseIdeasBanner,
  WinnersAndLosersWidget,
  BaseVerifyBanner,
  WatchWidget,
  Promotions,
  OpenPosition
} from '@/components';
import { testIDs } from '@/constants';
import { useTheme, useFocusEffect, ParamListBase } from '@react-navigation/native';
import useStyles from './styles';
import { useAppSelector, useHasBalance } from '@/hooks';
import { Signals } from '@/store/slices/market/types';
import Animated, { CurvedTransition } from 'react-native-reanimated';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { IIdeasBanner } from '@/components/molecules/verification-banner';
import { useGetTradingAccountsMutation } from '@/store/api';
import { usePostHog } from 'posthog-react-native';
import { IFeatureFlag } from '@/store/slices/application/types';
import { feature_flag_promo_welcome_account } from '@/constants/static';

type IdeasHubScreenProps = StackScreenProps<ParamListBase & IdeasHubRootParamsList, IDEASHUB_ROUTE_NAMES.IdeasHub>;

interface IdeasHubScreenData extends IdeasHubScreenProps {
  refreshing: boolean;
  onRefresh: () => void;
  getSignals: () => void;
  signals: {
    loading: boolean;
    data: Signals[];
    error: string | null;
  };
}

const IdeasHubScreen: FC<IdeasHubScreenData> = ({ refreshing, onRefresh, route, navigation, getSignals, signals }) => {
  const [hasWinners, setHasWinners] = useState<boolean>(false);

  const posthog = usePostHog();

  const isFeatureEnabled = posthog.isFeatureEnabled(feature_flag_promo_welcome_account); // it can be undefined/true/false
  const featureFlagValue = posthog.getFeatureFlagPayload(feature_flag_promo_welcome_account) as IFeatureFlag;

  const restricted_countries = featureFlagValue?.promotion?.restricted_countries;

  const theme = useTheme();
  const styles = useStyles(theme);
  const [selectedSignal, setSignal] = useState<Signals | null>(null);
  const [getTradingAccounts, tradingAccountsResponse] = useGetTradingAccountsMutation();
  const { isLoading: isFetching } = tradingAccountsResponse || {};

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);
  const auth = useAppSelector((state) => state.auth);

  const { accessToken } = auth || {};

  const isAuthorized = Boolean(accessToken);
  const isVerified = userInfo?.isVerified || false;
  const isDeposit = !!userInfo.firstDepositDate;
  const isFund = !!userInfo.lastTradedAt;

  const isBonus20 =
    isAuthorized &&
    !isVerified &&
    isFeatureEnabled === true &&
    restricted_countries &&
    !restricted_countries.includes(userInfo?.country);

  const hasBalance = useHasBalance();

  const getTradingAccountsHandler = async () => {
    if (!isAuthorized) {
      return;
    }
    try {
      await getTradingAccounts();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getTradingAccountsHandler();
    }, [route, navigation, isAuthorized])
  );

  const refreshHandler = () => {
    onRefresh && typeof onRefresh === 'function' && onRefresh();
  };

  const onClose = useCallback(() => {
    setSignal(null);
  }, [setSignal]);

  const goToVerification = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Common, {
        screen: COMMON_ROUTE_NAMES.Verification
      });
    });
  }, [navigation]);

  const goToSignUp = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
        screen: AUTH_ROUTE_NAMES.BonusSignUp
      });
    });
  }, [navigation]);

  const goToDeposit = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
  }, []);

  const goToTransfer = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
  }, []);

  const goToSignals = useCallback(() => {
    navigation.navigate(PULSEAI_ROUTE_NAMES.PulseAI);
  }, []);

  const banner = useMemo((): { type: IIdeasBanner['state']; goTo: () => void } => {
    if (isBonus20) return { goTo: goToVerification, type: 'bonus20' };
    if (!isAuthorized) return { goTo: goToSignUp, type: 'signup' };
    if (!isVerified) return { goTo: goToVerification, type: 'verification' };
    if (!isDeposit) return { goTo: goToDeposit, type: 'deposit' };
    if (!isFund) {
      if (hasBalance) return { goTo: goToSignals, type: 'trade' };
      else return { goTo: goToTransfer, type: 'fund' };
    }
    return { goTo: () => null, type: 'null' };
  }, [isAuthorized, isVerified, isDeposit, isFund, hasBalance, isBonus20, navigation]);

  const Separator = useCallback(() => {
    return (
      <Animated.View
        testID={testIDs.ideasHub.separator.container}
        layout={CurvedTransition}
        style={styles.seperatorContainer}
      >
        <View style={styles.seperatorUp} />
        <View style={styles.seperatorDown} />
      </Animated.View>
    );
  }, [theme]);

  const SeparatorTop = useCallback(() => {
    return (
      <Animated.View
        testID={testIDs.ideasHub.separator.topContainer}
        layout={CurvedTransition}
        style={[styles.seperatorContainer, styles.seperatorTopContainer]}
      >
        <View style={[styles.seperatorUp, styles.seperatorTopUp]} />
        <View style={styles.seperatorDown} />
      </Animated.View>
    );
  }, [theme]);

  const onDataLengthChange = useCallback((value: boolean) => setHasWinners(value), []);

  return (
    <View style={styles.safe}>
      <ScrollView
        testID={testIDs.ideasHub.scrollView}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollBox}
        refreshControl={
          <BaseRefreshControl
            refreshing={refreshing}
            onRefresh={refreshHandler}
            testID={testIDs.ideasHub.refreshControl}
          />
        }
      >
        <BaseVerifyBanner style={styles.verifyBanner} />
        <SeparatorTop />
        <View style={styles.container} testID={testIDs.ideasHub.promotions}>
          <Animated.View layout={CurvedTransition}>
            <Promotions testID={testIDs.components.molecules.promotions.container} />
          </Animated.View>
          <Animated.View layout={CurvedTransition}>
            <WatchWidget testID={testIDs.ideasHub.watchWidget} />
          </Animated.View>
          <Separator />
          <Animated.View layout={CurvedTransition}>
            <SignalsWidget
              testID={testIDs.ideasHub.signalsWidget}
              signals={signals}
              getSignals={getSignals}
              openCreatePosition={(signal) => {
                setSignal(signal);
              }}
            />
          </Animated.View>
          {banner.type !== 'null' && <Separator />}
          <Animated.View layout={CurvedTransition}>
            {!isFetching && (
              <BaseIdeasBanner
                testID={testIDs.ideasHub.ideasBanner}
                type={['verification', 'signup'].includes(banner.type) ? 'green' : 'purple'}
                state={banner.type}
                onPress={banner.goTo}
                style={styles.banner}
              />
            )}
          </Animated.View>
          {hasWinners && <Separator />}
          <Animated.View layout={CurvedTransition}>
            <WinnersAndLosersWidget
              testID={testIDs.ideasHub.winnersAndLosersWidget}
              onDataLengthChange={onDataLengthChange}
            />
          </Animated.View>
        </View>
      </ScrollView>
      <OpenPosition
        ask={selectedSignal?.Product?.lastTick?.ask}
        bid={selectedSignal?.Product?.lastTick?.bid}
        asset={selectedSignal?.Product?.amegaName}
        visible={!!selectedSignal?.Product.amegaName}
        setVisible={onClose}
        entry={selectedSignal?.Report?.action === 0}
        signalData={selectedSignal ?? undefined}
      />
    </View>
  );
};

export default IdeasHubScreen;

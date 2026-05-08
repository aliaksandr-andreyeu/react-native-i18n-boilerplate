import React, { memo, useCallback, useMemo } from 'react';
import { BaseWidget } from '@/components/atoms';
import { UserTheme, config, testIDs } from '@/constants';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BaseCaption, BaseIdeasBanner } from '@/components/molecules';
import { useGetTradingAccountsMutation, useWatchWidgetQuery } from '@/store/api';
import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { WatchWidget as WWidget } from '@/store/slices/ideas-hub/types';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { useAppSelector } from '@/hooks';
import { AUTH_ROUTE_NAMES, PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { IIdeasBanner } from '@/components/molecules/verification-banner';

const {
  screenWidth,
  fonts: { generalSans }
} = config;

const imageWidthSize = 207;
const imageHeightSize = 117;

interface IWatchWidgetProps {
  testID?: string;
}

const WatchWidget: React.FC<IWatchWidgetProps> = ({ testID }) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { t } = useTranslation();

  const [getWatchWidgets, { currentData, isLoading }] = useWatchWidgetQuery();
  const [getTradingAccounts, tradingAccountsResponse] = useGetTradingAccountsMutation();
  const { isLoading: isFetching } = tradingAccountsResponse || {};

  const tradingAccount = useAppSelector((state) => state.wallet.accounts.trading);

  const { userInfo } = useAppSelector((store) => store.portfolio);
  const auth = useAppSelector((state) => state.auth);

  const isAuthorized = Boolean(auth?.accessToken);
  const isVerified = userInfo?.isVerified || false;
  const isDeposit = !!userInfo.firstDepositDate;
  const isFund = !!userInfo.lastTradedAt;

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

  const hasBalance = useMemo(() => {
    if (tradingAccount) {
      const { balance = 0 } = tradingAccount;
      return Boolean(balance > 0);
    }
    return false;
  }, [tradingAccount, isFetching]);

  const widgets = useMemo(() => currentData || [], [currentData]);

  const theme = useTheme();
  const {
    palette: { graphite },
    dark
  } = theme;
  const styles = useStyles(theme);

  const data = useMemo(() => {
    const widgetData = [...widgets];
    if (!widgetData || widgetData.length === 0) return [];
    widgetData.length = 4;
    return widgetData || [];
  }, [widgets]);

  useFocusEffect(
    useCallback(() => {
      getTradingAccountsHandler();
      getWatchWidgets(1);
    }, [isAuthorized, navigation])
  );

  const Widget = useCallback(
    ({ image, index, title, id }: Partial<WWidget> & { index: number }) => {
      const onPress = () => {
        navigation.navigate(ROOT_ROUTE_NAMES.WidgetArticle, { id });
      };

      return (
        <BaseWidget
          testID={testIDs.components.molecules.watchWidget.card(`${id}`)}
          widgetHeight={imageHeightSize}
          widgetWidth={imageWidthSize}
          id={id}
          key={`${id}-widget`}
          image={image}
          animationDuration={120}
          index={index}
          onPress={onPress}
          title={title}
          textStyle={styles.text}
        />
      );
    },
    [dark]
  );

  const Loader = useCallback(() => {
    const cardSpacing = 12;
    const textTopOffset = imageHeightSize + 8;
    const lineHeight = 12;
    const lineSpacing = 8;
    const card2X = imageWidthSize + cardSpacing;

    return (
      <ContentLoader
        testID={testIDs.components.molecules.watchWidget.loader}
        speed={2}
        width={screenWidth - 20}
        height={imageHeightSize + 30 + lineHeight + lineSpacing}
        viewBox={`0 0 ${screenWidth - 20} ${imageHeightSize + 30 + lineHeight + lineSpacing}`}
        backgroundColor={'#E2E6F2'}
        foregroundColor={graphite['050']}
      >
        <Rect x='0' y='0' rx='12' ry='12' width={imageWidthSize} height={imageHeightSize} />
        <Rect x='0' y={textTopOffset} rx='4' ry='4' width='150' height={lineHeight} />
        <Rect x='0' y={textTopOffset + lineHeight + lineSpacing} rx='4' ry='4' width='120' height={lineHeight} />

        <Rect x={card2X} y='0' rx='12' ry='12' width={imageWidthSize} height={imageHeightSize} />
        <Rect x={card2X} y={textTopOffset} rx='4' ry='4' width='150' height={lineHeight} />
      </ContentLoader>
    );
  }, [dark]);

  const goToList = useCallback(() => navigation.navigate(ROOT_ROUTE_NAMES.WidgetList), []);

  const goToSignUp = useCallback(() => {
    requestAnimationFrame(() => {
      navigation.navigate(ROOT_ROUTE_NAMES.Auth, { screen: AUTH_ROUTE_NAMES.BonusSignUp });
    });
  }, []);

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
    if (!isAuthorized) return { goTo: goToSignUp, type: 'signup' };
    if (!isVerified) return { goTo: () => null, type: 'null' };
    if (!isDeposit) return { goTo: goToDeposit, type: 'deposit' };
    if (!isFund) {
      if (hasBalance) return { goTo: goToSignals, type: 'trade' };
      else return { goTo: goToTransfer, type: 'fund' };
    }
    return { goTo: () => null, type: 'null' };
  }, [isAuthorized, isVerified, isDeposit, isFund, hasBalance, navigation]);

  return (
    <View testID={testID || testIDs.components.molecules.watchWidget.container} style={styles.container}>
      <BaseCaption
        style={styles.caption}
        label={t('screens.ideas-hub.what-to-watch.title')}
        help={t('screens.ideas-hub.what-to-watch.help')}
        goTo={goToList}
      />
      {isLoading ? (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut.duration(150)}
          style={styles.loaderContainer}
          testID={testIDs.components.molecules.watchWidget.loaderWrapper}
        >
          <Loader />
        </Animated.View>
      ) : data.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.widgetContainer}
          testID={testIDs.components.molecules.watchWidget.scrollView}
        >
          {data.map((widget, index) => (
            <Widget {...widget} key={`${widget?.id}-${widget?.title}-${index}`} index={index} />
          ))}
        </ScrollView>
      ) : null}
      {!isFetching && (
        <BaseIdeasBanner
          testID={testIDs.components.molecules.watchWidget.banner}
          state={banner.type === 'signup' ? 'null' : banner.type}
          type='green'
          onPress={banner.goTo}
        />
      )}
    </View>
  );
};

const useStyles = ({ }: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 16
    },
    text: {
      fontWeight: '500',
      fontSize: 16,
      fontFamily: generalSans.medium
    },
    widgetContainer: {
      gap: 12,
      paddingRight: 20,
      marginLeft: 20
    },
    caption: {},
    loaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    }
  });

export default memo(WatchWidget);

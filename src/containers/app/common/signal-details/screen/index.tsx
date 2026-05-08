import React, { FC, memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Image, View, TouchableOpacity, ScrollView, TouchableHighlight } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import {
  AssetChart,
  BaseText,
  BaseTextVariant,
  SignalInfoPrices,
  BaseTradingBanner,
  BaseBackButton,
  OpenPosition
} from '@/components';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { PULSEAI_ROUTE_NAMES } from '@/navigation/app/stacks';
import { useTheme, ParamListBase, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { useAppDispatch, useAppSelector, useTradingSchedule } from '@/hooks';
import { useGetSymbolConfigMutation } from '@/store/api';
import { Signals } from '@/store/slices/market/types';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { config } from '@/constants';
import { useNetwork } from '@/providers';
import { jsonParse, TradeSource } from '@/helpers';
import { debounce } from 'throttle-debounce';
import { actions } from '@/store';

dayjs.extend(duration);

type SignalDetailsScreenProps = StackScreenProps<ParamListBase & RootRootParamsList, ROOT_ROUTE_NAMES.SignalDetails>;
interface SignalDetailsScreenData extends SignalDetailsScreenProps {
  signal: Signals;
}
const {
  buttons: { activeOpacity }
} = config;

const {
  portfolio: { setAssetSymbolData }
} = actions;

const SignalDetailsScreen: FC<SignalDetailsScreenData> = ({ route, navigation, signal }) => {
  const { t } = useTranslation();

  const assetSymbol = signal.Product.amegaName;

  const theme = useTheme();
  const styles = useStyles(theme);
  const { palette } = theme || {};

  const { websocket, isReadyState } = useNetwork();
  const pageIsFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const [getSymbolConfig, symbolConfigData] = useGetSymbolConfigMutation();
  const { tradingAssets, selectedAccount } = useAppSelector((store) => store.portfolio);

  const [liveAsk, setLiveAsk] = useState<number | undefined>(signal.Product.lastTick?.ask || 0);
  const [liveBid, setLiveBid] = useState<number | undefined>(signal.Product.lastTick?.bid || 0);

  const [liveEquity, setLiveEquity] = useState<number>(0);

  const [isOpenPositionVisible, setOpenPositionVisiblity] = useState<boolean>(false);

  const application = useAppSelector((state) => state.application);
  const { promoWelcome } = application || {};
  const { welcomeAccountTypeId } = promoWelcome || {};

  const tradingAccounts = useAppSelector((state) => state.wallet.tradingAccounts);

  const auth = useAppSelector((state) => state.auth);
  const { accessToken } = auth || {};

  const isAuthorized = Boolean(accessToken);

  const portfolio = useAppSelector((store) => store.portfolio);
  const { userInfo } = portfolio || {};

  const { canGoBack } = navigation || {};

  const canBack = canGoBack();

  const goBack = () => {
    navigation.navigate(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Pulse,
      params: {
        screen: PULSEAI_ROUTE_NAMES.PulseAI
      }
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerShadowVisible: false,
      headerTitle: t('screens.signal-details.title'),
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: styles.headerStyle,
      headerLeft: () => <BaseBackButton isChevron={false} customBack={canBack ? undefined : goBack} />,
      headerRight: () => null
    });
    return () => {};
  }, [navigation, route, goBack, canBack, t]);

  const scheduleData = useTradingSchedule({
    schedule: symbolConfigData.data?.tradingSessionShedule
  });

  const enabledHandleMessage = websocket && pageIsFocused && isReadyState;

  const debounceSetData = useCallback(
    (askPrice: number, bidPrice: number) => {
      if (!enabledHandleMessage) {
        return;
      }

      if (askPrice) {
        setLiveAsk(askPrice);
      }
      if (bidPrice) {
        setLiveBid(bidPrice);
      }
    },
    [enabledHandleMessage, setLiveBid, setLiveAsk]
  );

  const setData = debounce(250, debounceSetData);

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || !assetSymbol) {
      setData.cancel();
      return;
    }

    websocket.send(`unsubscribe ALL`);

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const data = jsonParse(event?.data);
      if (!data) {
        return;
      }
      const { ask: dataAsk, bid: dataBid, symbol: dataSymbol } = data || {};
      if (dataAsk === undefined || dataBid === undefined || dataSymbol === undefined) {
        return;
      }

      if (dataSymbol !== assetSymbol) {
        return;
      }

      setData(dataAsk, dataBid);
    });

    websocket.send(`subscribe ${assetSymbol}`);
  }, [enabledHandleMessage, assetSymbol, setData]);

  const unsubscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || !assetSymbol) {
      return;
    }

    setData.cancel();

    websocket.send(`unsubscribe ALL`);
  }, [enabledHandleMessage, assetSymbol, setData]);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        subscribeWebsocket();
      }, 1);
      if (assetSymbol)
        dispatch(
          setAssetSymbolData({
            asset: assetSymbol,
            ask: liveAsk,
            bid: liveBid,
            digits
          })
        );
      return () => {
        unsubscribeWebsocket();
      };
    }, [navigation, route, assetSymbol, enabledHandleMessage])
  );

  const getLiveEquity = () => {
    if (tradingAccounts && tradingAccounts.length === 0) {
      return;
    }

    const equity = tradingAccounts
      .filter((account) => account.typeId !== welcomeAccountTypeId)
      .reduce((acc, current) => {
        const { equity: currentEquity = 0 } = current || {};
        return acc + currentEquity;
      }, 0);

    setLiveEquity(equity);
  };

  useLayoutEffect(() => {
    getLiveEquity();
  }, [tradingAccounts]);

  const getSymbolConfigHandler = async () => {
    if (!assetSymbol || !selectedAccount) {
      return;
    }
    try {
      await getSymbolConfig({
        accountId: selectedAccount,
        symbol: assetSymbol
      });
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    getSymbolConfigHandler();
  }, [assetSymbol, selectedAccount]);

  const asset = useMemo(() => {
    return tradingAssets.find((asset) => asset.systemName === assetSymbol);
  }, [assetSymbol, tradingAssets]);

  const tradingSchedule = useMemo(() => {
    const { data } = symbolConfigData || {};
    const { tradingSessionShedule } = data || {};

    return tradingSessionShedule && Array.isArray(tradingSessionShedule) ? tradingSessionShedule : [];
  }, [symbolConfigData]);

  const digits = useMemo(() => {
    const lastTickDigit = signal.Product.lastTick?.digits || 2;
    return lastTickDigit > 2 ? lastTickDigit : 2;
  }, [signal.Product.lastTick?.digits]);

  const renderColumn = useCallback((title = '', value: string | number | undefined) => {
    return (
      <View style={styles.column}>
        <BaseText variant={BaseTextVariant.extraSmall} style={styles.columnTitle}>
          {title}
        </BaseText>
        <BaseText variant={BaseTextVariant.small} style={styles.columnValue}>
          {value}
        </BaseText>
      </View>
    );
  }, []);

  const price = useMemo(() => {
    if (!liveAsk || !liveBid) {
      return;
    }
    return (liveAsk + liveBid) / 2;
  }, [liveAsk, liveBid]);

  const dailyChange = useMemo(() => {
    if (price === undefined || symbolConfigData.data?.lastClosedPrice === undefined) {
      return;
    }
    return price - symbolConfigData.data?.lastClosedPrice;
  }, [price, symbolConfigData.data?.lastClosedPrice]);

  const dailyChangePercent = useMemo(() => {
    if (dailyChange === undefined || symbolConfigData.data?.lastClosedPrice === undefined) {
      return 0;
    }
    return (dailyChange / (symbolConfigData.data?.lastClosedPrice || 1)) * 100;
  }, [dailyChange, symbolConfigData.data?.lastClosedPrice]);

  const actionButtonText = useMemo(() => {
    let text = '';

    if (!!scheduleData?.timeToOpen && signal.Report?.status === 9) {
      return t('components.signals.market-is-closed');
    }

    if (signal.Report?.status === 9) {
      text = signal.Report?.action === 0 ? t('components.signals.buy-now') : t('components.signals.sell-now');
    } else {
      text =
        signal.Report?.action === 0
          ? t('components.signals.buy-at', {
              entry: signal.Report?.buy_entry_target_1?.toFixed(digits)
            })
          : t('components.signals.sell-at', {
              entry: signal.Report?.sell_entry_target_1?.toFixed(digits)
            });
    }
    return text;
  }, [signal.Report, digits, scheduleData?.timeToOpen]);

  const renderAssetInfo = useCallback(() => {
    if (!asset) {
      return null;
    }
    return (
      <TouchableOpacity
        style={[styles.container, styles.assetInfoContainer]}
        activeOpacity={activeOpacity}
        onPress={() => {
          navigation.navigate(ROOT_ROUTE_NAMES.AssetDetails, {
            asset: assetSymbol,
            ask: liveAsk || 0,
            bid: liveBid || 0,
            digits: digits
          });
        }}
      >
        <View style={styles.assetInfoLeft}>
          <View>{asset?.image && <Image resizeMode='cover' source={{ uri: asset?.image }} style={styles.img} />}</View>
          <View style={styles.symbolNameWrap}>
            <View style={styles.horizontal}>
              <BaseText variant={BaseTextVariant.textSemiBold}>{asset?.systemName}</BaseText>
              {signal.Report?.status === 9 && (
                <View style={styles.liveIcon}>
                  <SvgIcon style={styles.iconAdjust} name={SvgXmlIconNames.signal} size={IconSize.sm} />
                  <BaseText variant={BaseTextVariant.extraSmall}>{t('screens.common.live')}</BaseText>
                </View>
              )}
            </View>
            <BaseText style={styles.fullName} variant={BaseTextVariant.small}>
              {asset?.fullName || symbolConfigData.data?.description}
            </BaseText>
          </View>
        </View>
        <View style={styles.priceWrap}>
          <BaseText variant={BaseTextVariant.textSemiBold}>
            {(signal.Report.action === 0 ? liveAsk : liveBid)?.toFixed(digits)}
          </BaseText>
          <BaseText style={{ color: dailyChangePercent > 0 ? '#159D55' : palette.red['600'] }}>
            {dailyChangePercent > 0 ? '+' : ''}
            {dailyChangePercent?.toFixed(2)}%
          </BaseText>
        </View>
      </TouchableOpacity>
    );
  }, [palette, asset, symbolConfigData.data, liveAsk, liveBid, signal.Report.action, digits, dailyChangePercent]);

  const closeOpenPosition = useCallback(() => {
    setOpenPositionVisiblity(false);
  }, [setOpenPositionVisiblity]);

  const reportActionIsZero = useMemo(() => signal.Report?.action === 0, [signal.Report]);

  const renderBanner = useCallback(() => {
    const { isVerified, firstDepositDate, lastTradedAt } = userInfo || {};

    if (isAuthorized && isVerified && !firstDepositDate)
      return (
        <BaseTradingBanner
          style={styles.banner}
          title={`${t('screens.common.next-step')}:`}
          subTitle={t('screens.wallet.main-wallet-prompt')}
          buttonText={t('screens.wallet.make-deposit')}
          imageSource={images.safe}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
          }}
        />
      );

    if (isAuthorized && isVerified && firstDepositDate && !liveEquity && !lastTradedAt)
      return (
        <BaseTradingBanner
          style={styles.banner}
          title={`${t('screens.common.next-step')}:`}
          subTitle={t('screens.wallet.top-up-trading-account')}
          buttonText={t('screens.wallet.transfer-funds-now')}
          imageSource={images.rocket}
          onPress={() => {
            navigation.navigate(ROOT_ROUTE_NAMES.Transfer);
          }}
          imageStyle={{ right: -22 }}
        />
      );

    if (isAuthorized && isVerified && firstDepositDate && liveEquity && !lastTradedAt)
      return (
        <BaseTradingBanner
          style={styles.banner}
          leftSectionStyle={styles.bannerWoButton}
          title={t('screens.wallet.start-trading')}
          subTitle={t('screens.wallet.start-trading-now')}
          imageSource={images.barChart}
        />
      );

    return null;
  }, [t, styles, isAuthorized, userInfo, liveEquity]);

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {renderAssetInfo()}
        <SignalInfoPrices hide={true} data={signal} />
        {assetSymbol && !!tradingSchedule?.length && (
          <View style={styles.chart}>
            <AssetChart
              status={signal?.Report?.status}
              tradingSessionSchedule={tradingSchedule}
              initialInterval={'d1'}
              price={price?.toFixed(digits)}
              dailyChange={dailyChange?.toFixed(digits)}
              dailyChangePercent={dailyChangePercent.toFixed(2)}
              horizontalLines={[
                {
                  value: signal.Report?.stop,
                  color: palette.red['600']
                },
                {
                  value:
                    (reportActionIsZero ? signal.Report?.buy_entry_target_1 : signal.Report?.sell_entry_target_1) || 0,
                  color: palette.text.base.tertiary
                },
                {
                  value: (reportActionIsZero ? signal.Report?.buy_target_1 : signal.Report?.sell_target_1) || 0,
                  color: palette.green['400']
                }
              ]}
            />
          </View>
        )}
        {renderBanner()}
        <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.signal-details.resistance')}
        </BaseText>
        <View style={[styles.container, styles.pricesRow, styles.resistance]}>
          {renderColumn('1', signal.Report?.res_1.toFixed(digits))}
          {renderColumn('2', signal.Report?.res_2.toFixed(digits))}
          {renderColumn('3', signal.Report?.res_3.toFixed(digits))}
        </View>
        <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.signal-details.support')}
        </BaseText>
        <View style={[styles.container, styles.pricesRow, styles.support]}>
          {renderColumn('1', signal.Report?.sup_1.toFixed(digits))}
          {renderColumn('2', signal.Report?.sup_2.toFixed(digits))}
          {renderColumn('3', signal.Report?.sup_3.toFixed(digits))}
        </View>
        <BaseText style={styles.title} variant={BaseTextVariant.captionSemiBold}>
          {t('screens.signal-details.about')}
        </BaseText>
        <BaseText style={styles.about} variant={BaseTextVariant.text}>
          {(reportActionIsZero ? signal?.BuyPhrase : signal?.SellPhrase)?.join('\n\n')}
          {`\n\n`}
          {signal?.Phrase?.join('\n\n')}
        </BaseText>
      </ScrollView>
      {scheduleData ? (
        <View style={styles.buttonWrap}>
          <TouchableHighlight
            style={[
              styles.button,
              {
                backgroundColor:
                  !!scheduleData?.timeToOpen && signal.Report?.status === 9
                    ? palette.graphite[100]
                    : reportActionIsZero
                      ? palette.green['400']
                      : palette.red['600']
              }
            ]}
            disabled={!!scheduleData?.timeToOpen && signal.Report?.status === 9}
            underlayColor={reportActionIsZero ? palette.green[500] : palette.red[700]}
            onPress={() => {
              setOpenPositionVisiblity(true);
            }}
          >
            <BaseText
              variant={BaseTextVariant.titleXXS}
              style={[styles.buttonText, reportActionIsZero && styles.blackText]}
            >
              {actionButtonText}
            </BaseText>
          </TouchableHighlight>
        </View>
      ) : null}
      <OpenPosition
        ask={signal?.Product?.lastTick?.ask}
        bid={signal?.Product?.lastTick?.bid}
        asset={signal?.Product?.amegaName}
        visible={isOpenPositionVisible}
        setVisible={closeOpenPosition}
        entry={signal?.Report?.action === 0}
        signalData={signal ?? undefined}
        tradeSource={TradeSource.Signals}
      />
    </View>
  );
};

export default memo(SignalDetailsScreen);

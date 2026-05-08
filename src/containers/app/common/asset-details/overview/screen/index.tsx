import React, { FC, useMemo, useState, memo, useCallback, Fragment } from 'react';
import { ScrollView, View } from 'react-native';
import { AssetChart, BaseHelpButton, BaseHelpButtonSize, BaseText, BaseTextVariant, OpenPosition } from '@/components';
import {
  useTheme,
  useFocusEffect,
  useNavigation,
  useRoute,
  ParamListBase,
  NavigationProp,
  RouteProp
} from '@react-navigation/native';
import { useAppSelector } from '@/hooks';
import { getAssetName, jsonParse } from '@/helpers';
import { debounce } from 'throttle-debounce';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useNetwork } from '@/providers';
import { useIsFocused } from '@react-navigation/native';
import useStyles from './styles';
import SellBuyButtons from '../../components/SellBuyButtons';
import { SymbolConfig, SymbolLastTick } from '@/types';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { useTranslation } from 'react-i18next';
import { Signals } from '@/store/slices/market/types';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { formatNumberToAmount } from '@/helpers';
import { config } from '@/constants';

interface AssetDetailsOverviewScreenProps {
  symbolConfig: SymbolConfig;
  symbolLastTick: SymbolLastTick;
  profitSymbol: string | undefined;
  tradingAsset: ParsedTradingAssets | undefined;
}

const { screenWidth } = config;

const shimmerArr = new Array(7).fill(null);
const AssetDetailsOverviewScreen: FC<AssetDetailsOverviewScreenProps> = ({
  symbolConfig,
  symbolLastTick,
  profitSymbol
  // tradingAsset
}) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase>>();

  const { websocket, isReadyState } = useNetwork();

  const pageIsFocused = useIsFocused();
  const { t } = useTranslation();

  const enabledHandleMessage = websocket && pageIsFocused && isReadyState;

  const [liveAsk, setLiveAsk] = useState<number | undefined>(undefined);
  const [liveBid, setLiveBid] = useState<number | undefined>(undefined);

  const [selectedSignal, setSignal] = useState<Signals | null>(null);

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  // const signals = useAppSelector((store) => store.market.signals);
  const portfolio = useAppSelector((store) => store.portfolio);
  const { assetSymbolData, tradingAssets } = portfolio || {};
  const { asset: assetSymbol, ask: assetAsk, bid: assetBid, digits: assetDigits = 0 } = assetSymbolData || {};

  const wallet = useAppSelector((store) => store.wallet);
  const { accounts } = wallet || {};
  const { trading: tradingAccount } = accounts || {};
  const { currency: tradingAccountCurrency = 'USD' } = tradingAccount || {};

  const common = useAppSelector((state) => state.common);
  const { config: commonConfig } = common || {};
  const { trading: tradingConfig } = commonConfig || {};
  const { minInvestmentAmount = 0 } = tradingConfig || {};

  const { symbol: lastTickSymbol, ask: lastTickAsk, bid: lastTickBid } = symbolLastTick || ({} as SymbolLastTick);
  const {
    symbol = '',
    leverage = 0,
    margin = 0,
    volumeMax = 0,
    volumeLimit = 0,
    description = '',
    currencyProfit = '',
    contractSize = 0,
    digits: symbolDigits,
    lastClosedPrice,
    tradingSessionShedule,
    tradeMode
  } = symbolConfig || ({} as SymbolConfig);

  const isAuthorized = Boolean(accessToken);

  const setInitialState = () => {
    setLiveAsk(undefined);
    setLiveBid(undefined);
  };

  useFocusEffect(
    useCallback(() => {
      setInitialState();
      return () => {
        setInitialState();
      };
    }, [navigation, route])
  );

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

  const ask = useMemo(() => {
    return Number(liveAsk || lastTickAsk || assetAsk || 0);
  }, [assetAsk, lastTickAsk, liveAsk]);

  const bid = useMemo(() => {
    return Number(liveBid || lastTickBid || assetBid || 0);
  }, [assetBid, lastTickBid, liveBid]);

  const asset = useMemo(() => {
    return assetSymbol || lastTickSymbol || '';
  }, [assetSymbol, lastTickSymbol]);

  const theme = useTheme();
  const styles = useStyles(theme);
  const {
    palette: { graphite, blue }
  } = theme;

  const subscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || !asset) {
      setData.cancel();
      return;
    }

    const symbolsList = [asset];

    if (profitSymbol) {
      symbolsList.push(profitSymbol);
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

      if (dataSymbol !== asset) {
        return;
      }

      setData(dataAsk, dataBid);
    });

    websocket.send(`subscribe ${symbolsList.join(' ')}`);
  }, [enabledHandleMessage, asset, setData, profitSymbol]);

  const unsubscribeWebsocket = useCallback(() => {
    if (!enabledHandleMessage || !asset) {
      return;
    }

    setData.cancel();

    websocket.send(`unsubscribe ALL`);
  }, [enabledHandleMessage, asset, setData]);

  useFocusEffect(
    useCallback(() => {
      subscribeWebsocket();
      return () => {
        unsubscribeWebsocket();
      };
    }, [navigation, route, asset, enabledHandleMessage])
  );

  const digits = useMemo(() => {
    return assetDigits || symbolDigits || 0;
  }, [assetDigits, symbolDigits]);

  const price = useMemo(() => {
    if (!ask || !bid) {
      return;
    }
    return (ask + bid) / 2;
  }, [ask, bid]);

  const priceValue = useMemo(() => {
    if (price === undefined || digits === undefined) {
      return;
    }
    return price.toFixed(digits);
  }, [price, digits]);

  const dailyChange = useMemo(() => {
    if (price === undefined || lastClosedPrice === undefined) {
      return;
    }
    return price - lastClosedPrice;
  }, [price, lastClosedPrice]);

  const dailyChangeValue = useMemo(() => {
    if (dailyChange === undefined || digits === undefined) {
      return;
    }
    return dailyChange.toFixed(digits);
  }, [dailyChange, digits]);

  const dailyChangePercent = useMemo(() => {
    if (dailyChange === undefined || lastClosedPrice === undefined) {
      return;
    }
    const value = (dailyChange / (lastClosedPrice || 1)) * 100;
    return value.toFixed(2);
  }, [dailyChange, lastClosedPrice]);

  // const symbolsSignals = useMemo(() => {
  //   return signals
  //     .filter((el) => !el.Disabled)
  //     ?.filter((s) => s.Product?.name === tradingAsset?.acuityProductName || tradingAsset?.systemName);
  // }, [tradingAsset, signals]);

  // const handleOpenSignalDetails = useCallback((data: Signals) => {
  //   navigation.navigate(ROOT_ROUTE_NAMES.SignalDetails, {
  //     data
  //   });
  // }, []);

  const onClose = useCallback(() => {
    setSignal(null);
  }, [setSignal]);

  // const goToSignUpIntro = useCallback(() => {
  //   navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
  //     screen: AUTH_ROUTE_NAMES.SignUp
  //   });
  // }, [navigation]);

  // const goToSignIn = useCallback(() => {
  //   navigation.navigate(ROOT_ROUTE_NAMES.Auth, {
  //     screen: AUTH_ROUTE_NAMES.SignIn
  //   });
  // }, [navigation]);

  const separator = useMemo(() => {
    return (
      <View style={styles.separatorContainer}>
        <View style={styles.separatorUp} />
        <View style={styles.separatorDown} />
      </View>
    );
  }, []);

  const assetData = useMemo(() => {
    if (!symbol) {
      return null;
    }
    return tradingAssets.find((asset) => asset.systemName === symbol);
  }, [tradingAssets, symbol]);

  const tradingSpecificationsComponent = useMemo(() => {
    const { fullName = '', assetUnitOfMeasure = '' } = assetData || {};

    const currencySymbol = getSymbolFromCurrency(tradingAccountCurrency);
    const minInvestmentAmountValue = currencySymbol
      ? `${currencySymbol}${formatNumberToAmount(minInvestmentAmount)}`
      : `${formatNumberToAmount(minInvestmentAmount)} ${tradingAccountCurrency}`;

    const maxPositionSize = volumeMax && contractSize ? Math.round(volumeMax * contractSize * 100) / 100 : 0;
    const maxPositionSizeValue = `${formatNumberToAmount(maxPositionSize)}${
      assetUnitOfMeasure ? ` ${assetUnitOfMeasure}` : ''
    }`;

    const maxAggregatedVolume = volumeLimit && contractSize ? Math.round(volumeLimit * contractSize * 100) / 100 : 0;
    const maxAggregatedVolumeValue = `${formatNumberToAmount(maxAggregatedVolume)}${
      assetUnitOfMeasure ? ` ${assetUnitOfMeasure}` : ''
    }`;

    const marginValue = margin ? Math.round(margin * 100) / 100 : 0;

    const descriptionValue = fullName ? fullName : description;

    const isLoading = Boolean(
      !(
        symbol &&
        assetData !== null &&
        leverage &&
        margin !== undefined &&
        minInvestmentAmount !== undefined &&
        maxPositionSize &&
        maxAggregatedVolume &&
        currencyProfit
      )
    );

    return (
      <Fragment>
        {separator}
        <View style={styles.box}>
          <BaseText variant={BaseTextVariant.captionSemiBold}>
            {t('screens.asset-details.trading-specifications.title')}
          </BaseText>
          {isLoading ? (
            <ContentLoader
              speed={2}
              width={'100%'}
              height={406}
              backgroundColor={'#E2E6F2'}
              foregroundColor={graphite['050']}
            >
              {shimmerArr.map((_, index) => {
                return (
                  <Fragment key={index}>
                    <Rect
                      key={`${index}-loader-left`}
                      x={0}
                      y={index * 40}
                      rx='4'
                      ry='4'
                      width={index % 2 === 0 ? screenWidth * 0.6 : screenWidth * 0.52}
                      height={20}
                    />
                    <Rect
                      key={`${index}-loader-right`}
                      x={screenWidth * 0.71}
                      y={index * 40}
                      rx='4'
                      ry='4'
                      width={screenWidth * 0.18}
                      height={20}
                    />
                  </Fragment>
                );
              })}
            </ContentLoader>
          ) : (
            <View style={styles.card}>
              {symbol ? (
                <View style={styles.row}>
                  <BaseText variant={BaseTextVariant.small} style={styles.rowText}>
                    {t('screens.asset-details.trading-specifications.ticker')}
                  </BaseText>
                  <BaseText style={styles.info} variant={BaseTextVariant.small}>
                    {getAssetName(symbol)}
                  </BaseText>
                </View>
              ) : null}
              {descriptionValue ? (
                <View style={styles.row}>
                  <BaseText variant={BaseTextVariant.small} style={styles.rowText}>
                    {t('screens.asset-details.trading-specifications.full-name')}
                  </BaseText>
                  <BaseText style={styles.info} variant={BaseTextVariant.small}>
                    {descriptionValue}
                  </BaseText>
                </View>
              ) : null}
              {leverage ? (
                <View style={styles.row}>
                  <BaseText variant={BaseTextVariant.small} style={styles.rowText}>
                    {t('screens.asset-details.trading-specifications.leverage')}
                  </BaseText>
                  <BaseText style={styles.info} variant={BaseTextVariant.small}>{`1:${leverage}`}</BaseText>
                </View>
              ) : null}
              <View style={styles.row}>
                <BaseText variant={BaseTextVariant.small} style={styles.rowText}>
                  {t('screens.asset-details.trading-specifications.margin')}
                </BaseText>
                <BaseText style={styles.info} variant={BaseTextVariant.small}>{`${marginValue}%`}</BaseText>
              </View>
              {minInvestmentAmountValue ? (
                <View style={styles.row}>
                  <BaseText variant={BaseTextVariant.small} style={styles.rowText}>
                    {t('screens.asset-details.trading-specifications.min-margin')}
                  </BaseText>
                  <BaseText style={styles.info} variant={BaseTextVariant.small}>
                    {minInvestmentAmountValue}
                  </BaseText>
                </View>
              ) : null}
              {maxPositionSizeValue ? (
                <View style={styles.row}>
                  <BaseText variant={BaseTextVariant.small} style={styles.rowText}>
                    {t('screens.asset-details.trading-specifications.max-position-size')}
                  </BaseText>
                  <BaseText style={styles.info} variant={BaseTextVariant.small}>
                    {maxPositionSizeValue}
                  </BaseText>
                </View>
              ) : null}
              {maxAggregatedVolumeValue ? (
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <BaseText variant={BaseTextVariant.small} style={[styles.rowText]}>
                      {t('screens.asset-details.trading-specifications.total-position-size')}
                    </BaseText>
                    <BaseHelpButton
                      title={t('screens.asset-details.trading-specifications.total-position-size')}
                      text={t('screens.asset-details.trading-specifications.total-position-hint')}
                      size={BaseHelpButtonSize.tiny}
                      color={'#5D7278'}
                    />
                  </View>
                  <BaseText style={styles.info} variant={BaseTextVariant.small}>
                    {maxAggregatedVolumeValue}
                  </BaseText>
                </View>
              ) : null}
              {currencyProfit ? (
                <View style={styles.row}>
                  <BaseText variant={BaseTextVariant.small} style={styles.rowText}>
                    {t('screens.asset-details.trading-specifications.quote-currency')}
                  </BaseText>
                  <BaseText style={styles.info} variant={BaseTextVariant.small}>
                    {currencyProfit}
                  </BaseText>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </Fragment>
    );
  }, [
    t,
    styles,
    graphite,
    blue,
    tradingAccountCurrency,
    separator,
    assetData,
    symbol,
    minInvestmentAmount,
    leverage,
    margin,
    volumeMax,
    volumeLimit,
    contractSize,
    currencyProfit,
    description
  ]);

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
        <View style={styles.box}>
          {!!tradingSessionShedule?.length && (
            <AssetChart
              style={styles.chart}
              status={selectedSignal?.Report?.status}
              tradingSessionSchedule={tradingSessionShedule}
              price={priceValue}
              dailyChange={dailyChangeValue}
              dailyChangePercent={dailyChangePercent}
            />
          )}
        </View>
        {/* {symbolsSignals && symbolsSignals.length > 0 && (
          <>
            {separator}
            <View style={styles.box}>
              <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.title}>
                {t('screens.asset-details.trading-signal')}
              </BaseText>
              {!isAuthorized || !portfolio?.userInfo.isVerified ? (
                <SignalBlurredContent
                  isAuthorized={isAuthorized}
                  onSignInPressed={goToSignIn}
                  onSignUpPressed={goToSignUpIntro}
                />
              ) : (
                symbolsSignals.map((signal) => {
                  return (
                    <BaseSignalCard
                      symbolName={asset}
                      digits={digits}
                      data={signal}
                      image={tradingAsset?.image}
                      key={`${signal.id}-${asset}`}
                      price={(signal.Report?.action === 0 ? liveAsk || ask : liveBid || bid).toFixed(digits)}
                      onPress={() => {
                        handleOpenSignalDetails(signal);
                      }}
                      onActionButtonPressed={() => {
                        setSignal(signal);
                      }}
                    />
                  );
                })
              )}
            </View>
          </>
        )} */}
        {tradingSpecificationsComponent}
      </ScrollView>
      <SellBuyButtons bid={bid} ask={ask} digits={digits} asset={asset} tradeMode={tradeMode} useMode />
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

export default memo(AssetDetailsOverviewScreen);

import React, { memo, useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Pressable, Image, View, TouchableOpacity } from 'react-native';
import Animated, {
  CurvedTransition,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { BasePositionItem, BaseText, BaseTextVariant } from '..';
import { UserTheme, config, testIDs } from '@/constants';
import { DealsInfo, PendingOrder, Position } from '@/store/slices/portfolio/types';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { useTheme } from '@react-navigation/native';
import { getAssetName, jsonParse } from '@/helpers';
import { debounce } from 'throttle-debounce';
import { useNetwork } from '@/providers';
import { useIsFocused } from '@react-navigation/native';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from '@/hooks';

interface IBasePositionCard {
  isViewable?: boolean;
  data: DealsInfo & ParsedTradingAssets;
  onItemPress(ticket: number): void;
  isOrder?: boolean;
  onClosePressed: (
    position: Position & PendingOrder,
    currencyProfitSymbol: string,
    currencyProfitSymbolDirect: boolean
  ) => void;
  testID?: string;
}

export interface IHistoryData {
  price: number;
  pricePosition: number;
}

export type ActionTypes = 'buy' | 'sell' | 'sl' | 'current' | 'tp' | 'price' | '';
export type ActionValues = { color: string; suf: string; bg: string } | null;

export interface IInfoContainer {
  text?: string | number;
  text1?: string | number;
  type: ActionTypes;
}

const {
  fonts: { inter },
  screenWidth,
  headerBar: {
    buttons: { activeOpacity }
  }
} = config;

const INPUT_RANGE = [0, 1];
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CARD_HEIGHT = 128;

interface ExtraProps {
  currencyProfitSymbol: string;
  currencyProfitSymbolDirect: boolean;
}

const BasePositionCard: React.FC<IBasePositionCard> = ({
  isViewable = false,
  data,
  onItemPress,
  isOrder = false,
  onClosePressed,
  testID
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [liveAsk, setLiveAsk] = useState<number | undefined>(undefined);
  const [liveBid, setLiveBid] = useState<number | undefined>(undefined);
  const isAnimating = useRef<boolean>(false);

  const [liveCurrencyAveragePrice, setLiveCurrencyAveragePrice] = useState<number | undefined>(undefined);

  const { websocket, isReadyState } = useNetwork();

  const pageIsFocused = useIsFocused();

  const enabledHandleMessage = websocket && pageIsFocused && isViewable && isReadyState;

  const { currencyProfitSymbol, currencyProfitSymbolDirect } =
    (data as DealsInfo & ParsedTradingAssets & ExtraProps) || {};

  const anim = useSharedValue(0);
  const opened = useRef<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const theme = useTheme();
  const styles = useStyles(theme);
  const { shadow6Style } = useCommonStyles(theme);

  const { palette } = theme || {};

  const { t } = useTranslation();

  const infoValues: Record<ActionTypes, ActionValues> = useMemo(
    () => ({
      buy: { bg: '#e2faea', suf: t('components.atoms.deal-card.buy'), color: '#02500E' },
      sell: { color: '#A10C2F', bg: theme.palette.red[100], suf: t('components.atoms.deal-card.sell') },
      sl: { bg: '#FFE5BE', color: theme.palette.graphite['900'], suf: 'SL' },
      tp: { bg: '#BEE0FF', color: theme.palette.graphite['900'], suf: 'TP' },
      current: { bg: '#f1f5ff', color: theme.palette.graphite['900'], suf: '' },
      price: { bg: '#f1f5ff', color: theme.palette.graphite['900'], suf: '' },
      '': null
    }),
    [theme.dark, t]
  );

  const collapsedContainerHeight = useMemo(() => {
    const positionLength = data?.positions.length;

    return positionLength > 0 ? positionLength * 78 + (positionLength - 1) * 8 + 16 + 6 : 32;
  }, [data.positions.length]);

  const hasPositions = useMemo(() => data.positions.length > 0, [data.positions.length]);

  const cardStyle = useAnimatedStyle(() => {
    const translateY = interpolate(anim.value, INPUT_RANGE, [10, CARD_HEIGHT]);

    const scale = interpolate(anim.value, INPUT_RANGE, [0.95, 1]);

    const height = interpolate(anim.value, INPUT_RANGE, [CARD_HEIGHT, collapsedContainerHeight]);

    const bg = interpolateColor(
      anim.value,
      [0, 0.3, 1],
      [theme.palette.base.white, theme.palette.graphite['050'], theme.palette.graphite['050']],
      'RGB'
    );

    const width = interpolate(anim.value, [0, 0.8, 1], [screenWidth - 40, screenWidth, screenWidth]);

    return {
      height,
      transform: [{ translateY }, { scale }],
      backgroundColor: bg,
      width
    };
  }, [collapsedContainerHeight, theme.dark]);

  const runAfterInteraction = (fn: Function) => {
    if (!isAnimating.current) fn();
  };

  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(anim.value, INPUT_RANGE, [CARD_HEIGHT + 8, CARD_HEIGHT + collapsedContainerHeight]);

    return {
      height,
      width: screenWidth - 40
    };
  }, [collapsedContainerHeight]);

  const InfoContainer = useCallback(
    ({ text, type }: IInfoContainer) => {
      const props = infoValues[type];

      if (!props) return null;

      const info = () => {
        if (text) return `${text} ${props.suf}`;
        return props.suf;
      };

      return (
        <View
          testID={testIDs.components.atoms.positionCard.infoContainer.container(type)}
          style={[styles.info, { backgroundColor: props.bg }]}
        >
          <BaseText
            testID={testIDs.components.atoms.positionCard.infoContainer.info(type)}
            variant={BaseTextVariant.extraSmall}
            style={{ color: props.color }}
          >
            {info()}
          </BaseText>
        </View>
      );
    },
    [t]
  );

  const changeIsAnimating = (value: boolean) => (isAnimating.current = value);

  const onPress = useCallback(() => {
    if (!hasPositions) return;
    clearTimeout(debounceRef.current);
    isAnimating.current = true;
    anim.value = withTiming(opened.current ? 0 : 1, { duration: 500 }, () => {
      runOnJS(changeIsAnimating)(false);
    });
    debounceRef.current = setTimeout(
      () => {
        opened.current = !opened.current;
        setIsOpen(opened.current);
      },
      opened.current ? 300 : 0
    );
  }, [hasPositions]);

  const totals = useMemo((): { buys: number; sells: number; profit: number } => {
    const { positions } = data || {};

    const defaultObj = { buys: 0, profit: 0, pnl: 0, sells: 0 };

    if (!positions?.length) return defaultObj;

    //@ts-ignore
    return positions.reduce(
      //@ts-ignore
      (acc: { buys: number; sells: number; profit: number }, item: Position & PendingOrder) => {
        if (isOrder) {
          const orderType = item.type % 2;
          if (orderType === 0) acc.buys++;
          else if (orderType === 1) acc.sells++;
          acc.profit += item.profit ?? 0;
        } else {
          if (item.action === 0) {
            let profitBuy = item.profit;

            if (currencyProfitSymbol) {
              if (liveBid && liveCurrencyAveragePrice) {
                profitBuy = (liveBid - item.priceOpen) * item.Volume * item.contractSize;
                /*** We should convert into profit currency ***/
                profitBuy = currencyProfitSymbolDirect
                  ? profitBuy * liveCurrencyAveragePrice
                  : profitBuy / liveCurrencyAveragePrice;
              }
            } else {
              if (liveBid) {
                profitBuy = (liveBid - item.priceOpen) * item.Volume * item.contractSize;
              }
            }
            acc.buys++;
            acc.profit += profitBuy;
          } else if (item.action === 1) {
            let profitSell = item.profit;

            if (currencyProfitSymbol) {
              if (liveAsk && liveCurrencyAveragePrice) {
                profitSell = (item.priceOpen - liveAsk) * item.Volume * item.contractSize;
                /*** We should convert into profit currency ***/
                profitSell = currencyProfitSymbolDirect
                  ? profitSell * liveCurrencyAveragePrice
                  : profitSell / liveCurrencyAveragePrice;
              }
            } else {
              if (liveAsk) {
                profitSell = (item.priceOpen - liveAsk) * item.Volume * item.contractSize;
              }
            }
            acc.sells++;
            acc.profit += profitSell;
          }
        }
        return acc;
      },
      defaultObj
    );
  }, [data, isOrder, liveAsk, liveBid, liveCurrencyAveragePrice]);

  const img = useMemo(() => ({ uri: data.image }), [data.image]);

  const debounceSetData = useCallback(
    (askPrice: number, bidPrice: number) => {
      runAfterInteraction(() => {
        if (!enabledHandleMessage) {
          return;
        }

        if (askPrice) {
          setLiveAsk(askPrice);
        }
        if (bidPrice) {
          setLiveBid(bidPrice);
        }
      });
    },
    [enabledHandleMessage, setLiveBid, setLiveAsk]
  );

  const debounceSetCurrencyData = useCallback(
    (askPrice: number, bidPrice: number) => {
      runAfterInteraction(() => {
        if (!enabledHandleMessage) {
          return;
        }

        if (askPrice && bidPrice) {
          const averagePrice = (askPrice + bidPrice) / 2;

          setLiveCurrencyAveragePrice(averagePrice);
        }
      });

      // console.log('*************** BasePositionCard', askPrice, bidPrice);
    },
    [enabledHandleMessage, setLiveCurrencyAveragePrice]
  );

  const setData = debounce(250, debounceSetData);
  const setCurrencyData = debounce(250, debounceSetCurrencyData);

  const websocketMessageHandler = useCallback(() => {
    if (!enabledHandleMessage) {
      setData.cancel();
      setCurrencyData.cancel();
      return;
    }

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const { symbol, currencyProfitSymbol } = (data as DealsInfo & ParsedTradingAssets & ExtraProps) || {};

      if (!symbol) {
        return;
      }

      const wsData = jsonParse(event?.data);
      if (!wsData) {
        return;
      }
      const {
        ask: dataAsk,
        bid: dataBid,
        symbol: dataSymbol
      } = (wsData || {}) as { ask: number; bid: number; symbol: string };
      if (dataAsk === undefined || dataBid === undefined || dataSymbol === undefined) {
        return;
      }

      if (dataSymbol === symbol) {
        runAfterInteraction(() => setData(dataAsk, dataBid));
      }

      if (currencyProfitSymbol && dataSymbol === currencyProfitSymbol) {
        runAfterInteraction(() => setCurrencyData(dataAsk, dataBid));
      }
    });
  }, [enabledHandleMessage, data, setData, setCurrencyData]);

  useEffect(() => {
    websocketMessageHandler();
  }, [enabledHandleMessage, data]);

  const currentBid = useMemo(() => {
    const digits = data.positions.find((el) => el)?.digits || 0;

    if (liveBid) {
      return liveBid.toFixed(digits);
    }

    const priceCurrent = data.positions.find((el) => el)?.priceCurrent;

    if (priceCurrent) {
      return priceCurrent.toFixed(digits);
    }
  }, [liveBid, data]);

  const currentAsk = useMemo(() => {
    const digits = data.positions.find((el) => el)?.digits || 0;

    if (liveAsk) {
      return liveAsk.toFixed(digits);
    }

    const priceCurrent = data.positions.find((el) => el)?.priceCurrent;

    if (priceCurrent) {
      return priceCurrent.toFixed(digits);
    }
  }, [liveAsk, data]);

  const renderCloseButton = useCallback((position: Position & PendingOrder) => {
    return (
      <TouchableOpacity
        testID='position-card-close-button'
        activeOpacity={activeOpacity}
        hitSlop={{ left: 16, right: 12, top: 12, bottom: 16 }}
        onPress={() => {
          handleCloseButton(position);
        }}
        style={styles.closeButton}
      >
        <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} />
      </TouchableOpacity>
    );
  }, []);

  const handleCloseButton = useCallback(
    (position: Position & PendingOrder) => {
      onClosePressed(position, currencyProfitSymbol, currencyProfitSymbolDirect);
    },
    [isOrder, onClosePressed, currencyProfitSymbol, currencyProfitSymbolDirect]
  );

  const basePositionItem = useMemo(
    () => (
      <BasePositionItem
        isOrder={isOrder}
        onItemPress={onItemPress}
        assetUnit={data.assetUnitOfMeasure}
        assetUnitOfMeasureDigits={data.assetUnitOfMeasureDigits}
        items={data.positions as (Position & PendingOrder & IHistoryData)[]}
        liveAsk={liveAsk}
        liveBid={liveBid}
        liveCurrencyAveragePrice={liveCurrencyAveragePrice}
        currencyProfitSymbol={currencyProfitSymbol}
        currencyProfitSymbolDirect={currencyProfitSymbolDirect}
        onClosePressed={handleCloseButton}
      />
    ),
    [
      isOrder,
      onItemPress,
      liveAsk,
      liveBid,
      liveCurrencyAveragePrice,
      currencyProfitSymbol,
      currencyProfitSymbolDirect,
      handleCloseButton
    ]
  );

  return (
    <Animated.View testID={testID} layout={CurvedTransition} style={styles.general}>
      <Animated.View testID={testIDs.components.atoms.positionCard.positionsContainer} style={containerStyle}>
        {hasPositions && (
          <Animated.View style={[styles.card, cardStyle, !isOpen && shadow6Style]}>
            {isOpen && basePositionItem}
          </Animated.View>
        )}
        <AnimatedPressable
          testID={testIDs.components.atoms.positionCard.positionButton}
          onPress={onPress}
          style={styles.headStyle}
        >
          <View testID={testIDs.components.atoms.positionCard.head.container} style={styles.headContainer}>
            <View style={styles.left}>
              {img.uri?.length > 0 && (
                <Image
                  testID={testIDs.components.atoms.positionCard.head.image}
                  resizeMode='cover'
                  style={styles.img}
                  source={img}
                />
              )}
              <View>
                <BaseText
                  testID={testIDs.components.atoms.positionCard.head.symbol}
                  variant={BaseTextVariant.textSemiBold}
                  numberOfLines={1}
                >
                  {getAssetName(data.symbol)}
                </BaseText>
                <BaseText
                  testID={testIDs.components.atoms.positionCard.head.fullName}
                  variant={styles.fullName}
                  numberOfLines={1}
                >
                  {data.fullName}
                </BaseText>
              </View>
            </View>
            <View testID={testIDs.components.atoms.positionCard.positionsContainer} style={styles.profit}>
              {isOrder ? (
                <View />
              ) : (
                <BaseText
                  testID={testIDs.components.atoms.positionCard.profit}
                  variant={BaseTextVariant.textSemiBold}
                  numberOfLines={1}
                >
                  {`${totals.profit == 0 ? '' : totals.profit > 0 ? '+' : '-'}$${Math.abs(totals.profit).toFixed(2)}`}
                </BaseText>
              )}
            </View>
          </View>
          <View testID={testIDs.components.atoms.positionCard.bottomContainer} style={styles.bottom}>
            <View style={{ gap: 8 }}>
              <View style={styles.right}>
                <InfoContainer type='current' text={`Bid = ${currentBid}`} />
                {!!totals.buys && <InfoContainer type='buy' text={`${totals.buys}x`} />}
              </View>
              <View style={styles.right}>
                <InfoContainer type='current' text={`Ask = ${currentAsk}`} />
                {!!totals.sells && <InfoContainer type='sell' text={`${totals.sells}x`} />}
              </View>
            </View>
            {data.positions?.length === 1 ? renderCloseButton(data.positions[0] as Position & PendingOrder) : null}
            {/* {data?.positions?.[0]?.priceCurrent !== undefined && (
            <InfoContainer type='current' text={`Current = ${currentPrice}`} />
          )} */}
          </View>
        </AnimatedPressable>
      </Animated.View>
    </Animated.View>
  );
};

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { base, text } = palette || {};

  const { shadow10Style } = useCommonStyles(theme);

  return StyleSheet.create({
    headContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between'
    },
    general: {
      width: screenWidth,
      alignItems: 'center'
    },
    card: {
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      overflow: 'hidden',
      gap: 8,
      paddingTop: 12,
      zIndex: 4,
      alignSelf: 'center'
    },
    headStyle: {
      width: '100%',
      height: CARD_HEIGHT,
      backgroundColor: base.white,
      borderRadius: 16,
      zIndex: 10,
      position: 'absolute',
      padding: 16,
      gap: 10,
      ...shadow10Style
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1
    },
    right: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center'
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    closeButton: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    profit: { alignItems: 'flex-end', gap: 4 },
    fullName: {
      fontFamily: inter.regular,
      fontSize: 14,
      color: text.base.tertiary
    },
    img: {
      width: 32,
      height: 32,
      borderRadius: 40
    },
    info: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4
    }
  });
};

export default memo(BasePositionCard);

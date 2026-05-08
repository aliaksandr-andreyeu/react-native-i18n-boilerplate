import { UserTheme, config } from '@/constants';
import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, Keyboard } from 'react-native';
import { useTheme, useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import BaseText, { BaseTextVariant } from '../text';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { formatTwoDecimals, getAssetName, jsonParse } from '@/helpers';
import { debounce } from 'throttle-debounce';
import { useNetwork } from '@/providers';
import { useIsFocused } from '@react-navigation/native';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useCommonStyles } from '@/hooks';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGetSymbolConfigMutation } from '@/store/api';

interface IAssetCard {
  isViewable: boolean;
  title: string;
  fullName: string;
  bid: string;
  ask: string;
  image: string | undefined;
  lastClosedPrice: number;
  digits: number;
  tradeMode?: number | undefined;
  useTradeMode?: boolean;
  testID?: string;
}

const {
  buttons: { activeOpacity }
} = config;

const { width } = Dimensions.get('window');

const BaseAssetCard: React.FC<IAssetCard> = ({
  isViewable = false,
  fullName,
  image,
  ask,
  bid,
  title,
  digits = 0,
  lastClosedPrice,
  useTradeMode = false,
  tradeMode,
  testID
}) => {
  const [liveAsk, setLiveAsk] = useState(Number(ask));
  const [liveBid, setLiveBid] = useState(Number(bid));

  const [getSymbolConfig, { data: symbolConfig }] = useGetSymbolConfigMutation();
  const { websocket, isReadyState } = useNetwork();
  const signals = useAppSelector((store) => store.market.signals);
  const selectedAccount = useAppSelector((store) => store.portfolio.selectedAccount);

  const pageIsFocused = useIsFocused();

  const { t } = useTranslation();

  const enabledHandleMessage = websocket && pageIsFocused && isViewable && isReadyState;

  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    if (!symbolConfig && isViewable && selectedAccount && title && tradeMode === undefined)
      getSymbolConfig({ accountId: selectedAccount, symbol: title });
  }, [isViewable, symbolConfig, selectedAccount, title, tradeMode]);

  useEffect(() => {
    if (!liveAsk) {
      setLiveAsk(Number(ask));
    }
  }, [ask]);

  useEffect(() => {
    if (!liveBid) {
      setLiveBid(Number(bid));
    }
  }, [bid]);

  const debounceSetData = useCallback(
    (askPrice: number, bidPrice: number) => {
      if (!enabledHandleMessage) {
        return;
      }

      // console.log('*************** BaseAssetCard', askPrice, bidPrice)

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

  const websocketMessageHandler = useCallback(() => {
    if (!enabledHandleMessage) {
      setData.cancel();
      return;
    }

    websocket.onMessage((event: WebSocketMessageEvent | null) => {
      const data = jsonParse(event?.data);
      if (!data) {
        return;
      }
      const {
        ask: dataAsk,
        bid: dataBid,
        symbol: dataSymbol
      } = (data || {}) as { ask: number; bid: number; symbol: string };
      if (dataAsk === undefined || dataBid === undefined || dataSymbol === undefined) {
        return;
      }

      if (dataSymbol !== title) {
        return;
      }

      setData(dataAsk, dataBid);
    });
  }, [enabledHandleMessage, setData, title]);

  useEffect(() => {
    websocketMessageHandler();
  }, [enabledHandleMessage, title]);

  const hasImage = useMemo(() => {
    if (!image) return false;
    if (!image.length) return false;
    return true;
  }, [image]);

  const imageUrl = useMemo(() => ({ uri: image }), [image]);

  const average = formatTwoDecimals(((liveAsk + liveBid) / 2)?.toFixed(digits || 0));

  const goAssetDetails = useCallback(() => {
    Keyboard.dismiss();

    navigation.navigate(ROOT_ROUTE_NAMES.AssetDetails, {
      asset: title,
      ask: formatTwoDecimals(liveAsk?.toFixed(digits)),
      bid: formatTwoDecimals(liveBid?.toFixed(digits)),
      digits: digits
    });
  }, [title, liveAsk, liveBid, digits]);

  const profit = useMemo(() => {
    const diff = (liveBid + liveAsk) / 2 - lastClosedPrice;
    return (diff / lastClosedPrice) * 100;
  }, [liveBid, liveAsk, lastClosedPrice]);

  const signalStatus = useMemo(() => {
    let hasSignal = false;
    let hasLiveSignal = false;

    const tempSignals = signals.filter((el) => !el.Disabled);

    for (const signal of tempSignals) {
      if (signal.Product?.amegaName === title) {
        hasSignal = true;
        if (signal.Report?.status === 9) {
          hasLiveSignal = true;
          break;
        }
      }
    }

    return { hasSignal, hasLiveSignal };
  }, [signals, title]);

  const tradeModeValue = useMemo(() => {
    if (tradeMode === undefined) {
      return symbolConfig?.tradeMode;
    }
    return tradeMode;
  }, [tradeMode, symbolConfig]);

  const tradeModeIcon = useMemo((): SvgXmlIconNames | undefined => {
    if (tradeModeValue === undefined) {
      return;
    }
    if ([1, 2, 3].includes(tradeModeValue)) return SvgXmlIconNames.pause;
    else if (tradeModeValue === 0) return SvgXmlIconNames.lock;
  }, [tradeModeValue]);

  const TradeModeIcon = useCallback(
    ({ tradeModeIcon, useTradeMode }: { useTradeMode: boolean; tradeModeIcon: SvgXmlIconNames | undefined }) => {
      if (!useTradeMode || !tradeModeIcon) return null;

      return (
        <Animated.View entering={FadeIn} style={styles.tradeModeContainer}>
          <SvgIcon name={tradeModeIcon} size={IconSize.xs} color={theme.palette.base.black} />
        </Animated.View>
      );
    },
    [theme.dark]
  );

  return (
    <TouchableOpacity
      testID={testID || 'asset-card-button'}
      onPress={goAssetDetails}
      activeOpacity={activeOpacity}
      style={styles.container}
    >
      <TradeModeIcon useTradeMode={useTradeMode} tradeModeIcon={tradeModeIcon} />
      {hasImage && <Image resizeMode='cover' source={imageUrl} style={styles.img} />}
      <View style={{ flex: 1 }}>
        <View style={styles.titleContainer}>
          <View style={styles.horizontal}>
            <BaseText variant={BaseTextVariant.textSemiBold}>{getAssetName(title)}</BaseText>
            {signalStatus.hasSignal && (
              <View style={styles.signalWrap}>
                <SvgIcon name={SvgXmlIconNames.signal} size={IconSize.sm} />
                {signalStatus.hasLiveSignal && (
                  <BaseText variant={BaseTextVariant.extraSmall}>{t('components.signals.live')}</BaseText>
                )}
              </View>
            )}
          </View>
          <BaseText style={styles.average} variant={BaseTextVariant.textSemiBold}>
            {average}
          </BaseText>
        </View>
        <View style={styles.priceContainer}>
          <BaseText style={styles.fullName} variant={BaseTextVariant.small}>
            {fullName}
          </BaseText>
          {profit !== undefined && lastClosedPrice ? (
            <View style={styles.profitContainter}>
              <BaseText
                style={{ color: profit > 0 ? '#159D55' : theme.palette.red['600'] }}
                variant={BaseTextVariant.small}
              >
                {profit > 0 ? '+' : ''}
                {profit.toFixed(2)}%
              </BaseText>
            </View>
          ) : (
            <View style={styles.replace} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, text, background }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      backgroundColor: base.white,
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      gap: 8,
      width: width - 40,
      ...shadow6Style
    },
    img: {
      width: 24,
      height: 24,
      borderRadius: 14
    },
    replace: { width: 40, height: 22 },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 22,
      alignItems: 'center'
    },
    fullName: {
      color: text.base.tertiary,
      flex: 1
    },
    profitContainter: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 22
    },
    average: {
      flex: 1,
      textAlign: 'right'
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    signalWrap: {
      backgroundColor: background.tag.base.signal,
      borderRadius: 4,
      flexDirection: 'row',
      marginHorizontal: 4,
      paddingHorizontal: 4,
      paddingVertical: 1
    },
    tradeModeContainer: {
      paddingVertical: 3,
      paddingHorizontal: 4,
      backgroundColor: background.asset.subtle,
      borderTopLeftRadius: 8,
      borderBottomRightRadius: 8,
      position: 'absolute',
      left: 0,
      top: 0
    }
  });
};

export default memo(BaseAssetCard);

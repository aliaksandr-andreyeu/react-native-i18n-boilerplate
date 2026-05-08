import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { View, TextStyle } from 'react-native';
import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme, testIDs } from '@/constants';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { CurvedTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { formatNumberToAmount, getAssetName, jsonParse } from '@/helpers';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseInput,
  BaseSegmentsGroup,
  BaseText,
  BaseTextVariant
} from '@/components';
import { useNetwork } from '@/providers';
import { debounce } from 'throttle-debounce';
import { useTranslation } from 'react-i18next';

interface BottomSheetProps {
  positionValue: number | null;
  symbol: string;
  assetUnit: string;
  volume: number | undefined;
  profit: number | undefined;
  contractSize: number | undefined;
  volumeStep: number | undefined;
  volumeMin: number | undefined;
  assetUnitOfMeasureDigits: number | undefined;
  priceOpen: number;
  action: number;
  profitSymbol: string;
  profitSymbolDirect: boolean;
  onSubmit: (volumeClose: number, isFullClose: boolean) => void;
  livePnL?: number;
}

const segments = [5, 10, 25, 50, 75, 100];

export const ClosePositionContent: FC<BottomSheetProps> = ({
  positionValue,
  symbol,
  volume,
  profit,
  contractSize,
  assetUnit,
  volumeStep,
  volumeMin,
  assetUnitOfMeasureDigits = 2,
  onSubmit,

  priceOpen,
  action,
  profitSymbol,
  profitSymbolDirect,
  livePnL
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { websocket, isReadyState } = useNetwork();
  const [value, setValue] = useState<string>('');
  const [percent, setPercent] = useState<number>(segments.at(-1) || 100);
  const [hasValidationError, setHasValidationError] = useState<undefined | string>();
  const [liveAsk, setLiveAsk] = useState<number | undefined>(undefined);
  const [liveBid, setLiveBid] = useState<number | undefined>(undefined);

  const pageIsFocused = useIsFocused();

  const { t } = useTranslation();

  const enabledHandleMessage = websocket && pageIsFocused && isReadyState && !livePnL;
  const [liveCurrencyAveragePrice, setLiveCurrencyAveragePrice] = useState<number | undefined>(undefined);

  const positionSize = useMemo(() => {
    const ps = ((volume || 0) * (contractSize || 0)).toFixed(assetUnitOfMeasureDigits);
    return +ps;
  }, [volume, contractSize, assetUnitOfMeasureDigits]);

  useEffect(() => {
    if (positionSize) {
      setValue(positionSize.toString());
    }
  }, [positionSize]);

  const handleColor = (value: number | undefined) => {
    if (value === undefined || value === 0) return theme.palette?.graphite['900'];
    return value >= 0 ? '#159D55' : theme.palette?.red['600'];
  };

  const onInputChange = useCallback(
    (value: string) => {
      let val = value;
      value.includes(',') && (val = value.replaceAll(',', '.'));

      const regex = new RegExp(`^-?\\d*(\\.\\d{0,${assetUnitOfMeasureDigits}})?$`);
      if (regex.test(value)) {
        setValue(value);
      }
    },
    [assetUnitOfMeasureDigits]
  );

  const formatNumber = (num: number | undefined, digits?: number) => {
    if (num === undefined || isNaN(num)) return 0;
    return num % 1 !== 0 && num.toString().split('.')?.[1]?.length > 2 ? num.toFixed(digits || 0) : num.toString();
  };

  const handleRealisedProfit = (
    profit: number | undefined,
    volumeClose: number | undefined,
    volumeFull: number | undefined
  ) => {
    if (profit === undefined || volumeClose === undefined || volumeFull === undefined) return 0;
    return profit * (volumeClose / volumeFull);
  };

  const realisedPnL = useMemo(() => {
    const inputValue = value.length > 0 ? parseFloat(value) : 0;

    let volumeClose: number | undefined = (inputValue ?? volume) / (contractSize || 1);
    const rPnL = handleRealisedProfit(livePnL ?? profit, volumeClose, volume);
    const label =
      rPnL >= 0
        ? t('components.templates.close-position.realised-profit')
        : t('components.templates.close-position.realised-loss');
    return {
      value: formatNumber(rPnL, 2),
      color: handleColor(rPnL),
      label,
      volumeClose
    };
  }, [volume, profit, value, positionSize, contractSize, livePnL, t]);

  const onSegmentChanged = useCallback(
    (index: number) => {
      setValue((((positionSize || 0) * segments[index]) / 100).toFixed(assetUnitOfMeasureDigits));
      setPercent(segments[index]);
    },
    [positionSize, segments, assetUnitOfMeasureDigits, setPercent, setValue]
  );

  useEffect(() => {
    if (volumeStep && volumeMin && contractSize && positionSize) {
      const isDisabled = () => {
        const minStep = volumeStep * contractSize;
        const minVol = volumeMin * contractSize;
        const result = +value;
        const remain = positionSize - result;

        if (result === positionSize) {
          setHasValidationError(undefined);
        } else if (result > positionSize) {
          setHasValidationError(t('components.templates.close-position.too-big', { amount: positionSize }));
        } else if (result < minVol || result < minStep) {
          setHasValidationError(t('components.templates.close-position.minimal-close', { amount: minVol }));
        } else if (remain < minVol || remain < minStep) {
          setHasValidationError(t('components.templates.close-position.minimal-remain', { amount: minVol }));
        } else setHasValidationError(undefined);
      };

      isDisabled();
    }
  }, [value, volumeMin, contractSize, volumeStep, positionSize, t]);

  const formattedPositionValue = useMemo(() => {
    if (!positionValue) {
      return null;
    }
    const percentPositionValue = (percent * positionValue) / 100;
    const formatPositionValue = formatNumberToAmount(percentPositionValue.toFixed(2));

    return `$${formatPositionValue}`;
  }, [positionValue, percent]);

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

  const debounceSetCurrencyData = useCallback(
    (askPrice: number, bidPrice: number) => {
      if (!enabledHandleMessage) {
        return;
      }

      if (askPrice && bidPrice) {
        const averagePrice = (askPrice + bidPrice) / 2;

        setLiveCurrencyAveragePrice(averagePrice);
      }

      // console.log('*************** LiveCurrencyAveragePrice', askPrice, bidPrice)
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
        setData(dataAsk, dataBid);
      }

      if (profitSymbol && dataSymbol === profitSymbol) {
        setCurrencyData(dataAsk, dataBid);
      }
    });
  }, [enabledHandleMessage, symbol, setData, setCurrencyData]);

  useEffect(() => {
    websocketMessageHandler();
  }, [enabledHandleMessage, symbol]);

  const currentPnL = useMemo(() => {
    let currentProfit = profit;

    if (action === 0 && liveBid) {
      currentProfit = (liveBid - priceOpen) * (volume || 0) * (contractSize || 0);

      if (profitSymbol && liveCurrencyAveragePrice) {
        /*** We should convert into profit currency ***/
        currentProfit = profitSymbolDirect
          ? currentProfit * liveCurrencyAveragePrice
          : currentProfit / liveCurrencyAveragePrice; //liveCurrencyAveragePrice = (ask + bid) /2
      }
    } else if (action === 1 && liveAsk) {
      currentProfit = (priceOpen - liveAsk) * (volume || 0) * (contractSize || 0);

      if (profitSymbol && liveCurrencyAveragePrice) {
        /*** We should convert into profit currency ***/
        currentProfit = profitSymbolDirect
          ? currentProfit * liveCurrencyAveragePrice
          : currentProfit / liveCurrencyAveragePrice; //liveCurrencyAveragePrice = (ask + bid) /2
      }
    }

    let volumeClose: number | undefined = ((value.length > 0 ? parseFloat(value) : 0) ?? volume) / (contractSize || 1);

    return formatNumber(handleRealisedProfit(currentProfit, volumeClose, volume), 2);
  }, [
    value,
    liveAsk,
    liveBid,
    liveCurrencyAveragePrice,
    contractSize,
    volume,
    priceOpen,
    profitSymbol,
    profitSymbolDirect,
    profit
  ]);

  return (
    <BottomSheetView>
      <View testID={testIDs.components.templates.app.closePositionContent.container} style={styles.sheetContainer}>
        <BaseText
          testID={testIDs.components.templates.app.closePositionContent.symbol}
          variant={BaseTextVariant.title}
        >{`${action === 0 ? t('components.atoms.deal-card.sell') : t('components.atoms.deal-card.buy')} ${getAssetName(
          symbol
        )}`}</BaseText>
        <Animated.View layout={CurvedTransition} style={styles.sheetTop}>
          <View>
            <BaseInput
              testID={testIDs.components.templates.app.closePositionContent.input}
              keyboardType='numeric'
              value={value}
              onChange={onInputChange}
              hideClearButton
              isBottomSheet
              error={hasValidationError?.length !== undefined}
              style={styles.input}
              title={`${t('components.templates.close-position.amount')}, ${assetUnit}`}
            />
            {hasValidationError?.length !== undefined && (
              <Animated.View
                testID={testIDs.components.templates.app.closePositionContent.validationError}
                entering={FadeIn}
                exiting={FadeOut}
              >
                <BaseText style={styles.error} variant={BaseTextVariant.tiny}>
                  {hasValidationError}
                </BaseText>
              </Animated.View>
            )}
          </View>
          <Animated.View
            testID={testIDs.components.templates.app.closePositionContent.closeValue}
            layout={CurvedTransition}
            style={styles.sheetValue}
          >
            <BaseText style={styles.grayText} variant={BaseTextVariant.tiny}>
              {t('components.templates.close-position.value-usd')}
            </BaseText>
            <BaseText numberOfLines={1}>{formattedPositionValue}</BaseText>
          </Animated.View>
        </Animated.View>
        <Animated.View
          testID={testIDs.components.templates.app.closePositionContent.segmentsContainer}
          layout={CurvedTransition}
        >
          <BaseSegmentsGroup
            volumeStep={volumeStep}
            positionSize={positionSize}
            volumeMin={volumeMin}
            contractSize={contractSize}
            inputValue={+value}
            onSegmentSelect={onSegmentChanged}
            assetUnitOfMeasureDigits={assetUnitOfMeasureDigits}
            segments={segments}
          />
        </Animated.View>
        <Animated.View layout={CurvedTransition} style={styles.sheetBottom}>
          <Animated.View
            testID={testIDs.components.templates.app.closePositionContent.realisedPnLContaner}
            layout={CurvedTransition}
            style={styles.sheetLoss}
          >
            <BaseText style={styles.grayText} variant={BaseTextVariant.tiny}>
              {realisedPnL.label}
            </BaseText>
            <BaseText style={{ color: realisedPnL.color }}>
              {!enabledHandleMessage ? realisedPnL.value : currentPnL}
            </BaseText>
          </Animated.View>
          <BaseButton
            testID={testIDs.components.templates.app.closePositionContent.confirmButton}
            type={BaseButtonType.primary}
            onPress={() => {
              onSubmit(realisedPnL.volumeClose, positionSize.toString() === value);
            }}
            size={BaseButtonSize.large}
            disabled={hasValidationError?.length !== undefined || isNaN(parseFloat(value)) || parseFloat(value) <= 0}
            style={styles.sheetConfirm}
            label={t('components.templates.close-position.confirm')}
          />
        </Animated.View>
      </View>
    </BottomSheetView>
  );
};

interface Styles {
  sheetContainer: ViewStyle;
  sheetTop: ViewStyle;
  sheetValue: ViewStyle;
  sheetBottom: ViewStyle;
  sheetLoss: ViewStyle;
  sheetConfirm: ViewStyle;
  input: TextStyle;
  error: TextStyle;
  grayText: TextStyle;
}

const useStyles = ({ palette: { red } }: UserTheme) =>
  StyleSheet.create<Styles>({
    sheetContainer: {
      paddingTop: 32,
      paddingHorizontal: 20
    },
    sheetTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      marginTop: 24
    },
    input: {
      width: 213
    },
    error: {
      color: red['600'],
      paddingLeft: 16,
      marginTop: 4
    },
    sheetValue: {
      paddingVertical: 6,
      paddingHorizontal: 16,
      gap: 1,
      minWidth: 110
    },
    grayText: {
      color: '#8fa6ae'
    },
    sheetBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 44
    },
    sheetLoss: {
      gap: 1,
      width: 120
    },
    sheetConfirm: {
      flex: 1
    }
  });

export default ClosePositionContent;

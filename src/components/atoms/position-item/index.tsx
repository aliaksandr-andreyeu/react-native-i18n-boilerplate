import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, TextProps } from 'react-native';
import { ActionTypes, ActionValues, IHistoryData, IInfoContainer } from '../position-card';
import BaseText, { BaseTextVariant } from '../text';
import { UserTheme, config, testIDs } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { PendingOrder, Position } from '@/store/slices/portfolio/types';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { useTheme } from '@react-navigation/native';
import Animated, { FlipInEasyX } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from '@/hooks';

interface IBasePositionItem {
  items: (Position & PendingOrder & IHistoryData)[];
  onItemPress(ticket: number): void;
  onClosePressed(position: Position): void;
  assetUnit: ParsedTradingAssets['assetUnitOfMeasure'];
  assetUnitOfMeasureDigits: ParsedTradingAssets['assetUnitOfMeasureDigits'];
  isOrder: boolean;
  liveAsk?: number;
  liveBid?: number;
  liveCurrencyAveragePrice?: number;
  currencyProfitSymbol?: string;
  currencyProfitSymbolDirect?: boolean;
}

const {
  buttons: { activeOpacity },
  screenWidth
} = config;

const BasePositionItem: React.FC<IBasePositionItem> = ({
  liveAsk,
  liveBid,
  liveCurrencyAveragePrice,
  currencyProfitSymbol,
  currencyProfitSymbolDirect,
  items,
  onItemPress,
  onClosePressed,
  assetUnit = '',
  assetUnitOfMeasureDigits,
  isOrder
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
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

  const type = useCallback((i: number): ActionTypes | '' => {
    const types: Record<number, ActionTypes> = { 0: 'buy', 1: 'sell' };

    return types[i] || '';
  }, []);

  const InfoContainer = useCallback(
    ({ text, text1, type, ...rest }: IInfoContainer & TextProps) => {
      const props = infoValues[type];

      if (!props) return null;

      const info = () => {
        if (text) return `${text} ${props.suf}`;
        return props.suf;
      };
      return (
        <View testID={testIDs.components.atoms.positionItem.infoContainer(type)} style={[styles.info, { backgroundColor: props.bg }]}>
          {type === 'price' ? (
            <View style={styles.priceInfoContainer}>
              <BaseText testID={testIDs.components.atoms.positionItem.infoContainer(type) + '_text'} variant={BaseTextVariant.extraSmall} style={{ color: props.color }} {...rest}>
                {text}
              </BaseText>
              <SvgIcon name={SvgXmlIconNames.arrowRight} size={IconSize.xs} />
              <BaseText testID={testIDs.components.atoms.positionItem.infoContainer(type) + '_text1'} variant={BaseTextVariant.extraSmall} style={{ color: props.color }} {...rest}>
                {text1}
              </BaseText>
            </View>
          ) : (
            <BaseText testID={testIDs.components.atoms.positionItem.infoContainer(type) + '_infoText'} variant={BaseTextVariant.extraSmall} style={{ color: props.color }} {...rest}>
              {info()}
            </BaseText>
          )}
        </View>
      );
    },
    [t]
  );

  const renderCloseButton = useCallback(
    (position: Position) => {
      return (
        <TouchableOpacity
          testID={testIDs.components.atoms.positionItem.closeButton(position.ticket)}
          activeOpacity={activeOpacity}
          hitSlop={{ left: 8, right: 12, top: 12, bottom: 16 }}
          onPress={() => {
            onClosePressed?.(position);
          }}
          style={styles.closeButton}
        >
          <SvgIcon name={SvgXmlIconNames.close} size={IconSize.xxs} />
        </TouchableOpacity>
      );
    },
    [onClosePressed]
  );

  const _renderItem = useCallback(
    ({ item, index }: { item: Position & PendingOrder & IHistoryData; index: number }) => {
      const onPress = () => onItemPress(item.ticket);

      const multVC = (isOrder ? item.VolumeInitial : item.Volume) * item.contractSize;
      const VMC = multVC || 0;
      let profit = item.profit || 0;
      const priceOpen = isOrder ? item.priceOrder : item.priceOpen;
      const itemType = isOrder ? type(item.type % 2) : type(item.action);
      const hasUnitLength = assetUnit.length > 0;
      const hasSL = item.priceSL > 0;
      const hasTP = item.priceTP > 0;
      const current = `${VMC.toFixed(assetUnitOfMeasureDigits)}${hasUnitLength ? ` ${assetUnit}` : ''} at ${(
        priceOpen ?? 0
      ).toFixed(item.digits || 0)}`;

      if (!isOrder) {
        if (item.action === 0) {
          if (currencyProfitSymbol) {
            if (liveBid && liveCurrencyAveragePrice) {
              profit = (liveBid - item.priceOpen) * item.Volume * item.contractSize;
              /*** We should convert into profit currency ***/
              profit = currencyProfitSymbolDirect
                ? profit * liveCurrencyAveragePrice
                : profit / liveCurrencyAveragePrice;
            }
          } else {
            if (liveBid) {
              profit = (liveBid - item.priceOpen) * item.Volume * item.contractSize;
            }
          }
        } else if (item.action === 1) {
          if (currencyProfitSymbol) {
            if (liveAsk && liveCurrencyAveragePrice) {
              profit = (item.priceOpen - liveAsk) * item.Volume * item.contractSize;
              /*** We should convert into profit currency ***/
              profit = currencyProfitSymbolDirect
                ? profit * liveCurrencyAveragePrice
                : profit / liveCurrencyAveragePrice;
            }
          } else {
            if (liveAsk) {
              profit = (item.priceOpen - liveAsk) * item.Volume * item.contractSize;
            }
          }
        }
      }

      return (
        <Animated.View testID={testIDs.components.atoms.positionItem.container(item.ticket)} entering={FlipInEasyX.delay((index + 1) * 70)}>
          <TouchableOpacity
            testID={testIDs.components.atoms.positionItem.touchable(item.ticket)}
            onPress={onPress}
            activeOpacity={activeOpacity}
            style={styles.item}
          >
            <View style={styles.positionGap}>
              <View style={styles.positionInfo}>
                <InfoContainer type={itemType} />
                {hasSL && <InfoContainer type={'sl'} />}
                {hasTP && <InfoContainer type={'tp'} />}
              </View>
              <InfoContainer numberOfLines={1} text={current} type='current' />
            </View>
            <View style={styles.positionRight}>
              <View style={styles.positionProfit}>
                {isOrder ? (
                  renderCloseButton(item)
                ) : (
                  <View style={styles.closeButtonWrapper}>
                    <BaseText
                      testID={testIDs.components.atoms.positionItem.profit(item.ticket)}
                      variant={BaseTextVariant.textSemiBold}
                      numberOfLines={1}
                    >
                      {`${profit == 0 ? '' : profit > 0 ? '+' : '-'}$${Math.abs(profit).toFixed(2) ?? '0.00'}`}
                    </BaseText>
                    {renderCloseButton(item)}
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [liveAsk, liveBid, liveCurrencyAveragePrice, currencyProfitSymbol, currencyProfitSymbolDirect, t]
  );

  const _keyExtractor = useCallback(
    (item: Position & PendingOrder, index: number) => `${item.ticket}-${index}-position`,
    []
  );

  return (
    <FlatList
      testID={testIDs.components.atoms.positionItem.list}
      data={items}
      keyExtractor={_keyExtractor}
      scrollEnabled={false}
      style={styles.listStyle}
      showsVerticalScrollIndicator={false}
      bounces={false}
      renderItem={_renderItem}
    />
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme || {};

  const { shadow10Style } = useCommonStyles(theme);

  return StyleSheet.create({
    info: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4
    },
    positionProfit: { alignItems: 'flex-end', gap: 8 },
    positionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    positionInfo: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center'
    },
    positionGap: {
      gap: 8,
      alignItems: 'flex-start'
    },
    item: {
      width: screenWidth - 40,
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
      gap: 4,
      justifyContent: 'space-between',
      backgroundColor: base.white,
      borderRadius: 12,
      ...shadow10Style
    },
    closeButtonWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    closeButton: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8
    },
    listStyle: {
      gap: 8,
      alignSelf: 'center'
    },
    priceInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    }
  });
};

export default memo(BasePositionItem);

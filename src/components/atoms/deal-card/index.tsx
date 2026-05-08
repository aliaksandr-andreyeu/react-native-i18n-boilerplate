import React, { memo, useCallback, useMemo } from 'react';
import { ParsedTradingAssets } from '@/store/api/portfolio/types';
import { DealsInfo } from '@/store/slices/portfolio/types';
import { View, StyleSheet, TextProps, TouchableOpacity } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useTheme } from '@react-navigation/native';
import BaseImage from '../image';
import BaseText, { BaseTextVariant } from '../text';
import { ActionTypes, ActionValues, IInfoContainer } from '../position-card';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useCommonStyles } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { formatTwoDecimals, getAssetName } from '@/helpers';

interface IDealCard {
  data: DealsInfo & ParsedTradingAssets;
  onDealPress(ticket: number): void;
  testID?: string;
}

const {
  screenWidth,
  buttons: { activeOpacity }
} = config;

const BaseDealCard: React.FC<IDealCard> = ({ data, onDealPress, testID }) => {
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

  const InfoContainer = useCallback(({ text, text1, type, ...rest }: IInfoContainer & TextProps) => {
    const props = infoValues[type];

    if (!props) return null;

    const info = () => {
      if (text) return `${text} ${props.suf}`;
      return props.suf;
    };
    return (
      <View testID={testID + `_infoContainer_${type}_container`} style={[styles.info, { backgroundColor: props.bg }]}>
        {type === 'price' ? (
          <View testID={testID + `_infoContainer_${type}_priceInfoContainer`} style={styles.priceInfoContainer}>
            <BaseText variant={BaseTextVariant.extraSmall} style={{ color: props.color }} {...rest}>
              {text}
            </BaseText>
            <SvgIcon name={SvgXmlIconNames.arrowRight} size={IconSize.xs} />
            <BaseText variant={BaseTextVariant.extraSmall} style={{ color: props.color }} {...rest}>
              {text1}
            </BaseText>
          </View>
        ) : (
          <BaseText testID={testID + `_infoContainer_${type}_info`} variant={BaseTextVariant.extraSmall} style={{ color: props.color }} {...rest}>
            {info()}
          </BaseText>
        )}
      </View>
    );
  }, [testID]);

  const onPress = useCallback(() => {
    onDealPress(data.ticket);
  }, [data.ticket]);

  const getDirection = (action: number | undefined): ActionTypes => {
    if (action === 1) return 'buy';
    else if (action === 0) return 'sell';
    return '';
  };

  const getSize = (contractSize: number | undefined = 0, volumeClosed: number | undefined = 0, assetUnit: string) => {
    const multiVal = contractSize * volumeClosed || '';
    if (assetUnit)
      return `${multiVal ? multiVal.toFixed(data.assetUnitOfMeasureDigits) : ''} ${data.assetUnitOfMeasure}`;
    return multiVal;
  };

  const getProfit = (p: number) => {
    const dealProfit = p || 0;
    const fixedProfit = `$${Math.abs(dealProfit).toFixed(2)}`;
    if (dealProfit == 0) return fixedProfit;
    else if (dealProfit > 0) return `+${fixedProfit}`;
    else return `-${fixedProfit}`;
  };

  const deal = useMemo(() => {
    const size = getSize(data.contractSize, data.VolumeClosed, data.assetUnitOfMeasure);
    const direction = getDirection(data.action);
    const profit = getProfit(data.profit);
    const img = { uri: data.image };

    return {
      img,
      size,
      direction,
      profit
    };
  }, [data.contractSize, data.VolumeClosed, data.assetUnitOfMeasure, data.action, data.profit, data.image]);

  return (
    <TouchableOpacity testID={testID} activeOpacity={activeOpacity} onPress={onPress} style={styles.container}>
      <View style={styles.top}>
        {Boolean(data.image) && <BaseImage testID={testID + '_image'} resizeMode='cover' style={styles.img} source={deal.img} />}
        <View style={styles.topRight}>
          <View testID={testID + '_topContainer'} style={styles.topUp}>
            <BaseText variant={BaseTextVariant.textSemiBold}>{getAssetName(data.symbol || '')}</BaseText>
            <BaseText variant={BaseTextVariant.textSemiBold}>{formatTwoDecimals(deal?.profit || 0)}</BaseText>
          </View>
          <View testID={testID + '_downContainer'} style={styles.topDown}>
            <BaseText variant={BaseTextVariant.small}>{data.fullName}</BaseText>
            {/* <BaseText style={styles.percent} ></BaseText> */}
          </View>
        </View>
      </View>
      <View testID={testID + '_valuesContainer'} style={styles.valuesContainer}>
        <InfoContainer type='current' text={deal.size} />
        <InfoContainer type={deal.direction} />
        {data.priceSL > 0 && <InfoContainer type='sl' />}
        {data.priceTP > 0 && <InfoContainer type='tp' />}
      </View>
      <View testID={testID + '_currentContainer'} style={styles.currentContainer}>
        <InfoContainer
          type='price'
          text={formatTwoDecimals((data?.pricePosition || 0)?.toFixed(data?.digits || 0))}
          text1={formatTwoDecimals((data?.price || 0)?.toFixed(data?.digits || 0))}
        />
      </View>
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      width: screenWidth - 40,
      padding: 16,
      borderRadius: 16,
      backgroundColor: base.white,
      overflow: 'hidden',
      ...shadow6Style
    },
    img: {
      width: 32,
      height: 32,
      borderRadius: 16
    },
    info: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4
    },
    priceInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    top: {
      flexDirection: 'row',
      width: '100%',
      gap: 8,
      alignItems: 'center'
    },
    topRight: {
      gap: 4,
      flex: 1
    },
    topUp: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    topDown: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8
    },
    valuesContainer: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    currentContainer: {
      marginTop: 8,
      alignItems: 'flex-start'
    }
  });
};

export default memo(BaseDealCard);

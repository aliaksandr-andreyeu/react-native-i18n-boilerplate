import React, { FC, useMemo, useState, memo, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, TouchableHighlight } from 'react-native';
import { BaseText, BaseTextVariant, OpenPosition } from '@/components';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { UserTheme, config } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { testIDs } from '@/constants';

const {
  components: {
    buttons: { hitSlop }
  }
} = config;

interface AssetDetailsOverviewScreenProps {
  ask: number;
  bid: number;
  digits: number;
  asset: string;
  tradeMode?: number | undefined;
  useMode?: boolean;
}

const SellBuyButtons: FC<AssetDetailsOverviewScreenProps> = ({
  ask,
  bid,
  asset,
  digits = 0,
  tradeMode,
  useMode = false
}) => {
  const [entry, setEntry] = useState<boolean | undefined>(undefined);
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);

  const { width: screenWidth } = useWindowDimensions();

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    palette: { graphite }
  } = theme;

  const onSell = () => {
    setEntry(false);
    setSheetVisible(true);
  };

  const onBuy = () => {
    setEntry(true);
    setSheetVisible(true);
  };

  const askValue = useMemo(() => {
    return ask.toFixed(digits);
  }, [ask, digits]);

  const bidValue = useMemo(() => {
    return bid.toFixed(digits);
  }, [bid, digits]);

  const buttonsLoader = useMemo(() => {
    const xPos = screenWidth / 2 + 8;
    const xWidth = (screenWidth - 56) / 2;
    return (
      <View style={styles.buttonsLoader}>
        <ContentLoader
          speed={2}
          width={screenWidth}
          height={54}
          backgroundColor={'#E2E6F2'}
          foregroundColor={graphite['050']}
        >
          <Rect x={20} y={0} rx='8' ry='8' width={xWidth} height={54} />
          <Rect x={xPos} y={0} rx='8' ry='8' width={xWidth} height={54} />
        </ContentLoader>
      </View>
    );
  }, [screenWidth]);

  const tradeModeActives = useMemo(() => {
    const values = {
      buy: true,
      sell: true,
      isClosure: false,
      isUndefined: false
    };

    if (!useMode) return values;

    switch (tradeMode) {
      case 0:
        values.buy = false;
        values.sell = false;
        break;
      case 1:
        values.sell = false;
        break;
      case 2:
        values.buy = false;
        break;
      case 3:
        values.buy = false;
        values.sell = false;
        values.isClosure = true;
        break;
      case undefined:
        values.buy = false;
        values.sell = false;
        values.isUndefined = true;
        break;
    }

    return values;
  }, [tradeMode, useMode]);

  const translate = (key: string) => t(`screens.asset-details.${key}` as any);

  const TradeInfo = useCallback(
    ({
      buy,
      isClosure,
      isUndefined,
      sell
    }: {
      buy: boolean;
      sell: boolean;
      isClosure: boolean;
      isUndefined: boolean;
    }) => {
      if (isUndefined || (buy && sell) || !useMode) return null;

      let info = '';

      if (!buy && !sell) {
        if (isClosure) info = translate('mode-closure');
        else info = translate('mode-disabled');
      } else if (!buy) info = translate('mode-short');
      else if (!sell) info = translate('mode-long');

      return (
        <View style={styles.tradeInfo}>
          <SvgIcon
            name={!buy && !sell && !isClosure ? SvgXmlIconNames.lock : SvgXmlIconNames.pause}
            size={IconSize.sm}
            color={theme.palette.graphite[900]}
          />
          <BaseText variant={BaseTextVariant.extraSmall}>{info}</BaseText>
        </View>
      );
    },
    [theme.dark, useMode, t]
  );

  const buttonsComponent = useMemo(() => {
    if (!ask || !bid) {
      return buttonsLoader;
    }

    const sellDisabled = !tradeModeActives.sell;
    const buyDisabled = !tradeModeActives.buy;

    return (
      <View style={styles.buttonsContainer}>
        <TradeInfo {...tradeModeActives} />
        <View style={styles.buttons}>
          <TouchableHighlight
            disabled={sellDisabled}
            onPress={onSell}
            underlayColor={theme.palette.red[700]}
            hitSlop={hitSlop}
            style={styles.flex}
            testID={testIDs.components.molecules.assetDetailsTabs.overview.buttonSell}
            accessibilityValue={{
              text: testIDs.components.molecules.assetDetailsTabs.overview.buttonSell
            }}
            accessibilityLabel={testIDs.components.molecules.assetDetailsTabs.overview.buttonSell}
            accessible={true}
          >
            <View style={[styles.order, styles.sell, sellDisabled && { opacity: 0.6, backgroundColor: theme.palette.red[300] }]} >
              <BaseText variant={BaseTextVariant.textSemiBold} style={styles.sellDesc}>
                {t('screens.asset-details.sell')}
              </BaseText>
              <BaseText variant={BaseTextVariant.small} style={styles.sellDesc}>
                {bidValue}
              </BaseText>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            disabled={buyDisabled}
            onPress={onBuy}
            underlayColor={theme.palette.green[500]}
            hitSlop={hitSlop}
            style={styles.flex}
            testID={testIDs.components.molecules.assetDetailsTabs.overview.buttonBuy}
            accessibilityValue={{
              text: testIDs.components.molecules.assetDetailsTabs.overview.buttonBuy
            }}
            accessibilityLabel={testIDs.components.molecules.assetDetailsTabs.overview.buttonBuy}
            accessible={true}
          >
            <View style={[styles.order, styles.buy, buyDisabled && { opacity: 0.6, backgroundColor: '#DEFAE4' }]}  >
              <BaseText variant={BaseTextVariant.textSemiBold} style={styles.buyDesc}>
                {t('screens.asset-details.buy')}
              </BaseText>
              <BaseText variant={BaseTextVariant.small} style={styles.buyDesc}>
                {askValue}
              </BaseText>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }, [buttonsLoader, ask, bid, bidValue, askValue, tradeModeActives, useMode, t, theme.dark]);

  return (
    <View>
      {buttonsComponent}
      <OpenPosition
        ask={ask}
        bid={bid}
        asset={asset}
        visible={sheetVisible}
        setVisible={setSheetVisible}
        entry={entry}
      />
    </View>
  );
};

export default memo(SellBuyButtons);

const useStyles = ({ palette: { base, red, green, graphite } }: UserTheme) =>
  StyleSheet.create({
    buttonsLoader: {
      position: 'absolute',
      bottom: 72,
      left: 0,
      right: 0,
      height: 54
    },
    buttons: {
      gap: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 44,
      paddingHorizontal: 20,
      flex: 1,
    },
    order: {
      borderRadius: 8,
      paddingTop: 6,
      paddingHorizontal: 8,
      paddingBottom: 8,
      minHeight: 54,
      gap: 4,
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    buy: {
      backgroundColor: green['400'],
    },
    sell: {
      backgroundColor: red['600'],
    },
    flex: {
      flex: 1,
      borderRadius: 8,
      overflow: 'hidden'
    },
    buyDesc: {
      color: graphite['900']
    },
    sellDesc: {
      color: base.white
    },
    tradeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'center',
      borderRadius: 6,
      backgroundColor: graphite[100],
      paddingLeft: 4,
      paddingRight: 8,
      paddingVertical: 4
    },
    buttonsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(247, 248, 250, 0.9)',
      width: '100%',
      paddingTop: 12,
      gap: 16
    }
  });

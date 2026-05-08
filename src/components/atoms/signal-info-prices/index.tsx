import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import BaseText, { BaseTextVariant, BaseTextVariantValue } from '../text';
import { useTranslation } from 'react-i18next';
import { Signals } from '@/store/slices/market/types';
import { useCommonStyles } from '@/hooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { formatTwoDecimals } from '@/helpers';

dayjs.extend(duration);

interface ISegmentItem {
  data: Signals;
  style?: ViewStyle;
  potentialLoss?: string;
  expectedProfit?: string;
  hide?: boolean;
  testID?: string
}

const { screenWidth } = config;

const SignalInfoPrices: React.FC<ISegmentItem> = ({ data, style, potentialLoss, expectedProfit, hide, testID }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const { t } = useTranslation();

  const calculateTimeRemaining = useCallback(() => {
    const now = dayjs();
    const expiry = dayjs(data?.Report?.expiry);
    const durationObj = dayjs.duration(expiry.diff(now));

    const hours = durationObj.hours();
    const minutes = durationObj.minutes();

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, [data?.Report?.expiry]);

  const [expiresIn, setExpiresIn] = useState(calculateTimeRemaining());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setExpiresIn(calculateTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [calculateTimeRemaining]);

  const progressBarValues = useMemo(() => {
    let values = {
      color: theme.palette.red['600'],
      text: t('components.signals.low')
    };

    if (!data) {
      return values;
    }

    if (data?.Report?.confidence >= 40 && data?.Report?.confidence < 80) {
      values = {
        color: '#F7BF16',
        text: t('components.signals.medium')
      };
    }
    if (data?.Report?.confidence >= 80) {
      values = {
        color: theme.palette.green['400'],
        text: t('components.signals.high')
      };
    }

    return values;
  }, [data?.Report?.confidence, theme.palette, t]);

  const renderProgressBar = useMemo(() => {
    return (
      <>
        <View style={styles.progressBarHeader}>
          <BaseText style={styles.graphite} variant={BaseTextVariant.extraSmall}>
            {t('components.signals.confidence')}
          </BaseText>
          <BaseText variant={BaseTextVariant.small}>{progressBarValues.text}</BaseText>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFilledPart,
              { width: `${data?.Report?.confidence || 0}%`, backgroundColor: progressBarValues.color }
            ]}
          />
        </View>
      </>
    );
  }, [data?.Report?.confidence, progressBarValues, t, theme.dark]);

  const renderColumn = useCallback((title = '', value: string | number | undefined, color?: string, variant?: BaseTextVariantValue) => {
    return (
      <View style={styles.column}>
        <BaseText variant={BaseTextVariant.extraSmall} style={styles.columnTitle}>
          {title}
        </BaseText>
        <BaseText variant={variant || BaseTextVariant.small} style={[styles.columnValue, { color: color || theme.palette.text.base.primary }]}>
          {value}
        </BaseText>
      </View>
    );
  }, [theme.dark]);

  const { from, to, roiColor, roiPercentage } = useMemo(() => {
    const fromAsNumber =
      (data.Report?.action === 0
        ? data.Report?.buy_entry_target_1
        : data.Report?.sell_entry_target_1) || 0;

    const toAsNumber =
      (data.Report?.action === 0
        ? data.Report?.buy_target_1
        : data.Report?.sell_target_1) || 0;

    const to = toAsNumber.toFixed(data?.Product.lastTick?.digits);
    const from = fromAsNumber.toFixed(data?.Product.lastTick?.digits);
    const roi = Math.round(((toAsNumber - fromAsNumber) / fromAsNumber) * 100);
    const roiColor = theme.palette.text.status[roi > 0 ? 'positive' : 'negative'];
    const roiPercentage = `${Math.abs(roi)}%`;

    return { from, to, roiColor, roiPercentage };
  }, [data.Report, data?.Product.lastTick?.digits, theme.palette.text.status]);

  return (
    <View testID={testID} style={[styles.signalInfoContainer, style]}>
      <View style={styles.pricesRow}>
        {renderColumn(
          t('components.signals.roi'),
          roiPercentage,
          roiColor,
          BaseTextVariant.captionSemiBold
        )}
        {renderColumn(
          t('components.signals.from'),
          formatTwoDecimals(from)
        )}
        {renderColumn(
          t('components.signals.to'),
          formatTwoDecimals(to)
        )}
        {renderColumn(t('components.signals.expires-in'), expiresIn, theme.palette.text.status.negative)}
      </View>
      {renderProgressBar}
      {(hide ? potentialLoss && expectedProfit : true) && (
        <View style={styles.bottom}>
          <View style={styles.bottomSection}>
            <BaseText variant={BaseTextVariant.tiny} style={styles.pnl}>
              {t('components.signals.potential-loss')}, USD
            </BaseText>
            <BaseText style={{ color: theme.palette.red['600'] }} variant={BaseTextVariant.text}>
              {formatTwoDecimals(potentialLoss) ?? '...'}
            </BaseText>
          </View>
          <View style={[styles.bottomSection, { alignItems: 'flex-end' }]}>
            <BaseText variant={BaseTextVariant.tiny} style={styles.pnl}>
              {t('components.signals.expected-profit')}, USD
            </BaseText>
            <BaseText style={{ color: '#159D55' }} variant={BaseTextVariant.text}>
              {formatTwoDecimals(expectedProfit) ?? '...'}
            </BaseText>
          </View>
        </View>
      )}
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, text, border }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    signalInfoContainer: {
      backgroundColor: base.white,
      marginHorizontal: 20,
      borderRadius: 12,
      marginBottom: 16,
      ...shadow6Style
    },
    pricesRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingTop: 16,
    },
    column: {
      flex: 1,
      paddingHorizontal: 8,
      gap: 4
    },
    columnTitle: {
      fontSize: 12,
      color: text.base.tertiary,
      textAlign: 'center'
    },
    columnValue: {
      color: text.base.primary,
      textAlign: 'center'
    },
    progressBarHeader: {
      marginTop: 24,
      marginBottom: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20
    },
    progressBar: {
      alignSelf: 'center',
      width: screenWidth - 80,
      height: 5,
      backgroundColor: '#ECF0F1',
      borderRadius: 30,
      marginBottom: 16,
      marginHorizontal: 20
    },
    progressFilledPart: {
      borderRadius: 30,
      flex: 1,
      width: '0%',
      backgroundColor: border.base['progress-bar']
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: '#ecf0f1'
    },
    pnl: {
      color: '#8fa6ae'
    },
    bottomSection: {
      flex: 1
    },
    graphite: {
      color: text.base.tertiary
    }
  });
};

export default memo(SignalInfoPrices);

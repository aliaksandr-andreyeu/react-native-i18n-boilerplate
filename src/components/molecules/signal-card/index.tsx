import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
  TouchableHighlight,
  InteractionManager
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config, testIDs } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseText, BaseTextVariant } from '@/components';
import { Signals } from '@/store/slices/market/types';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'react-i18next';
import { BaseTextVariantValue } from '@/components/atoms/text';
import { getAssetName, signalViewMixpanel, formatTwoDecimals } from '@/helpers';
import { useAppDispatch, useAppSelector, useTradingSchedule, useCommonStyles } from '@/hooks';
import { useGetSymbolConfigMutation } from '@/store/api';
import { actions } from '@/store';

const { width } = Dimensions.get('window');

dayjs.extend(duration);

const {
  buttons: { activeOpacity }
} = config;

const {
  application: { setMarketOpenSchedule }
} = actions;

interface IBaseInviteCard {
  image: string | undefined;
  price?: string;
  symbolName: string;
  data: Signals;
  digits: number;
  isRowView?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  onActionButtonPressed?: () => void;
  rowWidth?: number;
  maxWidth?: number;
  testID?: string;
}

const BaseSignalCard: React.FC<IBaseInviteCard> = ({
  image,
  symbolName,
  data,
  digits = 0,
  onPress,
  isRowView,
  style,
  onActionButtonPressed,
  rowWidth = (width - 48) / 2,
  maxWidth,
  testID
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const [getSymbolConfig, symbolConfigData] = useGetSymbolConfigMutation();
  const selectedAccount = useAppSelector((state) => state.portfolio.selectedAccount);
  const symbolsTradingSessionSchedule = useAppSelector((state) => state.application.symbolsTradingSessionSchedule);
  const isVerified = useAppSelector((store) => store.portfolio.userInfo.isVerified) || false;

  const dispatch = useAppDispatch();

  const scheduleData = useTradingSchedule({
    schedule: symbolConfigData.data?.tradingSessionShedule || symbolsTradingSessionSchedule[symbolName] || []
  });

  useEffect(() => {
    if (!!scheduleData?.timeToOpen && symbolName && symbolConfigData.data?.tradingSessionShedule)
      dispatch(
        setMarketOpenSchedule({
          symbolName,
          schedule: symbolConfigData.data?.tradingSessionShedule
        })
      );
    if (
      !scheduleData?.timeToOpen &&
      symbolsTradingSessionSchedule[symbolName] &&
      symbolConfigData.data?.tradingSessionShedule
    ) {
      dispatch(
        setMarketOpenSchedule({
          symbolName,
          schedule: undefined
        })
      );
    }
  }, [!!scheduleData?.timeToOpen, symbolConfigData.data?.tradingSessionShedule]);

  useEffect(() => {
    if (data.Report?.status === 9) return;
    let manager: { cancel: () => void } | undefined = undefined;
    let timeout: NodeJS.Timeout;
    manager = InteractionManager.runAfterInteractions(() => {
      timeout = setTimeout(() => {
        getSymbolConfig({
          accountId: selectedAccount,
          symbol: symbolName
        });
      }, 1000);
    });

    return () => {
      clearTimeout(timeout);
      manager?.cancel?.();
    };
  }, [symbolName, selectedAccount, data.Report?.status]);

  const calculateTimeRemaining = useCallback(() => {
    const now = dayjs();
    const expiry = dayjs(data.Report?.expiry);
    const durationObj = dayjs.duration(expiry.diff(now));

    const hours = durationObj.hours();
    const minutes = durationObj.minutes();

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, [data.Report?.expiry]);

  const [expiresIn, setExpiresIn] = useState(calculateTimeRemaining());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setExpiresIn(calculateTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [calculateTimeRemaining]);

  const renderColumn = useCallback(
    (title = '', value: string | number | undefined, color?: any) => {
      return (
        <View style={styles.column} testID={testIDs.components.molecules.signalCard.column}>
          <BaseText
            variant={BaseTextVariant.extraSmall}
            style={styles.columnTitle}
            testID={testIDs.components.molecules.signalCard.columnTitle}
          >
            {title}
          </BaseText>
          <BaseText
            variant={BaseTextVariant.small}
            style={[styles.columnValue, { color: color || theme.palette.text.base.primary }]}
            testID={testIDs.components.molecules.signalCard.columnValue}
          >
            {value}
          </BaseText>
        </View>
      );
    },
    [theme.dark]
  );

  const progressBarValues = useMemo(() => {
    let values = {
      color: theme.palette.red['600'],
      text: t('components.signals.low')
    };

    if (data.Report?.confidence >= 40 && data.Report?.confidence < 80) {
      values = {
        color: '#F7BF16',
        text: t('components.signals.medium')
      };
    }
    if (data.Report?.confidence >= 80) {
      values = {
        color: theme.palette.green['400'],
        text: t('components.signals.high')
      };
    }

    return values;
  }, [data.Report?.confidence, theme.palette, t]);

  const actionButtonText = useMemo(() => {
    if (!!scheduleData?.timeToOpen) {
      return t('components.signals.market-is-closed');
    }
    return data.Report?.action === 0 ? t('components.signals.buy') : t('components.signals.sell');
  }, [data.Report, digits, scheduleData?.timeToOpen, t]);

  const renderProgressBar = useMemo(() => {
    return (
      <View testID={testIDs.components.molecules.signalCard.progressBarWrapper}>
        <View
          style={[styles.progressBarHeader, isRowView ? styles.rowProgressBarHeader : undefined]}
          testID={testIDs.components.molecules.signalCard.progressBarHeader}
        >
          <BaseText
            style={styles.grayText}
            variant={BaseTextVariant.extraSmall}
            testID={testIDs.components.molecules.signalCard.confidenceLabel}
          >
            {t('components.signals.confidence')}
          </BaseText>
          <Text style={styles.value} testID={testIDs.components.molecules.signalCard.confidenceValue}>
            {progressBarValues.text}
          </Text>
        </View>
        <View style={styles.progressBar} testID={testIDs.components.molecules.signalCard.progressBar}>
          <View
            style={[
              styles.progressFilledPart,
              { width: `${data.Report?.confidence || 0}%`, backgroundColor: progressBarValues.color }
            ]}
            testID={testIDs.components.molecules.signalCard.progressFilled}
          />
        </View>
      </View>
    );
  }, [data.Report?.confidence, progressBarValues, t, isRowView]);

  const renderActionButton = useMemo(() => {
    const isDisabled = !!scheduleData?.timeToOpen;
    let backgroundColor = theme.palette.green['400'];
    let highlightColor = theme.palette.green[500];

    if (data.Report?.action !== 0) {
      backgroundColor = theme.palette.red['600'];
      highlightColor = theme.palette.red[700];
    }

    if (isDisabled) {
      backgroundColor = theme.palette.graphite[100];
    }

    return (
      <TouchableHighlight
        style={[
          styles.button,
          {
            backgroundColor,
            height: isRowView ? 24 : 28
          }
        ]}
        disabled={isDisabled}
        underlayColor={highlightColor}
        onPress={() => {
          onActionButtonPressed?.();
        }}
        testID={testIDs.components.molecules.signalCard.actionButton}
      >
        <BaseText
          variant={BaseTextVariant.small}
          style={[
            styles.buttonText,
            { color: data.Report?.action === 0 ? theme.palette.graphite['900'] : theme.palette.base.white }
          ]}
          testID={testIDs.components.molecules.signalCard.actionButtonLabel}
        >
          {actionButtonText}
        </BaseText>
      </TouchableHighlight>
    );
  }, [actionButtonText, data.Report?.action, isRowView, onActionButtonPressed, scheduleData?.timeToOpen, theme.dark]);

  const renderRow = useCallback(
    (
      title: string,
      value: string | number | undefined,
      color?: string,
      variant?: BaseTextVariantValue,
      testId?: string
    ) => {
      return (
        <View style={styles.amountWrapper} testID={testId || testIDs.components.molecules.signalCard.rowWrapper}>
          <BaseText
            style={[styles.flex, styles.grayText]}
            variant={BaseTextVariant.extraSmall}
            testID={testIDs.components.molecules.signalCard.rowTitle}
          >
            {title}
          </BaseText>
          <BaseText
            variant={variant || BaseTextVariant.small}
            style={{ color: color ?? theme.palette.graphite['900'] }}
            testID={testIDs.components.molecules.signalCard.rowValue}
          >
            {value}
          </BaseText>
        </View>
      );
    },
    [theme.dark]
  );

  const renderLive = useMemo(() => {
    if (data.Report?.status === 9) {
      return (
        <View
          style={[styles.signalWrap, isRowView ? styles.signalWrapRow : undefined]}
          testID={testIDs.components.molecules.signalCard.liveWrapper}
        >
          <SvgIcon
            name={SvgXmlIconNames.signal}
            size={IconSize.sm}
            testID={testIDs.components.molecules.signalCard.liveIcon}
          />
          <BaseText
            variant={BaseTextVariant.extraSmall}
            testID={testIDs.components.molecules.signalCard.liveLabel}
          >
            {t('components.signals.live')}
          </BaseText>
        </View>
      );
    }
    return null;
  }, [data.Report?.status, isRowView, t, theme.dark]);

  const renderLogo = useMemo(() => {
    if (image)
      return (
        <Image
          resizeMode='cover'
          source={{ uri: image }}
          style={styles.img}
          testID={testIDs.components.molecules.signalCard.logo}
        />
      );
    return null;
  }, [image, theme.dark]);

  const onCardPress = useCallback(() => {
    const status = data.Report?.status === 9 ? 'live' : 'pending';
    let confidence = 'Low' as 'Low' | 'Medium' | 'High';

    if (data.Report?.confidence >= 40 && data.Report?.confidence < 80) confidence = 'Medium';
    else if (data.Report?.confidence >= 80) confidence = 'High';

    signalViewMixpanel({
      asset: symbolName,
      signalConfidence: confidence,
      signalType: status
    });
    onPress && onPress();
  }, [symbolName, data.Report]);

  const { from, to, roiColor, roiPercentage } = useMemo(() => {
    const fromAsNumber =
      (data.Report?.action === 0 ? data.Report?.buy_entry_target_1 : data.Report?.sell_entry_target_1) || 0;

    const toAsNumber = (data.Report?.action === 0 ? data.Report?.buy_target_1 : data.Report?.sell_target_1) || 0;

    const to = toAsNumber.toFixed(digits);
    const from = fromAsNumber.toFixed(digits);
    const roi = Math.round(((toAsNumber - fromAsNumber) / fromAsNumber) * 100);
    const roiColor = theme.palette.text.status[roi > 0 ? 'positive' : 'negative'];
    const roiPercentage = `${Math.abs(roi)}%`;

    return { from, to, roiColor, roiPercentage };
  }, [data.Report, digits, theme.palette.text.status]);

  const PriceShow = useCallback(
    ({ title, value }: { title: string; value: any }) => {
      return (
        <BaseText
          style={styles.grayText}
          variant={BaseTextVariant.extraSmall}
          testID={testIDs.components.molecules.signalCard.priceShow}
        >
          {title}{' '}
          <BaseText
            variant={BaseTextVariant.small}
            style={styles.flex}
            testID={testIDs.components.molecules.signalCard.priceShowValue}
          >
            {value}
          </BaseText>
        </BaseText>
      );
    },
    [theme.dark]
  );

  const expires = useMemo(() => {
    return renderRow(
      t('components.signals.expires-in'),
      expiresIn,
      theme.palette.text.status.negative,
      undefined,
      testIDs.components.molecules.signalCard.expires
    );
  }, [expiresIn, theme.palette.text.status.negative, t, renderRow]);

  if (isRowView) {
    return (
      <TouchableOpacity
        testID={testID}
        style={[styles.container, { minWidth: rowWidth, flex: 1, maxWidth, height: 236 }, style]}
        activeOpacity={activeOpacity}
        onPress={onCardPress}
      >
        {renderLive}
        <View style={[styles.top, { marginBottom: 6 }]} testID={testIDs.components.molecules.signalCard.top}>
          <View style={styles.topLeft} testID={testIDs.components.molecules.signalCard.topLeft}>
            {renderLogo}
            <BaseText
              variant={BaseTextVariant.captionSemiBold}
              style={styles.symbol}
              testID={testIDs.components.molecules.signalCard.symbol}
            >
              {symbolName}
            </BaseText>
          </View>
        </View>
        <View style={styles.rows} testID={testIDs.components.molecules.signalCard.rowsWrapper}>
          {renderRow(
            t('components.signals.roi'),
            roiPercentage,
            roiColor,
            BaseTextVariant.captionSemiBold,
            testIDs.components.molecules.signalCard.roi
          )}
          {isVerified ? (
            <>
              {expires}
              {renderRow(
                t('components.signals.from'),
                formatTwoDecimals(from),
                undefined,
                undefined,
                testIDs.components.molecules.signalCard.from
              )}
              {renderRow(
                t('components.signals.to'),
                formatTwoDecimals(to),
                undefined,
                undefined,
                testIDs.components.molecules.signalCard.to
              )}
            </>
          ) : (
            <>
              <View
                style={styles.priceContainer}
                testID={testIDs.components.molecules.signalCard.priceContainer}
              >
                <PriceShow title={t('components.signals.from')} value={formatTwoDecimals(from)} />
                <PriceShow title={t('components.signals.to')} value={formatTwoDecimals(to)} />
              </View>
              {expires}
            </>
          )}
          {renderProgressBar}
        </View>
        {renderActionButton}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity testID={testID} style={[styles.container, style]} activeOpacity={activeOpacity} onPress={onCardPress}>
      <View style={styles.top} testID={testIDs.components.molecules.signalCard.top}>
        <View style={[styles.topLeft, !isRowView ? { width: 'auto' } : undefined]} testID={testIDs.components.molecules.signalCard.topLeft}>
          {renderLogo}
          <BaseText
            variant={BaseTextVariant.captionSemiBold}
            style={styles.symbol}
            testID={testIDs.components.molecules.signalCard.symbol}
          >
            {getAssetName(symbolName)}
          </BaseText>
          {renderLive}
        </View>
        <BaseText
          style={styles.grayText}
          variant={BaseTextVariant.extraSmall}
          testID={testIDs.components.molecules.signalCard.roiLabel}
        >
          {t('components.signals.roi')}
          {': '}
          <BaseText
            style={{ color: roiColor }}
            variant={BaseTextVariant.captionSemiBold}
            testID={testIDs.components.molecules.signalCard.roiValue}
          >
            {roiPercentage}
          </BaseText>
        </BaseText>
      </View>
      <View style={styles.row}>
        {renderColumn(t('components.signals.from'), formatTwoDecimals(from))}
        {renderColumn(t('components.signals.to'), formatTwoDecimals(to))}
        {renderColumn(t('components.signals.expires-in'), expiresIn, theme.palette.text.status.negative)}
      </View>
      {renderProgressBar}
      {renderActionButton}
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { text, border } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    flex: {
      flex: 1
    },
    container: {
      backgroundColor: palette.base.white,
      borderRadius: 12,
      paddingVertical: 12,
      marginBottom: 12,
      justifyContent: 'space-between',
      ...shadow6Style
    },
    symbol: {
      marginRight: 8,
      marginLeft: 4,
      fontSize: 15
    },
    signalWrap: {
      backgroundColor: '#D5C2FF',
      borderRadius: 4,
      flexDirection: 'row',
      marginHorizontal: 4,
      paddingHorizontal: 6,
      paddingVertical: 4,
      zIndex: 99,
      alignSelf: 'flex-end',
      paddingRight: 10
    },
    signalWrapRow: {
      borderRadius: 0,
      marginHorizontal: 0,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 8,
      position: 'absolute'
    },
    top: {
      paddingHorizontal: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 8,
      gap: 8,
      borderBottomWidth: 1,
      borderColor: border.base.divider
    },
    topLeft: {
      flexDirection: 'row',
      alignItems: 'center'
      // width: '100%'
    },
    img: {
      width: 24,
      height: 24,
      borderRadius: 14
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      marginHorizontal: 12,
      marginTop: 16,
      backgroundColor: palette.green['400']
    },
    buttonText: {
      textAlign: 'center',
      lineHeight: 16,
      color: palette.base.white
    },
    column: {
      flex: 1,
      paddingHorizontal: 8
    },
    columnTitle: {
      color: text.base.tertiary,
      textAlign: 'center'
    },
    columnValue: {
      textAlign: 'center'
    },
    progressBarHeader: {
      marginBottom: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20
    },
    rowProgressBarHeader: {
      marginHorizontal: 12,
      marginBottom: 4,
      marginTop: 4,
      alignItems: 'center'
    },
    progressBar: {
      height: 5,
      backgroundColor: '#ECF0F1',
      marginHorizontal: 12,
      borderRadius: 30
    },
    progressFilledPart: {
      borderRadius: 30,
      flex: 1,
      width: '0%',
      backgroundColor: palette.graphite['900']
    },
    value: {
      color: palette.graphite['900'],
      fontWeight: '500'
    },
    amountWrapper: {
      paddingHorizontal: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      alignItems: 'center'
    },
    grayText: {
      color: text.base.tertiary
    },
    priceContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      paddingHorizontal: 12,
      justifyContent: 'space-between'
    },
    rows: {
      justifyContent: 'space-between',
      flex: 1,
      paddingTop: 6
    }
  });
};

export default BaseSignalCard;

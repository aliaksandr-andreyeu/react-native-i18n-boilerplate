import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import CountDown, { CountDownProps, DigitType } from 'react-native-countdown-component';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { BaseTextVariantValue } from '@/components/atoms/text';
import { useTranslation } from 'react-i18next';
import dateHelper from '@/helpers/dateHelper';
import { detectDateFormat } from '@/helpers';

interface ISimpleCountDown extends CountDownProps {
  hideWhenZero?: boolean;
  onLessThanADay?(value: boolean): void;
  textStyle?: BaseTextVariantValue;
  digitWidth?: number;
  lastDate: string | undefined;
}

const { isIOS } = config;

const timeToShowLessThanDay: DigitType[] = ['H', 'M', 'S'];
const timeToShowMoreThanDay: DigitType[] = [];
const timeLabels = {};
const SimpleCountDown: React.FC<ISimpleCountDown> = ({
  until,
  hideWhenZero = false,
  onLessThanADay,
  textStyle = BaseTextVariant.extraSmall,
  digitWidth = 15,
  lastDate,
  ...props
}) => {
  const [hide, setHide] = useState<boolean>(false);
  const [lessThanAday, setLessThanADay] = useState<boolean>(false);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [stop, setStop] = useState<number | undefined>(undefined);

  const { t } = useTranslation();

  const handleTimerShow = useCallback(
    (seconds: number) => {
      const dateFormat = detectDateFormat(lastDate);
      if (lastDate?.length && dateHelper.hasTimePassed(lastDate, dateFormat)) {
        setStop(0);
        setLessThanADay(true);
        onLessThanADay && onLessThanADay(true);
      } else if (seconds < 86400) {
        setLessThanADay(true);
        onLessThanADay && onLessThanADay(true);
      } else setCurrentDay(Math.round(seconds / 86400));
    },
    [lastDate]
  );

  const theme = useTheme();
  const styles = useStyles(theme);

  const onFinish = useCallback(() => {
    if (!hideWhenZero) return;

    setTimeout(() => setHide(true), 500);
  }, [hideWhenZero]);

  if (hide) return null;

  const handleDay = useMemo(() => {
    if (!currentDay) return '';
    else if (currentDay > 1) return `${currentDay} ${t('components.simple-countdown.days')}`;
    return `${currentDay} ${t('components.simple-countdown.day')}`;
  }, [currentDay, t]);

  const isLargeText = useMemo(() => textStyle?.fontSize === 14, [textStyle?.fontSize]);

  const separatorStyle = useMemo(
    () => ({
      ...styles.separator,
      ...(textStyle && textStyle),
      ...(isLargeText && styles.weight600),
      ...(lessThanAday ? styles.redText : styles.grayText),
      ...(isLargeText && styles.right5)
    }),
    [theme.dark, textStyle, isLargeText, lessThanAday]
  );

  const digitStyle = useMemo(
    () => ({
      ...styles.digitStyle,
      width: digitWidth
    }),
    [theme.dark, digitWidth]
  );

  const digitTxtStyle = useMemo(
    () => ({
      ...styles.digitText,
      ...(textStyle && textStyle),
      ...(isLargeText && styles.weight600),
      ...(lessThanAday ? styles.redText : styles.grayText)
    }),
    [theme.dark, textStyle, isLargeText, lessThanAday]
  );

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <CountDown
        onFinish={onFinish}
        onChange={handleTimerShow}
        until={stop ?? (until || 0)}
        separatorStyle={separatorStyle}
        timeToShow={lessThanAday ? timeToShowLessThanDay : timeToShowMoreThanDay}
        timeLabels={timeLabels}
        digitStyle={digitStyle}
        showSeparator
        digitTxtStyle={digitTxtStyle}
        {...props}
      />
      {!lessThanAday && (
        <BaseText
          style={isLargeText ? styles.blackText : styles.grayText}
          variant={textStyle || BaseTextVariant.extraSmall}
        >
          {handleDay}
        </BaseText>
      )}
    </Animated.View>
  );
};

const useStyles = ({ palette: { graphite, red } }: UserTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    separator: {
      ...BaseTextVariant.extraSmall,
      color: graphite['900'],
      height: 15,
      bottom: isIOS ? 1 : 0.8,
      right: isIOS ? 0.2 : 0,
      fontWeight: '500',
      marginHorizontal: 0,
      marginRight: 0,
      marginLeft: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingHorizontal: 0
    },
    right5: {
      right: isIOS ? 0.5 : 0.3
    },
    digitStyle: {
      height: 15,
      marginHorizontal: 0,
      marginLeft: 0,
      marginRight: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingHorizontal: 0
    },
    digitText: {
      ...BaseTextVariant.extraSmall,
      color: graphite['900'],
      fontVariant: ['tabular-nums'],
      fontWeight: '500'
    },
    grayText: {
      color: graphite['600']
    },
    redText: {
      color: red['600']
    },
    blackText: {
      color: graphite['900']
    },
    weight600: {
      fontWeight: '600'
    }
  });

export default memo(SimpleCountDown);

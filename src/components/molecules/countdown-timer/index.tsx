import { BaseText, BaseTextVariant } from '@/components/atoms';
import { UserTheme } from '@/constants';
import React, { useState, memo, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  StretchOutY,
  StretchInY,
  SharedValue
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface ICountdownTimerProps {
  time: dayjs.Dayjs;
  onTimeChange?(time: number): void;
  onFinished?(): void;
  hideOnFinished?: boolean;
}

const CountdownTimer: React.FC<ICountdownTimerProps> = ({ time, onTimeChange, onFinished, hideOnFinished = false }) => {
  const { t } = useTranslation();

  const [timeLeft, setTimeLeft] = useState(getRemainingTime(time));
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const firstReachedZero = useRef<boolean>(false);

  const days = useSharedValue(timeLeft.days);
  const hours = useSharedValue(timeLeft.hours);
  const minutes = useSharedValue(timeLeft.minutes);
  const seconds = useSharedValue(timeLeft.seconds);

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    firstReachedZero.current = false;
    setIsFinished(false);
    const runEachSecond = (callback: (time: { diffAsSeconds: number }) => any) => {
      const newTime = getRemainingTime(time);

      callback(newTime);
      setTimeLeft(newTime);
      onTimeChange && onTimeChange(newTime.diffAsSeconds);

      days.value = newTime.days;
      hours.value = newTime.hours;
      minutes.value = newTime.minutes;
      seconds.value = newTime.seconds;
    };

    const interval = setInterval(() => {
      runEachSecond((t) => {
        if (t.diffAsSeconds === 0) {
          if (firstReachedZero.current) {
            setTimeout(() => {
              onFinished && onFinished();
              hideOnFinished && setIsFinished(true);
            }, 500);
            return clearInterval(interval);
          } else firstReachedZero.current = true;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  if (isFinished) return null;

  const Colon = useMemo(
    () => (
      <BaseText variant={BaseTextVariant.authTitle} style={styles.colon}>
        :
      </BaseText>
    ),
    []
  );

  return (
    <View style={styles.countdownContainer}>
      {!!timeLeft.days && (
        <>
          <TimeBlock value={days} label={t('components.molecules.countdown-timer.days')} />
          {Colon}
        </>
      )}
      <TimeBlock value={hours} label={t('components.molecules.countdown-timer.hours')} />
      {Colon}
      <TimeBlock value={minutes} label={t('components.molecules.countdown-timer.minutes')} />
      {!timeLeft.days && (
        <>
          {Colon}
          <TimeBlock value={seconds} label={t('components.molecules.countdown-timer.seconds')} />
        </>
      )}
    </View>
  );
};

const TimeBlock = ({ value, label }: { value: SharedValue<number>; label: string }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const formattedValue = useDerivedValue(() => {
    const formatted = `${Math.max(0, Math.floor(value.value))}`.padStart(2, '0');
    return formatted;
  }, []);

  return (
    <View style={styles.timeBlock} testID={`timeblock-${label}`}>
      <View style={styles.digitContainerBlock}>
        {[0, 1].map((index) => (
          <View key={`${index}-digit-container`} style={styles.digitContainer}>
            <View style={styles.whiteLine} />
            <Animated.View
              key={`${formattedValue.value[index]}-${index}-digit`}
              entering={StretchInY}
              exiting={StretchOutY}
              style={styles.digit}
              testID={`countdown-digit-${label}-${index}`}
            >
              <BaseText variant={BaseTextVariant.authTitle}>{formattedValue.value[index]}</BaseText>
            </Animated.View>
          </View>
        ))}
      </View>
      <BaseText style={styles.label} variant={BaseTextVariant.caption}>
        {label}
      </BaseText>
    </View>
  );
};

function getRemainingTime(targetTime: dayjs.Dayjs) {
  const now = dayjs();
  const diff = Math.max(targetTime.diff(now, 'second'), 0);

  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    diffAsSeconds: diff
  };
}

const useStyles = ({ palette: { base } }: UserTheme) =>
  StyleSheet.create({
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10
    },
    countdownContainer: {
      flexDirection: 'row',
      justifyContent: 'center'
    },
    timeBlock: {
      alignItems: 'center',
      gap: 12,
      flex: 1
    },
    digitContainer: {
      width: 38,
      height: 51,
      backgroundColor: '#EEDDFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8
    },
    digit: {
      zIndex: 2
    },
    colon: {
      top: 3
    },
    label: {
      flex: 1,
      maxWidth: 80
    },
    whiteLine: {
      width: '100%',
      height: 1.78,
      backgroundColor: base.white,
      position: 'absolute',
      zIndex: 1,
      alignSelf: 'center'
    },
    digitContainerBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    }
  });

export default memo(CountdownTimer);

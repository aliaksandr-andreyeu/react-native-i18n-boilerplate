import React, { memo, } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import Animated, { CurvedTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { CountdownTimer } from '..';
import dayjs from 'dayjs';

interface IPromoTimer {
  title: string;
  until: dayjs.Dayjs,
  onFinish(): void;
}

const PromoTimer: React.FC<IPromoTimer> = ({ title, until, onFinish }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} layout={CurvedTransition} style={styles.container}>
      <Animated.View layout={CurvedTransition}>
        <BaseText variant={BaseTextVariant.captionSemiBold}>{title}</BaseText>
      </Animated.View>
      <CountdownTimer
        time={until ?? 0}
        onFinished={onFinish}
      />
    </Animated.View>
  );
};

const useStyles = ({ }: UserTheme) =>
  StyleSheet.create({
    container: {
      gap: 16,
      alignItems: 'center'
    },
  });

export default memo(PromoTimer);

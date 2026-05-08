import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import Animated, { FadeIn } from 'react-native-reanimated';
import CountDown from 'react-native-countdown-component';
import { BaseTextVariant } from '@/components/atoms';

interface IBasePerformerCountdown {
    until: number;
    onFinish?(): void;
    onLessThanAnHour(v: boolean): void;
    id: string;
}

const { isIOS } = config;

const BasePerformerCountdown: React.FC<IBasePerformerCountdown> = ({ until, onFinish, onLessThanAnHour, id }) => {
    const [lessThanAMinute, setLessThanAMinute] = useState<boolean>(false);
    const finishActionCalled = useRef<boolean>(false);

    const handleTimerShow = useCallback(
        (seconds: number) => {
            if (seconds <= 0) {
                if (!finishActionCalled.current) {
                    onFinish?.();
                    finishActionCalled.current = true;
                }
                return;
            }

            if (seconds < 60) {
                setLessThanAMinute(true);
                onLessThanAnHour?.(true);
            } else {
                onLessThanAnHour?.(false);
                setLessThanAMinute(false);
            }
        },
        [onFinish]
    );

    const theme = useTheme();
    const styles = useStyles(theme);

    const separatorStyle = useMemo(
        () => ({
            ...styles.separator,
            ...(lessThanAMinute ? styles.redText : styles.grayText)
        }),
        [theme.dark, lessThanAMinute]
    );

    const digitTxtStyle = useMemo(
        () => ({
            ...styles.digitText,
            ...(lessThanAMinute ? styles.redText : styles.grayText)
        }),
        [theme.dark, lessThanAMinute]
    );

    const onCFinish = useCallback(() => {
        if (!finishActionCalled.current) {
            onFinish?.();
            finishActionCalled.current = true;
        }
    }, [onFinish]);

    useEffect(() => {
        if (!finishActionCalled.current && until <= 0) {
            onFinish?.();
            finishActionCalled.current = true;
        }
    }, [until, id, onFinish]);

    return (
        <Animated.View entering={FadeIn} style={styles.container}>
            <CountDown
                key={id + until}
                onFinish={onCFinish}
                onChange={handleTimerShow}
                until={until || 1}
                separatorStyle={separatorStyle}
                timeToShow={['M', 'S']}
                timeLabels={{}}
                digitStyle={styles.digitStyle}
                showSeparator
                digitTxtStyle={digitTxtStyle}
            />
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
            ...BaseTextVariant.countdown,
            color: graphite['900'],
            height: 20,
            bottom: isIOS ? 0.2 : 0,
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
            width: 20,
            height: 18,
            marginHorizontal: 0,
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingHorizontal: 0
        },
        digitText: {
            ...BaseTextVariant.countdown,
            color: graphite['900'],
            fontVariant: ['tabular-nums'],
            fontWeight: '500'
        },
        grayText: {
            color: '#8890A1'
        },
        redText: {
            color: '#F6465D'
        }
    });

export default memo(BasePerformerCountdown);

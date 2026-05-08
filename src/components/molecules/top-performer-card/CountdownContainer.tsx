import React, { memo, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { BasePerformerCountdown } from '..';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useTranslation } from 'react-i18next';
import dateHelper from '@/helpers/dateHelper';
import dayjs from 'dayjs';

interface ICountdownContainer {
    expiresIn: Date,
    onFinish(): void;
};

const CountdownContainer: React.FC<ICountdownContainer> = ({
    expiresIn,
    onFinish
}) => {
    const [isLessThanAnHour, setIsLessThanAnHour] = useState<boolean>(false);


    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    const until = useMemo(() => {
        const diffSec = Math.max(0, dateHelper.diff(dayjs(), expiresIn));

        return diffSec;
    }, [expiresIn]);

    return (
        <View style={styles.bottomMiddleContainer}>
            <SvgIcon
                style={styles.clockIcon}
                name={SvgXmlIconNames.roundClock}
                size={IconSize.xs}
                color={isLessThanAnHour ? '#F6465D' : '#8890A1'}
            />
            <View style={styles.bottomRightContainer}>
                <BaseText
                    style={[styles.grayColor, styles.textAlignRight, { bottom: -2 }]}
                    variant={BaseTextVariant.amountExtraTiny}
                >
                    {t('components.top-performer-card.expires-in')}
                </BaseText>
                <BasePerformerCountdown
                    id={expiresIn + '_countdown'}
                    onLessThanAnHour={setIsLessThanAnHour}
                    onFinish={onFinish}
                    until={until}
                />
            </View>
        </View>
    )
};

const useStyles = ({
    palette: { text }
}: UserTheme) => StyleSheet.create({
    bottomMiddleContainer: {
        flexDirection: 'row',
        gap: 3,
        alignItems: 'flex-end'
    },
    bottomRightContainer: {
        gap: 0,
        marginRight: 2
    },
    clockIcon: {
        bottom: 2
    },
    textAlignRight: {
        textAlign: 'right'
    },
    grayColor: { color: text.base.hint },
});

export default memo(CountdownContainer);
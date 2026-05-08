import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components';
import { formatTwoDecimals } from '@/helpers';

interface IMyRewardDetail {
    assetName: string;
    date: string;
    price: string;
    lot: string;
};

const MyRewardDetail: React.FC<IMyRewardDetail> = ({
    assetName,
    date,
    lot,
    price,
}) => {

    const theme = useTheme();
    const styles = useStyles(theme);

    const goToDetailReward = useCallback(() => {
        return false
    }, []);

    return (
        <Pressable
            style={styles.container}
            onPress={goToDetailReward}
        >
            <View style={styles.left} >
                <View style={styles.column} >
                    <BaseText variant={BaseTextVariant.titleXXS} style={styles.textAlignLeft} >{assetName}</BaseText>
                    <BaseText variant={BaseTextVariant.extraSmall} style={[styles.textAlignLeft, styles.grayText]} >{date}</BaseText>
                </View>
            </View>
            <View style={styles.column} >
                <BaseText style={[styles.textAlignRight, styles.greenText]} >+${formatTwoDecimals(price)}</BaseText>
                <BaseText variant={BaseTextVariant.extraSmall} style={[styles.textAlignRight, styles.grayText]} >{lot}{' lot'}</BaseText>
            </View>
        </Pressable>
    )
};

const useStyles = ({
    palette: { text }
}: UserTheme) => {
    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        textAlignLeft: {
            textAlign: 'left'
        },
        textAlignRight: {
            textAlign: 'right'
        },
        textAlignCenter: {
            textAlign: 'center'
        },
        left: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 40
        },
        underLine: {
            textDecorationLine: 'underline'
        },
        grayText: {
            color: text.base.tertiary
        },
        greenText: {
            color: text.status.positive
        },
        column: {
            gap: 4
        },
        columnTwo: {
            gap: 5
        },
    });
}

export default MyRewardDetail;
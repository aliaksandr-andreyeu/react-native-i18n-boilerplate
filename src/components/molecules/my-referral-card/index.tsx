import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';

const {
    buttons: { activeOpacity }
} = config

interface IMyReferralCard {
    lot: number;
    id: number;
    date: string;
    onPress: () => void;
};

const MyReferralCard: React.FC<IMyReferralCard> = ({
    date,
    id,
    lot,
    onPress
}) => {

    const theme = useTheme();
    const styles = useStyles(theme);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity} style={styles.container}>
            <View style={styles.left} >
                <BaseText variant={BaseTextVariant.titleXXS} >#{id}</BaseText>
                <BaseText style={styles.grayText} variant={BaseTextVariant.extraSmall} >{date}</BaseText>
            </View>
            <BaseText style={styles.grayText} variant={BaseTextVariant.extraSmall} >{lot} lot</BaseText>
        </TouchableOpacity>
    )
};

const useStyles = ({
    palette: { text }
}: UserTheme) => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row'
    },
    left: {
        gap: 4
    },
    textAlignRight: {
        textAlign: 'right'
    },
    grayText: {
        color: text.title.hint
    }
});

export default MyReferralCard;
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseImage, BaseText, BaseTextVariant } from '@/components/atoms';
import Animated, { FadeIn } from 'react-native-reanimated';

interface IBaseInvestmentCard {
    image: string | undefined;
    title: string;
    index?: number;
    onPress(key: number): void;
    id: number
};

const {
    buttons: { activeOpacity }
} = config

const BaseInvestmentCard: React.FC<IBaseInvestmentCard> = ({
    image,
    title,
    index = 0,
    onPress,
    id
}) => {

    const theme = useTheme();
    const styles = useStyles(theme);

    return (
        <Animated.View entering={FadeIn.delay(index * 12)} >
            <TouchableOpacity
                activeOpacity={activeOpacity}
                style={styles.container}
                onPress={onPress.bind(null, id)}
            >
                <BaseImage style={styles.image} source={{ uri: image }} />
                <View style={styles.textContainer} >
                    <BaseText variant={BaseTextVariant.caption} >{title}</BaseText>
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
};

const useStyles = ({
    palette: { }
}: UserTheme) => StyleSheet.create({
    container: {
        width: 154
    },
    textContainer: {
        padding: 4
    },
    image: {
        width: '100%',
        height: 117,
        borderRadius: 12
    },
});

export default BaseInvestmentCard;
import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseButton, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components';
import { images } from '@/assets';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { PORTFOLIO_ROUTE_NAMES } from '@/navigation/app/stacks';
import { useCommonStyles } from '@/hooks';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface IMarketClosed {
    info: string;
};

const MarketClosed: React.FC<IMarketClosed> = ({
    info = ''
}) => {
    const navigation = useNavigation<any>();

    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    const goToPortfolio = useCallback(() => {
        navigation.navigate(APP_ROUTE_NAMES.Portfolio, {
            screen: PORTFOLIO_ROUTE_NAMES.Portfolio
        });
    }, []);

    return (
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.container}>
            <View style={styles.content} >
                <BaseImage source={images.timer} style={styles.image} resizeMode='contain' />
                <BaseText style={[styles.marketClosed, styles.textCenter]} variant={BaseTextVariant.captionSemiBold} >{t('screens.pulse.market-closed.market-closed')}</BaseText>
                <BaseText style={[styles.grayText, styles.textCenter]}  >{info}</BaseText>
            </View>
            <BaseButton
                type={BaseButtonType.primary}
                labelStyle={styles.label}
                style={styles.btnStyle}
                label={t('screens.pulse.market-closed.view-portfolio')}
                onPress={goToPortfolio}
            />
        </Animated.View>
    )
};

const useStyles = (theme: UserTheme) => {

    const {
        palette: { }
    } = theme

    const { shadow6Style } = useCommonStyles(theme)

    return StyleSheet.create({
        container: {
            marginHorizontal: 16,
            borderRadius: 12,
            borderWidth: 0.3,
            borderColor: '#8890A1',
            backgroundColor: "#F9FAFB",
            justifyContent: 'center',
            marginBottom: 51,
            paddingTop: 55,
            marginTop: 14,
            maxHeight: 373,
            ...shadow6Style
        },
        content: {
            alignItems: 'center'
        },
        image: {
            width: 90,
            height: 90
        },
        textCenter: {
            textAlign: 'center'
        },
        grayText: {
            color: '#8890A1',
            marginTop: 8
        },
        label: {
            ...BaseTextVariant.titleXXS
        },
        btnStyle: {
            borderWidth: 0,
            backgroundColor: '#8050F1',
            marginTop: 51,
            marginHorizontal: 23,
            marginBottom: 61

        },
        marketClosed: {
            marginTop: 16
        },

    });
}

export default memo(MarketClosed);
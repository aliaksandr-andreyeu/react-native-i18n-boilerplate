import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseGradientText, BaseText, BaseTextVariant } from '../../atoms';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import LinearGradient from 'react-native-linear-gradient';
import { useCommonStyles } from '@/hooks';
import { useTranslation } from 'react-i18next';

export interface IBaseProfitableTradeCard {
    assetName: string;
    category: string;
    direction: 'buy' | 'sell',
    profit: number;
    timeAgo: number;
};

const {
    headerBar: { buttons: { hitSlop, activeOpacity } }
} = config

const BaseProfitableTradeCard: React.FC<IBaseProfitableTradeCard> = ({
    assetName,
    category,
    direction,
    profit,
    timeAgo,
}) => {

    const isBuy = direction === 'buy';

    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    return (
        <Pressable style={styles.container}>
            <View style={styles.header} >
                <BaseText numberOfLines={1} variant={BaseTextVariant.extraSmallSemiBold} style={styles.flex1} >{assetName}</BaseText>
                <View style={[styles.iconContainer, isBuy ? styles.greenIconContainer : styles.redIconContainer]} >
                    <SvgIcon name={SvgXmlIconNames.smallArrowUp} color={theme.palette.base.white} size={IconSize.tiny} />
                </View>
            </View>
            <BaseText style={[styles.categoryGrayText, styles.category]} variant={BaseTextVariant.extraSmall} >{category}</BaseText>
            <BaseText
                style={[isBuy ? styles.greenTextColor : styles.redTextColor, styles.buyText]}
                variant={BaseTextVariant.titleXXS}
            >
                {isBuy ? t('components.molecules.profitable-trade-card.buy') : t('components.molecules.profitable-trade-card.sell')}
            </BaseText>
            <BaseGradientText
                colors={[
                    '#2ECC71',
                    '#27AE60'
                ]}
                variant={BaseTextVariant.amountSubTitle}
            >
                +{profit}%
            </BaseGradientText>
            <BaseText style={[styles.timeGrayText, styles.time]} variant={BaseTextVariant.tiny} ><BaseText style={styles.timeGrayText} variant={BaseTextVariant.tinySemiBold} >{timeAgo}</BaseText>{' '}min ago</BaseText>
            <TouchableOpacity activeOpacity={activeOpacity} hitSlop={hitSlop} style={styles.btnWrapper} >
                <LinearGradient
                    colors={['#2ECC71', '#27AE60']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.wrapper}
                >
                    <View style={styles.btnContainer} >
                        <SvgIcon name={SvgXmlIconNames.recentTrades} size={{ width: 11, height: 9 }} color={theme.palette.base.white} />
                        <BaseText variant={BaseTextVariant.titleXXS} style={styles.whiteText} >{t('components.molecules.profitable-trade-card.copy')}</BaseText>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Pressable>
    )
};

const useStyles = (theme: UserTheme) => {

    const {
        palette: { base, text }
    } = theme

    const { shadow6Style } = useCommonStyles(theme)


    return StyleSheet.create({
        container: {
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderWidth: 0.3,
            borderColor: text.title.hint,
            backgroundColor: "#FAFAFA",
            borderRadius: 12,
            ...shadow6Style
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 6,
            gap: 4
        },
        flex1: {
            flex: 1,
        },
        categoryGrayText: {
            color: text.title.hint
        },
        timeGrayText: {
            color: '#9CA3AF'
        },
        iconContainer: {
            width: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,

        },
        greenTextColor: {
            color: '#1DBF73'
        },
        redTextColor: {
            color: '#F6465D'
        },
        buyText: {
            marginTop: 7,
        },
        time: {
            marginTop: 4,
            marginRight: 6,
            textAlign: 'right'
        },
        btnContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            flex: 1,
            paddingVertical: 5,
        },
        wrapper: {
            borderRadius: 8,
            overflow: 'hidden'
        },
        btnWrapper: {
            marginTop: 5
        },
        whiteText: {
            color: base.white
        },
        category: {
            marginTop: 1
        },
        greenIconContainer: {
            backgroundColor: "#1DBF73",
        },
        redIconContainer: {
            backgroundColor: "#F6465D",
            transform: [{ rotate: '180deg' }]
        }
    });

}

export default memo(BaseProfitableTradeCard);
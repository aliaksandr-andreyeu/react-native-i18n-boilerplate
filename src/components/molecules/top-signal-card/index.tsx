import React, { memo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useCommonStyles, useLastAskBid } from '@/hooks';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { OpenPositionData } from '@/store/api/pulse/types';

export interface IBaseTopSignalCard {
    onPress?(item: OpenPositionData): void;
    assetName: string;
    category: string;
    direction: 'buy' | 'sell';
    tp: number;
    sl: number;
    confidence: number;
    confidencePercentage: number;
    lastAsk: number | undefined;
    lastBid: number | undefined;
    rewardsAndRisk: number | string;
    id: string;
    currencyProfit?: string
};

const {
    headerBar: { buttons: { hitSlop, activeOpacity } }
} = config;

const BaseTopSignalCard: React.FC<IBaseTopSignalCard> = ({
    onPress,
    assetName,
    category,
    direction,
    rewardsAndRisk,
    confidence,
    id,
    confidencePercentage,
    lastAsk,
    lastBid,
    sl,
    tp,
}) => {

    const getLastAskBid = useLastAskBid(assetName);

    const isBuy = direction === 'buy';

    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    const DirectionWrapper = ({ children, style, direction }: { style?: ViewStyle, children: React.ReactNode, direction: 'buy' | 'sell' }) => {
        if (direction === 'buy') {
            return (
                <LinearGradient
                    colors={['#2ECC71', '#27AE60']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={style}
                >
                    {children}
                </LinearGradient>
            )
        };

        return (
            <View style={[style, styles.redBg]} >
                {children}
            </View>
        );
    }

    const onCardPress = useCallback(() => {
        const { ask: liveAsk, bid: liveBid } = getLastAskBid();

        const finalAsk = liveAsk || lastAsk || 0;
        const finalBid = liveBid || lastBid || 0;
        onPress?.({
            ask: finalAsk,
            bid: finalBid,
            asset: assetName,
            category,
            entry: direction === 'buy',
            id,
            sl,
            tp,
            confidence,
        })
    }, [
        getLastAskBid,
        lastAsk,
        lastBid,
        onPress,
        assetName,
        category,
        direction,
        id,
        sl,
        tp,
        confidence,
    ])



    return (
        <Pressable onPress={onCardPress} style={styles.container}>
            <View style={styles.containerLeft} >
                <DirectionWrapper direction={direction} style={styles.arrowIconContainer} >
                    <SvgIcon name={isBuy ? SvgXmlIconNames.smallArrowUp : SvgXmlIconNames.smallArrowDown} color={theme.palette.base.white} size={IconSize.tiny} />
                </DirectionWrapper>
                <View style={styles.containerMiddle} >
                    <BaseText variant={BaseTextVariant.extraSmallSemiBold}>{assetName}</BaseText>
                    <View style={styles.middleTextContainer} >
                        <BaseText style={[styles.grayText, styles.flex1]} numberOfLines={1} variant={BaseTextVariant.text} >{category}</BaseText>
                        <BaseText style={[styles.grayText, styles.textAlignRight]} numberOfLines={1} variant={BaseTextVariant.extraSmall}>{t('components.molecules.top-signals-card.rewardsAndRisk')}{' '}{rewardsAndRisk}</BaseText>
                    </View>
                    <View style={styles.middleBottom} >
                        <BaseText style={styles.confidenceText} variant={BaseTextVariant.extraSmall}>{t('components.molecules.top-signals-card.low')}</BaseText>
                        <View style={styles.sticks} >
                            <View style={[styles.grayStick, { width: `${confidencePercentage || 0}%` }]} />
                        </View>
                        <BaseText style={styles.confidenceText} variant={BaseTextVariant.extraSmall}>{t('components.molecules.top-signals-card.high')}</BaseText>
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={onCardPress} hitSlop={hitSlop} activeOpacity={activeOpacity} >
                <DirectionWrapper direction={direction} style={styles.wrapper}  >
                    <View style={styles.btnContainer} >
                        <SvgIcon style={!isBuy && styles.sellRotate} name={SvgXmlIconNames.triangle} color={theme.palette.base.white} size={{ width: 8.17, height: 7 }} />
                        <BaseText style={styles.whiteText} variant={BaseTextVariant.titleXXS} >{isBuy ? t('components.molecules.top-signals-card.buy') : t('components.molecules.top-signals-card.sell')}</BaseText>
                    </View>
                </DirectionWrapper>
            </TouchableOpacity>
        </Pressable>
    )
};

const useStyles = (theme: UserTheme) => {

    const {
        palette: { text }
    } = theme;

    const { shadow6Style } = useCommonStyles(theme)

    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 17,
            paddingRight: 15,
            gap: 24,
            paddingTop: 5,
            paddingBottom: 8,
            borderWidth: 0.3,
            borderColor: text.title.hint,
            backgroundColor: "#FAFAFA",
            borderRadius: 12,
            ...shadow6Style
        },
        arrowIconContainer: {
            width: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
        },
        middleTextContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 4,
        },
        containerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
            flex: 1,
        },
        containerMiddle: {
            gap: 3,
            flex: 1
        },
        grayText: {
            color: text.title.hint
        },
        confidenceText: {
            color: '#BDC3CF'
        },
        middleBottom: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            marginTop: 5
        },
        grayStick: {
            height: 5,
            borderRadius: 16,
            backgroundColor: '#58616C',
        },
        sticks: {
            flex: 1,
            backgroundColor: '#D9DDE5CC',
            borderRadius: 16,
            overflow: 'hidden'
        },
        btnContainer: {
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6.83,
            flex: 1
        },
        wrapper: {
            borderRadius: 8,
            height: 25,
            overflow: 'hidden'
        },
        whiteText: {
            color: text.title.inverted
        },
        redBg: {
            backgroundColor: '#F6465D',
        },
        sellRotate: {
            transform: [{ rotate: '180deg' }]
        },
        textAlignRight: {
            textAlign: 'right'
        },
        flex1: {
            flex: 1
        }
    });
}

export default memo(BaseTopSignalCard);
import React, { memo, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseGradientText, BaseImage, BaseText, BaseTextVariant } from '@/components/atoms';
import { images, SvgIcon, SvgXmlIconNames } from '@/assets';
import LinearGradient from 'react-native-linear-gradient';
import { useCommonStyles, useLastAskBid } from '@/hooks';
import Animated, { CurvedTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { OpenPositionData } from '@/store/api/pulse/types';
import CountdownContainer from './CountdownContainer';

interface IBaseTopPerformerCard {
    onPress(item: OpenPositionData): void;
    asset: string;
    category: string;
    change: number;
    isBuy: boolean;
    profitTarget: number;
    expiresIn: Date;
    onExpired(id: string, asset: string, currencyProfit: string | undefined): void;
    style?: ViewStyle;
    id: string;
    currencyProfit?: string;
    lastAsk: number | undefined;
    lastBid: number | undefined;
    takeProfit: number;
    stopLoss: number;
    performanceMetric: number;
}

const {
    buttons: { activeOpacity }
} = config;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BaseTopPerformerCard: React.FC<IBaseTopPerformerCard> = ({
    expiresIn,
    onExpired,
    style,
    asset,
    category,
    change,
    isBuy,
    onPress,
    profitTarget,
    id,
    currencyProfit,
    lastAsk,
    lastBid,
    stopLoss,
    takeProfit,
    performanceMetric
}) => {

    const getLastAskBid = useLastAskBid(asset);
    const locked = useRef<boolean>(false);

    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    const LinearWrapper = ({ children }: { children: React.ReactNode }) => {
        if (isBuy) {
            return (
                <LinearGradient
                    colors={['#2ECC71', '#27AE60']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.wrapper}
                >
                    {children}
                </LinearGradient>
            );
        }
        return <View style={[styles.wrapper, styles.sellBg]}>{children}</View>;
    };

    const onFinish = useCallback(() => {
        onExpired?.(id, asset, currencyProfit);
    }, [onExpired, asset, currencyProfit, id]);



    const onCardPress = useCallback(() => {
        if (locked.current) return;

        locked.current = true;
        const { ask: liveAsk, bid: liveBid } = getLastAskBid();

        const finalAsk = liveAsk || lastAsk || 0;
        const finalBid = liveBid || lastBid || 0;

        onPress?.({
            ask: finalAsk,
            asset,
            bid: finalBid,
            entry: isBuy,
            id: id,
            category: category,
            sl: stopLoss,
            tp: takeProfit,
            performanceMetric: +performanceMetric
        });

        setTimeout(() => {
            locked.current = false;
        }, 250);

    }, [asset,
        category,
        performanceMetric,
        takeProfit,
        stopLoss,
        isBuy,
        id,
        lastAsk,
        lastBid,
        onPress,
        getLastAskBid
    ]);


    return (
        <AnimatedPressable
            onPress={onCardPress}
            layout={CurvedTransition}
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.container, style]}
        >
            <View style={styles.headContainer}>
                <BaseText style={styles.flex} variant={BaseTextVariant.extraSmallSemiBold}>
                    {asset}
                </BaseText>
                <View style={styles.priceChangeContainer}>
                    <SvgIcon
                        style={!isBuy && styles.sellTriangle}
                        name={SvgXmlIconNames.triangle}
                        size={{ width: 7, height: 6 }}
                        color={isBuy ? '#1DBF73' : '#F6465D'}
                    />
                    <BaseText style={isBuy ? styles.greenColor : styles.redColor} variant={BaseTextVariant.amountTiny}>
                        {change > 0 ? '+' : '-'}
                        {Math.abs(+(change?.toFixed?.(6) || 0))}%
                    </BaseText>
                </View>
            </View>
            <BaseText style={[styles.category, styles.grayColor]} variant={BaseTextVariant.extraSmall}>
                {category}
            </BaseText>
            <BaseImage
                style={isBuy ? styles.buyImage : styles.sellImage}
                resizeMode='stretch'
                source={isBuy ? images.arrowBuy : images.arrowSell}
            />
            <View style={styles.bottomContainer}>
                <View style={styles.flex}>
                    <BaseText style={[styles.greenColor, { bottom: -2 }]} variant={BaseTextVariant.amountExtraTiny}>
                        {t('components.top-performer-card.profit-target')}
                    </BaseText>
                    <BaseGradientText
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                        numberOfLines={1}
                        colors={['#2ECC71', '#27AE60']}
                        variant={BaseTextVariant.amountSubTitle}
                    >
                        {profitTarget}%
                    </BaseGradientText>
                </View>
                <CountdownContainer onFinish={onFinish} expiresIn={expiresIn} />
            </View>
            <View>
                <TouchableOpacity
                    style={styles.pressable}
                    activeOpacity={activeOpacity}
                    onPress={onCardPress}
                >
                    <LinearWrapper>
                        <View style={styles.btnContainer}>
                            <SvgIcon
                                style={!isBuy && styles.sellTriangle}
                                name={SvgXmlIconNames.triangle}
                                size={{ width: 8.17, height: 7 }}
                                color={theme.palette.base.white}
                            />
                            <BaseText style={styles.whiteText} variant={BaseTextVariant.titleXXS}>
                                {isBuy ? t('components.top-performer-card.buy') : t('components.top-performer-card.sell')}
                            </BaseText>
                        </View>
                    </LinearWrapper>
                </TouchableOpacity>
            </View>
        </AnimatedPressable>
    );
};

const useStyles = (theme: UserTheme) => {
    const { shadow6Style } = useCommonStyles(theme);

    const {
        palette: { text, base }
    } = theme;

    return StyleSheet.create({
        flex: { flex: 1 },
        container: {
            paddingVertical: 10,
            paddingLeft: 10.14,
            paddingRight: 7.29,
            borderWidth: 0.3,
            borderColor: text.base.hint,
            backgroundColor: '#F9FAFB',
            borderRadius: 12,
            flex: 1,
            ...shadow6Style
        },
        headContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 4
        },
        priceChangeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginRight: 5
        },
        bottomContainer: {
            marginTop: 5,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 8
        },
        bottomMiddleContainer: {
            flexDirection: 'row',
            gap: 3,
            alignItems: 'flex-end'
        },
        bottomRightContainer: {
            gap: 0,
            marginRight: 2
        },
        btnContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6.83,
            paddingVertical: 5,
            paddingHorizontal: 20,
            flex: 1
        },
        wrapper: {
            borderRadius: 8,
            overflow: 'hidden'
        },
        pressable: {
            marginTop: 8
        },

        sellTriangle: {
            transform: [{ rotate: '180deg' }]
        },
        redColor: {
            color: '#F6465D'
        },
        greenColor: {
            color: '#1DBF73'
        },
        category: { marginTop: 2 },
        grayColor: { color: text.base.hint },
        buyImage: {
            height: 23,
            marginTop: 4,
            top: 0,
            width: 102,
            alignSelf: 'center',
            flex: 1
        },
        sellImage: {
            height: 23,
            marginTop: 4,
            top: 4,
            width: 102,
            alignSelf: 'center',
            flex: 1,
            transform: [{ rotate: '1.07deg' }]
        },
        sellBg: { backgroundColor: '#F6465D' },
        whiteText: { color: base.white },
        finished: { backgroundColor: '#D9DDE5' }
    });
};

export default memo(BaseTopPerformerCard);

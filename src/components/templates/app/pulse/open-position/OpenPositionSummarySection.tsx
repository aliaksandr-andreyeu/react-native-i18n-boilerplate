import React, { FC, memo, ReactNode, useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { UseFormHandleSubmit } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { BaseGradientText, BaseText, BaseTextVariant } from '@/components';
import { SvgIcon, SvgXmlIconNames } from '@/assets';
import { config } from '@/constants';
import useStyles from './styles';
import { formatNumberToAmount } from '@/helpers';

const {
    components: {
        buttons: { activeOpacity },
    },
} = config;

type OpenPositionFormValues = {
    price: string;
    volume: string;
    tp: string;
    sl: string;
    slEnabled: boolean;
    tpEnabled: boolean;
};

interface OpenPositionSummarySectionProps {
    summaryKey: string;

    isMarketOrder: boolean;
    hasAmount: boolean;

    assetUnit: string;

    marginLoading: boolean;
    marginValue?: number;
    positionValue?: number;

    disableAction: boolean;
    handleSubmit: UseFormHandleSubmit<OpenPositionFormValues>;
    onSubmit: (values: OpenPositionFormValues) => void;

    isBuyAction: boolean;
    actionButtonText: string;

    isSubmitting: boolean;
}

const OpenPositionSummarySection: FC<OpenPositionSummarySectionProps> = ({
    summaryKey,
    isMarketOrder,
    hasAmount,
    assetUnit,
    marginLoading,
    marginValue,
    disableAction,
    handleSubmit,
    onSubmit,
    isBuyAction,
    actionButtonText,
    isSubmitting,
    positionValue
}) => {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { t } = useTranslation();

    const marginText = (marginValue ?? 0).toFixed(2);
    const isDisabled = disableAction;

    const pValue = useMemo(() => formatNumberToAmount(positionValue?.toFixed(2)), [positionValue])

    const LinearWrapper: FC<{ isBuy: boolean; children: ReactNode }> = ({ isBuy, children }) => {
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

    return (
        <>
            <Animated.View
                key={summaryKey}
                entering={FadeIn}
                exiting={FadeOut}
                style={[styles.row, styles.height44]}
            >
                {hasAmount ? (
                    <>
                        <View>
                            <BaseText variant={BaseTextVariant.extraSmall} style={styles.positionText1}>
                                {t('screens.create-position.position-value')}
                            </BaseText>
                            {marginLoading ? (
                                <BaseText variant={BaseTextVariant.countdown} style={styles.positionText2}>
                                    ...
                                </BaseText>
                            ) : (
                                <BaseGradientText
                                    colors={['#2ECC71', '#27AE60']}
                                    variant={BaseTextVariant.countdown}
                                    style={styles.positionText2}
                                >
                                    ~{pValue}
                                </BaseGradientText>
                            )}
                        </View>

                        <View>
                            <BaseText variant={BaseTextVariant.extraSmall} style={styles.positionText1}>
                                {t('screens.create-position.required-margin', { unit: assetUnit })}
                            </BaseText>
                            {marginLoading ? (
                                <BaseText variant={BaseTextVariant.countdown} style={styles.positionText2}>
                                    ...
                                </BaseText>
                            ) : (
                                <BaseText variant={BaseTextVariant.countdown} style={styles.positionText2}>
                                    {marginText}
                                </BaseText>
                            )}
                        </View>
                    </>
                ) : (
                    <View style={{ height: isMarketOrder ? 72 : 32 }} />
                )}
            </Animated.View>

            <Animated.View layout={LinearTransition} style={styles.buttonsWrapper}>
                <TouchableOpacity
                    disabled={isDisabled}
                    activeOpacity={activeOpacity}
                    style={[styles.actionButton, isDisabled && styles.disabledActionStyle]}
                    onPress={handleSubmit(onSubmit)}
                >
                    <LinearWrapper isBuy={isBuyAction}>
                        {isSubmitting ? (
                            <View style={styles.center}>
                                <ActivityIndicator size="small" color={theme.palette.base.white} />
                            </View>
                        ) : (
                            <View style={styles.btnContainer}>
                                {isMarketOrder && (
                                    <SvgIcon
                                        style={!isBuyAction && styles.sellTriangle}
                                        name={SvgXmlIconNames.triangle}
                                        size={{ width: 8.17, height: 7 }}
                                        color={theme.palette.base.white}
                                    />
                                )}
                                <BaseText style={styles.whiteText} variant={BaseTextVariant.titleXXS}>
                                    {actionButtonText}
                                </BaseText>
                            </View>
                        )}
                    </LinearWrapper>
                </TouchableOpacity>
            </Animated.View>
        </>
    );
};

export default memo(OpenPositionSummarySection);
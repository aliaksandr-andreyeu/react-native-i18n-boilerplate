import React, { FC, memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import {
    Control,
    Controller,
    UseFormGetValues,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    BaseText,
    BaseTextVariant,
} from '@/components';
import { config, testIDs } from '@/constants';
import useStyles from './styles';
import LimitInfo from '../limit-info';
import { BaseLimitSelector } from '..';
import { calculateSlTpLimits } from '@/helpers';

const {
    validation: { floatRegex },
} = config;

type OpenPositionFormValues = {
    price: string;
    volume: string;
    tp: string;
    sl: string;
    slEnabled: boolean;
    tpEnabled: boolean;
};

interface LimitsSectionProps {
    control: Control<OpenPositionFormValues>;
    getValues: UseFormGetValues<OpenPositionFormValues>;
    entry: boolean | undefined;
    symbolDigits: number;
    formValues: OpenPositionFormValues;
    onSwitchChange: (v: 'sl' | 'tp') => (value: boolean) => void;
    getPriceForLimits: () => number;
    stopsLevel: number;
    point: number;

}

const LimitsSection: FC<LimitsSectionProps> = ({
    control,
    getValues,
    entry,
    symbolDigits,
    formValues,
    onSwitchChange,
    getPriceForLimits,
    point,
    stopsLevel
}) => {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { t } = useTranslation();

    const getDynamicLimits = () => {
        const basePrice = getPriceForLimits();
        return calculateSlTpLimits(entry ? 0 : 1, basePrice, stopsLevel, point);
    };


    return (
        <Animated.View layout={LinearTransition} style={styles.limitsContainer}>
            <LimitInfo />
            <Controller
                name="tp"
                control={control}
                rules={{
                    validate: {
                        required: (value) => {
                            if (!value && getValues('tpEnabled')) return t('errors.required');
                            return true;
                        },
                        greaterThanMinimum: (value) => {
                            if (!getValues('tpEnabled')) return true;

                            const normalizedValue = value.replace(',', '.');
                            const v = parseFloat(normalizedValue);
                            if (Number.isNaN(v)) return true;

                            const { takeProfit } = getDynamicLimits();

                            if (entry) {
                                if (v < takeProfit) {
                                    return t('screens.create-position-details.min-validation', {
                                        min: takeProfit.toFixed(symbolDigits || 0),
                                    });
                                }
                            } else {
                                if (v > takeProfit) {
                                    return t('screens.create-position-details.max-validation', {
                                        max: takeProfit.toFixed(symbolDigits || 0),
                                    });
                                }
                            }

                            return true;
                        },
                        validFloat: (value) => {
                            const normalizedValue = value.replace(',', '.');
                            if (!floatRegex.test(normalizedValue) && getValues('tpEnabled')) {
                                return t('errors.invalidFloat');
                            }
                            return true;
                        },
                    },
                }}
                render={({
                    field: { onChange, value },
                    formState: {
                        errors: { tp },
                    },
                }) => (
                    <View style={styles.tpGap}>
                        <BaseLimitSelector
                            onSwitch={onSwitchChange('tp')}
                            enabled={formValues.tpEnabled}
                            value={value}
                            limitTitle={t('screens.create-position.take-profit')}
                            onChangeText={onChange}
                            testID={testIDs.components.templates.app?.pulse?.openPosition?.takeProfitInput}
                            switchTestID={testIDs.components.templates.app?.pulse?.openPosition?.takeProfitSwitch}
                        />
                        {!!tp?.message && (
                            <BaseText style={styles.errorText} variant={BaseTextVariant.extraSmall}>
                                {tp.message}
                            </BaseText>
                        )}
                    </View>
                )}
            />

            <Controller
                name="sl"
                control={control}
                rules={{
                    validate: {
                        required: (value) => {
                            if (!value && getValues('slEnabled')) return t('errors.required');
                            return true;
                        },
                        greaterThanMinimum: (value) => {
                            if (!getValues('slEnabled')) return true;

                            const normalizedValue = value.replace(',', '.');
                            const v = parseFloat(normalizedValue);
                            if (Number.isNaN(v)) return true;

                            const { stopLoss } = getDynamicLimits();

                            if (entry) {
                                if (v > stopLoss) {
                                    return t('screens.create-position-details.max-validation', {
                                        max: stopLoss.toFixed(symbolDigits || 0),
                                    });
                                }
                            } else {
                                if (v < stopLoss) {
                                    return t('screens.create-position-details.min-validation', {
                                        min: stopLoss.toFixed(symbolDigits || 0),
                                    });
                                }
                            }

                            return true;
                        },
                        validFloat: (value) => {
                            const normalizedValue = value.replace(',', '.');
                            if (!floatRegex.test(normalizedValue) && getValues('slEnabled')) {
                                return t('errors.invalidFloat');
                            }
                            return true;
                        },
                    },
                }}
                render={({
                    field: { onChange, value },
                    formState: {
                        errors: { sl },
                    },
                }) => (
                    <View style={styles.tpGap}>
                        <BaseLimitSelector
                            onSwitch={onSwitchChange('sl')}
                            enabled={formValues.slEnabled}
                            value={value}
                            limitTitle={t('screens.create-position.stop-loss')}
                            onChangeText={onChange}
                            testID={testIDs.components.templates.app?.pulse?.openPosition?.stopLossInput}
                            switchTestID={testIDs.components.templates.app?.pulse?.openPosition?.stopLossSwitch}
                        />
                        {!!sl?.message && (
                            <BaseText style={styles.errorText} variant={BaseTextVariant.extraSmall}>
                                {sl.message}
                            </BaseText>
                        )}
                    </View>
                )}
            />
        </Animated.View>
    );
};

export default memo(LimitsSection);
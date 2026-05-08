import React, { FC, memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BaseFormField, BaseText, BaseTextVariant } from '@/components';
import OpenPositionAmounts from './OpenPositionAmounts';
import useStyles from './styles';
import { config, testIDs } from '@/constants';

const {
    components: {
        buttons: { activeOpacity, hitSlop },
    },
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

interface OpenPositionAmountSectionProps {
    control: Control<OpenPositionFormValues>;
    errors: FieldErrors<OpenPositionFormValues>;

    isMarketOrder: boolean;
    tradingAccountHasBalance: boolean;
    assetUnit: string;

    limits: { min: number; max: number };
    formattedMin: string;
    formattedMax: string;
    limitsLoading: boolean;

    assetUnitOfMeasureDigits: number;
    selectedAmount: number;
    setAmount(amount: number): void;

    calculateMarginDebounce(value: number): void;
    setMaxVolume(): void;

    onAmountSelect(selected: boolean, amount: number): void;

    renderLoader(width?: number | string, height?: number): React.ReactNode;
}

const OpenPositionAmountSection: FC<OpenPositionAmountSectionProps> = ({
    control,
    errors,

    isMarketOrder,
    tradingAccountHasBalance,
    assetUnit,

    limits,
    formattedMin,
    formattedMax,
    limitsLoading,

    assetUnitOfMeasureDigits,
    selectedAmount,
    setAmount,

    calculateMarginDebounce,
    setMaxVolume,

    onAmountSelect,
    renderLoader,
}) => {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { t } = useTranslation();

    const volumeError = errors.volume?.message;

    const title = isMarketOrder
        ? t(
            tradingAccountHasBalance
                ? 'screens.create-position.other-amount'
                : 'screens.create-position.amount',
            {
                shares: assetUnit,
            },
        )
        : t('screens.create-position.set-target-price');

    return (
        <>
            <Animated.View layout={LinearTransition} style={styles.howMuchInvest}>
                <BaseText variant={BaseTextVariant.caption}>
                    {isMarketOrder
                        ? t('screens.create-position.order-amount', { shares: assetUnit || '' })
                        : t('screens.create-position.amount', { shares: assetUnit || '' })}
                </BaseText>
            </Animated.View>

            <Controller
                name="volume"
                control={control}
                rules={{
                    validate: {
                        greaterThanMaximum: (value) => {
                            const maxValue = limits.max || Number.MAX_SAFE_INTEGER;
                            if (parseFloat(value.toString()) > maxValue) {
                                return t('screens.create-position-details.amount-exceeds-balance');
                            }
                            return true;
                        },
                        minimumValidation: (value) => {
                            const minValue = limits.min || 0;
                            if (parseFloat(value.toString()) < minValue) {
                                return t('screens.create-position-details.min-amount-validation-unit', {
                                    min: minValue.toFixed(assetUnitOfMeasureDigits),
                                });
                            }
                            return true;
                        },
                        validFloat: (value) => {
                            const normalizedValue = value.replace(',', '.');
                            if (!floatRegex.test(normalizedValue)) {
                                return t('errors.invalidFloat');
                            }
                            return true;
                        },
                    },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <BaseFormField
                        returnKeyType="next"
                        keyboardType="numeric"
                        isBottomSheet
                        error={volumeError}
                        inputContainerStyle={styles.inputBorder}
                        focusedBorderColor={selectedAmount ? undefined : '#8050F1'}
                        onBlur={onBlur}
                        onChange={(val: any) => {
                            const normalizedValue = val.replaceAll(',', '.');
                            const regex = new RegExp(`^\\d+(\\.\\d{0,${assetUnitOfMeasureDigits}})?$`);

                            if (regex.test(normalizedValue) || normalizedValue === '') {
                                onChange(normalizedValue);

                                if (normalizedValue !== '') {
                                    calculateMarginDebounce(Number(normalizedValue));
                                }

                                if (selectedAmount) {
                                    setAmount(0);
                                }
                            }
                        }}
                        value={value}
                        title={title}
                        testID={testIDs.components.templates.app?.pulse?.openPosition?.amountInput}
                        accessibilityValue={{
                            text: testIDs.components.templates.app?.pulse?.openPosition?.amountInput,
                        }}
                    />
                )}
            />
            <Animated.View layout={LinearTransition} style={styles.inputLimitsContainer}>
                {limitsLoading ? (
                    <View style={styles.available}>{renderLoader(100, 14)}</View>
                ) : (
                    <BaseText
                        style={styles.available}
                        variant={BaseTextVariant.authSmall}
                        testID={testIDs.components.templates.app?.pulse?.openPosition?.amountRange}
                        accessibilityValue={{
                            text: testIDs.components.templates.app?.pulse?.openPosition?.amountRange,
                        }}
                    >
                        {formattedMin} - {formattedMax}
                    </BaseText>
                )}
                <TouchableOpacity hitSlop={hitSlop} activeOpacity={activeOpacity} onPress={setMaxVolume}>
                    <BaseText style={styles.enterMax} variant={BaseTextVariant.extraSmall}>
                        {t('screens.create-position.enter-max')}
                    </BaseText>
                </TouchableOpacity>
            </Animated.View>

            {isMarketOrder && <OpenPositionAmounts
                max={limits.max}
                min={limits.min}
                selectedAmount={selectedAmount}
                onAmountSelect={onAmountSelect}
            />}
        </>
    );
};

export default memo(OpenPositionAmountSection);
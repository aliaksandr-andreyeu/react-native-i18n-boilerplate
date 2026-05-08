import React, { FC, memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, { StretchInY } from 'react-native-reanimated';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    BaseFormField,
    BaseText,
    BaseTextVariant,
    BaseButton,
    BaseButtonType,
    BaseButtonSize,
} from '@/components';
import { SvgIcon, SvgXmlIconNames, IconSize } from '@/assets';
import { config, testIDs } from '@/constants';
import dateHelper from '@/helpers/dateHelper';
import useStyles from './styles';

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

interface PendingOrderSectionProps {
    control: Control<OpenPositionFormValues>;
    errors: FieldErrors<OpenPositionFormValues>;

    entry: boolean | undefined;

    selectedDate: Date | null;
    onSelectDate(): void;
    onClearDate(): void;
}

const PendingOrderSection: FC<PendingOrderSectionProps> = ({
    control,
    errors,
    entry,
    selectedDate,
    onSelectDate,
    onClearDate,
}) => {
    const theme = useTheme();
    const styles = useStyles(theme);
    const { t } = useTranslation();

    const priceError = errors.price?.message;

    const actionLabel = t(
        'screens.create-position-details.action-when-price',
        {
            action: entry
                ? t('screens.create-position.buy')
                : t('screens.create-position.sell'),
        },
    );

    const dateLabel = selectedDate
        ? dateHelper.to(selectedDate, 'HH:mm, DD MMMM YYYY')
        : t('screens.create-position-details.add-date');

    return (
        <Animated.View entering={StretchInY}>
            <View style={[styles.separator, styles.extraMargin]} />

            <BaseText variant={BaseTextVariant.caption} style={styles.fieldName}>
                {actionLabel}
            </BaseText>

            <Controller
                name="price"
                control={control}
                rules={{
                    validate: {
                        required: (value) => {
                            if (!value) return t('errors.required');
                            return true;
                        },
                        minimumValidation: (value) => {
                            const minValue = 0;
                            if (parseFloat(value.toString()) <= minValue) {
                                return t('screens.create-position.minimum-zero');
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
                        error={priceError}
                        isBottomSheet
                        onBlur={onBlur}
                        onChange={(val: any) => {
                            const normalizedValue = val.replace(',', '.');
                            onChange(normalizedValue);
                        }}
                        value={value}
                        title={t('screens.create-position-details.price')}
                        testID={testIDs.components.templates.app?.pulse?.openPosition?.buySellWhenPriceInput}
                        accessibilityValue={{
                            text: testIDs.components.templates.app?.pulse?.openPosition?.buySellWhenPriceInput,
                        }}
                    />
                )}
            />

            <View style={styles.dateRow}>
                <BaseText style={styles.grayText1} variant={BaseTextVariant.extraSmall}>
                    {t('screens.create-position-details.valid-till')}
                </BaseText>

                <View style={styles.horizontal}>
                    <BaseButton
                        type={BaseButtonType.link}
                        size={BaseButtonSize.tiny}
                        labelStyle={BaseTextVariant.extraSmall}
                        label={dateLabel}
                        onPress={onSelectDate}
                    />

                    {selectedDate && (
                        <TouchableOpacity style={styles.emptyDate} onPress={onClearDate}>
                            <SvgIcon name={SvgXmlIconNames.close} size={IconSize.tiny} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

export default memo(PendingOrderSection);
import React, { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import useStyles from './styles';
import { BaseButton, BaseTextVariant } from '@/components/atoms';

interface IOpenPositionAmounts {
    max: number;
    min: number;
    selectedAmount: number;
    onAmountSelect(selected: boolean, amount: number): void;
};

const popularAmount = [
    5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000, 25000, 50000, 75000, 100000, 250000, 500000,
    750000
];

const OpenPositionAmounts: React.FC<IOpenPositionAmounts> = ({
    max,
    min,
    selectedAmount,
    onAmountSelect
}) => {

    const theme = useTheme();
    const styles = useStyles(theme);

    const amounts = useMemo(() => {
        const array = popularAmount.filter((amount) => max && amount < max && amount > min);

        return array.slice(-6);
    }, [max, min]);


    const onAmountPress = useCallback((amount: number) => () => {
        onAmountSelect?.(amount === selectedAmount, amount);
    }, [selectedAmount, onAmountSelect])

    return (
        <View
            style={[
                styles.amountsContainer,
                amounts.length % 6 === 0 ? styles.amountsContainerJustify : styles.amountsContainerJustifyUndefined
            ]}
        >
            {amounts.map((amount, index) => {
                const isSelected = amount === selectedAmount;
                const isLastInRow = index % 3 === 2;
                return (
                    <BaseButton
                        labelStyle={[
                            styles.amount,
                            isSelected ? styles.selectedAmountButton : styles.unselectedAmountButton,
                            BaseTextVariant.smallSpace
                        ]}
                        key={`${amount}`}
                        label={amount.toLocaleString()}
                        style={[
                            styles.amountBtn,
                            !isLastInRow ?
                                styles.lastAmountBtnMarginRight : styles.notLastAmountBtnMarginRight,
                            isSelected ?
                                styles.selectedAmountBtnBorderWidth : styles.unSelectedAmountBtnBorderWidth
                        ]}
                        onPress={onAmountPress(amount)}
                    />
                );
            })}
        </View>
    )
};


export default memo(OpenPositionAmounts);
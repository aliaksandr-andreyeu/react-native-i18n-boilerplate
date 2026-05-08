import React, { memo, useEffect, useMemo, useState } from 'react';
import { runOnJS, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import BaseText, { BaseTextVariantValue } from '../text';
import { TextProps } from 'react-native';

interface BaseTextProps extends TextProps {
    variant?: BaseTextVariantValue;
    italic?: boolean;
}

interface IAnimNumber {
    value: number;
    textProps?: BaseTextProps;
    format?(value: string): string;
    duration?: number,
    fixed?: number
    tabular?: boolean
}

const AnimatedNumber: React.FC<IAnimNumber> = ({
    value = 0,
    format,
    textProps,
    duration = 1000,
    fixed = 2,
    tabular = true
}) => {
    const progress = useSharedValue(0);
    const [current, setCurrent] = useState<string>((0).toFixed(fixed));

    useEffect(() => {
        progress.value = withTiming(value, { duration });
    }, [value, duration]);

    useDerivedValue(() => {
        runOnJS(setCurrent)(progress.value.toFixed(fixed));
    }, [progress, fixed]);


    const formatted = useMemo(() => format ? format(current) : current, [current]);


    return <BaseText  {...textProps} style={[tabular && { fontVariant: ['tabular-nums'] }, textProps?.style || {}]}  >{formatted}</BaseText>
};


export default memo(AnimatedNumber);
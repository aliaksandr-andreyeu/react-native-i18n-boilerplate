import React, { memo } from 'react';
import { Text, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import BaseText, { BaseTextProps } from '../text';

interface IBaseGradientText extends BaseTextProps {
    colors: string[];
    style?: TextStyle;

}


const BaseGradientText: React.FC<IBaseGradientText> = ({
    colors,
    style,
    children,
    ...props
}) => {

    return (
        <MaskedView
            maskElement={
                <BaseText
                    {...props}
                    style={style}
                >
                    {children}
                </BaseText>
            }>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 1 }}
                end={{ x: 0.5, y: 0 }}
            >
                <BaseText
                    {...props}
                    style={[style, { opacity: 0 }]}>
                    {children}
                </BaseText>
            </LinearGradient>
        </MaskedView>
    );
};

export default memo(BaseGradientText);

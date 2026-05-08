import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { AccordionItem } from '@/components/molecules';
import { useSharedValue } from 'react-native-reanimated';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useCommonStyles } from '@/hooks';
import { ORDER_TYPES } from '@/types';
import { useTranslation } from 'react-i18next';


interface IBaseOrderSelector {
    defaultOrder: ORDER_TYPES
    onChange(order: ORDER_TYPES): void;
    isDisabled: boolean
};

const { headerBar: { buttons: { activeOpacity, hitSlop } } } = config

const BaseOrderSelector: React.FC<IBaseOrderSelector> = ({
    defaultOrder = 'market_order',
    onChange,
    isDisabled
}) => {
    const isExpanded = useSharedValue(false);

    const { t } = useTranslation()
    const theme = useTheme();
    const styles = useStyles(theme);

    const onChangeOrder = useCallback(() => {
        const next = defaultOrder === 'market_order' ? 'pending_order' : 'market_order'
        onChange?.(next);
        isExpanded.value = false;
    }, [defaultOrder]);

    const toggleExpand = useCallback(() => isExpanded.value = !isExpanded.value, []);

    return (

        <View style={styles.container}>
            <Pressable hitSlop={hitSlop} disabled={isDisabled} onPress={toggleExpand} style={styles.selectedContainer} >
                <BaseText variant={BaseTextVariant.extraSmall} >{defaultOrder === 'market_order' ? t('screens.create-position.market-order') : t('screens.create-position.pending-order')}</BaseText>
                {isDisabled || <SvgIcon name={SvgXmlIconNames.chevronDown} size={IconSize.sm} color={theme.palette.background.card.secondary} />}
            </Pressable>
            <TouchableOpacity activeOpacity={activeOpacity} onPress={onChangeOrder}>
                <AccordionItem isExpanded={isExpanded} >
                    <View style={styles.content} >
                        <View style={styles.separator} />
                        <BaseText variant={BaseTextVariant.extraSmall} >{defaultOrder === 'market_order' ? t('screens.create-position.pending-order') : t('screens.create-position.market-order')}</BaseText>
                    </View>
                </AccordionItem>
            </TouchableOpacity>
        </View>
    )
};

const useStyles = (theme: UserTheme) => {

    const {
        palette: { background, border }
    } = theme;

    const { shadow6Style } = useCommonStyles(theme)

    return StyleSheet.create({
        container: {
            backgroundColor: background.tag.simple.secondary,
            zIndex: 9999,
            position: 'absolute',
            right: 0,
            top: 0,
            borderRadius: 8,
            paddingTop: 8,
            ...(shadow6Style)

        },

        selectedContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingBottom: 8,
            paddingLeft: 15,
            paddingRight: 10,
            zIndex: 999

        },
        content: {
            paddingBottom: 10,
            paddingLeft: 15,
            paddingRight: 10,
            zIndex: 999
        },
        separator: {
            height: 0.5,
            backgroundColor: border.base.divider,
            marginBottom: 8,
        }

    });
}

export default memo(BaseOrderSelector);
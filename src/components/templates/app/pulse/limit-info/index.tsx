import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { SheetBackdrop } from '@/components/molecules';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface ILimitInfo {
};

const { headerBar: { buttons: { activeOpacity, hitSlop } }, isAndroid } = config
const LimitInfo: React.FC<ILimitInfo> = () => {
    const [reset, setReset] = useState<number>(Math.random());
    const { bottom } = useSafeAreaInsets();
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme, bottom);


    const sheetRef = useRef<BottomSheetModal>(null);
    const sheetState = useRef<boolean>(false);


    useEffect(() => {
        if (!isOpen) return;
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (sheetState.current) sheetRef.current?.dismiss();
            handler.remove();
            return true;
        })

        return handler.remove

    }, [reset, isOpen])


    const onAnimate = useCallback(() => {
        sheetState.current = true;
        setIsOpen(true)
    }, []);

    const onDismiss = useCallback(() => {
        sheetState.current = true;
        setIsOpen(false)
    }, []);

    const onIconPress = useCallback(() => {
        sheetRef.current?.present();
        isAndroid && setReset(Math.random())
    }, [isAndroid]);

    return (
        <>
            <View style={styles.container}>
                <BaseText>{t('screens.create-position.limits')}</BaseText>
                <TouchableOpacity activeOpacity={activeOpacity} hitSlop={hitSlop} onPress={onIconPress} >
                    <SvgIcon style={styles.icon} name={SvgXmlIconNames.questionCircle} size={IconSize.xxs} color='#58616C80' />
                </TouchableOpacity>
            </View>
            <BottomSheetModal
                ref={sheetRef}
                stackBehavior='push'
                keyboardBehavior='interactive'
                keyboardBlurBehavior='restore'
                handleIndicatorStyle={styles.indicator}
                onDismiss={onDismiss}
                backgroundStyle={styles.sheetBgStyle}
                enablePanDownToClose
                onAnimate={onAnimate}
                backdropComponent={SheetBackdrop}
                enableDynamicSizing
            >
                <BottomSheetView style={styles.sheet} >
                    <View style={styles.gap} >
                        <BaseText variant={BaseTextVariant.extraSmallSemiBold} >{t('screens.create-position.take-profit')}</BaseText>
                        <BaseText variant={BaseTextVariant.extraSmall} >{t('screens.create-position.take-profit-info')}</BaseText>
                    </View>
                    <View style={styles.gap}>
                        <BaseText variant={BaseTextVariant.extraSmallSemiBold} >{t('screens.create-position.stop-loss')}</BaseText>
                        <BaseText variant={BaseTextVariant.extraSmall} >{t('screens.create-position.stop-loss-info')}</BaseText>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </>
    )
};

const useStyles = ({
    palette: { icon, graphite }
}: UserTheme, bottom: number) => StyleSheet.create({
    container: {
        gap: 19,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    indicator: {
        backgroundColor: icon.base.tertiary
    },
    sheetBgStyle: {
        borderRadius: 24,
        backgroundColor: graphite['050']
    },
    icon: {
        top: 1
    },
    gap: { gap: 2 },
    sheet: {
        paddingHorizontal: 69,
        paddingBottom: bottom + 30,
        gap: 20,
        paddingTop: 25
    }
})

export default memo(LimitInfo);
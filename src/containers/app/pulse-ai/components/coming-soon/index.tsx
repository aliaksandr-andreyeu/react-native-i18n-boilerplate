import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, BackHandler, View } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BottomSheetModal, BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { BaseImage, BaseText, BaseTextVariant, SheetBackdrop } from '@/components';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const {
    headerBar: { buttons: { activeOpacity, hitSlop } }
} = config

interface IComingSoonBottomSheet { };

const ComingSoonBottomSheet = forwardRef<Partial<BottomSheetModal>, IComingSoonBottomSheet>(({ }, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const navigation = useNavigation();
    const { bottom } = useSafeAreaInsets()

    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme, bottom);

    const sheetState = useRef<boolean>(false);
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const onAnimate = useCallback(() => {
        sheetState.current = true;
        setIsOpen(true)
    }, []);

    const onDismiss = useCallback(() => {
        sheetState.current = false;
        setIsOpen(false)
    }, []);

    const dismiss = useCallback(() => bottomSheetRef.current?.dismiss(), []);

    useImperativeHandle(ref, () => ({
        present: bottomSheetRef.current?.present,
        dismiss: bottomSheetRef.current?.dismiss
    }), [])

    useEffect(() => {
        if (!isOpen) return;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (sheetState.current) bottomSheetRef.current?.dismiss();
            else navigation.canGoBack() && navigation.goBack();
            return true;
        });

        return backHandler.remove;
    }, [isOpen]);


    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            onAnimate={onAnimate}
            onDismiss={onDismiss}
            enableDynamicSizing
            backdropComponent={SheetBackdrop}
            handleStyle={styles.handleStyle}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <BottomSheetView style={styles.sheetView}>
                <TouchableOpacity style={styles.closeButton} activeOpacity={activeOpacity} hitSlop={hitSlop} onPress={dismiss}  >
                    <SvgIcon size={IconSize.xxs} name={SvgXmlIconNames.close} color={theme.palette.background.interaction.basic.primary.default} />
                </TouchableOpacity>
                <View style={styles.header} >
                    <SvgIcon size={{ width: 27, height: 21.01 }} name={SvgXmlIconNames.recentTrades} color={'#FBBF24'} />
                    <BaseText variant={BaseTextVariant.captionSemiBold} >{t('screens.pulse.coming-soon.profitable-trades')}</BaseText>
                </View>
                <View style={styles.middleContainer} >
                    <View style={styles.middleTop} >
                        <BaseImage resizeMode='contain' source={images.rocket} style={styles.rocket} />
                        <BaseText variant={BaseTextVariant.extraSmallSemiBold} >{t('screens.pulse.coming-soon.coming-soon')}</BaseText>
                    </View>
                    <BaseText style={styles.middleText} variant={BaseTextVariant.extraSmall}>{t('screens.pulse.coming-soon.info')}</BaseText>
                    <BaseText style={styles.bottomText} variant={BaseTextVariant.extraSmallSemiBold}>{t('screens.pulse.coming-soon.stay-tuned')}</BaseText>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
});

const useStyles = ({
    palette: { icon, graphite }
}: UserTheme, bottom: number) => StyleSheet.create({
    handleStyle: {
        backgroundColor: graphite['050'],
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
    },
    handleIndicator: {
        backgroundColor: icon?.base?.tertiary
    },
    sheetView: {
        paddingTop: 8,
        paddingBottom: 40 + bottom,
        paddingLeft: 33,
        paddingRight: 22,
        backgroundColor: graphite['050']
    },
    closeButton: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    middleContainer: {
        marginLeft: 39,
        marginRight: 28,
        marginTop: 22
    },
    rocket: {
        width: 32,
        height: 32
    },
    middleTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7
    },
    middleText: {
        marginTop: 15
    },
    bottomText: {
        marginTop: 20
    }
});

export default ComingSoonBottomSheet;
import React, { forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, BackHandler, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components/atoms';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCommonStyles } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import sheetBackdrop from '../sheet-backdrop';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

interface IAccountDelete {
  type: 'cancel_delete_profile' | 'delete_profile';
  ref: Ref<BottomSheetModal>;
  navigation: StackNavigationProp<any>;
  onPress?: TouchableOpacityProps['onPress'];
  disable?: boolean;
  onSheetPress?(): void;
}

const {
  buttons: { activeOpacity }
} = config;

const AccountDelete = forwardRef<Partial<BottomSheetModal>, IAccountDelete>(
  ({ type, navigation, onPress, disable, onSheetPress }, ref) => {
    const { t } = useTranslation();

    const { top, bottom } = useSafeAreaInsets();

    const theme = useTheme();
    const styles = useStyles(theme);

    const sheetRef = useRef<BottomSheetModal>(null);
    const sheetIsOpen = useRef<boolean>(false);

    const onDismiss = useCallback(() => (sheetIsOpen.current = false), []);
    const onChange = useCallback(() => (sheetIsOpen.current = true), []);

    useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (sheetIsOpen.current) sheetRef.current?.dismiss();
        else if (navigation.canGoBack() && navigation.isFocused()) navigation.goBack();
        return true;
      });

      return backHandler.remove;
    }, [navigation]);

    useImperativeHandle(
      ref,
      () => ({
        present: sheetRef.current?.present,
        dismiss: sheetRef.current?.dismiss
      }),
      []
    );

    const actionText = useMemo(() => {
      return type === 'delete_profile'
        ? t('components.molecules.account-delete.delete-my-account')
        : t('components.molecules.account-delete.cancel-deletion');
    }, [type, t]);

    const onGoBack = useCallback(() => sheetRef.current?.dismiss(), []);

    return (
      <>
        {disable || (
          <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress} style={styles.container}>
            <View style={styles.top}>
              <BaseText style={styles.actionText}>{actionText}</BaseText>
              <SvgIcon color={theme.palette.graphite['600']} name={SvgXmlIconNames.chevronRight} size={IconSize.xsm} />
            </View>
            {type === 'cancel_delete_profile' && (
              <View style={styles.cancelInfoContainer}>
                <BaseText style={styles.info} variant={BaseTextVariant.tiny}>
                  {t('components.molecules.account-delete.delete-request-process')}
                </BaseText>
              </View>
            )}
          </TouchableOpacity>
        )}
        <BottomSheetModal
          ref={sheetRef}
          enableDynamicSizing
          onChange={onChange}
          onDismiss={onDismiss}
          handleIndicatorStyle={styles.indicator}
          backgroundStyle={styles.sheetBgStyle}
          backdropComponent={sheetBackdrop}
          enablePanDownToClose
          topInset={top}
        >
          <BottomSheetView style={styles.sheetContainer}>
            <View style={styles.sheetTop}>
              <BaseImage source={images.cancelImage} style={styles.image} />
              <View style={styles.textContainer}>
                <BaseText style={styles.textAlign} variant={BaseTextVariant.captionSemiBold}>
                  {t('components.molecules.account-delete.are-you-sure-delete')}
                </BaseText>
                <BaseText style={styles.textAlign}>
                  {t('components.molecules.account-delete.30-days-to-cancel')}
                </BaseText>
              </View>
            </View>
            <View style={[styles.btnContainer, { paddingBottom: 50 + bottom }]}>
              <BaseButton
                type={BaseButtonType.primary}
                fullWidth={true}
                size={BaseButtonSize.large}
                label={t('components.molecules.account-delete.yes-delete')}
                onPress={onSheetPress}
              />
              <BaseButton
                type={BaseButtonType.accent}
                fullWidth={true}
                size={BaseButtonSize.large}
                label={t('components.molecules.account-delete.go-back')}
                onPress={onGoBack}
              />
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </>
    );
  }
);

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { red, graphite, base, icon } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      paddingVertical: 12,
      borderRadius: 12,
      paddingHorizontal: 16,
      backgroundColor: base.white,
      marginHorizontal: 20,
      ...shadow6Style
    },
    actionText: {
      color: red['600']
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'space-between',
      paddingVertical: 12
    },
    cancelInfoContainer: {
      paddingVertical: 12
    },
    info: {
      color: graphite[500]
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetBgStyle: {
      borderRadius: 24,
      backgroundColor: graphite['050']
    },
    sheetContainer: {
      paddingTop: 24,
      gap: 48
    },
    textAlign: {
      textAlign: 'center'
    },
    sheetTop: {
      gap: 16
    },
    image: {
      width: '100%',
      height: 243
    },
    textContainer: {
      gap: 8,
      paddingHorizontal: 20
    },
    btnContainer: {
      paddingHorizontal: 20,
      gap: 12
    }
  });
};

export default memo(AccountDelete);

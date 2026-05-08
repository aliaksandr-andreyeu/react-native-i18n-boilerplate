import React, { forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { View, StyleSheet, BackHandler, ViewStyle, Share, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { SheetBackdrop } from '..';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useAppSelector } from '@/hooks';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';
import { useGetProfileQuery } from '@/store/api';
import { config } from '@/constants';

interface InviteFriendSheetProps {
  ref: Ref<BottomSheetModal>;
  navigation: StackNavigationProp<any>;
}

export interface InviteFriendSheetRef {
  present(): void;
  dismiss(): void;
}

const { isIOS } = config;

const InviteFriendSheet = forwardRef<InviteFriendSheetRef, InviteFriendSheetProps>(({ navigation }, ref) => {
  const { t } = useTranslation();

  const { bottom } = useSafeAreaInsets();

  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetIsOpen = useRef<boolean>(false);

  const theme = useTheme();
  const styles = useStyles(theme);

  const [isCopied, setIsCopied] = React.useState(false);

  const [getProfile, response] = useGetProfileQuery();

  const referralCode = useAppSelector((store) => store.amega.referralCode);

  const onDismiss = useCallback(() => {
    sheetIsOpen.current = false;
    setIsCopied(false);
  }, []);
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
      present: () => {
        sheetRef.current?.present();
        setIsCopied(false);
        getProfile();
      },
      dismiss: () => sheetRef.current?.dismiss()
    }),
    []
  );

  const bottomPadding = useMemo((): ViewStyle => ({ paddingBottom: 32 + bottom }), [bottom]);

  const handleCopyToClipboard = useCallback(() => {
    Clipboard.setString(`${referralCode}`);
    setIsCopied(true);
  }, [referralCode]);

  const handleShareReferral = useCallback(async () => {
    try {
      await Share.share({
        title: t('components.molecules.invite-sheet.join-amega'),
        message: t('components.molecules.invite-sheet.share-message', { referralCode })
      });
    } catch (error) {
      console.log('Error sharing referral code:', error);
    }
  }, [referralCode, t]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      onChange={onChange}
      onDismiss={onDismiss}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBgStyle}
      backdropComponent={SheetBackdrop}
      enablePanDownToClose
    >
      <BottomSheetView style={[styles.container, bottomPadding]}>
        <View style={styles.textContainer}>
          <BaseText variant={BaseTextVariant.captionSemiBold}>
            {t('components.molecules.invite-sheet.invite-friend')}
          </BaseText>
          <BaseText>{t('components.molecules.invite-sheet.share-referral')}</BaseText>
        </View>
        <View style={styles.box}>
          {response.isFetching ? (
            <ActivityIndicator
              color={theme.palette.graphite['900']}
              size={isIOS ? 'small' : 'large'}
              animating={true}
            />
          ) : (
            <BaseText style={styles.referralCode}>{referralCode || 'N/A'}</BaseText>
          )}
          <View style={styles.rightBox}>
            <TouchableOpacity onPress={handleCopyToClipboard}>
              <SvgIcon
                name={SvgXmlIconNames.copy}
                size={IconSize.md}
                color={isCopied ? '#D9DDE5' : theme.palette.green[400]}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
              <SvgIcon name={SvgXmlIconNames.shareIcon} size={IconSize.md} />
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const useStyles = ({ palette: { graphite, icon, base } }: UserTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 24,
      paddingHorizontal: 20,
      gap: 24
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetBgStyle: {
      borderRadius: 24,
      backgroundColor: graphite['050']
    },
    box: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: base?.white,
      padding: 16,
      borderColor: '#58616C',
      borderWidth: 0.3,
      borderRadius: 8
    },
    referralCode: {
      color: graphite[500],
      fontSize: 14
    },
    textContainer: {
      gap: 8
    },
    rightBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16
    },
    shareButton: {
      marginBottom: 2
    }
  });

export default memo(InviteFriendSheet);

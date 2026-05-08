import React, { forwardRef, memo, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { View, StyleSheet, Linking, BackHandler, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { SheetBackdrop } from '..';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components/atoms';
import { useAppSelector, useIntercom } from '@/hooks';
import dateHelper from '@/helpers/dateHelper';
import { StackNavigationProp } from '@react-navigation/stack';
import { images } from '@/assets';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export type ContactMessageType = 'email' | 'phone' | 'phone-correct';

export type DidNotReceiveActions = 'correct' | 'incorrect' | 'send-manual' | 'support';


interface IUnRecievedEmail {
  ref: Ref<BottomSheetModal>;
  navigation: StackNavigationProp<any>;
  type?: ContactMessageType;
  onAction?(type?: ContactMessageType, action?: DidNotReceiveActions): void;
}

export interface IUnRecievedRef {
  present(): void;
  dismiss(): void;
}

const createTemplate = (
  id: number,
  email: string,
  phone: string,
  registrationDate: Date | null,
  firstName: string,
  lastName: string,
  type?: ContactMessageType
) => {

  const isPhone = type === 'phone-correct';

  const text = `Hello Amega Team,

I registered an account on your platform, ${isPhone ? 'I am unable to complete phone verification' : 'but did not receive the email verification link'}. 

My account details:

Client ID: ${id}
${isPhone ? `Registered phone: ${phone}` : `Registered Email Address: ${email}`}
Date of Registration: ${dateHelper.to(registrationDate, 'DD/MM/YYYY')}

Please assist with my ${isPhone ? 'phone' : 'email address'} verification. 

Best regards,
${firstName} ${lastName}`;


  const prefix = `mailto:support@amegafx.com?subject=Manual%20${isPhone ? 'phone' : 'Email'}%20${isPhone ? 'verification' : 'Verification'}${isPhone ? '' : '%20Request'}&body=`;
  return prefix + encodeURIComponent(text);
};

let timeout: NodeJS.Timeout;
const UnRecievedEmail = forwardRef<IUnRecievedRef, IUnRecievedEmail>(({
  navigation,
  onAction,
  type = 'email'
}, ref) => {
  const { t } = useTranslation();

  const { bottom } = useSafeAreaInsets();

  const manualIsInProgress = useRef<boolean>(false);
  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetIsOpen = useRef<boolean>(false);

  const theme = useTheme();
  const styles = useStyles(theme);

  const { intercomPresent } = useIntercom();

  const { id, email, registrationDate, firstName, lastName, phone } = useAppSelector((store) => store.portfolio.userInfo);

  const onDismiss = useCallback(() => (sheetIsOpen.current = false), []);
  const onChange = useCallback(() => (sheetIsOpen.current = true), []);

  const isPhoneCorrectType = useMemo(() => type === 'phone-correct', [type]);

  const sheetText = useMemo(() => {
    let title = t('components.molecules.unreceived-email.info-caption');
    let subTitle = t('components.molecules.unreceived-email.info-desc');
    let buttonFirst = t('components.molecules.unreceived-email.send-manual');
    let buttonSecond = t('components.molecules.unreceived-email.contact-support');

    switch (type) {
      case 'phone':
        title = t('components.molecules.unreceived-email.phone-correct-title');
        break;

      case 'phone-correct':
        title = t('components.molecules.unreceived-email.did-not-receive-code');
        subTitle = t('components.molecules.unreceived-email.check-number', { number: phone });
        buttonFirst = t('components.molecules.unreceived-email.it-is-correct');
        buttonSecond = t('components.molecules.unreceived-email.it-is-not-correct');
        break;
    }

    return {
      title,
      subTitle,
      buttonFirst,
      buttonSecond
    }

  }, [t, type, phone]);


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
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss()
    }),
    []
  );

  const goToManualRequest = useCallback(() => {
    if (manualIsInProgress.current) return;
    onAction && onAction(type, isPhoneCorrectType ? 'correct' : 'send-manual')
    if (isPhoneCorrectType) return;
    requestAnimationFrame(() => {
      sheetRef.current?.dismiss();
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        try {
          manualIsInProgress.current = true;

          const mail = createTemplate(id, email, phone, registrationDate, firstName, lastName, type);
          if (!mail) return (manualIsInProgress.current = false);
          const canOpenLink = await Linking.canOpenURL(mail);
          if (!canOpenLink) return (manualIsInProgress.current = false);
          await Linking.openURL(mail);

          manualIsInProgress.current = false;
        } catch (error) {
          console.error(error);
          manualIsInProgress.current = false;
        }
      }, 300);
    });
  }, [id, email, registrationDate, firstName, lastName, type, phone, isPhoneCorrectType]);

  const openIntercom = useCallback(() => {
    onAction && onAction(type, isPhoneCorrectType ? 'incorrect' : 'support')
    if (isPhoneCorrectType) return;
    requestAnimationFrame(() => {
      sheetRef.current?.dismiss();
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        intercomPresent();
      }, 300);
    });
  }, [isPhoneCorrectType]);

  const bottomPadding = useMemo((): ViewStyle => ({ paddingBottom: 32 + bottom }), [bottom]);

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
        <View style={styles.topContainer}>
          <BaseImage resizeMode='contain' source={images.depositError} style={styles.img} />
          <View style={styles.textContainer}>
            <BaseText style={styles.textAlign} variant={BaseTextVariant.captionSemiBold}>
              {sheetText.title}
            </BaseText>
            <BaseText style={styles.textAlign}>{sheetText.subTitle}</BaseText>
          </View>
        </View>
        <View style={styles.btnContainer}>
          <BaseButton
            type={BaseButtonType.primary}
            fullWidth={true}
            size={BaseButtonSize.large}
            label={sheetText.buttonFirst}
            onPress={goToManualRequest}
          />
          <BaseButton
            type={BaseButtonType.link}
            fullWidth={true}
            size={BaseButtonSize.large}
            label={sheetText.buttonSecond}
            onPress={openIntercom}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const useStyles = ({ palette: { graphite, icon } }: UserTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 24,
      paddingHorizontal: 20,
      gap: 48
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },

    sheetBgStyle: {
      borderRadius: 24,
      backgroundColor: graphite['050']
    },
    btnContainer: {
      gap: 12
    },
    textAlign: {
      textAlign: 'center'
    },
    textContainer: {
      gap: 8
    },
    topContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    },
    img: {
      width: 90,
      height: 90,
      marginLeft: 15
    }
  });

export default memo(UnRecievedEmail);

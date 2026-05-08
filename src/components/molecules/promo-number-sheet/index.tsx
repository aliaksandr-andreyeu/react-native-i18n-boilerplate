import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseInput, BaseText, BaseTextVariant } from '@/components/atoms';
import CountryFlagIcon from '@/assets/icons/countries-flags';
import { BottomSheetModal, BottomSheetModalProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { SheetBackdrop } from '..';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import libphoneNumber, {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString
} from 'libphonenumber-js';
import { CountriesCode } from '@/assets/icons/countries-flags/types';
import { BounceIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface IBasePromoNumberSheet extends Omit<BottomSheetModalProps, 'children'> {
  completeWebinarRegistration(phone: string): void;
  children?: ReactNode;
  countryCode: string | undefined;
}

const getCountryFromCallingCode = (input: string) => {
  const numericCode = input.replace(/\D/g, '');

  return getCountries().find((country) => getCountryCallingCode(country) === numericCode) || '';
};

const isValidPhoneNumber = (phoneNumber: string) => {
  try {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);
    return parsedNumber && parsedNumber.isValid();
  } catch {
    return false;
  }
};

let timeout: NodeJS.Timeout;
const BasePromoNumberSheet = forwardRef<Partial<BottomSheetModal>, IBasePromoNumberSheet>(
  ({ completeWebinarRegistration, countryCode = '', ...props }, sheetRef) => {
    const { t } = useTranslation();

    const [phone, setPhone] = useState<string>('');
    const [country, setCountry] = useState<string>('');
    const [hasError, setHasError] = useState<boolean>(false);
    const isFirst = useRef<boolean>(true);

    const ref = useRef<BottomSheetModal>(null);

    const { top, bottom } = useSafeAreaInsets();

    const theme = useTheme();
    const styles = useStyles(theme);

    const extraPadding = useMemo(() => ({ paddingBottom: bottom + 34 }), [bottom]);

    useEffect(() => {
      const countryPhoneCode = getCountryCallingCode((countryCode?.toUpperCase?.() || 'US') as CountryCode);

      setCountry(countryCode.toLowerCase() || '');
      setPhone(`+${countryPhoneCode}`);
      isFirst.current = true;
    }, [countryCode]);

    useImperativeHandle(
      sheetRef,
      () => ({
        dismiss: ref.current?.dismiss,
        present: ref.current?.present
      }),
      []
    );

    const checkCountry = (value: string) => {
      const detectedCountry = getCountryFromCallingCode(value);
      if (detectedCountry && detectedCountry !== country) {
        setCountry(detectedCountry?.toLowerCase?.());
      }
      return detectedCountry;
    };

    const checkNumber = (value: string) => {
      checkCountry(value);

      const valid = isValidPhoneNumber(value) || false;

      setHasError(!valid);
      return valid;
    };

    const onChange = useCallback(
      (value: string) => {
        if (isFirst.current) isFirst.current = false;
        const currentValue = `+${value.replaceAll('+', '')}`;
        setPhone(currentValue);
        if (hasError) setHasError(false);

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const cCountry = checkCountry(currentValue);
          const resultCountry = libphoneNumber(currentValue)?.country || '';
          if (resultCountry && resultCountry !== cCountry) setCountry(resultCountry?.toLowerCase?.());
        }, 200);
      },
      [hasError]
    );

    const checkAndComplete = useCallback(() => {
      const isValid = checkNumber(phone);
      if (!isValid) return;
      completeWebinarRegistration(phone);
    }, [phone, checkNumber]);

    const renderIcon = useMemo(() => {
      return country && phone.length > 2;
    }, [country, phone]);

    const onBlur = useCallback(() => {
      const valid = checkNumber(phone);
      if (!valid) setHasError(true);
    }, [phone]);

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.indicator}
        enablePanDownToClose
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        backdropComponent={SheetBackdrop}
        enableDismissOnClose
        topInset={top}
        {...props}
      >
        <BottomSheetView style={[styles.sheetView, extraPadding]}>
          <View style={styles.gap24}>
            <BaseText variant={BaseTextVariant.captionSemiBold}>{t('screens.promo-details.enter-phone')}</BaseText>
            <View style={styles.gap12}>
              <BaseInput
                title={t('screens.promo-details.phone')}
                placeholder='+1234567890'
                enableButtonsAnimation={phone.length > 1}
                value={phone}
                onBlur={onBlur}
                error={hasError}
                rightIcon={
                  renderIcon && (
                    <CountryFlagIcon
                      key={country}
                      entering={BounceIn.delay(200)}
                      exiting={FadeOut.duration(200)}
                      style={styles.iconStyle}
                      name={country as CountriesCode}
                      width={20}
                      height={20}
                    />
                  )
                }
                required
                onChange={onChange}
                keyboardType='phone-pad'
                dataDetectorTypes='phoneNumber'
                isBottomSheet
              />
              <BaseText style={styles.error}>
                {hasError ? t('screens.promo-details.phone-not-valid') : `${' '}`}
              </BaseText>
            </View>
          </View>
          <BaseButton
            style={styles.margin}
            onPress={checkAndComplete}
            label={t('screens.promo-details.complete-registration')}
            size={BaseButtonSize.large}
            type={BaseButtonType.primary}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const useStyles = ({ palette: { graphite, red, icon } }: UserTheme) =>
  StyleSheet.create({
    sheetView: {
      backgroundColor: graphite['050'],
      paddingHorizontal: 20,
      paddingTop: 20
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    handle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    iconStyle: {
      marginTop: 11,
      marginRight: 12,
      width: 20,
      height: 20
    },
    gap12: { gap: 12 },
    gap24: {
      gap: 24
    },
    error: { color: red['600'] },
    margin: {
      marginTop: 24
    }
  });

export default BasePromoNumberSheet;

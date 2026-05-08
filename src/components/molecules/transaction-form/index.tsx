import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacityProps, TouchableOpacity, InteractionManager } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { BaseText, BaseTextVariant, BaseHelpButton } from '@/components';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import Animated, {
  CurvedTransition,
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  ZoomIn,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import getCurrency, { Currencies } from '@/helpers/currency';
import { useTranslation } from 'react-i18next';
import { decode } from 'html-entities';
import { formatTwoDecimals } from '@/helpers';

const {
  buttons: { activeOpacity }
} = config;

export interface TransactionFormProps {
  feeDescription: string;
  feeAmount?: string;
  onChevronPress: TouchableOpacityProps['onPress'];
  selectedCurrency: Currencies;
  hasDropDown: boolean;
  hasCalculatedAmount: boolean;
  calculatedValue: string;
  onAmoutChange(val: string): void;
  amount: string | undefined;
  error?: string;
  placeholder: string;
  isWithdrawal?: boolean;
  limitsInfo: string;
  maxLimitError: boolean;
  showErrorAsInfo?: boolean;
  pendigError?: string;
  calculatedDecimalPlaces?: string | undefined | number;
  hideAnim?: boolean;
}

export interface IDropDownCurrency {
  onChevronPress: TouchableOpacityProps['onPress'];
  selectedCurrency: Currencies;
  hasDropDown: boolean;
  hideAnim: boolean;
}

const TransactionForm = ({
  feeDescription,
  feeAmount,
  onChevronPress,
  selectedCurrency,
  hasDropDown,
  onAmoutChange,
  amount,
  error = '',
  calculatedValue,
  placeholder,
  isWithdrawal = false,
  limitsInfo,
  maxLimitError = false,
  calculatedDecimalPlaces,
  pendigError = '',
  hideAnim = true
}: TransactionFormProps) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const anim = useSharedValue(0);

  const { t } = useTranslation();

  const inputRef = useRef<TextInput>(null);

  const { palette } = theme || {};
  const { icon } = palette || {};

  const hasError = useMemo(() => error.length > 0, [error]);

  useEffect(() => {
    anim.value = withTiming(hasError ? 1 : 0, { duration: 500 });
  }, [hasError]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
  }, []);

  const amountContainerErrorStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(anim.value, [0, 1], ['transparent', theme.palette.red['600']]);
    const padding = interpolate(anim.value, [0, 1], [16, 15]);

    return {
      borderWidth: anim.value,
      borderColor,
      padding
    };
  }, [theme.dark]);

  const DropDownCurrency = useCallback(
    ({ hasDropDown, selectedCurrency, onChevronPress }: IDropDownCurrency) => {
      return (
        <TouchableOpacity
          style={styles.dropdown}
          activeOpacity={activeOpacity}
          hitSlop={5}
          disabled={!hasDropDown}
          onPress={onChevronPress}
        >
          <Animated.View
            layout={CurvedTransition}
            key={selectedCurrency}
            entering={hideAnim ? undefined : FadeInUp}
            exiting={hideAnim ? undefined : FadeOutDown}
          >
            <BaseText style={styles.currency}>{selectedCurrency}</BaseText>
          </Animated.View>
          {hasDropDown && (
            <Animated.View layout={CurvedTransition}>
              <SvgIcon name={SvgXmlIconNames.chevronDown} size={IconSize.sm} />
            </Animated.View>
          )}
        </TouchableOpacity>
      );
    },
    [theme.dark]
  );

  const SimpleCurrency = useCallback(({ currency = 'USD' }: { currency?: string }) => {
    return <BaseText style={styles.currency}>{currency}</BaseText>;
  }, []);

  const dynamic = (
    <DropDownCurrency
      hideAnim={hideAnim}
      hasDropDown={hasDropDown}
      onChevronPress={onChevronPress}
      selectedCurrency={selectedCurrency}
    />
  );

  const staticCurrency = <SimpleCurrency />;

  const handleDecimalPlace = (amount: string | undefined, decimalPlace: number | string | undefined) => {
    if (decimalPlace === undefined) return amount;
    if (amount === undefined) return '';

    return (+amount).toFixed(+decimalPlace);
  };

  const handledCalculatedValue = useMemo(
    () => handleDecimalPlace(calculatedValue, calculatedDecimalPlaces),
    [calculatedValue, calculatedDecimalPlaces]
  );

  return (
    <View style={styles.container}>
      <Animated.View layout={CurvedTransition} style={[styles.card, amountContainerErrorStyle]}>
        <View style={styles.top}>
          <View style={styles.horizontal}>
            <SvgIcon name={SvgXmlIconNames.bankCard} />
            {isWithdrawal ? staticCurrency : dynamic}
          </View>
          <View style={styles.inputContainerStyle}>
            <TextInput
              value={amount}
              returnKeyType='done'
              ref={inputRef}
              selectionColor={palette.purple[300]}
              keyboardType='numeric'
              onChangeText={onAmoutChange}
              cursorColor={palette.purple[300]}
              textAlign='right'
              style={[styles.input, hasError && styles.error]}
              placeholder={placeholder}
              placeholderTextColor={hasError ? palette.red['600'] : '#8fa6ae'}
            />
          </View>
        </View>
        <View style={styles.bottom}>
          <Animated.View layout={CurvedTransition}>
            <BaseText variant={BaseTextVariant.authSmall}>
              {isWithdrawal
                ? t('components.molecules.transaction-form.withdraw-amount')
                : t('components.molecules.transaction-form.deposit-amount')}
            </BaseText>
          </Animated.View>
          {hasError && (
            <Animated.View style={styles.errorContainer} entering={FadeIn} exiting={FadeOut}>
              <BaseText style={[styles.error, styles.align]}>{error}</BaseText>
            </Animated.View>
          )}
        </View>
      </Animated.View>
      <Animated.View
        layout={CurvedTransition}
        key={`${limitsInfo}-${pendigError}`}
        entering={FadeInUp}
        exiting={FadeOutDown}
        style={styles.middle}
      >
        <BaseText
          variant={BaseTextVariant.small}
          style={[styles.info, (!!pendigError.length || maxLimitError) && styles.error]}
        >
          {pendigError || limitsInfo}
        </BaseText>
      </Animated.View>
      {Boolean(feeAmount) ? (
        <Animated.View style={styles.feeTooltipBox} layout={CurvedTransition} entering={FadeInUp} exiting={FadeOutDown}>
          <View style={styles.feeTooltipContent}>
            <BaseText variant={BaseTextVariant.small} style={styles.feeTitle}>
              {t('screens.wallet.psp-fee')}
            </BaseText>
            <BaseHelpButton text={t('screens.wallet.psp-fee-tooltip')} color={icon.base.secondary} />
          </View>
          <BaseText variant={BaseTextVariant.small} style={styles.feeDesc}>
            {decode('&asymp;&nbsp;')}
            {isWithdrawal
              ? `${getCurrency(selectedCurrency).text(formatTwoDecimals(feeAmount))}`
              : `$${formatTwoDecimals(feeAmount)}`}
          </BaseText>
        </Animated.View>
      ) : null}
      <Animated.View layout={CurvedTransition} entering={ZoomIn}>
        <View style={[styles.card]}>
          <View style={styles.top}>
            <Animated.View style={styles.horizontal}>
              <SvgIcon name={SvgXmlIconNames.bankCard} />
              {isWithdrawal ? dynamic : staticCurrency}
            </Animated.View>
            <View style={styles.inputContainerStyle}>
              <BaseText variant={BaseTextVariant.captionSemiBold}>{`${
                isWithdrawal
                  ? `${getCurrency(selectedCurrency).text(formatTwoDecimals(handledCalculatedValue))}`
                  : `$${formatTwoDecimals(handledCalculatedValue)}`
              }`}</BaseText>
            </View>
          </View>
          <BaseText variant={BaseTextVariant.authSmall}>
            {t('components.molecules.transaction-form.credited-amount')}
          </BaseText>
        </View>
      </Animated.View>
      <Animated.View style={styles.feeBox} layout={CurvedTransition} entering={FadeInUp} exiting={FadeOutDown}>
        <BaseText variant={BaseTextVariant.small} style={[styles.info, styles.margin8]}>
          {feeDescription}
        </BaseText>
      </Animated.View>
      {/* {staticCurrency} */}
      {/* <View style={styles.index}>
        {(isLoading || hasCalculatedAmount) && (
          <Animated.View
            layout={CurvedTransition}
            style={[styles.checkIconWrap, { backgroundColor: 'transparent' }]}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
          >
            <ActivityIndicator color={palette.purple[800]} size={'small'} />
          </Animated.View>
        )}
        {isLoading || !hasCalculatedAmount || (
          <Animated.View
            layout={CurvedTransition}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
            style={[styles.checkIconWrap]}
          >
            <SvgIcon name={SvgXmlIconNames.arrowRight} size={IconSize.sm} />
          </Animated.View>
        )}
      </View> */}
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { text } = palette || {};

  const { shadow0Style, shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    feeBox: {
      marginTop: 4
    },
    feeTooltipBox: {
      marginTop: 16,
      marginBottom: 12,
      paddingHorizontal: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    feeTooltipContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 4
    },
    feeTitle: {
      color: text.base.tertiary
    },
    feeDesc: {
      color: text.base.primary
    },
    container: {
      paddingHorizontal: 20
    },
    middle: {
      paddingHorizontal: 4,
      paddingTop: 8,
      paddingBottom: 20
    },
    currency: {
      marginLeft: 4
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    inputContainerStyle: {
      flex: 1,
      borderWidth: 0,
      alignItems: 'flex-end',
      marginLeft: 10,
      ...shadow0Style
    },
    card: {
      padding: 16,
      gap: 12,
      backgroundColor: palette.base.white,
      borderRadius: 12,
      zIndex: 0,
      ...shadow6Style
    },
    top: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    checkIconWrap: {
      position: 'absolute',
      zIndex: 1,
      top: -5,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      alignSelf: 'center',
      backgroundColor: palette.purple['100'],
      transform: [{ rotate: '90deg' }]
    },
    input: {
      ...BaseTextVariant.captionSemiBold,
      color: palette.graphite['900'],
      margin: 0,
      padding: 0,
      width: '100%'
    },
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    error: {
      color: palette.red['600']
    },
    align: {
      textAlign: 'right'
    },
    errorContainer: {
      flex: 1,
      alignItems: 'flex-end',
      marginLeft: 20
    },
    bottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    index: { zIndex: 10 },
    info: {
      color: '#5D7278',
      textAlign: 'left',
      marginTop: 4
    },
    margin8: {
      marginTop: 8,
      marginHorizontal: 4
    }
  });
};

export default memo(TransactionForm);

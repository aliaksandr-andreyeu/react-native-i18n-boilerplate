import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StackActions, useFocusEffect, useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import { StackScreenProps } from '@react-navigation/stack';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { BaseBackButton, BaseButton, BaseButtonLoading, BaseButtonSize, BaseButtonType, BaseFormField, BaseText, BaseTextVariant, BaseToastVariant, KeyboardDismissButton } from '@/components';
import libphoneNumber, { CountryCode, getCountries, getCountryCallingCode, parsePhoneNumberFromString, } from 'libphonenumber-js';
import { Controller, ControllerRenderProps, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { CountriesCode } from '@/assets/icons/countries-flags/types';
import CountryFlagIcon from '@/assets/icons/countries-flags';
import { BounceIn, FadeOut } from 'react-native-reanimated';
import { useToast } from '@/providers';
import { ActionType, useChangePhoneMutation, usePinSend, useProfileQuery } from '@/store/api';
import { actions } from '@/store';


const {
    verification: { decrementRemainingSeconds,
        startCountdown, resetCountdown }
} = actions

type PhoneVerificationScreenProps = StackScreenProps<CommonRootParamsList, COMMON_ROUTE_NAMES.ChangePhone>;

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


let firstTime = true;
let intervalId: ReturnType<typeof setInterval> | undefined = undefined;
let timeout: NodeJS.Timeout
const ChnagePhoneScreen: React.FC<PhoneVerificationScreenProps> = ({ route, navigation }) => {

    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    const { openToast } = useToast()

    const [phoneCountry, setPhoneCountry] = useState<string>('');
    const [error, setError] = useState<string>('');

    const userInfo = useAppSelector(store => store.portfolio.userInfo);
    const { remainingSeconds } = useAppSelector((state) => state.verification);


    const [getProfile, { isFetching: profileLoading }] = useProfileQuery()
    const [changePhone, { isLoading: changePhoneLoading }] = useChangePhoneMutation();
    const [sendPin, sendPinResponse] = usePinSend();
    const { isSuccess, isLoading: pinLoading, isError } = sendPinResponse || {};

    const dispatch = useAppDispatch();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        setError: setControlError,
        clearErrors: clearControlError,
    } = useForm({
        mode: 'onChange',
        defaultValues: { pin: '', phone: '' },
    });

    const { pin, phone } = watch();

    const resendPin = useCallback(() => sendPin({ action: ActionType.PHONE, method: 'email' }), []);

    useEffect(() => {
        if (remainingSeconds === 0 && firstTime) {
            firstTime = false;
            resendPin();
        }
    }, [resendPin, remainingSeconds, firstTime]);


    const loadTimer = () => {
        if (remainingSeconds === 0) {
            return;
        }
        intervalId && clearInterval(intervalId);

        intervalId = setInterval(() => {
            dispatch(decrementRemainingSeconds());
        }, 1000);
    };

    const startTimer = () => {
        dispatch(startCountdown());

        intervalId && clearInterval(intervalId);

        intervalId = setInterval(() => {
            dispatch(decrementRemainingSeconds());
        }, 1000);
    };

    const resetTimer = () => {
        if (remainingSeconds > 0) {
            return;
        }

        intervalId && clearInterval(intervalId);

        dispatch(resetCountdown());
    };

    const errorResponseHandler = () => {
        if (!isError) {
            return;
        }
        const { error } = sendPinResponse || {};
        if (!error) {
            return null;
        }
        const { message } = (error || {}) as { message: string };
        setError(message || t('errors.common'));
    };

    const successResponseHandler = () => {
        if (!isSuccess) {
            return;
        }
        startTimer();
    };

    useLayoutEffect(() => {
        errorResponseHandler();
    }, [isError, sendPinResponse?.error, t]);

    useLayoutEffect(() => {
        successResponseHandler();
    }, [isSuccess]);


    useFocusEffect(
        useCallback(() => {
            loadTimer();
            resetTimer();
            return () => {
                intervalId && clearInterval(intervalId);
            };
        }, [route, navigation, remainingSeconds])
    );

    useEffect(() => {
        const countryPhoneCode = getCountryCallingCode((userInfo.country?.toUpperCase?.() || 'US') as CountryCode);

        setPhoneCountry(userInfo.country.toLowerCase() || '');
        setValue('phone', `+${countryPhoneCode}`);
    }, [userInfo.country]);


    const checkCountry = (value: string) => {
        const detectedCountry = getCountryFromCallingCode(value);
        if (detectedCountry && detectedCountry !== phoneCountry) {
            setPhoneCountry(detectedCountry?.toLowerCase?.());
        }
        return detectedCountry;
    };


    const checkNumber = (value: string) => {
        checkCountry(value);
        const valid = isValidPhoneNumber(value) || false;
        !valid && setControlError('phone', { message: t('screens.promo-details.phone-not-valid') });
        return valid;
    };


    const onChangePhone = useCallback((value: string) => {
        const currentValue = `+${value.replace(/[^0-9]/g, '')}`;
        setValue('phone', currentValue);
        if (errors.phone?.message) clearControlError('phone');
        if (error) setError('');
        if (currentValue === userInfo.phone) setControlError('phone', { message: t('screens.change-phone.same-phone') });
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const cCountry = checkCountry(currentValue);
            const resultCountry = libphoneNumber(currentValue)?.country || '';
            if (resultCountry && resultCountry !== cCountry) setPhoneCountry(resultCountry?.toLowerCase?.());
        }, 200);
    }, [errors?.phone?.message, userInfo.phone]);

    const renderIcon = phoneCountry && phone.length > 2;

    const onSubmit = async (data: { pin: string; phone: string }) => {
        try {
            const isValidNumber = checkNumber(data.phone);
            if (!isValidNumber) return;

            const { phone: dataPhone, pin: dataPin } = data;
            const res = await changePhone({ phone: dataPhone, pin: dataPin }).unwrap();

            if (!res.result) return

            await getProfile().unwrap();

            openToast({
                title: t('screens.change-phone.phone-updated'),
                type: BaseToastVariant.success
            });

            if (navigation.canGoBack() && navigation.isFocused()) navigation.dispatch(StackActions.pop(2))

        } catch (error: any) {
            console.error(error)
            const errorChildren = error?.data?.errors?.children;
            const pinError = errorChildren?.pin?.errors?.[0] || ''
            const phoneError = errorChildren?.phone?.errors?.[0] || '';
            if (pinError) setControlError('pin', { message: pinError });
            if (phoneError) setControlError('phone', { message: phoneError });
        }

    };

    const onPhoneBlur = useCallback((value: string, blur: any) => {
        blur && blur()
        const valid = checkNumber(value);
        if (!valid) setControlError('phone', { message: t('screens.promo-details.phone-not-valid') });
    }, [t]);


    const rightIcon = useMemo(() => {
        return renderIcon && (
            <CountryFlagIcon
                key={phoneCountry}
                entering={BounceIn.delay(200)}
                exiting={FadeOut.duration(200)}
                style={styles.iconStyle}
                name={phoneCountry as CountriesCode}
                width={20}
                height={20}
            />
        )
    }, [renderIcon, phoneCountry, theme.dark])


    const RenderPhone = useCallback(({ field: { onBlur, value } }:
        { field: ControllerRenderProps<{ pin: string; phone: string }, 'phone'> }
    ) => (
        <BaseFormField
            returnKeyType='done'
            hideClearButton
            error={errors.phone?.message}
            onBlur={() => onPhoneBlur(value, onBlur)}
            enableButtonsAnimation={value?.length > 1}
            onChange={onChangePhone as any}
            keyboardType='phone-pad'
            dataDetectorTypes='phoneNumber'
            rightIcon={rightIcon}
            value={value}
            title={t('screens.change-phone.new-phone')}
            placeholder='+123 000 000'
            required
        />
    ), [errors.phone?.message, onPhoneBlur, onChangePhone, rightIcon, theme.dark, t])


    const changePhoneIsDisabled = useMemo(() => !pin?.length || !phone?.length || !!errors.phone?.message || !!errors.pin?.message || changePhoneLoading || profileLoading, [pin, phone, errors.phone?.message, errors.pin?.message, changePhoneLoading])

    const isResendDisabled = useMemo(() => Boolean(remainingSeconds > 0) || pinLoading, [remainingSeconds, pinLoading]);

    const resendButtonLabel = useMemo(() => {
        if (remainingSeconds) {
            return t('screens.change-phone.resend-pin-in', { time: remainingSeconds });
        }
        return t('screens.change-phone.resend-pin');
    }, [remainingSeconds, t]);


    return (
        <SafeAreaView style={styles.safe}>
            <BaseBackButton isChevron={false} />
            <View style={styles.container} >
                <View>
                    <View style={styles.headText} >
                        <BaseText variant={BaseTextVariant.authSubTitle} >{t('screens.change-phone.change-phone-number')}</BaseText>
                        <BaseText style={styles.desc} variant={BaseTextVariant.small} >{t('screens.change-phone.desc', { email: userInfo.email })}</BaseText>
                    </View>
                    <View style={styles.inputs} >
                        <Controller
                            name='pin'
                            control={control}
                            rules={{ required: t('errors.required') }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <BaseFormField
                                    returnKeyType='done'
                                    error={errors.pin?.message}
                                    onBlur={onBlur}
                                    onChange={onChange}
                                    value={value}
                                    title={t('screens.phone-verification.pin-sent')}
                                    placeholder='123456'
                                    required
                                />
                            )}
                        />
                        <Controller
                            name='phone'
                            control={control}
                            rules={{ required: t('errors.required') }}
                            render={RenderPhone}
                        />
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <BaseButton
                        type={BaseButtonType.primary}
                        size={BaseButtonSize.large}
                        loading={changePhoneLoading}
                        loadingType={BaseButtonLoading.ellipsis}
                        disabled={changePhoneIsDisabled}
                        onPress={handleSubmit(onSubmit)}
                        label={t('screens.change-phone.change-phone-number')}
                    />
                    <BaseButton
                        type={BaseButtonType.accent}
                        loadingType={BaseButtonLoading.ellipsis}
                        size={BaseButtonSize.large}
                        disabled={isResendDisabled}
                        loading={pinLoading}
                        onPress={resendPin}
                        label={resendButtonLabel}
                    />
                </View>
            </View>
            <KeyboardDismissButton disabled={changePhoneIsDisabled} onPress={handleSubmit(onSubmit)} />
        </SafeAreaView>
    )
};

const useStyles = ({
    palette: { text }
}: UserTheme) => StyleSheet.create({
    safe: {
        flex: 1,
        flexGrow: 1
    },
    container: {
        marginHorizontal: 20,
        justifyContent: 'space-between',
        flex: 1
    },
    inputs: {
        paddingVertical: 16,
        gap: 12,
    },
    headText: {
        paddingVertical: 12,
        gap: 8,
    },
    buttonContainer: {
        marginBottom: 34,
        gap: 12
    },
    desc: {
        color: text.title.secondary
    },
    iconStyle: {
        marginTop: 11,
        marginRight: 12,
        width: 20,
        height: 20
    }
});

export default ChnagePhoneScreen;
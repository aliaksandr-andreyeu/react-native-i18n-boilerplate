import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from '@/navigation/app/stacks';
import { config } from '@/constants';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Pressable
} from 'react-native';
import {
    BaseText,
    BaseTextVariant,
    BaseButton,
    BaseButtonSize,
    BaseButtonType,
    BaseImage,
    BaseButtonLoading
} from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';

import { FacebookSignInFrom, useAppDispatch, useAppSelector, useFacebookSignIn } from '@/hooks';
import useStyles from './styles';
import { SocialService } from '@/types';
import { googleSignIn, setStoredLastAuthAction } from '@/helpers';
import useAsyncStorage from '@/hooks/asyncstorage';
import { FacebookData } from '@/hooks/auth/use-facebook-signin';

const {
    components: {
        buttons: { activeOpacity }
    },
    isAndroid,

} = config;


type BonusSignUpProps = StackScreenProps<ParamListBase & AuthRootParamsList, AUTH_ROUTE_NAMES.BonusSignUp>;

const BonusSignUpScreen: FC<BonusSignUpProps> = ({ route, navigation }) => {

    const goID = route?.params?.goID;


    const { t } = useTranslation();

    const theme = useTheme();
    const styles = useStyles(theme);
    const { facebookSignIn, facebookData } = useFacebookSignIn({ from: FacebookSignInFrom.signUp, navigation });

    const { set, get } = useAsyncStorage<'last-social-click-page'>()

    const common = useAppSelector((store) => store.common);
    const { config } = common || {};
    const { socialAuth } = config || {};

    const isSocialAuthEnabled = useMemo(() => {
        if (isAndroid) return socialAuth.android;
        return socialAuth.ios;
    }, [isAndroid, socialAuth]);


    const goToSignIn = () => {
        navigation.navigate(AUTH_ROUTE_NAMES.SignIn);
    };

    const goToSignUpIntro = useCallback((hasBonus: boolean) => () => {
        navigation.navigate(AUTH_ROUTE_NAMES.SignUp, { hasBonus, goID });
    }, [goID]);


    const signUpWithFacebook = useCallback(async () => {
        setStoredLastAuthAction('sign-up')
        set('last-social-click-page', 'sign-up-bonus');
        facebookSignIn();
    }, []);

    const signUpWithGoogle = useCallback(async () => {
        try {
            setStoredLastAuthAction('sign-up')
            const userInfo = await googleSignIn();

            const { serverAuthCode, user } = userInfo || {};
            const { givenName = '', familyName = '', email = '' } = user || {};

            const firstName = givenName?.trim() || '';
            const lastName = familyName?.trim() || '';

            if (!serverAuthCode || !email) return;

            const routeData = {
                email,
                first_name: firstName,
                last_name: lastName,
                code: serverAuthCode,
                service: SocialService.google,
                goID
            };
            navigation.navigate(AUTH_ROUTE_NAMES.CompleteSignUp, routeData);
        } catch (error) {
            console.error(error);
        }
    }, [navigation, goID]);

    useEffect(() => {
        const handleFacebookData = async (fbData: FacebookData) => {
            try {
                const lastClickedScreen = await get('last-social-click-page');
                if (!fbData.code || lastClickedScreen !== 'sign-up') return;
                if (!fbData?.email)
                    return navigation.navigate(AUTH_ROUTE_NAMES.EmailSignUp, {
                        state: 0,
                        code: fbData.code,
                        service: SocialService.facebook,
                        goID
                    });
                fbData.last_name = fbData.last_name?.trim() || '';
                fbData.first_name = fbData.first_name?.trim() || '';
                const routeData = { ...fbData, service: SocialService.facebook };
                navigation.navigate(AUTH_ROUTE_NAMES.CompleteSignUp, routeData);
            } catch (error) {
                console.error(error);
            }
        };

        if (facebookData) handleFacebookData(facebookData);
    }, [facebookData, navigation, goID]);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scrollContent} >
                <View style={styles.header} >
                    <BaseText variant={BaseTextVariant.header} >{t('screens.bonus-signup.create-your-account')}</BaseText>
                    <BaseText variant={BaseTextVariant.text} >{t('screens.bonus-signup.choose-method')}</BaseText>
                </View>
                <Pressable onPress={goToSignUpIntro(true)} style={styles.giftboxContainer} >
                    <View>
                        <BaseImage resizeMode='contain' style={styles.gbImage} source={images.giftBox} />
                    </View>
                    <View  >
                        <BaseText variant={BaseTextVariant.captionSemiBold} >{t('screens.bonus-signup.get-bonus')}</BaseText>
                        <BaseText style={styles.newUser} variant={BaseTextVariant.small} >{t('screens.bonus-signup.available-only-new-users')}</BaseText>
                    </View>
                </Pressable>
                <BaseText variant={BaseTextVariant.small} style={styles.bonusInfo} >{t('screens.bonus-signup.bonus-applies-all-methods')}</BaseText>
                <BaseButton
                    label={t('screens.bonus-signup.create-account')}
                    type={BaseButtonType.primary}
                    onPress={goToSignUpIntro(false)}
                    style={styles.createAccount}
                />
                <View style={styles.orContainer} >
                    <View style={styles.stick} />
                    <BaseText style={styles.or} >{t('screens.bonus-signup.or')}</BaseText>
                    <View style={styles.stick} />
                </View>
                <View style={styles.socialButtons} >
                    {isSocialAuthEnabled &&
                        <>
                            <BaseButton
                                label={t('screens.bonus-signup.continue-with-facebook')}
                                type={BaseButtonType.facebook}
                                size={BaseButtonSize.large}
                                icon={<SvgIcon name={SvgXmlIconNames.facebookColor} size={IconSize.sm} />}
                                loadingType={BaseButtonLoading.ellipsis}
                                onPress={signUpWithFacebook}
                            />
                            <BaseButton
                                label={t('screens.bonus-signup.continue-with-google')}
                                type={BaseButtonType.google}
                                size={BaseButtonSize.large}
                                icon={<SvgIcon name={SvgXmlIconNames.googleColor} size={IconSize.sm} />}
                                loadingType={BaseButtonLoading.ellipsis}
                                onPress={signUpWithGoogle}
                            />
                        </>
                    }
                    <View style={styles.haveAccount} >
                        <BaseText
                            variant={BaseTextVariant.extraSmall}
                            style={styles.haveAccountText} >
                            {t('screens.bonus-signup.already-have-account')}
                        </BaseText>
                        <TouchableOpacity onPress={goToSignIn} hitSlop={10} activeOpacity={activeOpacity} >
                            <BaseText style={styles.login} variant={BaseTextVariant.extraSmall} >{t('screens.bonus-signup.login')}</BaseText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default BonusSignUpScreen;
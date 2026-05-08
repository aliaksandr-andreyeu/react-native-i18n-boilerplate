import React, { memo, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { useTranslation } from 'react-i18next';
import { images } from '@/assets';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components/atoms';

export type BlackBannerTypes = 'sign-up' | 'verification' | 'fund-now' | 'transfer' | 'explore' | 'null';

interface IBaseBlackBanner {
    type: BlackBannerTypes;
    style?: ViewStyle;
    onPress?(): void;
};

const BaseBlackBanner: React.FC<IBaseBlackBanner> = ({
    type,
    style,
    onPress
}) => {

    const { t } = useTranslation();

    const theme = useTheme();
    const styles = useStyles(theme);


    const banner = useMemo(() => {
        const bannerData = {
            title: '',
            subTitle: '',
            button: '',
            image: undefined
        }

        switch (type) {
            case 'sign-up':
                bannerData.title = t('components.molecules.banner.next-step');
                bannerData.subTitle = t('components.molecules.banner.create-account');
                bannerData.button = t('components.molecules.banner.sign-up');
                bannerData.image = images.idCard
                break;

            case 'verification':
                bannerData.title = t('components.molecules.banner.next-step');
                bannerData.subTitle = t('components.molecules.banner.complete-verification-sub');
                bannerData.button = t('components.molecules.banner.complete-verification');
                bannerData.image = images.verificationKey
                break;

            case 'fund-now':
                bannerData.title = t('components.molecules.banner.next-step');
                bannerData.subTitle = t('components.molecules.banner.deposit-kickstart');
                bannerData.button = t('components.molecules.banner.fund-now');
                bannerData.image = images.safe
                break;

            case 'transfer':
                bannerData.title = t('components.molecules.banner.next-step');
                bannerData.subTitle = t('components.molecules.banner.transfer-funds-sub');
                bannerData.button = t('components.molecules.banner.transfer-funds-now');
                bannerData.image = images.rocket
                break;

            case 'explore':
                bannerData.title = t('components.molecules.banner.start-trading');
                bannerData.subTitle = t('components.molecules.banner.hooray');
                bannerData.button = t('components.molecules.banner.explore-signals');
                bannerData.image = images.barChart
                break;
        }

        return bannerData

    }, [t, type])

    if (type === 'null') return null;

    return (
        <Pressable android_disableSound style={[styles.container, style]}>
            <View style={styles.top} >
                <BaseText testID={testIDs.components.molecules.baseBlackBanner.bannerTitle} style={styles.text} variant={BaseTextVariant.titleXXS} >{banner.title}</BaseText>
                <BaseText style={styles.text} >{banner.subTitle}</BaseText>
            </View>
            <View style={styles.bottom} >
                <BaseButton
                    testID={testIDs.components.molecules.baseBlackBanner.bannerButton}
                    size={BaseButtonSize.extraSmall}
                    type={BaseButtonType.accent}
                    style={styles.button}
                    label={banner.button}
                    labelStyle={styles.labelStyle}
                    onPress={onPress}
                />
            </View>
            <View style={[styles.imageContainer, { right: ['verification', 'transfer'].includes(type) ? -20 : -15 }]} >
                <BaseImage testID={testIDs.components.molecules.baseBlackBanner.bannerImage} resizeMode='contain' source={banner.image} style={styles.image} />
            </View>
        </Pressable>
    )
};

const useStyles = ({
    palette: { background, text }
}: UserTheme) => StyleSheet.create({
    container: {
        borderRadius: 12,
        backgroundColor: background.card.secondary,
        width: '100%',
    },
    top: {
        gap: 8,
        paddingLeft: 20,
        paddingRight: 85,
        paddingTop: 20,
        paddingBottom: 16,
    },
    bottom: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    labelStyle: {
        color: text.interaction.basic.tertiary.default
    },
    image: {
        width: 90,
        height: 90,
    },
    button: {
        backgroundColor: background.interaction.positive.default,
        alignSelf: 'flex-start'
    },
    text: {
        color: text.base.inverted
    },
    imageContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    }
});

export default memo(BaseBlackBanner);
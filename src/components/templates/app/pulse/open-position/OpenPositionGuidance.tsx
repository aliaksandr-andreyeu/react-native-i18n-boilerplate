import React, { FC, useCallback, memo } from 'react';
import { ImageSourcePropType } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BaseImage, BaseText, BaseButton, BaseTextVariant, BaseButtonType } from '@/components';
import { images } from '@/assets';
import LoginContent from '../../create-position/login-content';
import useStyles from './styles';

interface OpenPositionGuidanceProps {
    isAuthorized: boolean;
    isVerified: boolean;
    firstDepositDate?: Date | null;
    lastTradedAt?: Date | null;
    equity: number;

    onLoginPress: () => void;
    onGoVerification: () => void;
    onGoDeposit: () => void;
    onGoTransfer: () => void;
}

const OpenPositionGuidance: FC<OpenPositionGuidanceProps> = ({
    isAuthorized,
    isVerified,
    firstDepositDate,
    lastTradedAt,
    equity,
    onLoginPress,
    onGoVerification,
    onGoDeposit,
    onGoTransfer
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const styles = useStyles(theme);

    const renderGuidance = useCallback(
        (
            image: ImageSourcePropType,
            title = '',
            subTitle = '',
            buttonText = '',
            onPress?: () => void
        ) => {
            return (
                <BottomSheetScrollView contentContainerStyle={styles.sheetContainer}>
                    <BaseImage style={styles.guidanceImage} resizeMode="contain" source={image} />
                    <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.guidanceTitle}>
                        {title}
                    </BaseText>
                    {!!subTitle && <BaseText style={styles.guidanceText}>{subTitle}</BaseText>}
                    <BaseButton
                        style={styles.guidanceButton}
                        type={BaseButtonType.primary}
                        label={buttonText}
                        onPress={onPress}
                    />
                </BottomSheetScrollView>
            );
        },
        [styles]
    );

    if (!isAuthorized) {
        return <LoginContent onPress={onLoginPress} />;
    }

    if (!isVerified) {
        return renderGuidance(
            images.blackKey,
            t('screens.create-position.complete-verification'),
            '',
            t('screens.create-position.complete-profile-verification'),
            onGoVerification
        );
    }

    const hasFirstDeposit = !!firstDepositDate;
    const hasEquity = !!equity;
    const hasLastTrade = !!lastTradedAt;

    if (isVerified && !hasFirstDeposit && !hasEquity) {
        return renderGuidance(
            images.safe,
            t('screens.create-position.add-funds-wallet'),
            t('screens.create-position.deposit-now-start-trading'),
            'Fund now',
            onGoDeposit
        );
    }

    if (isVerified && hasFirstDeposit && !hasEquity && !hasLastTrade) {
        return renderGuidance(
            images.rocket,
            t('screens.create-position.top-up-trading-account'),
            t('screens.create-position.transfer-funds-main-wallet'),
            t('screens.create-position.transfer-funds-now'),
            onGoTransfer
        );
    }

    return null;
};

export default memo(OpenPositionGuidance);
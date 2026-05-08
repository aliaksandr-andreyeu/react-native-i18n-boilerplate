import React, { FC, useEffect, useLayoutEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { ROOT_ROUTE_NAMES } from '@/navigation/app';
import { APP_ROUTE_NAMES } from '@/navigation/app/tabs';
import { COMMON_ROUTE_NAMES, CommonRootParamsList, WALLET_ROUTE_NAMES } from '@/navigation/app/stacks';
import { ScrollView, View } from 'react-native';
import {
  BaseImage,
  BaseText,
  BaseTextVariant,
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseRiskWarning
} from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { images } from '@/assets';
import { useAppSelector, useWelcomeBonusAvailability } from '@/hooks';
import { useGetPromoWelcomeInfo } from '@/store/api';
import { MixpanelEventTypes, mixpanelScreenOpenTracker } from '@/helpers';

type WelcomeScreenProps = StackScreenProps<CommonRootParamsList & ParamListBase, COMMON_ROUTE_NAMES.Welcome>;

const WelcomeScreen: FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);
  const accessToken = useAppSelector((store) => store.auth.accessToken);

  const [getPromoWelcomeInfo] = useGetPromoWelcomeInfo();

  const getPromoWelcomeInfoHandler = async () => {
    try {
      await getPromoWelcomeInfo();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userInfo.isVerified || !accessToken) navigation.replace(ROOT_ROUTE_NAMES.App);
  }, [userInfo.isVerified, accessToken]);

  useLayoutEffect(() => {
    getPromoWelcomeInfoHandler();
    mixpanelScreenOpenTracker(MixpanelEventTypes.CongratulationsScreenOpen, 'email', 'email');
  }, []);

  const { isWelcomeBonusAvailable, promoBonus } = useWelcomeBonusAvailability();

  const goToWallet = () => {
    navigation.replace(ROOT_ROUTE_NAMES.App, {
      screen: APP_ROUTE_NAMES.Wallet,
      params: {
        screen: WALLET_ROUTE_NAMES.Wallet
      }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollBox}>
        <View style={styles.content}>
          <View style={styles.titleBox}>
            <BaseText variant={BaseTextVariant.authSubTitle}>
              {isWelcomeBonusAvailable
                ? t('screens.welcome.bonus-title', { amount: promoBonus })
                : t('screens.welcome.title')}{' '}
            </BaseText>
            <BaseText variant={BaseTextVariant.authSmall}>
              {isWelcomeBonusAvailable ? t('screens.welcome.bonus-desc') : t('screens.welcome.desc')}{' '}
            </BaseText>
          </View>
        </View>
        <View style={styles.imgBox}>
          <BaseImage
            style={styles.img}
            resizeMode='contain'
            source={isWelcomeBonusAvailable ? images.bonusMoney : images.welcome}
          />
        </View>
      </ScrollView>
      <View>
        <View style={styles.buttonBox}>
          <BaseButton
            fullWidth={true}
            size={BaseButtonSize.large}
            label={t('screens.welcome.goto-demo-account')}
            type={BaseButtonType.accent}
            onPress={goToWallet}
          />
        </View>
        <View style={styles.warningContainer}>
          <BaseRiskWarning />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

import React, { FC, useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { config } from '@/constants';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { SvgIcon, SvgXmlIconNames, IconSize, images } from '@/assets';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStyles from './styles';
import { WalletCard } from '../../components';
import { BaseButtonType, BaseImage, BaseText, BaseTextVariant, BaseTradingBanner, SimpleCountDown } from '@/components';
import { useAppSelector } from '@/hooks';
import dateHelper from '@/helpers/dateHelper';
import dayjs from 'dayjs';
import { detectDateFormat } from '@/helpers';

type WelcomeAccountDetailsScreenProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.WelcomeAccountDetails>;

const {
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

const WelcomeAccountDetailsScreen: FC<WelcomeAccountDetailsScreenProps> = ({ route, navigation }) => {
  const { params } = route || {};
  const { expire = '' } = params || {};

  const { t } = useTranslation();

  const [isLessThanADay, setIsLessThanADay] = useState<boolean>(false);

  const { goBack, canGoBack } = navigation || {};
  const canBack = canGoBack();

  const theme = useTheme();
  const styles = useStyles(theme);

  const hasExpire = useMemo(() => !!expire?.length, [expire]);

  const userInfo = useAppSelector((store) => store.portfolio.userInfo);
  const promoWelcome = useAppSelector((store) => store.application.promoWelcome);
  const {
    conditionsCreditAmount,
    conditionsMaxLeverage,
    conditionsMarginCall,
    conditionsStopOut,
    conditionsMaxPositionOrOrders,
    conditionsMaxPositionSize,
    conditionsNumberOfInstruments
  } = promoWelcome || {};

  const { palette } = theme || {};

  const onGoBack = () => {
    if (!canBack) {
      return;
    }
    goBack();
  };

  const backButtonComponent = useMemo(() => {
    if (canBack) {
      return (
        <TouchableOpacity activeOpacity={activeOpacity} hitSlop={hitSlop} onPress={onGoBack} style={styles.backButton}>
          <SvgIcon name={SvgXmlIconNames.close} size={IconSize.sm} />
        </TouchableOpacity>
      );
    }
    return null;
  }, [canBack, onGoBack, styles]);

  const explanations = useMemo(() => {
    const descs = [
      t('screens.welcome-account-details.keep-profit'),
      t('screens.welcome-account-details.after_expiration_profits_moved')
    ];

    if (!hasExpire) return descs;
    return ['', ...descs];
  }, [t, hasExpire]);

  const InfoRow = useCallback(({ title = '', value = '' }: { title: string; value?: string | number }) => {
    return (
      <View style={styles.row}>
        <View style={styles.horizontal}>
          <BaseText style={styles.infoText}>{title}</BaseText>
        </View>
        <View style={styles.horizontal}>
          <BaseText style={styles.infoValue}>{value}</BaseText>
        </View>
      </View>
    );
  }, []);

  const navigateToDeposit = useCallback(() => {
    navigation.navigate(ROOT_ROUTE_NAMES.Deposit, { isDeposit: true });
  }, []);

  const until = useMemo(() => {
    if (!hasExpire) return 0;

    const format = detectDateFormat(expire);

    return dateHelper.diff(dayjs(), expire, format);
  }, [expire, hasExpire]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>{backButtonComponent}</View>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollView}>
        <View>
          <WalletCard
            style={{ height: 152 }}
            title={t('screens.welcome-account-details.welcome-account')}
            unbounded
            amount={`$${conditionsCreditAmount?.toFixed?.(2)}`}
            icon={SvgXmlIconNames.welcome}
            iconWrapColor={theme.palette.purple['100']}
            iconColor={palette.graphite['900']}
          />
          <BaseImage source={images.cardImageWithWave} style={styles.wave} />
        </View>
        <View style={styles.explanationsWrapper}>
          <BaseText variant={BaseTextVariant.titleXXS}>
            {t('screens.welcome-account-details.welcome_account_description')}
          </BaseText>
          {explanations.map((exp, index) => {
            return (
              <View key={`${index}-exp`} style={styles.exp}>
                <View style={styles.expCount}>
                  <BaseText style={styles.nums} variant={BaseTextVariant.widgetTitle}>
                    {index + 1}
                  </BaseText>
                </View>
                {index === 0 && hasExpire ? (
                  <View style={styles.expireContainer}>
                    <BaseText
                      style={isLessThanADay ? styles.redText : styles.grayText}
                      variant={BaseTextVariant.extraSmall}
                    >
                      {t('components.simple-countdown.expires-in')}
                    </BaseText>
                    <SimpleCountDown onLessThanADay={setIsLessThanADay} lastDate={expire} until={until} />
                  </View>
                ) : (
                  <BaseText style={styles.shrinkText}>{exp}</BaseText>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.infoWrap}>
          {conditionsMaxLeverage && (
            <InfoRow title={t('screens.welcome-account-details.maxLeverage')} value={conditionsMaxLeverage} />
          )}
          {conditionsMarginCall && (
            <InfoRow title={t('screens.welcome-account-details.margin-call')} value={conditionsMarginCall} />
          )}
          {conditionsStopOut && (
            <InfoRow title={t('screens.welcome-account-details.stop-out-level')} value={conditionsStopOut} />
          )}
          {conditionsMaxPositionOrOrders && (
            <InfoRow
              title={t('screens.welcome-account-details.max_positions_orders_quantity')}
              value={conditionsMaxPositionOrOrders}
            />
          )}
          {conditionsMaxPositionSize && (
            <InfoRow title={t('screens.welcome-account-details.investment')} value={conditionsMaxPositionSize} />
          )}
          {conditionsNumberOfInstruments && (
            <InfoRow
              title={t('screens.welcome-account-details.number_of_instruments')}
              value={conditionsNumberOfInstruments}
            />
          )}
          <InfoRow title={t('screens.welcome-account-details.other-instruments')} value={`Read-only`} />
        </View>
        {!userInfo.firstDepositDate && (
          <BaseTradingBanner
            style={styles.guidelineBanner}
            title={`${t('screens.common.next-step')}:`}
            subTitle={t('screens.welcome-account-details.add_funds_unlock_potential')}
            buttonText={'Deposit now'}
            imageSource={images.safe}
            imageStyle={styles.safeImage}
            leftSectionStyle={{ marginRight: 112 }}
            buttonType={BaseButtonType.primary}
            onPress={navigateToDeposit}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeAccountDetailsScreen;

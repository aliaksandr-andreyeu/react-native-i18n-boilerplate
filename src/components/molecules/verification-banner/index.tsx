import { BaseButton, BaseButtonSize, BaseButtonType, BaseText, BaseTextVariant } from '@/components/atoms';
import React, { memo, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { IconSize, SvgIcon, SvgXmlIconNames, images } from '@/assets';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export interface IIdeasBanner {
  type?: 'green' | 'purple';
  onPress?(): void;
  style?: ViewStyle;
  shown?: boolean;
  state: 'verification' | 'signup' | 'deposit' | 'fund' | 'trade' | 'bonus20' | 'null';
  customDepositLabel?: string;
  disableAnim?: boolean;
  testID?: string;
}

const BaseIdeasBanner: React.FC<IIdeasBanner> = ({
  onPress,
  style,
  type = 'green',
  shown = true,
  state,
  customDepositLabel = '',
  disableAnim = false,
  testID
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const bgColor = useMemo(
    (): ViewStyle =>
      type === 'green' ? { backgroundColor: theme.palette.base.white } : { backgroundColor: theme.palette.purple[600] },
    [theme.dark, type]
  );

  const Type = useMemo(() => {
    const Components = {
      Title: <></>,
      Icon: <></>,
      SubTile: <></>,
      Button: <></>,
      Image: <></>,
      allIsEmpty: true
    };
    const tColor = { color: type === 'green' ? theme.palette.graphite['900'] : theme.palette.base.white };
    switch (state) {
      case 'null':
        break;

      case 'bonus20':
        Components.Title = (
          <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
            {t('components.molecules.verification-banner.next-step')}:
          </BaseText>
        );
        Components.SubTile = (
          <BaseText style={[tColor, { marginRight: 120 }]}>
            {t('components.molecules.verification-banner.complete-verification-to-get-bonus', { amount: '$20' })}
          </BaseText>
        );
        Components.Button = (
          <BaseButton
            testID={testIDs.components.molecules.ideasBanner.button}
            label={t('components.molecules.verification-banner.complete-verification')}
            type={BaseButtonType.accent}
            size={BaseButtonSize.extraSmall}
            onPress={onPress}
            labelStyle={tColor}
            style={[{ backgroundColor: theme.palette.graphite['900'], alignSelf: 'flex-start' }, styles.btn]}
          />
        );
        Components.Image = <Image resizeMode='contain' source={images.verificationKey} style={styles.key} />;
        Components.allIsEmpty = false;

        break;

      case 'verification':
        if (type === 'green') {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.Icon = <SvgIcon name={SvgXmlIconNames.verificationKey} size={IconSize.md} />;
          Components.SubTile = (
            <BaseText style={tColor}>{t('components.molecules.verification-banner.verification-sub')}</BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={t('components.molecules.verification-banner.complete-verification')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.green['400'] }, styles.btn]}
            />
          );
          Components.allIsEmpty = false;
        } else {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.SubTile = (
            <BaseText style={[tColor, { marginRight: 80 }]}>
              {t('components.molecules.verification-banner.verification-sub')}
            </BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={t('components.molecules.verification-banner.complete-verification')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.graphite['900'], alignSelf: 'flex-start' }, styles.btn]}
            />
          );
          Components.Image = <Image resizeMode='contain' source={images.verificationKey} style={styles.key} />;
          Components.allIsEmpty = false;
        }
        break;

      case 'signup':
        if (type === 'purple') {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.SubTile = (
            <BaseText style={[tColor, { marginRight: 100 }]}>
              {t('components.molecules.verification-banner.sign-in-sub')}
            </BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={t('screens.common.sign-up')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.graphite['900'], alignSelf: 'flex-start' }, styles.btn]}
            />
          );
          Components.Image = <Image resizeMode='contain' source={images.idCard} style={styles.idCard} />;
          Components.allIsEmpty = false;
        } else {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.Icon = (
            <SvgIcon color={theme.palette.icon.context.amega} name={SvgXmlIconNames.userSquare} size={IconSize.md} />
          );
          Components.SubTile = (
            <BaseText style={tColor}>{t('components.molecules.verification-banner.sign-up-sub')}</BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={!!customDepositLabel ? customDepositLabel : t('components.molecules.verification-banner.sign-up')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.green['400'] }, styles.btn]}
            />
          );
          Components.allIsEmpty = false;
        }
        break;

      case 'deposit':
        if (type === 'green') {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.Icon = <SvgIcon name={SvgXmlIconNames.coins} size={IconSize.md} />;
          Components.SubTile = (
            <BaseText style={tColor}>{t('components.molecules.verification-banner.deposit-sub')}</BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={!!customDepositLabel ? customDepositLabel : t('components.molecules.verification-banner.fund-now')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.green['400'] }, styles.btn]}
            />
          );
          Components.allIsEmpty = false;
        } else {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.SubTile = (
            <BaseText style={[tColor, { marginRight: 85 }]}>
              {t('components.molecules.verification-banner.deposit-sub')}
            </BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={!!customDepositLabel ? customDepositLabel : t('components.molecules.verification-banner.fund-now')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.graphite['900'], alignSelf: 'flex-start' }, styles.btn]}
            />
          );
          Components.Image = <Image resizeMode='contain' source={images.safe} style={styles.depositImg} />;
          Components.allIsEmpty = false;
        }
        break;

      case 'fund':
        if (type === 'green') {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.Icon = <SvgIcon name={SvgXmlIconNames.rocket} size={IconSize.md} />;
          Components.SubTile = (
            <BaseText style={tColor}>{t('components.molecules.verification-banner.fund-sub')}</BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={t('components.molecules.verification-banner.fund-label')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.green['400'] }, styles.btn]}
            />
          );
          Components.allIsEmpty = false;
        } else {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.next-step')}:
            </BaseText>
          );
          Components.SubTile = (
            <BaseText style={[tColor, { marginRight: 100 }]}>
              {t('components.molecules.verification-banner.fund-sub')}
            </BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={t('components.molecules.verification-banner.fund-label')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.graphite['900'], alignSelf: 'flex-start' }, styles.btn]}
            />
          );
          Components.Image = <Image resizeMode='contain' source={images.rocket} style={styles.rocketImage} />;
          Components.allIsEmpty = false;
        }
        break;

      case 'trade':
        if (type === 'green') {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.start-trading')}
            </BaseText>
          );
          Components.Icon = <SvgIcon name={SvgXmlIconNames.candleStickGreen} size={IconSize.md} />;
          Components.SubTile = (
            <BaseText style={tColor}>{t('components.molecules.verification-banner.trading-sub')}</BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={t('components.molecules.verification-banner.trade-label')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.green['400'] }, styles.btn]}
            />
          );
          Components.allIsEmpty = false;
        } else {
          Components.Title = (
            <BaseText style={tColor} variant={BaseTextVariant.titleXXS}>
              {t('components.molecules.verification-banner.start-trading')}:
            </BaseText>
          );
          Components.SubTile = (
            <BaseText style={[tColor, { marginRight: 90 }]}>
              {t('components.molecules.verification-banner.trading-sub')}
            </BaseText>
          );
          Components.Button = (
            <BaseButton
              testID={testIDs.components.molecules.ideasBanner.button}
              label={t('components.molecules.verification-banner.trade-label')}
              type={BaseButtonType.accent}
              size={BaseButtonSize.extraSmall}
              onPress={onPress}
              labelStyle={tColor}
              style={[{ backgroundColor: theme.palette.graphite['900'], alignSelf: 'flex-start' }, styles.btn]}
            />
          );
          Components.Image = <Image resizeMode='contain' source={images.barChart} style={styles.chart} />;
          Components.allIsEmpty = false;
        }
        break;
    }

    return Components;
  }, [theme.dark, type, state, t]);

  if (!shown || Type.allIsEmpty) return null;

  return (
    <Animated.View
      entering={disableAnim ? undefined : SlideInLeft}
      style={[styles.container, bgColor, style, type === 'purple' && styles.hidden]}
      testID={testID}
    >
      <View style={styles.up}>
        <View style={styles.top}>
          {Type.Icon}
          {Type.Title}
        </View>
        {Type.SubTile}
      </View>
      {Type.Button}
      {Type.Image}
    </Animated.View>
  );
};

const useStyles = (theme: UserTheme) => {
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      width: '100%',
      padding: 20,
      borderRadius: 12,
      ...shadow6Style
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
    },
    up: {
      gap: 8,
      alignItems: 'flex-start',
      paddingBottom: 16
    },
    btn: {
      borderWidth: 0
    },
    key: {
      width: 160,
      height: 160,
      position: 'absolute',
      top: 0,
      right: -40
    },
    idCard: {
      width: 137,
      height: 85,
      position: 'absolute',
      top: '25%',
      right: -30
    },
    depositImg: {
      width: 220,
      height: 160,
      position: 'absolute',
      top: 30,
      right: -97
    },
    rocketImage: {
      width: 210,
      height: 210,
      position: 'absolute',
      top: -20,
      right: -60
    },
    chart: {
      width: 150,
      height: 150,
      position: 'absolute',
      top: 5,
      right: -20
    },
    hidden: {
      overflow: 'hidden'
    }
  });
};

export default memo(BaseIdeasBanner);

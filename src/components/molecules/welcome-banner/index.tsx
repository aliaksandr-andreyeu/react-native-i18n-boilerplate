import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme, testIDs } from '@/constants';
import { IconSize, images, SvgIcon, SvgXmlIconNames } from '@/assets';
import { useCommonStyles } from '@/hooks';
import {
  BaseButton,
  BaseButtonSize,
  BaseButtonType,
  BaseHelpButton,
  BaseImage,
  BaseText,
  BaseTextVariant
} from '@/components/atoms';
import { useTranslation } from 'react-i18next';

interface IWelcomeBanner {
  bonus: number;
  onUnlockPress(): void;
  testID?: string;
}

const { screenWidth } = config;

const translationPath = 'components.molecules.welcome-bonus';

const WelcomeBanner: React.FC<IWelcomeBanner> = ({ bonus = 0, onUnlockPress, testID }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container} testID={testID || testIDs.components.molecules.welcomeBanner.container}>
      <View style={styles.top}>
        <View style={styles.iconContainer}>
          <SvgIcon name={SvgXmlIconNames.welcome} size={IconSize.sm} color={theme.palette.graphite['900']} />
        </View>
        <View style={styles.topRight}>
          <BaseText variant={BaseTextVariant.titleXXS}>{t(`${translationPath}.welcome-account`)}</BaseText>
          <BaseHelpButton
            title={t(`${translationPath}.welcome-account`)}
            arrowPlacement='top'
            text={t(`${translationPath}.help-text`, { bonus })}
          />
        </View>
      </View>
      <View style={styles.bottom}>
        <BaseText>{t(`${translationPath}.complete`)}</BaseText>
        <BaseButton
          style={styles.button}
          type={BaseButtonType.accent}
          label={t(`${translationPath}.unlock`, { bonus })}
          onPress={onUnlockPress}
          size={BaseButtonSize.extraSmall}
        />
      </View>
      <BaseImage resizeMode='contain' style={styles.img} source={images.lock} />
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { purple, green, base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      gap: 16,
      padding: 16,
      backgroundColor: base.white,
      width: screenWidth - 40,
      alignSelf: 'center',
      borderRadius: 16,
      overflow: 'hidden',
      ...shadow6Style
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    button: {
      backgroundColor: green['400'],
      borderWidth: 0
    },
    iconContainer: {
      padding: 7,
      borderRadius: 8,
      backgroundColor: purple['100'],
      alignItems: 'center',
      justifyContent: 'center'
    },
    topRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    bottom: {
      gap: 20,
      alignItems: 'flex-start'
    },
    img: {
      position: 'absolute',
      transform: [{ rotateY: '180deg' }],
      width: 145,
      height: 145,
      top: 30,
      right: -35
    }
  });
};

export default memo(WelcomeBanner);

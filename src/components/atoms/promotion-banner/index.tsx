import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import { View, StyleSheet, ImageBackground, Linking, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import BaseText, { BaseTextVariant } from '../text';
import BaseButton, { BaseButtonSize, BaseButtonType } from '../button';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import BaseImage from '../image';

interface IBasePromotionBanner {
  id: number;
  title: string;
  subTitle: string;
  tagLine: string;
  buttonLabel?: string;
  bgColor: string;
  bgImage: string;
  fullWidth?: boolean;
  onCardPress?(id: number): void;
  isHero?: boolean;
  termsAndConditionsLabel?: string;
  termsAndConditionsLink?: string;
  bannerTextColor: string;
  bannerButtonColor: string;
  bannerButtonLabelColor: string;
  testID?: string
}

const { screenWidth } = config;

const maxWidth = screenWidth - 40;
export const minPromotionsCardWidth = screenWidth - 64;
const BasePromotionBanner: React.FC<IBasePromotionBanner> = ({
  bgColor,
  bgImage,
  buttonLabel,
  id,
  subTitle = '',
  tagLine = '',
  title = '',
  fullWidth = false,
  onCardPress,
  isHero = false,
  termsAndConditionsLabel,
  termsAndConditionsLink,
  bannerButtonColor,
  bannerButtonLabelColor,
  bannerTextColor,
  testID
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const {
    palette: { red, graphite }
  } = theme;

  const {
    palette: {
      base: { white }
    }
  } = theme;

  const hasTagLine = useMemo(() => !!tagLine?.length, [tagLine]);

  const bgImageSource = useMemo(() => {
    if (bgImage) {
      return { uri: bgImage };
    }
    return { uri: undefined };
  }, [bgImage]);

  const textColor = useMemo(() => {
    if (bannerTextColor) return { color: bannerTextColor };

    return {
      color: [red['600'], graphite[500]].includes(bgColor) ? white : graphite['900']
    };
  }, [bgColor, theme.dark, bannerTextColor]);

  const bannerHeight = useMemo(() => (isHero ? 388 : 159), [isHero]);

  const onPromotionPress = useCallback(() => onCardPress && onCardPress(id), [id]);

  const Replacer = useCallback(({ height }: { height: number }) => {
    return <View style={{ height }} />;
  }, []);

  const onTermsPress = useCallback(async () => {
    if (termsAndConditionsLink) {
      const canOpenLink = await Linking.canOpenURL(termsAndConditionsLink);
      if (canOpenLink) Linking.openURL(termsAndConditionsLink);
    }
  }, [termsAndConditionsLink]);


  const Wrapper = useCallback(({ children }: { children: ReactNode }) => {
    if (isHero) {
      return (
        <ImageBackground style={styles.imageBgContainer} resizeMode='stretch' source={bgImageSource} >
          {children}
        </ImageBackground>
      );
    };
    return (
      <>
        {children}
        <BaseImage resizeMode={'contain'} source={bgImageSource} style={[styles.bgImage, !isHero && { objectFit: 'fill' }]} />
      </>
    )
  }, [isHero, bgImageSource, theme.dark])


  return (
    <Pressable
      testID={testID}
      disabled={isHero}
      onPress={isHero ? undefined : onPromotionPress}
      style={[
        styles.container,
        {
          width: fullWidth || isHero ? maxWidth : minPromotionsCardWidth,
          backgroundColor: bgColor,
          minHeight: bannerHeight
        },
        isHero && { flex: 1 }
      ]}
    >
      <Wrapper>
        <View style={styles.inside}>
          <View style={styles.top}>
            <BaseText
              style={[!isHero && styles.lineHeight182, textColor]}
              variant={isHero ? BaseTextVariant.authSubTitle : BaseTextVariant.titleXXS}
            >
              {title || ' '}
            </BaseText>
            {!!subTitle?.length && (
              <BaseText
                style={[textColor, !isHero && styles.paddingRight]}
                variant={isHero ? BaseTextVariant.small : BaseTextVariant.text}
              >
                {subTitle || ' '}
              </BaseText>
            )}
            {isHero && !!termsAndConditionsLabel?.length && (
              <Pressable
                style={(press) => press.pressed && { backgroundColor: 'red' }}
                hitSlop={5}
                onPress={onTermsPress}
              >
                <BaseText style={[textColor, styles.underline]}>{termsAndConditionsLabel || ''}</BaseText>
              </Pressable>
            )}
            {hasTagLine ? (
              <View style={[styles.tagLineButton, isHero && { marginTop: 12 }]}>
                <SvgIcon
                  style={styles.top1}
                  name={SvgXmlIconNames.signal}
                  color={theme.palette.graphite['900']}
                  size={IconSize.md}
                />
                <BaseText variant={BaseTextVariant.extraSmall}>{tagLine}</BaseText>
              </View>
            ) : (
              <Replacer height={24} />
            )}
          </View>
          {isHero || (
            <BaseButton
              testID={testID + '_inside_button'}
              style={[styles.button, !!bannerButtonColor?.length && { backgroundColor: bannerButtonColor }]}
              type={BaseButtonType.primary}
              size={BaseButtonSize.extraSmall}
              labelStyle={!!bannerButtonLabelColor?.length ? { color: bannerButtonLabelColor } : {}}
              label={buttonLabel}
              onPress={onPromotionPress}
            />
          )}
        </View>
      </Wrapper>
    </Pressable>
  );
};

const useStyles = ({
  palette: {
    base: { white }
  }
}: UserTheme) =>
  StyleSheet.create({
    container: {
      overflow: 'hidden',
      borderRadius: 12
    },
    imageBgContainer: {
      width: '100%',
      height: '100%'
    },
    tagLineButton: {
      backgroundColor: white,
      gap: 4,
      borderRadius: 6,
      alignItems: 'center',
      paddingVertical: 4,
      paddingLeft: 6,
      paddingRight: 8,
      flexDirection: 'row',
      height: 24
    },
    bgImage: {
      width: '100%',
      minHeight: 159,
      bottom: 0,
      position: 'absolute',
      right: 0,
      zIndex: 0,
    },
    inside: {
      paddingTop: 20,
      paddingBottom: 16,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      flex: 1,
      zIndex: 1
    },
    top: {
      alignItems: 'flex-start',
      paddingBottom: 16,
      gap: 8
    },
    button: {
      alignSelf: 'flex-start',
      padding: 0,
      paddingBottom: 0,
      paddingTop: 0,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 0
    },
    lineHeight182: { lineHeight: 18.2 },
    lineheight175: { lineHeight: 17.5 },
    top1: { top: 1 },
    underline: {
      textDecorationLine: 'underline'
    },
    paddingRight: {
      paddingRight: 90
    }
  });

export default memo(BasePromotionBanner);

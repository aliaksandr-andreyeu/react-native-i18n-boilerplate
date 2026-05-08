import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageSourcePropType, ImageStyle, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components';

interface IBaseTradingBanner {
  title: string;
  subTitle: string;
  buttonText?: string;
  imageSource: ImageSourcePropType;
  onPress?: () => void;
  imageStyle?: ImageStyle;
  style?: ViewStyle;
  leftSectionStyle?: ViewStyle;
  buttonType?: BaseButtonType | null;
  testID?: string;
}

const BaseTradingBanner: React.FC<IBaseTradingBanner> = ({
  title,
  subTitle,
  buttonText,
  imageSource,
  onPress,
  imageStyle,
  style,
  leftSectionStyle,
  buttonType,
  testID
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const button = useMemo(() => {
    if (!buttonText) {
      return null;
    }
    if (buttonType) {
      return (
        <BaseButton
          testID={testIDs.components.molecules.tradingBanner.button}
          style={styles.baseButton}
          type={buttonType}
          label={buttonText}
          size={BaseButtonSize.small}
          onPress={onPress}
        />
      );
    }
    return (
      <TouchableOpacity
        testID={testIDs.components.molecules.tradingBanner.button}
        style={styles.button}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <BaseText testID={testIDs.components.molecules.tradingBanner.buttonText} style={styles.buttonText}>
          {buttonText}
        </BaseText>
      </TouchableOpacity>
    );
  }, [styles, buttonText, buttonType, onPress]);

  return (
    <View style={[styles.container, style]} testID={testID || testIDs.components.molecules.tradingBanner.container}>
      <View testID={testIDs.components.molecules.tradingBanner.containerTop} style={[styles.left, leftSectionStyle]}>
        <BaseText
          testID={testIDs.components.molecules.tradingBanner.title}
          variant={BaseTextVariant.captionSemiBold}
          style={styles.title}
        >
          {title}
        </BaseText>
        <BaseText testID={testIDs.components.molecules.tradingBanner.subTitle} style={styles.subTitle}>
          {subTitle}
        </BaseText>
        {button}
      </View>
      {imageSource && (
        <BaseImage
          testID={testIDs.components.molecules.tradingBanner.image}
          style={[styles.image, imageStyle]}
          resizeMode='contain'
          source={imageSource}
        />
      )}
    </View>
  );
};

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.graphite['900'],
      marginHorizontal: 20,
      borderRadius: 16,
      flexDirection: 'row',
      paddingLeft: 20,
      paddingVertical: 20
    },
    image: {
      width: 90,
      height: 90,
      right: -12
    },
    left: {
      flex: 1,
      alignItems: 'flex-start'
    },
    title: {
      fontSize: 16,
      color: palette.base.white,
      fontWeight: '600'
    },
    subTitle: {
      marginTop: 8,
      fontSize: 14,
      color: palette.base.white
    },
    baseButton: {
      marginTop: 12
    },
    button: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginTop: 12,
      backgroundColor: palette.green['400'],
      alignItems: 'center'
    },
    buttonText: {
      fontSize: 14,
      color: palette.graphite['900'],
      fontWeight: '500'
    }
  });

export default BaseTradingBanner;

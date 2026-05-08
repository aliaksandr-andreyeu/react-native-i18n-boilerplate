import { images } from '@/assets';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseText, BaseTextVariant } from '@/components/atoms';
import React, { memo } from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';

interface IBasePortfolioEmptyContainer {
  title?: string;
  subTitle?: string;
  buttonText?: string;
  onPress?(): void;
  style?: ViewStyle;
  buttonStyle?: ViewStyle;
  showButton?: boolean;
}

const BasePortfolioEmptyContainer: React.FC<IBasePortfolioEmptyContainer> = ({
  buttonText,
  onPress,
  subTitle,
  title,
  style,
  buttonStyle,
  showButton = true
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View testID={testIDs.components.molecules.portfolioEmptyContainer.container} style={[styles.container, style]}>
      <Image
        testID={testIDs.components.molecules.portfolioEmptyContainer.image}
        source={images.search}
        style={styles.img}
      />
      <View testID={testIDs.components.molecules.portfolioEmptyContainer.bottomContainer} style={styles.bottom}>
        <View testID={testIDs.components.molecules.portfolioEmptyContainer.textContainer} style={styles.textContainer}>
          <BaseText
            testID={testIDs.components.molecules.portfolioEmptyContainer.title}
            variant={BaseTextVariant.captionSemiBold}
            style={styles.textAlign}
          >
            {title}
          </BaseText>
          <BaseText style={styles.subTitle}>{subTitle}</BaseText>
        </View>
        {showButton && (
          <BaseButton
            label={buttonText}
            size={BaseButtonSize.large}
            type={BaseButtonType.primary}
            onPress={onPress}
            style={buttonStyle}
          />
        )}
      </View>
    </View>
  );
};

const useStyles = ({}: UserTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 20,
      gap: 16
    },
    bottom: {
      gap: 16
    },
    textAlign: {
      textAlign: 'center'
    },
    subTitle: {
      textAlign: 'center',
      color: '#8890A1'
    },
    img: {
      width: 90,
      height: 90,
      alignSelf: 'center'
    },
    textContainer: {
      gap: 8
    }
  });

export default memo(BasePortfolioEmptyContainer);

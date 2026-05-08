import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { UserTheme, testIDs } from '@/constants';
import { BaseButton, BaseButtonSize, BaseButtonType, BaseImage, BaseText, BaseTextVariant } from '@/components';
import { images } from '@/assets';
import { BlurView } from '@react-native-community/blur';

interface IBaseAccessGuidelinesOverlay {
  title: string;
  subTitle: string;
  firstButton?: {
    text: string;
    onPress: () => void;
    testID?: string;
  };
  secondButton?: {
    text: string;
    onPress: () => void;
    testID?: string;
  };
  style?: ViewStyle;
  testID?: string;
}

const BaseAccessGuidelinesOverlay: React.FC<IBaseAccessGuidelinesOverlay> = ({
  style,
  title,
  subTitle,
  firstButton,
  secondButton,
  testID
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const [render, setRender] = useState<number>();

  useFocusEffect(
    useCallback(() => {
      setRender(Math.random());
    }, [])
  );

  return (
    <BlurView key={`${render}`} style={[styles.container, style]} blurAmount={10} blurType='xlight' testID={testID || testIDs.components.molecules.accessBlurOverlay.container}>
      <View style={styles.wrapper}>
        <View />
        <View style={styles.center}>
          <BaseImage style={styles.lockImage} resizeMode='contain' source={images.lock} />
          <BaseText variant={BaseTextVariant.captionSemiBold} style={styles.title}>
            {title}
          </BaseText>
          <BaseText variant={BaseTextVariant.text} style={styles.subTitle}>
            {subTitle}
          </BaseText>
        </View>
        <View style={styles.bottom}>
          {firstButton && (
            <BaseButton
              testID={firstButton.testID}
              label={firstButton.text}
              onPress={firstButton.onPress}
              size={BaseButtonSize.large}
              type={BaseButtonType.primary}
            />
          )}
          {secondButton && (
            <BaseButton
              testID={secondButton.testID}
              label={secondButton.text}
              onPress={secondButton.onPress}
              size={BaseButtonSize.large}
              type={BaseButtonType.accent}
              style={styles.signIn}
            />
          )}
        </View>
      </View>
    </BlurView>
  );
};

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: 99
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'transparent',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 24
    },
    title: {
      textAlign: 'center',
      marginBottom: 8
    },
    subTitle: {
      textAlign: 'center'
    },
    center: {
      width: '100%',
      alignItems: 'center'
    },
    bottom: {
      width: '100%'
    },
    lockImage: {
      marginBottom: 16,
      width: 90,
      height: 90
    },
    signIn: {
      marginTop: 12
    }
  });

export default BaseAccessGuidelinesOverlay;

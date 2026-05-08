import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { testIDs, UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components/atoms';
import { useCommonStyles } from '@/hooks';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { AccordionItem } from '..';

interface IBaseFAQ {
  question: string;
  answer: string;
  testID?: string;
}

const BaseFAQ: React.FC<IBaseFAQ> = ({ answer, question, testID }) => {
  const isExpanded = useSharedValue(false);

  const theme = useTheme();
  const styles = useStyles(theme);

  const derivedRotate = useDerivedValue(() => withTiming(isExpanded.value ? 45 : 0, { duration: 350 }), []);

  const plusStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${derivedRotate.value}deg` }] }), []);

  const onPress = useCallback(() => (isExpanded.value = !isExpanded.value), []);

  return (
    <Pressable testID={testID} onPress={onPress} style={styles.container}>
      <View style={styles.top}>
        <BaseText style={styles.question} variant={BaseTextVariant.titleXXS}>
          {question}
        </BaseText>
        <Animated.View style={[styles.iconContainer, plusStyle]}>
          <SvgIcon name={SvgXmlIconNames.plus} color={theme.palette.graphite['900']} size={IconSize.xsm} />
        </Animated.View>
      </View>
      <AccordionItem isExpanded={isExpanded}>
        <View style={styles.accordion}>
          <BaseText testID={testIDs.components.molecules.faq.answer} selectable>
            {answer}
          </BaseText>
        </View>
      </AccordionItem>
    </Pressable>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, purple }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      backgroundColor: base.white,
      paddingBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      ...shadow6Style
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      paddingTop: 16,
      paddingHorizontal: 20,
      gap: 8
    },
    iconContainer: {
      borderRadius: 14,
      width: 24,
      height: 24,
      backgroundColor: purple['100'],
      alignItems: 'center',
      justifyContent: 'center'
    },
    accordion: {
      paddingHorizontal: 20,
      paddingTop: 4
    },
    question: { flex: 1 }
  });
};

export default memo(BaseFAQ);

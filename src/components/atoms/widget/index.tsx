import React, { memo, useCallback } from 'react';
import { StyleSheet, Image, TouchableOpacity, DimensionValue, TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import BaseText, { BaseTextVariant } from '../text';
import { WatchWidget } from '@/store/slices/ideas-hub/types';
import { UserTheme, config, testIDs } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { articleViewedMixpanel } from '@/helpers';

type IWidgetProps = Partial<WatchWidget> & {
  index?: number | undefined;
  onPress?(id: number): void;
  widgetWidth: DimensionValue;
  widgetHeight: DimensionValue;
  disableAnimation?: boolean;
  animationDuration?: number;
  textStyle?: TextStyle;
  testID: string;
};

const {
  buttons: { activeOpacity }
} = config;

const Widget: React.FC<IWidgetProps> = ({
  index,
  id,
  image,
  title,
  onPress,
  widgetHeight,
  widgetWidth,
  disableAnimation = false,
  animationDuration = 150,
  textStyle,
  testID
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const onWidgetPress = useCallback(() => {
    articleViewedMixpanel({
      contentCategory: 'Market pulse',
      contentID: id || '',
      contentTitle: title || ''
    });
    onPress && onPress(id || 0);
  }, [id, title]);

  return (
    <Animated.View
      testID={testID}
      entering={disableAnimation || index === undefined ? undefined : FadeIn.delay(index * animationDuration)}
    >
      <TouchableOpacity
        testID={testIDs.components.atoms.widget.button}
        onPress={onWidgetPress}
        activeOpacity={activeOpacity}
        style={[styles.widget, { width: widgetWidth }]}
      >
        <Image
          testID={testIDs.components.atoms.widget.image}
          resizeMode='cover'
          source={{ uri: image }}
          style={[styles.image, { width: widgetWidth, height: widgetHeight }]}
        />
        <BaseText style={[styles.text, textStyle]} numberOfLines={2} variant={BaseTextVariant.small}>
          {title}
        </BaseText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const useStyles = ({ }: UserTheme) =>
  StyleSheet.create({
    widget: {
      paddingBottom: 8,
      gap: 8
    },
    text: {
      paddingHorizontal: 8
    },
    widgetContainer: {
      flexDirection: 'row',
      gap: 12
    },
    image: {
      borderRadius: 12
    }
  });

export default memo(Widget);

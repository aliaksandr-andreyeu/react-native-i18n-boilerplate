import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  TextStyle,
  ImageBackground,
  NativeSyntheticEvent,
  TextLayoutEventData,
  View
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { BaseText, BaseTextVariant } from '@/components';
import Animated, { FadeIn } from 'react-native-reanimated';
import { articleViewedMixpanel } from '@/helpers';

const {
  components: {
    cards: { hitSlop, activeOpacity }
  }
} = config;

type TextAlignment = 'top' | 'center' | 'bottom';
interface BaseIdeaCardProps extends TouchableOpacityProps {
  onWidgetPress(id: number): void;
  title: string;
  verticalTextAlignment: TextAlignment;
  image: string | undefined;
  widgetWidth?: number;
  widgetHeight?: number;
  ideaId: number;
  index?: number | undefined;
  animationDuration?: number;
  disableAnimation?: boolean;
  articleTitle?: string;
}

const BaseIdeaCard = ({
  style,
  image,
  onWidgetPress,
  title,
  verticalTextAlignment = 'bottom',
  widgetHeight = 208,
  widgetWidth = 154,
  animationDuration = 120,
  disableAnimation = false,
  index,
  ideaId,
  articleTitle,
  ...rest
}: BaseIdeaCardProps) => {
  const [lines, setLines] = useState<number>(1);

  const theme = useTheme();
  const styles = useStyles(theme);

  const imageUri = useMemo(() => ({ uri: image }), [image]);

  const textAlign = useMemo((): TextStyle => {
    if (['bottom', 'top'].includes(verticalTextAlignment)) return { [verticalTextAlignment]: 16 };
    return { top: widgetHeight / 2 - lines * 7 };
  }, [verticalTextAlignment, lines]);

  const onWPress = useCallback(() => {
    articleViewedMixpanel({
      contentCategory: 'Asset collections',
      contentID: ideaId,
      contentTitle: articleTitle || ''
    });
    onWidgetPress(ideaId);
  }, [ideaId, articleTitle]);

  const onTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => setLines(e.nativeEvent.lines.length || 1),
    [title]
  );

  return (
    <Animated.View
      entering={disableAnimation || index === undefined ? undefined : FadeIn.delay(index * animationDuration)}
    >
      <TouchableOpacity
        activeOpacity={activeOpacity}
        hitSlop={hitSlop}
        style={[styles.container, { width: widgetWidth, height: widgetHeight }, style]}
        onPress={onWPress}
        {...rest}
      >
        <ImageBackground style={styles.image} source={imageUri} resizeMode={'cover'}>
          <View style={styles.inside}>
            <BaseText
              onTextLayout={onTextLayout}
              style={[styles.text, textAlign]}
              variant={BaseTextVariant.widgetTitle}
            >
              {title}
            </BaseText>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const useStyles = ({ palette: { base, graphite, red } }: UserTheme) =>
  StyleSheet.create({
    image: {
      width: '100%',
      height: '100%'
    },
    container: {
      borderRadius: 12,
      overflow: 'hidden'
    },
    inside: {
      flex: 1,
      paddingHorizontal: 12
    },
    text: {
      left: 12,
      position: 'absolute',
      textAlign: 'left'
    }
  });

export default memo(BaseIdeaCard);

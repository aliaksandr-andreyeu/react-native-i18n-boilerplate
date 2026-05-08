import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UserTheme } from '@/constants';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import BaseText, { BaseTextVariant } from '../text';
import { images } from '@/assets';
import BaseImage from '../image';
import { useTranslation } from 'react-i18next';
import { formatTwoDecimals } from '@/helpers';

interface IPlaceBar {
  place: number;
  price: number;
  isMe?: boolean;
  performance: number | string;
  width: number;
  testID?: string
}

const places: Record<number, ImageSourcePropType | undefined> = {
  1: images?.one,
  2: images?.two,
  3: images?.three
};

const swingInput = [0, 0.3, 0.4, 0.5, 0.6, 0.7, 1];
const swingOutput = [0, 0, 3, -3, 3, -3, 0];

const scaleInput = [0, 0.5, 1];
const scaleOutput = [1, 1.1, 1];

const PlaceBar: React.FC<IPlaceBar> = ({ place, price, isMe = false, performance, width = 0, testID }) => {
  const anim = useSharedValue(0);
  const rotate = useSharedValue(0);

  const { t } = useTranslation();

  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    const delay = place > 10 ? 1000 : (place - 1) * 100;
    anim.value = withDelay(
      delay,
      withTiming(
        1,
        {
          duration: 450,
          easing: Easing.bezier(0.45, 0, 0.25, 1)
        },
        (finished) => {
          if (finished && isMe)
            rotate.value = withTiming(1, {
              duration: 1500
            });
        }
      )
    );

    return () => {
      cancelAnimation(anim);
    };
  }, [width, place, isMe, place]);

  const containerStyle = useAnimatedStyle(() => {
    const containerWidth = interpolate(anim.value, [0, 1], [0, width]);
    const opacity = interpolate(anim.value, [0, 1], [0, 1]);
    const swing = interpolate(rotate.value, swingInput, swingOutput);
    const scale = interpolate(rotate.value, scaleInput, scaleOutput);

    return {
      width: containerWidth,
      opacity,
      transform: [{ rotate: `${swing}deg` }, { scale }]
    };
  }, []);

  const me = useMemo(() => {
    return (
      <View style={styles.meContainer}>
        <BaseText variant={BaseTextVariant.extraSmall} style={styles.you}>
          {t('components.atoms.place-bar.you')}
        </BaseText>
      </View>
    );
  }, [theme.dark, t]);

  const Place = useCallback(
    ({ place }: { place: number }) => {
      const placeValue = places[place];

      if (placeValue)
        return <BaseImage testID='PlaceBaseImage' resizeMode='contain' source={placeValue} style={styles.img} />;

      return <BaseText variant={BaseTextVariant.small}>{place}</BaseText>;
    },
    [theme.dark]
  );

  return (
    <Animated.View testID={testID} style={[styles.container, isMe && styles.me, containerStyle]}>
      <View style={styles.left}>
        <View style={styles.placeContainer}>
          <Place place={place} />
        </View>
        {!!price && <BaseText>${formatTwoDecimals(price)}</BaseText>}
        {isMe && me}
      </View>
      <BaseText>{formatTwoDecimals(performance)}%</BaseText>
    </Animated.View>
  );
};

const useStyles = ({ palette: { graphite, purple, base } }: UserTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingLeft: 8,
      paddingRight: 12,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderWidth: 1.5,
      borderLeftWidth: 0,
      borderColor: graphite[100],
      height: 37
    },
    img: { width: 19, height: 19 },
    me: {
      backgroundColor: purple['100'],
      borderColor: 'transparent'
    },
    you: {
      color: base.white
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    placeContainer: {
      width: 30,
      alignItems: 'center'
    },
    meContainer: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      backgroundColor: purple[500]
    }
  });

export default memo(PlaceBar);

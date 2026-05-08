import React from 'react';
import { View, ViewStyle } from 'react-native';
import useStyles from './styles';
import { CountriesCode } from './types';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';
import { icons } from './flags';


const SIZE = 24

interface ICountryFlag extends AnimatedProps<ViewProps> {
  style?: ViewStyle,
  width?: number,
  height?: number,
  name: CountriesCode,
  returnNullIfNot?: boolean
}

const CountryFlagIcon = ({ name, width = SIZE, height = SIZE, style = {}, returnNullIfNot = false, ...props }: ICountryFlag) => {
  const styles = useStyles()
  const SvgIcon = icons[name];

  if (!SvgIcon) {
    if (returnNullIfNot) return null
    return <View style={styles.iconSize} />;
  }

  return (
    <Animated.View style={[styles.iconSize, styles.rounded, style]} {...props}>
      <SvgIcon width={width} height={height} />
    </Animated.View>
  );
};

export default CountryFlagIcon;

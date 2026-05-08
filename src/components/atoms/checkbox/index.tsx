import React, { useState, useMemo, useLayoutEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  TextStyle,
} from 'react-native';
import Animated, { AnimatableValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';
import { IconSize, SvgIcon, SvgXmlIconNames, SvgXmlProps } from '@/assets';

const {
  animation: { duration },
  components: {
    buttons: { activeOpacity, hitSlop }
  }
} = config;

interface BaseCheckBoxProps extends TouchableOpacityProps {
  label?: string;
  selected?: boolean;
  onChange?: (data: boolean) => void;
  containerStyle?: ViewStyle;
  textFont?: TextStyle;
  hasCheck?: boolean;
  checkBoxStyle?: ViewStyle;
  checkedBgColor?: string;
  iconColor?: string;
  iconSize?: SvgXmlProps['size']
  defaultValue?: boolean;
}

const BaseCheckBox = ({
  label,
  selected,
  onChange,
  style,
  textFont,
  containerStyle,
  hasCheck = false,
  checkBoxStyle,
  checkedBgColor,
  iconColor,
  iconSize,
  defaultValue = false,
  ...rest
}: BaseCheckBoxProps) => {
  const [checked, setChecked] = useState<boolean>(defaultValue);

  const theme = useTheme();
  const styles = useStyles(theme);
  const { palette } = theme;

  const animatedBg = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(checked ? (checkedBgColor || palette.graphite['900']) : 'transparent', {
        duration
      })
    };
  });

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(checked ? 1 : 0, {
        duration
      })
    };
  });

  useLayoutEffect(() => {
    if (selected === undefined) {
      return;
    }
    setChecked(selected);
  }, [selected]);

  const onPress = () => {
    setChecked(!checked);
    onChange && onChange(!checked);
  };

  const checkBoxLabel = useMemo(() => {
    if (!label) {
      return null;
    }
    return (
      <View style={styles.labelBox}>
        <Text style={[styles.label, textFont && textFont]}>{label}</Text>
      </View>
    );
  }, [label, textFont]);

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={hitSlop}
      activeOpacity={activeOpacity}
      style={[styles.content, containerStyle]}
      testID="base-checkbox"
      {...rest}
    >
      <Animated.View style={[styles.checkBox, animatedBg, checkBoxStyle]}>
        <Animated.View style={[styles.checkItem, animatedOpacity]}>
          {hasCheck && checked && (
            <SvgIcon name={SvgXmlIconNames.check} size={iconSize || IconSize.xs} color={iconColor || palette.base.white} />
          )}
        </Animated.View>
      </Animated.View>
      {checkBoxLabel}
    </TouchableOpacity>
  );
};

interface Styles {
  content: ViewStyle;
  checkBox: ViewStyle;
  checkItem: ViewStyle;
  labelBox: ViewStyle;
  label: TextStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    content: {
      minHeight: 16,
      flexDirection: 'row',
      gap: 10
    },
    checkBox: {
      marginVertical: 2,
      width: 16,
      height: 16,
      borderRadius: 4,
      borderColor: palette.graphite['900'],
      borderWidth: 2,
      overflow: 'hidden'
    },
    checkItem: {
      width: '100%',
      height: '100%',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    labelBox: {
      justifyContent: 'center'
    },
    label: {
      fontSize: 14,
      color: palette.graphite['900']
    }
  });

export default BaseCheckBox;

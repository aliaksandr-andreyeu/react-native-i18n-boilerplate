import React, { FC } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useTheme } from '@react-navigation/native';

const BaseDivider: FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <View testID="BaseDividerSegment" style={[styles.common, styles.top]} />
      <View testID="BaseDividerSegment" style={[styles.common, styles.bottom]} />
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  common: ViewStyle;
  top: ViewStyle;
  bottom: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { border, background } = palette || {};

  return StyleSheet.create<Styles>({
    container: {
      height: 44,
      gap: 10,
      backgroundColor: border.base.divider
    },
    common: {
      flex: 1,
      backgroundColor: background.base.primary
    },
    top: {
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16
    },
    bottom: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16
    }
  });
};

export default BaseDivider;

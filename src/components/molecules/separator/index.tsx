import React, { memo, FC } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { config, UserTheme } from '@/constants';

const { screenWidth } = config;

interface BaseSeparatorProps extends ViewProps {}

const BaseSeparator: FC<BaseSeparatorProps> = ({ style }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={[styles.separatorContainer, style]}>
      <View style={styles.separatorUp} />
      <View style={styles.separatorDown} />
    </View>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { background, graphite }
  } = theme || {};

  return StyleSheet.create({
    separatorContainer: {
      width: screenWidth,
      height: 40,
      backgroundColor: graphite['100'],
      gap: 8,
      justifyContent: 'space-between'
    },
    separatorUp: {
      width: '100%',
      height: 16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: background.base.primary
    },
    separatorDown: {
      width: '100%',
      height: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: background.base.primary
    }
  });
};

export default memo(BaseSeparator);

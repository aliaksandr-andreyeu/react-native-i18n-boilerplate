import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconSize, SvgIcon, SvgXmlIconNames } from '@/assets';
import { UserTheme, config, testIDs } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { useTheme } from '@react-navigation/native';

interface Iindex {
  onPress(): void;
}

const {
  buttons: { activeOpacity }
} = config;

const BaseCalendarButton: React.FC<Iindex> = ({ onPress }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity testID={testIDs.components.atoms.calendarButton.button} onPress={onPress} activeOpacity={activeOpacity} style={styles.container}>
      <SvgIcon name={SvgXmlIconNames.calendar} size={IconSize.sm} color={theme.palette.graphite['900']} />
    </TouchableOpacity>
  );
};

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    container: {
      paddingVertical: 1,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: base.white,
      justifyContent: 'center',
      height: 30,
      alignItems: 'center',
      ...shadow6Style
    }
  });
};

export default BaseCalendarButton;

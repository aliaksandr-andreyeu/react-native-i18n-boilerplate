import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { config, UserTheme } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  fonts: { generalSans }
} = config;

interface Styles extends CommonStyles {
  safe: ViewStyle;
  headerTitleStyle: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme;
  const commonStyles = useCommonStyles(theme);
  return StyleSheet.create<Styles>({
    ...commonStyles,
    safe: {
      flex: 1
    },
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: generalSans.medium
    }
  });
};

export default useStyles;

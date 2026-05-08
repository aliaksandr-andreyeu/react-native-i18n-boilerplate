import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';

interface Styles {
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    safe: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 24,
      paddingTop: 8
    },
    scrollBox: {
      flexGrow: 1
    }
  });

export default useStyles;

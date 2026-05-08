import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';

interface Styles {
  safe: ViewStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1
    }
  });

export default useStyles;

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  container: ViewStyle;
  section: ViewStyle;
  scrollView: ViewStyle;
  row: ViewStyle;
  formTitle: TextStyle;
  rowWithIcon: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      flex: 1
    },
    scrollView: {
      flex: 1
    },
    section: {
      marginVertical: 12,
      marginHorizontal: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: palette.base.white,
      ...shadow6Style
    },
    row: {
      paddingVertical: 6
    },
    rowWithIcon: {
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    formTitle: {
      color: '#8fa6ae'
    }
  });
};

export default useStyles;

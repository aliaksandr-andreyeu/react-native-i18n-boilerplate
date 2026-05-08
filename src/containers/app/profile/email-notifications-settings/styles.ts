import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  container: ViewStyle;
  row: ViewStyle;
  section: ViewStyle;
  textWrap: ViewStyle;
  indicator: ViewStyle;
  subTitle: TextStyle;
  button: ViewStyle;
  scrollView: ViewStyle;
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
    row: {
      paddingVertical: 12,
      flexDirection: 'row',
      // alignItems: 'center',
      justifyContent: 'space-between'
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
    textWrap: {
      flex: 1
    },
    subTitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      color: '#8fa6ae'
    },
    indicator: {
      marginTop: '24%'
    },
    button: {
      marginTop: 'auto',
      marginHorizontal: 20,
      marginBottom: 20
    }
  });
};

export default useStyles;

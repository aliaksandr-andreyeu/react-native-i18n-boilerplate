import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { config, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

const {
  fonts: { unbounded }
} = config;

interface Styles {
  container: ViewStyle;
  profilePlus: ViewStyle;
  profileMinus: ViewStyle;
  img: ImageStyle;
  profitContainer: ViewStyle;
  title: TextStyle;
  date: TextStyle;
  titleContainer: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      backgroundColor: palette.base.white,
      borderRadius: 12,
      marginBottom: 10,
      width: 164,
      marginHorizontal: 5,
      ...shadow6Style
    },
    profilePlus: { backgroundColor: palette.green['400'] },
    profileMinus: { backgroundColor: palette.red[200] },
    img: {
      width: 32,
      height: 32,
      borderRadius: 100,
      marginLeft: 10,
      gap: 8
    },
    profitContainer: {
      alignSelf: 'flex-end',
      padding: 5,
      paddingVertical: 7,
      borderTopRightRadius: 12,
      borderBottomLeftRadius: 12
    },
    title: {
      color: palette.base.black,
      marginHorizontal: 10,
      fontFamily: unbounded.medium
    },
    date: {
      marginLeft: 10
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 12
    }
  });
};

export default useStyles;

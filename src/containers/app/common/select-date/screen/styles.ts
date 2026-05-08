import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  fonts: { generalSans }
} = config;

interface Styles extends CommonStyles {
  safe: ViewStyle;
  headerTitleStyle: TextStyle;
  calendar: ViewStyle;
  horizontal: ViewStyle;
  row: ViewStyle;
  topButton: ViewStyle;
  dateWrapper: ViewStyle;
  calendarHeader: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme;
  const commonStyles = useCommonStyles(theme);
  return StyleSheet.create<Styles>({
    ...commonStyles,
    safe: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      paddingBottom: 20
    },
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: generalSans.medium
    },
    calendar: {
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8
    },
    row: {
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      paddingLeft: 16,
      paddingTop: 8,
      paddingBottom: 4,
      backgroundColor: base.white,
      marginTop: 32,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    horizontal: {
      flexDirection: 'row'
    },
    topButton: {
      backgroundColor: '#ecf0f1',
      borderWidth: 0,
      borderRadius: 4
    },
    dateWrapper: {
      backgroundColor: 'white',
      alignItems: 'center',
      paddingVertical: 20,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8
    },
    calendarHeader: {
      flexDirection: 'row',
      gap: 4
    }
  });
};

export default useStyles;

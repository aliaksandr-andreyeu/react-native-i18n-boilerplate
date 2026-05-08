import { Dimensions, ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { config, UserTheme } from '@/constants';
import { rgba } from '@/helpers';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  headerBar: { height: headerBarSize },
  screenWidth
} = config;

interface Styles extends CommonStyles {
  profileIcon: ViewStyle;
  logoIcon: ViewStyle;
  safe: ViewStyle;
  screen: ViewStyle;
  content: ViewStyle;
  container: ViewStyle;
  button: ViewStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  calendarContainer: ViewStyle;
  calendar: ViewStyle;
  headContainer: ViewStyle;
  backDrop: ViewStyle;
  headerIcon: ViewStyle;
  blurImage: ImageStyle;
  headerPlaceholder: ViewStyle;
  searchImg: ImageStyle;
  signUpButton: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite }
  } = theme;
  const commonStyles = useCommonStyles(theme);
  return StyleSheet.create<Styles>({
    ...commonStyles,
    profileIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      width: headerBarSize,
      height: headerBarSize
    },
    logoIcon: {
      marginLeft: 20
    },
    safe: {
      flexGrow: 1
    },
    screen: {
      flexGrow: 1,
      backgroundColor: graphite['050']
    },
    content: {
      flexGrow: 1
    },
    container: {
      alignItems: 'center',
      flexGrow: 1,
      padding: 24
    },
    button: {
      marginTop: 32
    },
    list: { flex: 1 },
    listContent: {
      gap: 22,
      paddingBottom: 204
    },
    calendarContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
      backgroundColor: rgba(graphite['900'], 15)
    },
    calendar: {
      width: screenWidth - 40,
      alignSelf: 'center'
    },
    headContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      width: screenWidth - 40,
      alignSelf: 'center'
    },
    backDrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    headerIcon: {
      zIndex: 100,
      bottom: headerBarSize,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    blurImage: {
      width: screenWidth,
      height: '100%',
      bottom: 60
    },
    headerPlaceholder: { height: headerBarSize },
    searchImg: {
      width: 90,
      height: 90,
      marginBottom: 16
    },
    signUpButton: {
      marginRight: 20
    }
  });
};

export default useStyles;

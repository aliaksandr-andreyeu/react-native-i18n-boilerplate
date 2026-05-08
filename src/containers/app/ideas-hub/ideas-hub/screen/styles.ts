import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  headerBar: { height: headerBarSize },
  screenWidth
} = config;

interface Styles extends CommonStyles {
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  container: ViewStyle;
  logoIcon: ViewStyle;
  signInButton: ViewStyle;
  headerBox: ViewStyle;
  headerBtn: ViewStyle;
  profileIcon: ViewStyle;
  banner: ViewStyle;
  seperatorContainer: ViewStyle;
  seperatorTopContainer: ViewStyle;
  seperatorTopUp: ViewStyle;
  seperatorUp: ViewStyle;
  seperatorDown: ViewStyle;
  verifyBanner: ViewStyle;
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
    safe: {
      flexGrow: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingVertical: 24,
      paddingTop: 8
      // alignItems: 'center'
    },
    scrollBox: {
      flexGrow: 1
    },
    container: {
      flexGrow: 1,
      paddingBottom: 16,
      gap: 12
    },
    logoIcon: {
      marginLeft: 20
    },
    signInButton: {
      marginRight: 20
    },
    headerBox: {
      flexDirection: 'row',
      gap: 16,
      justifyContent: 'space-between',
      marginBottom: 16
    },
    headerBtn: {
      justifyContent: 'flex-end'
    },
    banner: {
      marginTop: 16,
      alignSelf: 'center',
      width: screenWidth - 40
    },
    seperatorContainer: {
      width: screenWidth,
      height: 44,
      backgroundColor: '#E1DFE5',
      gap: 8
    },
    seperatorTopContainer: {
      height: 34
    },
    seperatorUp: {
      width: '100%',
      height: 18,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorTopUp: {
      height: 8
    },
    seperatorDown: {
      width: '100%',
      height: 18,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    },
    verifyBanner: {
      marginHorizontal: 20
    }
  });
};

export default useStyles;

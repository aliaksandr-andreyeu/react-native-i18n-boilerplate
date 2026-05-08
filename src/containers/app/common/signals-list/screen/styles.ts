import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

interface Styles extends CommonStyles {
  bannerBox: ViewStyle;
  banner: ViewStyle;
  bannerWoButton: ViewStyle;
  safe: ViewStyle;
  screen: ViewStyle;
  chart: ViewStyle;
  content: ViewStyle;
  container: ViewStyle;
  logoIcon: ViewStyle;
  signInButton: ViewStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  tabLive: ViewStyle;
  topIconWrapper: ViewStyle;
  tabsContainer: ViewStyle;
  discoverButton: ViewStyle;
  headerStyle: ViewStyle;
  card: ViewStyle;
  emptyView: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme;

  const commonStyles = useCommonStyles(theme);
  const { shadow6Style } = commonStyles || {};

  return StyleSheet.create<Styles>({
    ...commonStyles,
    bannerBox: {
      marginTop: 8,
      marginBottom: 20,
      alignItems: 'center'
    },
    banner: {
      marginHorizontal: 0
    },
    bannerWoButton: {
      justifyContent: 'center'
    },
    safe: {
      flex: 1,
      flexGrow: 1
    },
    topIconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 20,
      width: 30,
      height: 30,
      backgroundColor: palette.base.white,
      borderRadius: 8,
      ...shadow6Style
    },
    screen: {
      height: '100%'
    },
    title: {
      marginTop: 16,
      textAlign: 'center'
    },
    desc: {
      marginTop: 8,
      textAlign: 'center'
    },
    scrollContent: {
      flexGrow: 1,
      paddingVertical: 24,
      paddingTop: 8,
      alignItems: 'center'
    },
    scrollBox: {
      flexGrow: 1
    },
    avatar: {
      width: 100,
      height: 100
    },
    roundButton: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 34,
      borderRadius: 34,
      paddingHorizontal: 14,
      backgroundColor: '#f1f5ff'
    },
    rounButtonSelected: {
      backgroundColor: palette.graphite['900']
    },
    label: {
      color: palette.graphite['900']
    },
    labelSelected: {
      color: palette.base.white
    },
    content: {
      flexGrow: 1
    },
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1
    },
    logoIcon: {
      marginLeft: 20
    },
    signInButton: {
      marginRight: 20
    },
    chart: {
      backgroundColor: '#ffffff',
      width: '100%',
      height: 250,
      borderRadius: 16
    },
    list: {
      marginTop: 4,
      flex: 1
    },
    listContent: {
      paddingTop: 8,
      paddingHorizontal: 20,
      paddingBottom: 80
    },
    card: {
      marginRight: 8
    },
    tabsContainer: { paddingVertical: 4 },
    discoverButton: { width: '100%' },
    emptyView: {
      alignItems: 'center',
      paddingTop: 40
    },
    tabLive: {
      position: 'absolute',
      backgroundColor: '#D5C2FF',
      right: 10,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 4,
      paddingHorizontal: 1,
      zIndex: 99
    }
  });
};

export default useStyles;

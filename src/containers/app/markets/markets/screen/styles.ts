import { Dimensions, ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

interface Styles {
  tabsHide: ViewStyle;
  emptyBox: ViewStyle;
  searchImg: ImageStyle;
  emptyTextBox: ViewStyle;
  textAlign: TextStyle;
  safe: ViewStyle;
  screen: ViewStyle;
  chart: ViewStyle;
  content: ViewStyle;
  container: ViewStyle;
  logoIcon: ViewStyle;
  signInButton: ViewStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  profileIcon: ViewStyle;
  tabsContainer: ViewStyle;
  searchContainer: ViewStyle;
  txt: TextStyle;
  img: ImageStyle;
  emptyContainer: ViewStyle;
  discoverButton: ViewStyle;
  headerStyle: ViewStyle;
  cancel: TextStyle;
  gap: ViewStyle;
}

const {
  headerBar: { height: headerBarSize }
} = config;

const { width } = Dimensions.get('window');
const useStyles = (theme: UserTheme) => {
  const {
    palette,
    colors: { primary }
  } = theme;
  const commonStyles = useCommonStyles(theme);
  return StyleSheet.create<Styles>({
    ...commonStyles,
    tabsHide: {
      overflow: 'hidden',
      display: 'none',
      height: 0
    },
    emptyBox: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      gap: 16
    },
    searchImg: {
      width: 90,
      height: 90,
      aspectRatio: 1
    },
    emptyTextBox: {
      gap: 8
    },
    textAlign: {
      textAlign: 'center'
    },
    safe: {
      flex: 1
    },
    profileIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      width: headerBarSize,
      height: headerBarSize
    },
    screen: {
      flex: 1
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
      width: '100%',
      alignSelf: 'center',
      marginTop: 12
    },
    listContent: {
      gap: 8,
      paddingBottom: 80,
      paddingHorizontal: 20,
      // alignItems: 'center',
      paddingTop: 3
    },
    tabsContainer: { paddingVertical: 4 },
    searchContainer: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      flexDirection: 'row',
      gap: 8,
      width: '100%'
    },
    txt: {
      textAlign: 'center'
    },
    img: { width: 90, height: 90 },
    emptyContainer: { gap: 16, alignItems: 'center', marginTop: 32 },
    discoverButton: { width: '100%' },
    cancel: {
      color: palette.text.interaction.basic.accent.default
    },
    gap: {
      gap: 8
    }
  });
};

export default useStyles;

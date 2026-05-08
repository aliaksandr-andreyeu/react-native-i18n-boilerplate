import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';

const {
  fonts: { generalSans },
  headerBar: { height }
} = config;

interface Styles {
  safe: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  scrollView: ViewStyle;
  explanationsWrapper: ViewStyle;
  expCount: ViewStyle;
  infoWrap: ViewStyle;
  row: ViewStyle;
  horizontal: ViewStyle;
  guidelineBanner: ViewStyle;
  exp: TextStyle;
  infoText: TextStyle;
  infoValue: TextStyle;
  safeImage: ImageStyle;
  wave: ImageStyle;
  nums: TextStyle;
  expireContainer: ViewStyle;
  redText: TextStyle;
  grayText: TextStyle;
  shrinkText: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { graphite, base, purple, red } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1,
      backgroundColor: graphite['050']
    },
    content: { flex: 1 },
    header: {
      height,
      paddingHorizontal: 10,
      justifyContent: 'center'
    },
    backButton: {
      alignSelf: 'flex-end',
      width: height,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    scrollView: {
      paddingBottom: 20,
      paddingHorizontal: 20,
      paddingTop: 8
    },
    explanationsWrapper: {
      borderRadius: 16,
      borderTopLeftRadius: 0,
      borderLeftColor: purple[500],
      borderLeftWidth: 4,
      marginTop: 12,
      padding: 16,
      backgroundColor: base.white,
      ...shadow6Style
    },
    exp: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      flex: 1
    },
    expCount: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: purple[200],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6
    },
    infoWrap: {
      borderRadius: 12,
      paddingVertical: 12,
      marginTop: 16,
      paddingHorizontal: 16,
      backgroundColor: base.white,
      ...shadow6Style
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14
    },
    infoText: {
      fontSize: 13,
      color: '#8fa6ae'
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    infoValue: {
      fontSize: 13,
      color: graphite['900'],
      fontFamily: generalSans.medium
    },
    safeImage: {
      width: 159,
      height: 159,
      right: -60,
      bottom: -48,
      position: 'absolute'
    },
    guidelineBanner: {
      marginTop: 16,
      marginHorizontal: 0,
      backgroundColor: purple[600],
      overflow: 'hidden'
    },
    wave: {
      overflow: 'hidden',
      height: 152,
      position: 'absolute',
      right: 0,
      top: 0
    },
    nums: {
      color: graphite['900']
    },
    redText: {
      color: red['600']
    },
    expireContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    grayText: { color: graphite['600'] },
    shrinkText: {
      flexShrink: 1
    }
  });
};

export default useStyles;

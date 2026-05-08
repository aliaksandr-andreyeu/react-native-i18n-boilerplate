import { StyleSheet, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { config } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  header: ViewStyle;
  headerButton: ViewStyle;
  buttonBox: ViewStyle;
  helpBox: ViewStyle;
  helpDesc: TextStyle;
  waitingAlign: ViewStyle;
  flex: ViewStyle;
  identifyContainer: ViewStyle;
  verifyImage: ImageStyle;
  verifyTop: ViewStyle;
  descContainer: ViewStyle;
  desc: ViewStyle;
  descIconContainer: ViewStyle;
  topContainer: ViewStyle;
}

const {
  isIOS,
  headerBar: { height }
} = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { border, background, green }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    flex: {
      flex: 1
    },
    safe: {
      flexGrow: 1
    },
    topContainer: { gap: 32 },
    scrollContent: {
      flexGrow: 1,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: 24,
      justifyContent: 'space-between'
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10
    },
    headerButton: {
      width: height,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    steps: {
      gap: 24
    },
    buttonBox: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 72,
      gap: 16
    },
    helpBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    helpDesc: {
      color: '#5D7278'
    },
    waitingAlign: { left: 1, bottom: 1 },
    identifyContainer: {
      backgroundColor: background.card.primary,
      paddingVertical: 12,
      borderRadius: 12,
      ...shadow6Style
    },
    verifyImage: {
      width: 45,
      height: 45,
      marginLeft: 12,
      marginRight: 12,
      marginTop: 1,
      marginBottom: 2
    },
    verifyTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingBottom: 12,
      borderBottomWidth: isIOS ? 0.5 : 1,
      borderStyle: isIOS ? 'solid' : 'dashed',
      borderBlockColor: border.base.divider
    },
    descContainer: {
      paddingTop: 12
    },
    desc: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    descIconContainer: {
      width: 30,
      height: 30,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: green[400]
    }
  });
};

export default useStyles;

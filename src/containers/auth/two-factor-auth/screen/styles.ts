import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { config } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  safe: ViewStyle;
  emptyScreen: ViewStyle;
  keyboardContainer: ViewStyle;
  keyboardContent: ViewStyle;
  backButton: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  titleBox: ViewStyle;
  codeInput: ViewStyle;
  focusedCodeInput: ViewStyle;
  error: ViewStyle;
  errorText: TextStyle;
  pinCodeText: TextStyle;
  warning: TextStyle;
}

const {
  headerBar: { height },
  fonts: { unbounded }
} = config;

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1
    },
    keyboardContainer: {
      flex: 1,
      flexGrow: 1
    },
    keyboardContent: {
      flex: 1,
      flexGrow: 1
    },
    backButton: {
      paddingHorizontal: 10,
      width: height,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    titleBox: {
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginBottom: 16
    },
    errorText: {
      color: '#C80030',
      marginHorizontal: 20,
      marginTop: 8
    },
    warning: {
      marginTop: 20,
      fontSize: 14,
      marginHorizontal: 20
    },
    emptyScreen: {
      backgroundColor: palette.base.white,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    codeInput: {
      borderWidth: 0,
      height: 50,
      backgroundColor: palette.base.white,
      borderRadius: 10,
      ...shadow6Style
    },
    focusedCodeInput: {
      borderWidth: 1,
      borderColor: palette.purple[800]
    },
    pinCodeText: {
      color: palette.graphite['900'],
      fontWeight: '700',
      fontSize: 20,
      fontFamily: unbounded.medium
    },
    error: {
      height: 50,
      backgroundColor: palette.base.white,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#C80030',
      ...shadow6Style
    }
  });
};

export default useStyles;

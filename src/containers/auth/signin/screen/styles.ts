import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { config } from '@/constants';

interface Styles {
  safe: ViewStyle;
  keyboardContainer: ViewStyle;
  keyboardContent: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  form: ViewStyle;
  subDescBox: ViewStyle;
  subDesc: TextStyle;
  buttonBox: ViewStyle;
  content: ViewStyle;
  orContainer: ViewStyle;
  haveAccount: ViewStyle;
  haveAccountText: TextStyle;
  signup: TextStyle;
  stick: ViewStyle;
  or: TextStyle;
  backContainer: ViewStyle;
}

const {
  headerBar: { height }
} = config;

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1
    },
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 20
    },
    keyboardContainer: {
      flex: 1,
      flexGrow: 1
    },
    or: { color: '#BDC3CF', bottom: 2 },
    stick: { flex: 1, height: 1, backgroundColor: '#D9E1E4' },
    orContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24
    },
    signup: {
      color: '#8050F1'
    },
    haveAccountText: {
      color: '#8890A1'
    },
    haveAccount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 24
    },
    keyboardContent: {
      flex: 1,
      flexGrow: 1
    },
    header: { marginTop: 3 },
    backButton: {
      width: height,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    scrollContent: {
      paddingHorizontal: 20
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    form: {
      marginTop: 16
    },
    subDescBox: {
      height: 42,
      alignItems: 'center',
      justifyContent: 'center'
    },
    subDesc: {
      color: '#5D7278',
      textAlign: 'center'
    },
    buttonBox: {
      paddingTop: 20,
      gap: 16
    },
    content: {
      flex: 1
    }
  });

export default useStyles;

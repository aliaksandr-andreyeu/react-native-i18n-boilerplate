import { StyleSheet, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { config } from '@/constants';

const {
  fonts: { generalSans },
  headerBar: { height }
} = config;

interface Styles {
  rules: ViewStyle;
  rule: ViewStyle;
  criteriaText: TextStyle;
  unActiveCheckIcon: ViewStyle;
  activeCheckIcon: ViewStyle;
  container: ViewStyle;
  keyboardContainer: ViewStyle;
  keyboardContent: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  content: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  titleBox: ViewStyle;
  formBox: ViewStyle;
  inBox: ViewStyle;
  formField: ViewStyle;
  buttonBox: ViewStyle;
  closeKeyboard: ViewStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    rules: {
      paddingVertical: 8,
      gap: 8
    },
    rule: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    unActiveCheckIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#8fa6ae'
    },
    activeCheckIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.green['400']
    },
    container: {
      flex: 1
    },
    keyboardContainer: {
      flex: 1,
      flexGrow: 1
    },
    keyboardContent: {
      flex: 1,
      flexGrow: 1
    },
    header: {
      height,
      paddingHorizontal: 10,
      justifyContent: 'center'
    },
    backButton: {
      width: height,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      flex: 1,
      flexGrow: 1
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
      paddingHorizontal: 20,
      paddingVertical: 12
    },
    formBox: {
      marginTop: 16,
      paddingHorizontal: 20,
      gap: 24
    },
    inBox: {
      gap: 8
    },
    formField: {
      marginBottom: 0
    },
    buttonBox: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 72,
      gap: 16
    },
    closeKeyboard: {
      alignSelf: 'flex-end',
      position: 'absolute',
      bottom: 16,
      right: 20,
      minWidth: 50
    },
    criteriaText: {
      fontWeight: '500',
      fontFamily: generalSans.medium
    }
  });

export default useStyles;

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { config } from '@/constants';

interface Styles {
  container: ViewStyle;
  keyboardContainer: ViewStyle;
  keyboardContent: ViewStyle;
  content: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  titleBox: ViewStyle;
  formBox: ViewStyle;
  formField: ViewStyle;
  buttonBox: ViewStyle;
  closeKeyboard: ViewStyle;
  emailBox: ViewStyle;
  currentEmail: TextStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
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
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12
    },
    formBox: {
      marginTop: 16,
      paddingHorizontal: 20,
      gap: 24
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
    emailBox: {
      paddingHorizontal: 20,
      paddingVertical: 12
    },
    currentEmail: {
      color: '#8fa6ae'
    }
  });

export default useStyles;

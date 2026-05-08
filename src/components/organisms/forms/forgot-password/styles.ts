import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { config } from '@/constants';

const {
  headerBar: { height }
} = config;

interface Styles {
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
  formField: ViewStyle;
  buttonBox: ViewStyle;
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
    }
  });

export default useStyles;

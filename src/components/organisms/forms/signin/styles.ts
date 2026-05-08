import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { BaseTextVariant } from '@/components/atoms';

interface Styles {
  container: ViewStyle;
  formFieldBox: ViewStyle;
  formField: ViewStyle;
  checkBox: ViewStyle;
  rememberMe: ViewStyle;
  unselected: ViewStyle;
  buttonsBox: TextStyle;
  textFont: TextStyle;
  rememberMeContainer: ViewStyle;
  forgot: TextStyle;
  loginBtn: ViewStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    container: {
      gap: 16
    },
    textFont: {
      color: '#8890A1',
      ...BaseTextVariant.text
    },
    loginBtn: { borderWidth: 0, backgroundColor: '#8050F1', marginVertical: 34 },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    formFieldBox: {
      gap: 16
    },
    formField: {
      marginBottom: 0
    },
    buttonsBox: {
      gap: 16
    },
    rememberMe: {
      flexDirection: 'row'
    },
    checkBox: {
      width: 24,
      height: 24,
      borderWidth: 0.5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F0F2F5',
      borderRadius: 8
    },
    unselected: {
      borderColor: '#8fa6ae',
      borderRadius: 5,
      width: 20,
      height: 20,
      marginRight: 8,
      borderWidth: 1
    },
    forgot: { color: '#8050F1' }
  });

export default useStyles;

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { config, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  safe: ViewStyle;
  keyboardContainer: ViewStyle;
  keyboardContent: ViewStyle;
  scrollContent: ViewStyle;
  button: ViewStyle;
  scrollBox: ViewStyle;
  inputWrapper: ViewStyle;
  transparentInput: ViewStyle;
  unActiveCheckIcon: ViewStyle;
  activeCheckIcon: ViewStyle;
  criteriaWrapper: ViewStyle;
  title: TextStyle;
  subTitle: TextStyle;
  criteria: TextStyle;
  iconStyle: ViewStyle;
  subDescBox: ViewStyle;
  subDesc: TextStyle;
  buttonBox: ViewStyle;
}

const {
  fonts: { unbounded }
} = config;

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};

  const { shadow0Style } = useCommonStyles(theme);

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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 32,
      paddingBottom: 34
    },
    scrollBox: {
      flexGrow: 1
    },
    title: {
      fontWeight: '500',
      fontSize: 20,
      fontFamily: unbounded.medium
    },
    subTitle: {
      marginTop: 8,
      color: '#5D7278'
    },
    button: {
      marginTop: 12,
      borderWidth: 0
    },
    inputWrapper: {
      marginTop: 16
    },
    transparentInput: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      ...shadow0Style
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
    criteriaWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8
    },
    criteria: {
      marginLeft: 8,
      fontWeight: '500'
    },
    iconStyle: {
      marginTop: 11,
      marginRight: 12,
      width: 20,
      height: 20
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
      gap: 16
    }
  });
};

export default useStyles;

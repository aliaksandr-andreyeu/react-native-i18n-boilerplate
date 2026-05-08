import { StyleSheet } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';

const {
  screenWidth,
  headerBar: { height: headerBarSize }
} = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { graphite, base, purple, icon, text, background }
  } = theme;

  const commonStyles = useCommonStyles(theme);
  const { shadow0Style, shadow6Style } = commonStyles || {};

  return StyleSheet.create({
    ...commonStyles,
    safe: {
      flexGrow: 1,
      flex: 1
    },
    labelSuffixBox: {
      height: 17,
      borderRadius: 8,
      backgroundColor: graphite['100'],
      paddingHorizontal: 6,
      justifyContent: 'center'
    },
    labelSuffixDesc: {
      color: text.base.primary
    },
    arrowIcon: {
      marginLeft: 20
    },
    profileIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      width: headerBarSize,
      height: headerBarSize
    },
    logoIcon: {
      marginLeft: 20
    },
    signUpButton: {
      marginRight: 20
    },
    title: {
      marginTop: 12,
      paddingHorizontal: 20
    },
    button: {
      bottom: 0,
      gap: 12,
      width: '100%',
      backgroundColor: 'rgba(247, 248, 250, 0.75)',
      alignItems: 'center',
      paddingHorizontal: 20,
      position: 'absolute',
      paddingTop: 12
    },
    btn: {
      width: '100%'
    },
    resetStyle: {
      backgroundColor: 'transparent',
      ...shadow0Style
    },
    list: {
      width: screenWidth - 40,
      alignSelf: 'center',
      backgroundColor: base.white,
      borderRadius: 12,
      marginTop: 4,
      ...shadow6Style
    },
    img: { width: 24, height: 24, borderRadius: 12 },
    radioStyle: { marginBottom: 0 },
    seperator: { height: 0.5, width: '100%', backgroundColor: 'rgba(180, 196, 201, 0.5)' },
    scrollBox: {
      marginTop: 24
    },
    scrollContent: {
      paddingBottom: 134
    },
    searchImg: {
      width: 90,
      height: 90
    },
    empty: {
      alignSelf: 'center',
      marginTop: 20,
      paddingHorizontal: 20
    },
    textAlign: {
      textAlign: 'center'
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    handle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    textContainer: {
      gap: 8
    },
    emptyList: {
      alignItems: 'center',
      gap: 16,
      paddingVertical: 24
    },
    balance: {
      color: text.title.secondary,
      paddingHorizontal: 20,
      marginTop: 8
    },
    completeVerification: {
      marginTop: 12,
      paddingHorizontal: 20
    },
    secure: {
      alignSelf: 'center',
      textAlign: 'center',
      paddingTop: 8,
      marginBottom: 20,
      color: '#5D7278'
    }
  });
};

export default useStyles;

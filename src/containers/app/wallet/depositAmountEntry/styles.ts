import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';

const { screenWidth } = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { red, text }
  } = theme;

  const commonStyles = useCommonStyles(theme);
  const { shadow6Style } = commonStyles || {};

  return StyleSheet.create({
    ...commonStyles,
    safe: {
      flexGrow: 1
    },
    title: {
      marginTop: 12,
      marginBottom: 8,
      marginHorizontal: 20
    },
    subTitle: {
      marginBottom: 30,
      marginHorizontal: 20
    },
    button: {
      marginHorizontal: 20,
      marginTop: 40
    },
    container: {
      flex: 1,
      justifyContent: 'space-between'
    },
    avoidView: {
      flex: 1
    },
    accountDetails: {
      marginTop: 32
    },
    input: {
      width: screenWidth - 40,
      alignSelf: 'center'
    },
    inputContainer: {
      gap: 12,
      marginTop: 24
    },
    detailText: {
      marginLeft: 20
    },
    errorText: {
      color: red['600'],
      marginLeft: 20
    },
    balance: {
      color: text.title.secondary,
      marginLeft: 20,
      marginBottom: 24
    },
    error: {
      color: red['600']
    },
    secure: {
      alignSelf: 'center',
      textAlign: 'center',
      color: '#5D7278',
      marginTop: 8
    },
    docContainer: { gap: 16, marginHorizontal: 20, marginBottom: 20 },
    guidesContainer: {
      paddingVertical: 12,
      backgroundColor: theme.palette.base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    doc: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 13,
      paddingLeft: 16,
      paddingRight: 12
    }
  });
};

export default useStyles;

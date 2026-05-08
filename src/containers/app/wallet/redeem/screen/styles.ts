import { StyleSheet } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

const useStyles = (theme: UserTheme) => {
  const {
    palette: { text, green }
  } = theme;

  const { shadow0Style } = useCommonStyles(theme);

  const colorSection = '#F0F2F5';

  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colorSection
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32
    },
    headerTitle: {
      flex: 1,
      alignItems: 'center',
      paddingRight: 24
    },
    contentBox: {
      paddingHorizontal: 20
    },
    primaryText: {
      color: text.title.primary
    },
    tertiaryText: {
      color: text.title.tertiary
    },
    title: {
      marginBottom: 18
    },
    description: {
      textAlign: 'center'
    },
    button: {
      marginBottom: 12,
      backgroundColor: green[400]
    },
    inputBox: {
      marginBottom: 58,
      borderRadius: 8,
      overflow: 'hidden',
      borderColor: '#58616C',
      borderWidth: 1
    },
    inputContainer: {
      ...shadow0Style,
      borderWidth: 0
    },
    input: {
      backgroundColor: '#D9DDE566',
      borderRadius: 0,
      color: text.base.secondary,
      paddingTop: 0,
      paddingBottom: 14
    },
    errorText: {
      color: '#EA4335',
      marginTop: 10
    },
    accounts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      marginBottom: 28
    },
    box: {
      flex: 1,
      marginHorizontal: 0
    },
    icon: {
      transform: [{ rotate: `180deg` }]
    }
  });
};

export default useStyles;

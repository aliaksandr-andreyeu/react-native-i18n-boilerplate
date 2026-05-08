import { StyleSheet } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { BaseTextVariant } from '@/components';

const useStyles = (theme: UserTheme) => {
  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flexGrow: 1
    },
    scrollContent: { paddingHorizontal: 20, paddingTop: 28 },
    header: {
      gap: 10
    },
    giftboxContainer: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      borderWidth: 1,
      borderColor: '#D5C2FF',
      borderRadius: 8,
      marginTop: 22,
      backgroundColor: '#fff',
      ...shadow6Style
    },
    gbImage: { width: 42, height: 42 },
    bonusInfo: {
      marginTop: 12,
      alignSelf: 'center',
      color: '#8890A1'
    },
    createAccount: {
      backgroundColor: '#8050F1',
      marginVertical: 34
    },
    orContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24
    },
    stick: { flex: 1, height: 1, backgroundColor: '#D9E1E4' },
    or: { color: '#BDC3CF', bottom: 2 },
    socialButtons: {
      gap: 16,
      marginTop: 17
    },
    haveAccount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    },
    haveAccountText: {
      color: '#8890A1'
    },
    login: {
      color: '#8050F1',
      ...BaseTextVariant.extraSmallSemiBold
    },
    newUser: {
      left: 10
    }
  });
};

export default useStyles;

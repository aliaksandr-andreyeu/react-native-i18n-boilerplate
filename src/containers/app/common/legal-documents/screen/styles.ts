import { StyleSheet } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { graphite, base } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flexGrow: 1
    },
    content: {
      flex: 1,
      backgroundColor: '#E1DFE5'
    },
    section: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: graphite['050'],
      borderRadius: 16,
      marginVertical: 10
    },
    head: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 10,
      backgroundColor: graphite['050'],
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16
    },
    list: {
      paddingVertical: 12,
      marginTop: 16,
      backgroundColor: base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    lastSection: {
      paddingBottom: 40,
      paddingHorizontal: 20,
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16
    },
    document: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10
    },
    documentTitle: {
      marginLeft: 15
    },
    header: { backgroundColor: graphite['050'] },
    indicator: { marginTop: 100 }
  });
};

export default useStyles;

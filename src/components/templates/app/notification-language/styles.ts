import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  radioStyle: ViewStyle;
  loading: ViewStyle;
  list: ViewStyle;
  loaderContainer: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { graphite, base } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    container: {
      justifyContent: 'space-between',
      backgroundColor: graphite['050'],
      padding: 16,
      paddingBottom: 34,
      gap: 30
    },
    content: {
      flexGrow: 0,
      flexShrink: 1,
      gap: 16
    },
    list: {
      flexGrow: 0,
      flexShrink: 1,
      overflow: 'hidden',
      backgroundColor: base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    radioStyle: { marginBottom: 0, borderRadius: 0 },
    loading: { marginBottom: 120, marginTop: 50 },
    loaderContainer: { height: '100%', alignItems: 'center', justifyContent: 'center' }
  });
};

export default useStyles;

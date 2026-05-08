import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  title: TextStyle;
  separatorContainer: ViewStyle;
  separatorUp: ViewStyle;
  separatorDown: ViewStyle;
  chart: ViewStyle;
  box: ViewStyle;
  card: ViewStyle;
  row: ViewStyle;
  rowLeft: ViewStyle;
  rowText: TextStyle;
  info: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    safe: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 0,
      paddingVertical: 24,
      paddingTop: 8,
      paddingBottom: 200
    },
    scrollBox: {
      flexGrow: 1
    },
    title: {
      marginBottom: 12
    },
    separatorContainer: {
      width: '100%',
      height: 40,
      backgroundColor: '#E1DFE5',
      gap: 8,
      justifyContent: 'space-between'
    },
    separatorUp: {
      width: '100%',
      height: 16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    separatorDown: {
      width: '100%',
      height: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    },
    chart: {
      zIndex: 1,
      paddingBottom: 12
    },
    box: {
      paddingHorizontal: 20,
      gap: 12
    },
    card: {
      backgroundColor: base.white,
      gap: 8,
      zIndex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      ...shadow6Style
    },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    rowLeft: {
      gap: 4,
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    rowText: {
      color: '#8fa6ae'
    },
    info: { flex: 1, textAlign: 'right', marginLeft: 15 }
  });
};

export default useStyles;

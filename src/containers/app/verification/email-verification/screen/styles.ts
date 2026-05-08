import { StyleSheet } from 'react-native';
import { UserTheme } from '@/constants';
import { config } from '@/constants';

const {
  headerBar: { height }
} = config;

const useStyles = ({ palette: { graphite, icon } }: UserTheme) =>
  StyleSheet.create({
    safe: {
      flexGrow: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: 24,
      gap: 8
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10
    },
    headerButton: {
      width: height,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonBox: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 34,
      gap: 16
    },
    gap16: { gap: 16 },
    gap8: { gap: 8 },
    signOutImage: { width: '100%', height: 243 },
    handleStyle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    handleIndicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetView: {
      backgroundColor: graphite['050'],
      gap: 48
    },
    sheetBorder: {
      borderRadius: 24,
      overflow: 'hidden'
    },
    margin: {
      marginHorizontal: 20
    },
    bottomSheetPaddingTop: {
      paddingTop: 64
    },
    sheetButtons: {
      marginTop: 12,
      marginHorizontal: 20,
      marginBottom: 34,
      gap: 12
    },
    textCenterAlign: {
      textAlign: 'center'
    }
  });

export default useStyles;

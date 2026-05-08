import { StyleSheet, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { BaseTextVariant } from '@/components';

interface Styles {
  safe: ViewStyle;
  content: ViewStyle;
  scrollBox: ViewStyle;
  txt: TextStyle;
  head: ViewStyle;
  section: ViewStyle;
  sectionBottom: ViewStyle;
  buttonsList: ViewStyle;
  row: ViewStyle;
  horizontal: ViewStyle;
  header: ViewStyle;
  btn: ViewStyle;
  label: TextStyle;
  infoText: TextStyle;
  title: TextStyle;
  gap8: ViewStyle;
  gap16: ViewStyle;
  sheetView: ViewStyle;
  margin: ViewStyle;
  handleIndicator: ViewStyle;
  handleStyle: ViewStyle;
  authImage: ImageStyle;
  signOutImage: ImageStyle;
  textCenterAlign: TextStyle;
  sheetButtons: ViewStyle;
  bottomSheetPaddingTop: ViewStyle;
  languageSheetBg: ViewStyle;
  languageSheetTop: ViewStyle;
  languageSheetList: ViewStyle;
  languageSheetButton: ViewStyle;
  languageSheetUp: ViewStyle;
  buttonRightText: TextStyle;
  buttonRight: ViewStyle;
  sheetBorder: ViewStyle;
  loading: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { purple, base, graphite, icon }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1
    },
    content: {
      flex: 1,
      backgroundColor: '#E1DFE5'
    },
    scrollBox: {
      gap: 8
    },
    sectionBottom: {
      paddingBottom: 120,
      paddingTop: 16,
      backgroundColor: graphite['050'],
      alignItems: 'center',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16
    },
    txt: { textAlign: 'center' },
    head: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 10,
      backgroundColor: graphite['050'],
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16
    },
    section: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: graphite['050'],
      borderRadius: 16
    },
    title: {
      marginTop: 16
    },
    buttonsList: {
      paddingVertical: 12,
      marginTop: 16,
      backgroundColor: base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 13,
      paddingHorizontal: 16
    },
    infoText: {
      fontSize: 13,
      color: graphite['900']
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: graphite['050'],
      paddingTop: 5,
      minHeight: 44,
      paddingHorizontal: 20,
      paddingBottom: 5
    },
    btn: {
      backgroundColor: purple['100'],
      borderWidth: 0
    },
    label: {
      ...BaseTextVariant.tag,
      color: graphite['900']
    },
    textCenterAlign: {
      textAlign: 'center'
    },
    sheetButtons: {
      marginTop: 12,
      marginHorizontal: 20,
      marginBottom: 34,
      gap: 12
    },
    gap16: { gap: 16 },
    gap8: { gap: 8 },
    authImage: { width: '100%', height: 250 },
    signOutImage: { width: '100%', height: 300 },
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
    margin: {
      marginHorizontal: 20
    },
    bottomSheetPaddingTop: {
      paddingTop: 64
    },
    languageSheetBg: {
      backgroundColor: graphite['050']
    },
    languageSheetTop: {
      paddingHorizontal: 20,
      gap: 20,
      paddingTop: 20
    },
    languageSheetList: {
      flexGrow: 0,
      flexShrink: 1,
      overflow: 'hidden',
      backgroundColor: theme.palette.base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    languageSheetButton: {
      marginTop: 12,
      marginBottom: 34
    },
    languageSheetUp: { gap: 12, flexGrow: 0, flexShrink: 1 },
    buttonRightText: {
      color: graphite['500']
    },
    buttonRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    sheetBorder: {
      borderRadius: 24,
      overflow: 'hidden'
    },
    loading: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      flex: 1,
      zIndex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
};

export default useStyles;

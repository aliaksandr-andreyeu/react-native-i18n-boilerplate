import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  fonts: { generalSans }
} = config;

interface Styles extends CommonStyles {
  headerTitleStyle: TextStyle;
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  descBox: ViewStyle;
  desc: TextStyle;
  socialBox: ViewStyle;
  socialCard: ViewStyle;
  socialItem: ViewStyle;
  logoBox: ViewStyle;
  disconnect: ImageStyle;
  handleStyle: ViewStyle;
  handleIndicator: ViewStyle;
  sheetView: ViewStyle;
  sheetViewContent: ViewStyle;
  sheetViewText: TextStyle;
  textAlignCenter: TextStyle;
  sheetButtons: ViewStyle;
  socialButton: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite, icon }
  } = theme || {};

  const commonStyles = useCommonStyles(theme);
  const { shadow6Style } = commonStyles || {};

  return StyleSheet.create<Styles>({
    ...commonStyles,
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: generalSans.medium
    },
    safe: {
      flexGrow: 1,
      backgroundColor: graphite['050']
    },
    scrollContent: {
      flexGrow: 1
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    descBox: {
      paddingHorizontal: 20,
      paddingVertical: 12
    },
    desc: {
      color: '#5D7278'
    },
    socialBox: {
      paddingHorizontal: 20,
      paddingVertical: 12
    },
    socialCard: {
      paddingVertical: 12,
      backgroundColor: base.white,
      borderRadius: 12,
      ...shadow6Style
    },
    socialItem: {
      height: 42,
      paddingVertical: 8,
      paddingLeft: 16,
      paddingRight: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16
    },
    logoBox: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center'
    },
    disconnect: {
      width: '100%',
      height: 'auto',
      aspectRatio: 360 / 243
    },
    handleStyle: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    handleIndicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetView: {
      paddingTop: 42,
      backgroundColor: graphite['050'],
      gap: 48
    },
    sheetViewContent: {
      gap: 16
    },
    sheetViewText: {
      gap: 8,
      paddingHorizontal: 20
    },
    textAlignCenter: {
      textAlign: 'center'
    },
    sheetButtons: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      gap: 12
    },
    socialButton: {
      minWidth: 88
    }
  });
};

export default useStyles;

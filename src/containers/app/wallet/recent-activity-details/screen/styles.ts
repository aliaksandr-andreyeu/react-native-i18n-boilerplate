import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';

const {
  headerBar: { height }
} = config;

interface Styles {
  safe: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  content: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitleBox: ViewStyle;
  sectionIcon: ViewStyle;
  sectionBox: ViewStyle;
  sectionRow: ViewStyle;
  sectionCol: ViewStyle;
  sectionRight: ViewStyle;
  sectionDescRow: ViewStyle;
  sectionDesc: TextStyle;
  sectionCaption: TextStyle;
  statusPending: TextStyle;
  statusDeclined: TextStyle;
  buttonsBox: ViewStyle;
  primaryButtonLabel: TextStyle;
  primaryButton: ViewStyle;
  secondaryButtonLabel: TextStyle;
  secondaryButton: ViewStyle;
  cancelImg: ImageStyle;
  handleStyle: ViewStyle;
  handleIndicator: ViewStyle;
  sheetView: ViewStyle;
  sheetViewContent: ViewStyle;
  sheetViewText: TextStyle;
  textAlignCenter: TextStyle;
  sheetButtons: ViewStyle;
  blankImg: ViewStyle;
  logoImg: ImageStyle;
  fromLogoBox: ViewStyle;
  toLogoBox: ViewStyle;
  imageBg: ViewStyle;
  imageSize: ImageStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { purple, base, graphite, red, icon }
  } = theme;

  const { shadow0Style, shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1,
      backgroundColor: graphite['050']
    },
    header: {
      height,
      paddingHorizontal: 10,
      justifyContent: 'center'
    },
    backButton: {
      width: height,
      height: height,
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      gap: 12
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    sectionHeader: {
      paddingVertical: 12,
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    sectionTitleBox: {
      gap: 8
    },
    sectionIcon: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center'
    },
    sectionBox: {
      backgroundColor: base.white,
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      ...shadow6Style
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    sectionCol: {
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    sectionRight: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center'
    },
    sectionDescRow: {
      gap: 4,
      flexDirection: 'row',
      alignItems: 'center'
    },
    sectionDesc: {
      color: '#5D7278'
    },
    sectionCaption: {
      color: '#8fa6ae'
    },
    statusDeclined: {
      color: red['600']
    },
    statusPending: {
      color: graphite['500']
    },
    buttonsBox: {
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 12
    },
    primaryButtonLabel: {},
    primaryButton: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      ...shadow0Style
    },
    secondaryButtonLabel: {},
    secondaryButton: {
      backgroundColor: purple['100'],
      borderColor: purple['100'],
      ...shadow0Style
    },
    cancelImg: {
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
    blankImg: {
      width: 32,
      height: 32,
      borderRadius: 32,
      overflow: 'hidden',
      backgroundColor: graphite['100']
    },
    logoImg: {
      width: 32,
      height: 32,
      borderRadius: 32,
      overflow: 'hidden'
    },
    fromLogoBox: {
      position: 'absolute',
      top: 2,
      left: 0
    },
    toLogoBox: {
      position: 'absolute',
      bottom: 2,
      right: 0,
      borderRadius: 30,
      borderWidth: 3,
      borderColor: base.white
    },
    imageBg: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16
    },
    imageSize: {
      width: 18,
      height: 18
    }
  });
};

export default useStyles;

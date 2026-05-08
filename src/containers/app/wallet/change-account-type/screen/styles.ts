import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  tabsContainer: ViewStyle;
  tabs: ViewStyle;
  tabsContent: ViewStyle;
  button: ViewStyle;
  box: ViewStyle;
  accountHeader: ViewStyle;
  accountHeaderImage: ImageStyle;
  accountHeaderText: TextStyle;
  infoBox: ViewStyle;
  row: ViewStyle;
  topFeaturesImageBox: ViewStyle;
  topFeaturesImage: ImageStyle;
  switchBox: ViewStyle;
  indicator: ViewStyle;
  sheetBg: ViewStyle;
  confirmationImage: ImageStyle;
  switchContainer: ViewStyle;
  switchImageContainer: ViewStyle;
  switchImageExt: ViewStyle;
  switchTextContainer: ViewStyle;
  textCenter: TextStyle;
  defaultAccountBox: ViewStyle;
  defaultAccountText: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const commonStyles = useCommonStyles(theme);
  const { shadow6Style } = commonStyles || {};

  const { palette } = theme || {};
  const { text, background, icon } = palette || {};

  return StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1,
      flex: 1,
      backgroundColor: background.base.primary
    },
    scrollContent: {
      flexGrow: 1
    },
    scrollBox: {
      flexGrow: 1
    },
    defaultAccountBox: {
      paddingVertical: 20,
      paddingHorizontal: 24
    },
    defaultAccountText: {
      color: text.base.secondary
    },
    button: {
      paddingHorizontal: 8,
      ...shadow6Style
    },
    tabsContainer: {},
    tabs: {
      alignSelf: 'flex-start'
    },
    tabsContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3,
      paddingVertical: 12,
      paddingHorizontal: 20,
      gap: 12,
      alignSelf: 'flex-start'
    },
    box: {
      paddingTop: 8,
      paddingBottom: 16,
      paddingHorizontal: 20,
      gap: 16
    },
    accountHeader: {
      backgroundColor: background.card.secondary,
      minHeight: 104,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 40,
      overflow: 'hidden',
      gap: 8
    },
    accountHeaderImage: {
      borderTopRightRadius: 12,
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      aspectRatio: 1
    },
    accountHeaderText: {
      color: text.base.inverted
    },
    infoBox: {
      backgroundColor: background.card.primary,
      borderRadius: 12,
      paddingVertical: 12,
      ...shadow6Style
    },
    row: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
      alignItems: 'center',
      flexDirection: 'row'
    },
    topFeaturesImageBox: {
      borderRadius: 16,
      overflow: 'hidden',
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center'
    },
    topFeaturesImage: {
      width: 14,
      height: 14
    },
    switchBox: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      gap: 12
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetBg: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: background?.base?.primary
    },
    confirmationImage: {
      width: '100%',
      height: 'auto',
      aspectRatio: 360 / 243
    },
    switchImageContainer: {
      paddingTop: 40,
      paddingBottom: 48,
      gap: 16
    },
    switchImageExt: {
      paddingBottom: 32
    },
    switchTextContainer: {
      gap: 8,
      alignItems: 'center'
    },
    switchContainer: {},
    textCenter: {
      textAlign: 'center'
    }
  });
};

export default useStyles;

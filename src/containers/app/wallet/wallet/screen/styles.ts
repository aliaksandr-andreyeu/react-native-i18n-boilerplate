import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  headerBar: { height: headerBarSize }
} = config;

interface Styles extends CommonStyles {
  profileIcon: ViewStyle;
  signUpButton: ViewStyle;
  logoIcon: ViewStyle;
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  topSection: ViewStyle;
  topSectionWithBanner: ViewStyle;
  title: TextStyle;
  balance: ViewStyle;
  balanceWithBanner: ViewStyle;
  section: ViewStyle;
  sectionBottom: ViewStyle;
  row: ViewStyle;
  horizontal: ViewStyle;
  verifyBanner: ViewStyle;
  unAuthorizedSection: ViewStyle;
  helpButton80: ViewStyle;
  helpButton140: ViewStyle;
  welcomeBanner: ViewStyle;
  tradingSection: ViewStyle;
  tradingContent: ViewStyle;
  inviteBtn: ViewStyle;
  indicator: ViewStyle;
  sheetBgStyle: ViewStyle;
  sheetView: ViewStyle;
  sheetTop: ViewStyle;
  sheetTopTextContainer: ViewStyle;
  sheetAccountNo: TextStyle;
  sheetTradingIconContainer: ViewStyle;
  sheetIcon: ImageStyle;
  sheetBottom: ViewStyle;
  sheetBottomDefaultContainer: ViewStyle;
  sheetDefaultTextContainer: ViewStyle;
  sheetDefaultInfo: TextStyle;
  sheetSeeDetailsContainer: ViewStyle;
  sheetSeeDetails: TextStyle;
  keyImage: ImageStyle;
  completeImageContainer: ViewStyle;
  completeVerificationContainer: ViewStyle;
  textWidth: TextStyle;
  textAlign: TextStyle;
  alignCenter: TextStyle;
  paddingZero: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { text, icon, background } = palette || {};

  const commonStyles = useCommonStyles(theme);
  const { shadow6Style } = commonStyles || {};

  return StyleSheet.create<Styles>({
    ...commonStyles,
    profileIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      width: headerBarSize,
      height: headerBarSize
    },
    signUpButton: {
      marginRight: 20
    },
    logoIcon: {
      marginLeft: 20
    },
    safe: {
      flexGrow: 1,
      backgroundColor: background.base.primary
    },
    scrollContent: {
      flexGrow: 1
    },
    scrollBox: {
      flexGrow: 1
    },
    topSection: {
      paddingVertical: 16
    },
    topSectionWithBanner: {
      paddingVertical: 0,
      paddingTop: 16,
      paddingBottom: 0
    },
    title: {
      color: text.title.tertiary
    },
    balance: {
      alignItems: 'center',
      marginBottom: 12
    },
    balanceWithBanner: {
      marginBottom: 24
    },
    section: {
      paddingHorizontal: 20
    },
    sectionBottom: {
      paddingBottom: 32
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 12
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    verifyBanner: {
      paddingHorizontal: 20,
      marginTop: 12
    },
    unAuthorizedSection: {
      flex: 1,
      paddingBottom: 24
    },
    helpButton80: {
      width: 80
    },
    helpButton140: {
      width: 140,
      alignSelf: 'flex-end'
    },
    welcomeBanner: {
      marginBottom: 16
    },
    tradingSection: {},
    tradingContent: {
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: 10
    },
    inviteBtn: {
      marginTop: 20
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    sheetBgStyle: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor: background?.base?.primary
    },
    sheetView: {
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 12,
      paddingBottom: 34
    },
    sheetTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingVertical: 12
    },
    sheetTopTextContainer: {
      flex: 1
    },
    sheetAccountNo: {
      color: palette.graphite['600']
    },
    sheetTradingIconContainer: {
      borderRadius: 8,
      backgroundColor: palette.icon.base.strong,
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30
    },
    sheetIcon: {
      width: 18,
      height: 18
    },
    sheetBottom: {
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: palette.base.white,
      ...shadow6Style
    },
    sheetBottomDefaultContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16
    },
    sheetDefaultTextContainer: {
      gap: 4,
      flex: 1
    },
    sheetDefaultInfo: {
      color: '#8fa6ae'
    },
    sheetSeeDetailsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    sheetSeeDetails: {
      flex: 1
    },
    keyImage: {
      width: 90,
      height: 90
    },
    completeImageContainer: {
      alignItems: 'center',
      gap: 16
    },
    completeVerificationContainer: {
      gap: 60,
      paddingHorizontal: 20,
      paddingTop: 44,
      paddingBottom: 34
    },
    textWidth: {
      width: 320
    },
    textAlign: {
      textAlign: 'center',
      alignSelf: 'center',
      maxWidth: 320
    },
    alignCenter: {
      textAlign: 'center'
    },
    paddingZero: {
      paddingHorizontal: 0
    }
  });
};

export default useStyles;

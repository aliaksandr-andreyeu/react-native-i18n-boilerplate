import { ViewStyle, StyleSheet, TextStyle, ImageStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';

const {
  fonts: { unbounded }
} = config;

interface Styles {
  sheetContainer: ViewStyle;
  sheetBgStyle: ViewStyle;
  sheetCaption: ViewStyle;
  sheetTitle: ViewStyle;
  sheetDetails: ViewStyle;
  row: ViewStyle;
  dateRow: ViewStyle;
  disabledDetails: ViewStyle;
  horizontal: ViewStyle;
  signalInfo: ViewStyle;
  sheetDesc: TextStyle;
  howMuchInvest: TextStyle;
  amount: TextStyle;
  positionText1: TextStyle;
  positionText2: TextStyle;
  available: TextStyle;
  changeTypeText: TextStyle;
  buttonsWrapper: ViewStyle;
  actionButton: ViewStyle;
  settingsButton: ViewStyle;
  fieldName: TextStyle;
  guidanceImage: ImageStyle;
  guidanceText: TextStyle;
  guidanceTitle: TextStyle;
  guidanceButton: ViewStyle;
  indicator: ViewStyle;
  alertBox: ViewStyle;
  height44: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, icon, graphite }
  } = theme || {};

  const { shadow0Style, shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    sheetContainer: {
      paddingTop: 24,
      paddingHorizontal: 20,
      paddingBottom: 32
    },
    sheetBgStyle: {
      borderRadius: 24,
      backgroundColor: graphite['050']
    },
    sheetCaption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16
    },
    sheetTitle: {
      gap: 8
    },
    sheetDesc: {
      color: '#5D7278'
    },
    howMuchInvest: {
      marginTop: 20,
      marginBottom: 32
    },
    amount: {
      fontSize: 10,
      color: graphite['900'],
      fontWeight: '500',
      fontFamily: unbounded.medium
    },
    disabledDetails: {
      backgroundColor: 'transparent',
      ...shadow0Style
    },
    row: {
      marginTop: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    positionText1: {
      color: graphite['600'],
      lineHeight: 12.5
    },
    positionText2: {
      color: graphite[900],
      lineHeight: 17.5
    },
    sheetDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 30,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: base.white,
      ...shadow6Style
    },
    signalInfo: {
      borderWidth: 1,
      borderColor: '#ecf0f1',
      marginTop: 12,
      marginBottom: 0,
      marginHorizontal: 0,
      paddingBottom: 8,
      paddingTop: 8
    },
    available: {
      marginTop: 8
    },
    changeTypeText: {
      fontWeight: '500',
      color: graphite['900'],
      marginRight: 4
    },
    buttonsWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    actionButton: {
      flex: 0.95,
      borderWidth: 0
    },
    settingsButton: {
      width: 42
    },
    fieldName: {
      marginTop: 8,
      marginBottom: 24
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12
    },
    guidanceImage: {
      marginTop: 20,
      width: 90,
      height: 90,
      alignSelf: 'center'
    },
    guidanceText: {
      marginTop: 8,
      textAlign: 'center'
    },
    guidanceTitle: {
      marginTop: 16,
      textAlign: 'center'
    },
    guidanceButton: {
      marginTop: 50
    },
    alertBox: {
      marginTop: 16
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    height44: { height: 44 }
  });
};

export default useStyles;

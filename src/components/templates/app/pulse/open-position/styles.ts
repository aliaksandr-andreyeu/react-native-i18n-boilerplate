import { config, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { StyleSheet } from 'react-native';

const {
  screenWidth,
  fonts: { unbounded }
} = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, icon, graphite, text, purple }
  } = theme || {};

  const { shadow0Style, shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    sheetContainer: {
      paddingTop: 24,
      paddingHorizontal: 28,
      paddingBottom: 32
    },
    sheetBgStyle: {
      borderRadius: 24,
      backgroundColor: graphite['050']
    },
    sheetCaption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16
    },
    sheetTitle: {
      gap: 2
    },
    title: { lineHeight: 27 },
    sheetTitleRightContainer: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center'
    },
    sheetDesc: {
      color: '#5D7278'
    },
    howMuchInvest: {
      marginTop: 40,
      marginBottom: 18
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
      color: text.title.hint,
      lineHeight: 12.5
    },
    grayText1: {
      color: '#58616C'
    },
    positionText2: {
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
      paddingTop: 8,
      zIndex: 0
    },
    available: {
      maxHeight: 15
    },
    changeTypeText: {
      fontWeight: '500',
      color: graphite['900'],
      marginRight: 4
    },
    buttonsWrapper: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    actionButton: {
      flex: 1
    },
    settingsButton: {
      width: 42
    },
    fieldName: {
      marginTop: 20,
      marginBottom: 15
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 21
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
    height44: { height: 44 },
    grayText: {
      color: text.title.hint
    },
    middleBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11
    },
    redStick: {
      height: 5,
      borderRadius: 16,
      backgroundColor: '#F6465D'
    },
    greenStick: {
      height: 5,
      borderRadius: 16,
      backgroundColor: '#2ECC71'
    },
    sticks: {
      flexDirection: 'row',
      flex: 1
    },
    tpSlSparator: {
      flex: 1,
      height: 0.5,
      backgroundColor: '#D9DDE5'
    },
    tpSlContainer: {
      gap: 24,
      paddingBottom: 29,
      paddingTop: 34
    },
    limitsContainer: {
      gap: 12,
      marginTop: 16,
      marginBottom: 24
    },
    separator: {
      height: 0.5,
      width: screenWidth - 38,
      backgroundColor: '#D9DDE5',
      alignSelf: 'center'
    },
    inputLimitsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24
    },
    enterMax: {
      color: '#8050F1',
      lineHeight: 13
    },
    btnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6.83,
      paddingVertical: 11,
      paddingHorizontal: 20,
      flex: 1
    },
    wrapper: {
      borderRadius: 8,
      minHeight: 42,
      overflow: 'hidden'
    },
    sellBg: { backgroundColor: '#F6465D' },
    whiteText: { color: base.white },
    sellTriangle: {
      transform: [{ rotate: '180deg' }]
    },
    disabledActionStyle: {
      opacity: 0.5
    },
    amountsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 25
    },
    amountsContainerJustify: {
      justifyContent: 'space-between'
    },
    amountsContainerJustifyUndefined: {
      justifyContent: undefined
    },
    amountBtn: {
      width: '29%',
      paddingVertical: 7,
      height: 30,
      marginBottom: 12,
      borderColor: '#8050F1',
      paddingHorizontal: 8,
      backgroundColor: theme.palette.background.card.primary
    },
    inputBorder: { borderWidth: 0.5 },
    emptyDate: { padding: 4 },
    extraMargin: { marginTop: 10 },
    errorText: {
      textAlign: 'right',
      color: '#F6465D'
    },
    tpGap: {
      gap: 4
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
    },
    selectedAmountButton: {
      color: purple[800]
    },
    unselectedAmountButton: {
      color: graphite[900]
    },
    lastAmountBtnMarginRight: {
      marginRight: 12
    },
    notLastAmountBtnMarginRight: {
      marginRight: 0
    },
    selectedAmountBtnBorderWidth: {
      borderWidth: 0.5
    },
    unSelectedAmountBtnBorderWidth: {
      borderWidth: 0
    }
  });
};

export default useStyles;

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

interface Styles extends CommonStyles {
  keyboardContainer: ViewStyle;
  keyboardContent: ViewStyle;
  formField: ViewStyle;
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  amount: ViewStyle;
  caption: ViewStyle;
  row: ViewStyle;
  horizontal: ViewStyle;
  positionText: TextStyle;
  titleBox: ViewStyle;
  desc: TextStyle;
  available: TextStyle;
  availableTextWrap: ViewStyle;
  header: ViewStyle;
  arrowIcon: ViewStyle;
  buttons: ViewStyle;
  sheetDetails: ViewStyle;
  disabledDetails: ViewStyle;
  changeTypeText: TextStyle;
  alertBox: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { blue, graphite, base }
  } = theme || {};

  const commonStyles = useCommonStyles(theme);
  const { shadow0Style, shadow6Style } = commonStyles || {};

  return StyleSheet.create<Styles>({
    ...commonStyles,
    keyboardContainer: {
      flex: 1,
      flexGrow: 1
    },
    keyboardContent: {
      flex: 1,
      flexGrow: 1
    },
    formField: {
      marginBottom: 0
    },
    safe: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 0,
      gap: 20
    },
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    amount: {
      gap: 12
    },
    caption: {
      gap: 16,
      paddingTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    positionText: {
      fontSize: 10,
      color: '#8fa6ae'
    },
    titleBox: {
      flex: 1,
      gap: 8,
      paddingVertical: 12
    },
    desc: {
      color: '#5D7278'
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      paddingHorizontal: 20,
      gap: 24
    },
    arrowIcon: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttons: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 44
    },
    available: {
      fontSize: 13,
      color: '#8fa6ae'
    },
    availableTextWrap: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
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
    disabledDetails: {
      backgroundColor: 'transparent',
      ...shadow0Style
    },
    changeTypeText: {
      fontWeight: '500',
      color: graphite['900'],
      marginRight: 4
    },
    alertBox: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: '#E8EEFF',
      borderLeftWidth: 4,
      borderColor: blue[500],
      gap: 4,
      marginTop: 16
    }
  });
};

export default useStyles;

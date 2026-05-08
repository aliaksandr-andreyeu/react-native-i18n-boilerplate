import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme, config } from '@/constants';
import { rgba } from '@/helpers';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  screenWidth,
  fonts: { generalSans }
} = config;

interface Styles extends CommonStyles {
  headerTitleStyle: TextStyle;
  safe: ViewStyle;
  scrollBox: ViewStyle;
  datePickerBox: ViewStyle;
  datePickerDate: ViewStyle;
  datePickerDateBtn: ViewStyle;
  datePickerDateText: TextStyle;
  datePickerContainer: ViewStyle;
  datePickerBackDrop: ViewStyle;
  calendar: ViewStyle;
  separatorContainer: ViewStyle;
  separatorUp: ViewStyle;
  separatorDown: ViewStyle;
  sectionHeader: ViewStyle;
  sectionBox: ViewStyle;
  sectionItemBox: ViewStyle;
  emptyBox: ViewStyle;
  textAlign: TextStyle;
  emptyImg: ImageStyle;
  emptyTextBox: TextStyle;
  loaderBox: ViewStyle;
  calendarHeader: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { purple, base, graphite }
  } = theme;

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
    scrollBox: {
      flex: 1,
      flexGrow: 1
    },
    datePickerBox: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16
    },
    datePickerDate: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8
    },
    datePickerDateBtn: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center'
    },
    datePickerDateText: {
      color: purple['500']
    },
    datePickerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: rgba(graphite['900'], 15),
      flex: 1
    },
    datePickerBackDrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    calendar: {
      alignSelf: 'center',
      width: screenWidth - 40
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
    sectionHeader: {
      paddingHorizontal: 20
    },
    sectionBox: {
      marginTop: 6,
      paddingHorizontal: 20,
      paddingVertical: 10
    },
    sectionItemBox: {
      zIndex: 1,
      backgroundColor: base.white,
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      ...shadow6Style
    },
    emptyBox: {
      width: '100%',
      paddingHorizontal: 20,
      gap: 16
    },
    textAlign: {
      textAlign: 'center'
    },
    emptyImg: {
      width: 90,
      height: 90,
      alignSelf: 'center'
    },
    emptyTextBox: {
      gap: 8
    },
    loaderBox: {
      flex: 1
    },
    calendarHeader: {
      flexDirection: 'row',
      gap: 4
    }
  });
};
export default useStyles;

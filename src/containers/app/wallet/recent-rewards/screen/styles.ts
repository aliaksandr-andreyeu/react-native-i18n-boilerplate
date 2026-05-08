import { config } from '@/constants';
import { rgba } from '@/helpers';
import { useCommonStyles } from '@/hooks';
import { useTheme } from '@react-navigation/native';
import { Dimensions, StyleSheet } from 'react-native';

export const useStyles = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { text } = palette || {};
  const { shadow6Style } = useCommonStyles(theme);
  const { screenWidth } = config;

  return StyleSheet.create({
    box: {
      paddingHorizontal: 20
    },
    primaryText: {
      color: text.title.primary
    },
    wrapper: {
      flex: 1,
      flexDirection: 'column',
      rowGap: 20,
      paddingTop: 16
    },
    rewardsWrapper: {
      flex: 1,
      flexGrow: 1,
      flexDirection: 'column',
      paddingHorizontal: 20
    },
    container: {
      flexDirection: 'column',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: palette.base.white,
      ...shadow6Style
    },
    headerTitle: {
      color: palette.graphite[900],
      marginBottom: 16
    },
    itemWrapper: {
      flexGrow: 1,
      width: '100%',
      flexDirection: 'row',
      paddingVertical: 8
    },
    itemWithBorder: {
      borderBottomWidth: 1,
      borderBottomColor: '#D9E1E4'
    },
    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    },
    textContentWrapper: {
      flexDirection: 'column',
      rowGap: 4,
      marginLeft: 16
    },
    title: {
      textTransform: 'uppercase',
      color: palette.graphite[900]
    },
    description: {
      color: palette.graphite[400]
    },
    valueWrapper: {
      flex: 1,
      flexGrow: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end'
    },
    value: {
      color: palette.green[600]
    },
    emptyBox: {
      width: '100%',
      paddingHorizontal: 20,
      gap: 16
    },
    emptyTextBox: {
      gap: 8
    },
    emptyImg: {
      width: 90,
      height: 90,
      alignSelf: 'center'
    },
    textAlign: {
      textAlign: 'center'
    },
    calendarHeader: {
      flexDirection: 'row',
      gap: 4
    },
    datePickerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: rgba(palette.graphite['900'], 15),
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
    datePickerDateText: {
      color: palette.purple['500']
    },
    datePickerDateBtn: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
};

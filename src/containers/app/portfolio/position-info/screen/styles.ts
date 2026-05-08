import { BaseTextVariant } from '@/components';
import { UserTheme, config } from '@/constants';
import { Dimensions, StyleSheet } from 'react-native';
import { useCommonStyles } from '@/hooks';

const { headerBar } = config;

const { width } = Dimensions.get('window');

const screenWidth = width - 40;

const useStyles = (theme: UserTheme) => {
  const {
    palette: {
      base: { white },
      graphite,
      purple,
      icon
    }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    headerStyle: {
      backgroundColor: graphite['050'],
      height: headerBar.height,
      borderBottomWidth: 0.5,
      borderBottomColor: graphite['050'],
      ...shadow6Style
    },
    headerTitle: {
      ...BaseTextVariant.caption,
      color: graphite['900']
    },
    safe: {
      flexGrow: 1
    },
    screen: {
      flexGrow: 1,
      backgroundColor: graphite['050']
    },
    field: {
      color: '#8fa6ae'
    },
    container: {
      paddingTop: 8,
      backgroundColor: white,
      borderRadius: 12,
      gap: 12,
      marginTop: 12,
      width: screenWidth,
      alignSelf: 'center',
      ...shadow6Style
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    at: {
      color: '#5D7278'
    },
    head: {
      gap: 8,
      paddingVertical: 12,
      marginTop: 12,
      width: screenWidth,
      alignSelf: 'center'
    },
    second: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    shares: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      backgroundColor: white,
      ...shadow6Style
    },
    btnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      marginTop: 28,
      width: screenWidth,
      alignSelf: 'center'
    },
    editBtn: {
      flex: 1,
      backgroundColor: purple['100'],
      borderWidth: 0
    },
    sellBtn: {
      flex: 1
    },
    edit: {
      ...BaseTextVariant.textSemiBold,
      color: graphite['900']
    },
    sell: {
      ...BaseTextVariant.textSemiBold
    },
    content: {
      paddingBottom: 60
    },
    bottomSheet: {
      backgroundColor: graphite['050'],
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    sheetBgStyle: {
      backgroundColor: graphite['050']
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    }
  });
};

export default useStyles;

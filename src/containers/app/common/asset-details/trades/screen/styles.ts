import { StyleSheet } from 'react-native';
import { UserTheme, config } from '@/constants';

const { screenWidth } = config;

export const useStyles = ({ palette: { graphite, icon } }: UserTheme) =>
  StyleSheet.create({
    list: {
      flex: 1
    },
    title: {
      textAlign: 'left',
      marginHorizontal: 20,
      marginVertical: 12
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: 200
    },
    container: {
      flex: 1
    },
    seperatorContainer: {
      width: screenWidth,
      height: 40,
      backgroundColor: '#E1DFE5',
      gap: 8,
      marginTop: 4
    },
    seperatorUp: {
      width: '100%',
      height: 16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    },
    sheetBgStyle: {
      backgroundColor: graphite['050']
    },
    emptyList: {
      marginHorizontal: 20,
      alignItems: 'center',
      marginTop: 12
    },
    emptyText: {
      textAlign: 'center'
    },
    searchImg: {
      width: 90,
      height: 90
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
    }
  });

export default useStyles;

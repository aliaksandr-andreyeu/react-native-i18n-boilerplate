import { config, UserTheme } from '@/constants';
import { StyleSheet, ViewStyle } from 'react-native';

const { screenWidth } = config;

const useStyles = ({ palette: { graphite } }: UserTheme) =>
  StyleSheet.create({
    container: {
      marginTop: 16,
      paddingLeft: 15
    },
    contentContainer: {
      paddingRight: 30
    },
    header: {
      paddingLeft: 20
    },
    seperatorContainer: {
      width: screenWidth,
      height: 44,
      backgroundColor: '#E1DFE5',
      gap: 8,
      marginBottom: 12
    },
    seperatorUp: {
      width: '100%',
      height: 18,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 18,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: graphite['050']
    }
  });

export default useStyles;

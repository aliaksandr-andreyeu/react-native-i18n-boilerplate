import { UserTheme, config } from '@/constants';
import { StyleSheet } from 'react-native';

const { screenWidth } = config;

export const useStyles = ({ palette: { graphite, purple } }: UserTheme) =>
  StyleSheet.create({
    list: {
      flex: 1
    },
    listContent: {
      gap: 8,
      paddingBottom: 204,
      paddingLeft: 20
    },
    container: {
      flex: 1
    },
    seperatorContainer: { width: screenWidth, height: 40, backgroundColor: '#E1DFE5', right: 20, gap: 8 },
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
    loader: { marginTop: 40, right: 10 },
    safeImage: {
      width: 159,
      height: 159,
      right: -60,
      bottom: -48,
      position: 'absolute'
    },
    blackKeyImage: {
      width: 160,
      height: 160,
      right: -36,
      bottom: -16,
      position: 'absolute'
    },
    rocketImage: {
      width: 210,
      height: 210,
      right: -60,
      bottom: -48,
      position: 'absolute'
    },
    barchartImage: {
      width: 142,
      height: 142,
      right: -16,
      bottom: -24,
      position: 'absolute'
    },
    guidelineBanner: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 20,
      backgroundColor: purple[600],
      overflow: 'hidden'
    },
    idCardImage: {
      width: 137,
      height: 85,
      position: 'absolute',
      bottom: 24,
      right: -45
    }
  });

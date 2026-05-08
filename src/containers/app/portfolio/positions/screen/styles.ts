import { UserTheme, config } from '@/constants';
import { StyleSheet } from 'react-native';

const { screenWidth } = config;

export const useStyles = ({ palette: { graphite, purple, icon } }: UserTheme) =>
  StyleSheet.create({
    list: {
      flex: 1
    },
    listContent: {
      paddingBottom: 200,
      paddingTop: 6,
      alignItems: 'center'
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
    indicator: {
      backgroundColor: icon?.base?.tertiary
    },
    idCardImage: {
      width: 137,
      height: 85,
      position: 'absolute',
      bottom: 24,
      right: -45
    },
    footer: {
      alignItems: 'center',
      marginTop: 100,
      gap: 20,
      width: screenWidth
    },
    buttonFooter: {
      width: screenWidth - 40,
      borderWidth: 1,
      borderColor: '#1DBF73',
      backgroundColor: 'transparent'
    },
    buttonLabel: {
      color: '#1DBF73'
    }
  });

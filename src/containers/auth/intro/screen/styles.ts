import { ImageStyle, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { UserTheme, config } from '@/constants';

const {
  headerBar: { height },
  screenWidth
} = config;

interface Styles {
  safe: ViewStyle;
  header: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  content: ViewStyle;
  titleBox: ViewStyle;
  buttonBox: ViewStyle;
  barContainer: ViewStyle;
  animContainer: ViewStyle;
  titleContainer: ViewStyle;
  img: ImageStyle;
  bar: ViewStyle;
  step: ViewStyle;
  stepsList: ViewStyle;
  stepsListContainer: ViewStyle;
  titleListContainer: ViewStyle;
  flex: ViewStyle;
}

const useStyles = ({ palette: { graphite } }: UserTheme) =>
  StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1
    },
    flex: {
      flex: 1
    },
    header: {
      height,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingHorizontal: 20
    },
    scrollContent: {
      flexGrow: 1
    },
    scrollBox: {
      flexGrow: 1,
      width: screenWidth * 3
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 48,
      gap: 24
    },
    titleBox: {
      gap: 8
    },
    buttonBox: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 32,
      gap: 16
    },
    barContainer: {
      width: '21%',
      height: 4,
      borderRadius: 30,
      backgroundColor: graphite[100]
    },
    animContainer: {
      flex: 1,
      flexGrow: 1
    },
    titleContainer: {
      paddingLeft: 20,
      gap: 8,
      width: screenWidth - 40
    },
    img: {
      width: screenWidth,
      flex: 1,
      marginTop: 20
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 30
    },
    step: {
      width: screenWidth
    },
    stepsList: {
      flex: 1,
      position: 'absolute',
      bottom: 0,
      top: 0,
      left: 0,
      right: 0
    },
    stepsListContainer: {
      justifyContent: 'center'
    },
    titleListContainer: {
      flexDirection: 'row',
      width: screenWidth * 3,
      alignItems: 'flex-start',
      gap: 40
    }
  });

export default useStyles;

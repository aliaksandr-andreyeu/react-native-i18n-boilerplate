import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { config, UserTheme } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

const {
  fonts: { generalSans }
} = config;

interface Styles extends CommonStyles {
  banner: ViewStyle;
  safe: ViewStyle;
  img: ImageStyle;
  assetInfoContainer: ViewStyle;
  bannerWoButton: ViewStyle;
  liveIcon: ViewStyle;
  column: ViewStyle;
  container: ViewStyle;
  priceWrap: ViewStyle;
  symbolNameWrap: ViewStyle;
  horizontal: ViewStyle;
  assetInfoLeft: ViewStyle;
  pricesRow: ViewStyle;
  resistance: ViewStyle;
  support: ViewStyle;
  button: ViewStyle;
  buttonWrap: ViewStyle;
  scrollView: ViewStyle;
  chart: ViewStyle;
  headerTitleStyle: TextStyle;
  columnTitle: TextStyle;
  columnValue: TextStyle;
  title: TextStyle;
  about: TextStyle;
  buttonText: TextStyle;
  fullName: TextStyle;
  blackText: TextStyle;
  iconAdjust: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, graphite, green, red, text }
  } = theme;

  const commonStyles = useCommonStyles(theme);
  const { shadow6Style } = commonStyles || {};

  return StyleSheet.create<Styles>({
    ...commonStyles,
    banner: {
      marginBottom: 32
    },
    bannerWoButton: {
      justifyContent: 'center'
    },
    safe: {
      flex: 1,
      paddingTop: 16
    },
    container: {
      backgroundColor: base.white,
      marginHorizontal: 20,
      borderRadius: 12,
      marginBottom: 16,
      ...shadow6Style
    },
    scrollView: {
      paddingBottom: 80
    },
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: generalSans.medium
    },
    img: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8
    },
    assetInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16
    },
    assetInfoLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    },
    symbolNameWrap: {
      flex: 1,
      marginRight: 8
    },
    priceWrap: {
      alignItems: 'flex-end'
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    liveIcon: {
      backgroundColor: '#D5C2FF',
      borderRadius: 4,
      marginLeft: 4,
      paddingHorizontal: 2,
      paddingVertical: 2,
      flexDirection: 'row',
      alignItems: 'center'
    },
    column: {
      flex: 1,
      gap: 4
    },
    columnTitle: {
      color: text.base.tertiary,
      textAlign: 'center',
      lineHeight: 15
    },
    columnValue: {
      color: graphite['900'],
      textAlign: 'center',
      lineHeight: 16.25
    },
    pricesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12
    },
    title: {
      marginHorizontal: 20,
      marginBottom: 12
    },
    about: {
      marginHorizontal: 20
    },
    buttonWrap: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: green['400'],
      height: 38
    },
    buttonText: {
      textAlign: 'center',
      lineHeight: 16,
      fontSize: 14,
      color: base.white
    },
    chart: {
      marginHorizontal: 20,
      marginBottom: 20
    },
    resistance: {
      borderLeftWidth: 6,
      borderLeftColor: green['400']
    },
    support: {
      borderLeftWidth: 6,
      borderLeftColor: red['600']
    },
    fullName: {
      color: text.base.tertiary
    },
    blackText: {
      color: graphite['900']
    },
    iconAdjust: { top: 1 }
  });
};

export default useStyles;

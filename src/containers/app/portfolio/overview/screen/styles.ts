import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  titleBox: ViewStyle;
  chartBox: ViewStyle;
  chartWrapper: ViewStyle;
  chartInfo: ViewStyle;
  listHeaderBox: ViewStyle;
  listTitle: TextStyle;
  listTitleMiddle: TextStyle;
  listTitleLast: TextStyle;
  dealsBox: ViewStyle;
  dealsContent: ViewStyle;
  cardBox: ViewStyle;
  cardAsset: ViewStyle;
  cardAssetImgLess: ViewStyle;
  currentValue: TextStyle;
  pnlValue: TextStyle;
  cardImg: ImageStyle;
  blankImg: ViewStyle;
  cardAssetTitle: ViewStyle;
  bearPnL: TextStyle;
  bullPnL: TextStyle;
  chartPagination: ViewStyle;
  pageBox: ViewStyle;
  pageBoxSelected: ViewStyle;
  viewSelector: ViewStyle;
  filterList: ViewStyle;
  filterItemBox: ViewStyle;
  filterDescBox: ViewStyle;
  filterIconBox: ViewStyle;
  filterCheckBox: ViewStyle;
  filterCheckBoxSelected: ViewStyle;
  sheetBgStyle: ViewStyle;
  btnContainer: ViewStyle;
  safeImage: ImageStyle;
  idCardImage: ImageStyle;
  rocketImage: ImageStyle;
  blackKeyImage: ImageStyle;
  barchartImage: ImageStyle;
  guidelineBanner: ViewStyle;
  indicator: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, purple, red, graphite, icon }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    sheetBgStyle: {
      backgroundColor: graphite['050']
    },
    container: {},
    scrollContent: {
      flexGrow: 1
    },
    scrollBox: {
      flexGrow: 1
    },
    titleBox: {
      paddingHorizontal: 20,
      paddingBottom: 12
    },
    chartBox: {
      alignItems: 'center',
      marginVertical: 20
    },
    chartWrapper: {
      width: 250,
      height: 250
    },
    chartInfo: {
      borderRadius: 250,
      position: 'absolute',
      top: 24,
      left: 24,
      right: 24,
      bottom: 24,
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },
    listHeaderBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
      paddingHorizontal: 12,
      paddingBottom: 4,
      gap: 4
    },
    listTitle: {
      color: '#4E5F64',
      flex: 0.3,
      textAlign: 'left'
    },
    listTitleMiddle: {
      textAlign: 'right',
      flex: 0.35
    },
    listTitleLast: {
      textAlign: 'right',
      flex: 0.35
    },
    dealsBox: {},
    dealsContent: {
      paddingTop: 16,
      paddingHorizontal: 20,
      paddingBottom: 36,
      gap: 8
    },
    cardBox: {
      height: 62,
      backgroundColor: base.white,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeftWidth: 6,
      borderLeftColor: graphite['900'],
      paddingLeft: 2,
      paddingRight: 12,
      gap: 4,
      ...shadow6Style
    },
    cardAsset: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 0.3
    },
    cardAssetImgLess: {
      paddingLeft: 8
    },
    currentValue: {
      flex: 0.35,
      textAlign: 'right'
    },
    pnlValue: {
      flex: 0.35,
      textAlign: 'right'
    },
    cardImg: {
      width: 28,
      height: 28,
      borderRadius: 28,
      overflow: 'hidden'
    },
    blankImg: {
      width: 28,
      height: 28,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: graphite['100']
    },
    cardAssetTitle: {
      gap: 2
    },
    bearPnL: {
      color: red['600']
    },
    bullPnL: {
      color: '#159D55'
    },
    chartPagination: {
      padding: 12,
      width: '100%',
      gap: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    pageBox: {
      width: 5,
      height: 5,
      backgroundColor: graphite['200'],
      borderRadius: 5
    },
    pageBoxSelected: {
      width: 7,
      height: 7,
      backgroundColor: graphite['900'],
      borderRadius: 7
    },
    viewSelector: {
      height: 30,
      borderRadius: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      backgroundColor: base.white,
      gap: 8,
      ...shadow6Style
    },
    filterList: {
      gap: 12,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: 34
    },
    filterItemBox: {
      paddingHorizontal: 16,
      height: 50,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      backgroundColor: base.white,
      ...shadow6Style
    },
    filterDescBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    filterIconBox: {
      width: 24,
      height: 24,
      borderRadius: 24,
      backgroundColor: purple['100'],
      alignItems: 'center',
      justifyContent: 'center'
    },
    filterCheckBox: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#8fa6ae',
      borderRadius: 16
    },
    filterCheckBoxSelected: {
      borderColor: purple['100'],
      backgroundColor: purple['100']
    },
    btnContainer: {
      gap: 12,
      paddingBottom: 20,
      marginHorizontal: 20
    },
    idCardImage: {
      width: 137,
      height: 85,
      position: 'absolute',
      bottom: 24,
      right: -45
    },
    safeImage: {
      width: 159,
      height: 159,
      right: -60,
      bottom: -48,
      position: 'absolute'
    },
    rocketImage: {
      width: 210,
      height: 210,
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
    }
  });
};

export default useStyles;

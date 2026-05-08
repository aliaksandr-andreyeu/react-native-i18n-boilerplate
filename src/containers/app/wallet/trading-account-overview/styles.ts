import { StyleSheet } from 'react-native';
import { config, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

const {
  fonts: { generalSans },
  screenWidth
} = config;

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { text, icon } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    safe: {
      flexGrow: 1,
      flex: 1
    },
    content: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: palette.border.base.divider
    },
    scrollBox: {
      flexGrow: 1
    },
    header: {
      backgroundColor: palette.graphite['050']
    },
    top: {
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      backgroundColor: palette.graphite['050'],
      gap: 4
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      gap: 8
    },
    title: {
      color: '#4E5F64'
    },
    text: {
      marginBottom: 4
    },
    container: {
      paddingHorizontal: 20,
      marginBottom: 8,
      paddingTop: 16,
      paddingBottom: 20,
      borderRadius: 16,
      backgroundColor: palette.graphite['050']
    },
    infoWrap: {
      borderRadius: 12,
      paddingVertical: 12,
      marginTop: 12,
      paddingHorizontal: 16,
      backgroundColor: palette.base.white,
      ...shadow6Style
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      flex: 1
    },
    infoText: {
      fontSize: 13,
      color: text.base.tertiary
    },
    descText: {
      fontSize: 13,
      color: text.base.tertiary
    },
    rowBoldText: {
      fontSize: 14,
      fontFamily: generalSans.semiBold
    },
    infoValue: {
      fontSize: 13,
      color: palette.graphite['900'],
      fontFamily: generalSans.medium
    },
    icon: {
      alignSelf: 'center'
    },
    toolTip: { bottom: 2 },
    sheetBgStyle: {
      borderRadius: 24,
      backgroundColor: palette.graphite['050']
    },
    bottomSheetScrollView: {
      paddingHorizontal: 20,
      paddingVertical: 20
    },
    bottomSheetTitle: {
      marginBottom: 12
    },
    bottomSheetButton: {
      marginTop: 12
    },
    bottomSheetSubTitle: {
      color: '#5D7278',
      fontSize: 13,
      fontWeight: '500',
      marginBottom: 12
    },
    indicator: {
      backgroundColor: icon?.base?.tertiary
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
    barchartImage: {
      width: 142,
      height: 142,
      right: -16,
      bottom: -24,
      position: 'absolute'
    },
    guidelineBanner: {
      backgroundColor: palette.purple[600],
      overflow: 'hidden'
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
      backgroundColor: palette.graphite['050']
    },
    seperatorDown: {
      width: '100%',
      height: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: palette.graphite['050']
    },
    sheetBottomDefaultContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16
    },
    sheetDefaultTextContainer: {
      gap: 4,
      flex: 1
    },
    sheetDefaultInfo: { color: text.base.tertiary },
    sheetSelectorContainer: {
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: palette.base.white,
      ...shadow6Style
    },
    redText: {
      color: palette.red['600']
    },
    expireContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    grayText: { color: palette.graphite['600'] },
    left: { justifyContent: 'flex-start', marginRight: 20 },
    right: { justifyContent: 'flex-end', marginLeft: 25 }
  });
};

export default useStyles;

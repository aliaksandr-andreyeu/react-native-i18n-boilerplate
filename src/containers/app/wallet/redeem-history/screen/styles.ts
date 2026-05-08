import { StyleSheet } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { Visibility } from '@intercom/intercom-react-native';

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, text, blue, border, background }
  } = theme;

  const { shadow6Style } = useCommonStyles(theme);

  const { screenWidth } = config;

  const colorSection = background.base.primary;

  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colorSection
    },
    indicator: {
      marginTop: 40
    },
    scroll: {
      marginTop: 16,
      paddingBottom: 40
    },
    shadow: {
      ...shadow6Style
    },
    tertiaryText: {
      color: text.title.tertiary
    },
    primaryText: {
      color: text.title.primary
    },
    secondaryText: {
      color: text.title.secondary
    },
    hintText: {
      color: text.title.hint
    },
    seperatorContainer: {
      width: screenWidth,
      height: 40,
      backgroundColor: border.base.divider,
      gap: 8,
      marginTop: 10
    },
    seperatorUp: {
      width: '100%',
      height: 16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      backgroundColor: colorSection
    },
    seperatorDown: {
      width: '100%',
      height: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: colorSection
    },
    redeemSeperatorContainer: {
      height: 24,
      backgroundColor: colorSection,
      gap: 8,
      marginRight: 20,
      marginLeft: 20,
      zIndex: 2,
      marginTop: -4
    },
    redeemSeperatorUp: {
      width: '100%',
      height: 8,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      backgroundColor: base.white
    },
    redeemSeperatorDown: {
      width: '100%',
      height: 8,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      backgroundColor: base.white
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    headerTitle: {
      flex: 1,
      alignItems: 'center',
      paddingRight: 24
    },
    headContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
      width: screenWidth - 40,
      alignSelf: 'center'
    },
    whiteLine: {
      height: 4,
      marginBottom: -2,
      marginTop: -2,
      backgroundColor: base.white
    },
    listContainer: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      backgroundColor: colorSection,
      overflow: 'hidden',
      paddingLeft: 20,
      paddingRight: 20,
      marginBottom: -12,
      paddingBottom: 12
    },
    timeStatsList: {
      backgroundColor: base.white,
      padding: 16,
      paddingLeft: 28,
      paddingRight: 30,
      borderLeftColor: blue[500],
      borderLeftWidth: 4,
      marginTop: 16,
      borderRadius: 12
    },
    timeStatsItem: {
      gap: 12,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingLeft: 4,
      paddingRight: 4
    },
    timeStatsContentContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    },
    redeemItem: {
      backgroundColor: base.white,
      marginRight: 20,
      marginLeft: 20,
      marginBottom: -2,
      zIndex: 1
    },
    redeemBorderTop: {
      marginTop: 12,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12
    },
    redeemBorderBottom: {
      marginBottom: 12,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12
    },
    container: {
      gap: 8,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 12,
      paddingTop: 8,
      flexDirection: 'row',
      justifyContent: 'flex-start'
    },
    infoBox: {
      paddingLeft: 58,
      paddingRight: 24,
      gap: 10,
      paddingBottom: 6,
      paddingTop: 8
    },
    infoLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8
    },
    iconBox: {
      paddingLeft: 2,
      paddingRight: 12,
      justifyContent: 'center',
      alignContent: 'center'
    },
    box: {
      gap: 4
    },
    boxRight: {
      alignItems: 'flex-end',
      flex: 1
    },
    test: {
      marginTop: -12,
      marginBottom: -12
    },
    borderBox: {
      marginLeft: 16,
      marginRight: 16,
      marginBottom: 4,
      backgroundColor: '#D9E1E4',
      height: 1
    }
  });
};

export default useStyles;

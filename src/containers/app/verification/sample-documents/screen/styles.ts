import { config, UserTheme } from '@/constants';
import { StyleSheet } from 'react-native';
import { useCommonStyles } from '@/hooks';

const { screenWidth } = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { purple, base, graphite }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create({
    flex: {
      flex: 1
    },
    sectionContent: { paddingHorizontal: 20, paddingVertical: 12 },
    container: {
      gap: 20,
      paddingBottom: 120
    },
    grayText: {
      color: graphite['600']
    },
    shadow: {
      ...shadow6Style
    },
    guideGeneral: {
      gap: 16,
      paddingHorizontal: 20
    },
    guideInfoContainer: {
      gap: 20,
      padding: 16,
      borderRadius: 16,
      borderTopLeftRadius: 0,
      borderLeftWidth: 4,
      borderLeftColor: purple[800],
      backgroundColor: base.white,
      paddingRight: 40
    },
    stepsContainer: {
      gap: 12
    },
    textAlignLeft: {
      textAlign: 'left'
    },
    ruleContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
      paddingRight: 8
    },
    guideContainer: {
      paddingTop: 20,
      gap: 24,
      marginHorizontal: 20
    },
    numberContainer: {
      height: 30,
      width: 30,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: purple[200]
    },
    blackText: {
      color: graphite['900']
    },
    infoContainer: {
      paddingVertical: 12,
      paddingHorizontal: 20
    },
    tabButtonStyle: {
      borderWidth: 0,
      paddingHorizontal: 8
    },
    alignSelf: {
      alignSelf: 'flex-start'
    },
    sectionFooter: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
      gap: 12
    },
    modalListCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 90,
      gap: 10
    },
    backButtonStyle: {
      alignSelf: 'flex-end',
      marginRight: 12
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)'
    },
    listContent: {
      alignItems: 'center'
    },
    imageZoom: {
      width: '100%',
      flex: 0
    },
    docTitle: {
      color: base.white
    },
    listItem: {
      width: screenWidth,
      paddingHorizontal: 16,
      gap: 12
    },
    dotStyle: {
      width: 8,
      height: 8,
      borderRadius: 4
    },
    dotContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
    },
    tabContent: { paddingHorizontal: 20, gap: 12, marginVertical: 12 }
  });
};

export default useStyles;

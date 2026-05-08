import { StyleSheet } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { BaseTextVariant } from '@/components';

const { screenWidth } = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base, text, blue, background, border }
  } = theme || {};

  const { shadow6Style } = useCommonStyles(theme);

  const colorSection = '#F0F2F5';

  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colorSection
    },
    shadow: {
      ...shadow6Style
    },
    scroll: {
      paddingBottom: 40
    },
    indicator: {
      marginTop: 40
    },
    availableContainer: {
      justifyContent: 'center',
      backgroundColor: colorSection,
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 16,
      paddingTop: 16
    },
    referralHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15
    },
    referralIconContainer: {
      borderRadius: 8,
      padding: 7,
      backgroundColor: '#269B56',
      alignItems: 'center',
      justifyContent: 'center'
    },
    rewardsIconContainer: {
      borderRadius: 8,
      padding: 7,
      backgroundColor: blue[500],
      alignItems: 'center',
      justifyContent: 'center'
    },
    availableText: {
      marginTop: 8
    },
    availablePrice: {
      marginTop: 4
    },
    head: {
      alignSelf: 'center'
    },
    blueText: {
      color: blue[500]
    },
    primaryText: {
      color: text.title.primary
    },
    tertiaryText: {
      color: text.interaction.basic.tertiary.disabled
    },
    secondaryText: {
      color: text.title.secondary
    },
    rewardsBtn: {
      backgroundColor: blue[500],
      borderWidth: 0,
      borderRadius: 8,
      marginTop: 21,
      padding: 8,
      height: 47,
      ...shadow6Style
    },
    rewardsBtnText: {
      color: theme.palette.base.white
    },
    inviteBtn: {
      borderWidth: 0,
      borderRadius: 8,
      padding: 14,
      alignSelf: 'stretch',
      marginLeft: 20,
      marginRight: 20,
      marginTop: 7,
      height: 47,
      backgroundColor: '#1FE07A'
    },
    seeAllLink: {
      alignSelf: 'center'
    },
    seeAll: {
      ...BaseTextVariant.text,
      color: blue[500]
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
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      ...shadow6Style
    },
    timeStatsItem: {
      gap: 12,
      alignItems: 'center'
    },
    simpleStepsList: {
      backgroundColor: '#F4F6FF',
      alignSelf: 'stretch',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderLeftColor: blue[500],
      borderLeftWidth: 3,
      marginTop: 16,
      borderRadius: 16,
      gap: 12,
      ...shadow6Style
    },
    simpleStepsTop: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignSelf: 'stretch',
      gap: 8
    },
    simpleStepsClose: {
      backgroundColor: 'none',
      padding: 0,
      margin: 0,
      width: 20,
      height: 20
    },
    simpleStepsItem: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8
    },
    simpleStepsNumber: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      borderWidth: 2,
      borderColor: blue[500]
    },
    searchImg: {
      width: 90,
      height: 90,
      marginBottom: 8
    },
    textCenter: {
      textAlign: 'center'
    },
    referralsEmpty: {
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 16,
      maxWidth: 320,
      gap: 8
    },
    referralsBox: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      backgroundColor: background.card.primary,
      marginBottom: 12,
      marginTop: 15,
      borderRadius: 16,
      flex: 1,
      width: '100%'
    },
    myReferralSeparator: {
      height: 0.6,
      backgroundColor: '#D9E1E4'
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
    }
  });
};

export default useStyles;

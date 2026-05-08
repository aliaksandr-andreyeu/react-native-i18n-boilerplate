import { StyleSheet } from 'react-native';
import { UserTheme, config } from '@/constants';
import { useCommonStyles } from '@/hooks';

const {
  headerBar: { height: headerBarSize }
} = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { text, background, green }
  } = theme || {};

  const commonStyles = useCommonStyles(theme);

  return StyleSheet.create({
    ...commonStyles,
    section: {
      paddingHorizontal: 20
    },
    pieChart: {
      alignItems: 'center'
    },
    headerIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      width: headerBarSize,
      height: headerBarSize
    },
    headerRightIcon: {
      marginRight: 8
    },
    headerLeftIcon: {
      marginLeft: 8
    },
    subTitle: {
      color: text.title.primary,
      marginBottom: 16
    },
    inviteBtn: {
      marginTop: 16
    },
    safe: {
      flex: 1,
      backgroundColor: background.base.primary
    },
    scroll: {
      paddingBottom: 40
    },
    indicator: {
      marginTop: 40
    },
    availableContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: background.base.primary,
      overflow: 'hidden',
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 16,
      paddingTop: 16
    },
    availableText: {
      marginTop: 8
    },
    availablePrice: {
      marginTop: 4
    },
    primaryText: {
      color: text.title.primary
    },
    tertiaryText: {
      color: '#58616C'
    },
    secondaryText: {
      color: '#BDC3CF'
    },
    progressPill: {
      marginTop: 12,
      height: 48,
      width: '100%',
      borderRadius: 8,
      backgroundColor: '#D9DDE5',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center'
    },
    progressFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: green[400],
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8
    },
    amountBold: {
      fontWeight: '700'
    },
    progressLock: {
      position: 'absolute',
      right: 14
    }
  });
};

export default useStyles;

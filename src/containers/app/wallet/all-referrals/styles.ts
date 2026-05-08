import { StyleSheet } from 'react-native';
import { config, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';
import { BaseTextVariant } from '@/components';

const {
  fonts: { generalSans },
  screenWidth
} = config;

const useStyles = (theme: UserTheme) => {
  const {
    palette: { text },
    palette: { background }
  } = theme || {};
  const commonStyles = useCommonStyles(theme);

  return StyleSheet.create({
    ...commonStyles,
    container: {
      flex: 1
    },
    textContainer: {
      paddingHorizontal: 20,
      gap: 8,
      marginTop: 12
    },
    dateSelect: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center'
    },
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: generalSans.medium
    },
    description: {
      color: text.title.hint
    },
    dateSelectContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 9,
      marginTop: 12
    },
    tabsContainer: {
      ...commonStyles.shadow6Style,
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 3,
      paddingHorizontal: 2,
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: background.card.primary,
      height: 30
    },
    tabButton: {
      flex: 1,
      borderWidth: 0,
      borderRadius: 12,
      height: 24
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingTop: 16
    },
    emptyList: {
      marginTop: 20,
      marginHorizontal: 20,
      alignItems: 'center'
    },
    emptyText: {
      textAlign: 'center',
      marginBottom: 8
    },
    searchImg: {
      width: 90,
      height: 90
    },
    dateText: {
      marginBottom: 16,
      marginHorizontal: 20
    },
    sectionBox: {
      ...commonStyles.shadow6Style,
      backgroundColor: theme.palette.base.white,
      borderRadius: 12,
      overflow: 'hidden',
      paddingVertical: 12,
      marginHorizontal: 20
    },
    separator: { width: screenWidth - 72, height: 0.6, backgroundColor: '#D9E1E4', alignSelf: 'center' },
    blueText: { color: theme.palette.blue[500] },
    btnLabel: { flex: 1, ...BaseTextVariant.small }
  });
};

export default useStyles;

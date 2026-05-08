import { useCommonStyles } from '@/hooks';
import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const theme = useTheme();
  const { palette } = theme;
  const { shadow6Style } = useCommonStyles(theme);
  return StyleSheet.create({
    wrapper: {
      gap: 8,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8
    },
    groupBarContainer: {
      padding: 4,
      borderRadius: 16,
      backgroundColor: palette.base.white,
      ...shadow6Style
    },
    groupBarInnerContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      gap: 8
    },
    groupBarItem: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      backgroundColor: palette.base.white
    },
    activeGroupBarItem: {
      backgroundColor: palette.background.interaction.context.rewards.strong
    },
    groupBarItemLabel: {
      color: palette.graphite[900]
    },
    activeGroupBarItemLabel: {
      color: palette.base.white
    }
  });
};

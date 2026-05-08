import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { config, UserTheme } from '@/constants';
import { useCommonStyles } from '@/hooks';

const { bottomBar, fonts, isAndroid } = config;

interface Styles {
  tabBarStyle: ViewStyle;
  tabBarItemStyle: ViewStyle;
  tabBarLabelStyle: TextStyle;
}

const useStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { background } = palette || {};

  const { shadow6Style } = useCommonStyles(theme);

  return StyleSheet.create<Styles>({
    tabBarItemStyle: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: 6,
      paddingTop: 6
    },
    tabBarLabelStyle: {
      marginTop: 2,
      fontFamily: fonts.inter.medium,
      fontSize: 12
    },
    tabBarStyle: {
      backgroundColor: palette.base.white,
      display: 'flex',
      borderTopWidth: 0.5,
      borderTopColor: background.base.primary,
      ...(isAndroid && {
        height: bottomBar.height
      }),
      ...shadow6Style
    }
  });
};

export default useStyles;

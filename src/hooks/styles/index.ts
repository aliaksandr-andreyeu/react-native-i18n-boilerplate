import { StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { config, UserTheme } from '@/constants';

const { headerBar, shadowColor } = config || {};
export interface CommonStyles {
  headerStyle: ViewStyle;
  shadow0Style: ViewStyle;
  shadow6Style: ViewStyle;
  shadow10Style: ViewStyle;
}

const useCommonStyles = (theme: UserTheme) => {
  const { palette } = theme || {};
  const { background } = palette || {};

  const { top = 0 } = useSafeAreaInsets();

  return StyleSheet.create<CommonStyles>({
    headerStyle: {
      backgroundColor: background.base.primary,
      borderBottomWidth: 0.5,
      borderBottomColor: background.base.primary,
      height: headerBar.height + top
    },
    shadow0Style: {
      zIndex: 1,
      shadowColor: 'transparent',
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0
    },
    shadow6Style: {
      zIndex: 1,
      shadowColor,
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6
    },
    shadow10Style: {
      zIndex: 1,
      shadowColor,
      shadowOffset: {
        width: 0,
        height: 5
      },
      shadowOpacity: 0.34,
      shadowRadius: 6.27,
      elevation: 10
    }
  });
};

export default useCommonStyles;

import { StyleSheet, ViewStyle } from 'react-native';
import { UserTheme } from '@/constants';
import { rgba } from '@/helpers';
import { useCommonStyles, CommonStyles } from '@/hooks';

interface Styles extends CommonStyles {
  headerBlurContainer: ViewStyle;
  headerBlur: ViewStyle;
}

const useStyles = (theme: UserTheme) => {
  const {
    palette: { base }
  } = theme;
  const commonStyles = useCommonStyles(theme);
  return StyleSheet.create<Styles>({
    ...commonStyles,
    headerBlurContainer: {
      flex: 1,
      backgroundColor: rgba(base.white, 75),
      overflow: 'hidden'
    },
    headerBlur: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });
};

export default useStyles;

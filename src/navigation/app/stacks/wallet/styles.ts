import { StyleSheet } from 'react-native';
import { UserTheme } from '@/constants';
import { useCommonStyles, CommonStyles } from '@/hooks';

interface Styles extends CommonStyles {}

const useStyles = (theme: UserTheme) => {
  const commonStyles = useCommonStyles(theme);
  return StyleSheet.create<Styles>({
    ...commonStyles
  });
};

export default useStyles;

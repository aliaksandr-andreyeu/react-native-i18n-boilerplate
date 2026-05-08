import { StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { UserTheme, config } from '@/constants';

const {
  headerBar: { height }
} = config;

interface Styles {
  safe: ViewStyle;
  scrollContent: ViewStyle;
  scrollBox: ViewStyle;
  content: ViewStyle;
  titleBox: ViewStyle;
  imgBox: ViewStyle;
  img: ImageStyle;
  buttonBox: ViewStyle;
  warningContainer: ViewStyle;
  signOutContainer: ViewStyle;
  signOut: ViewStyle;
}

const useStyles = ({ palette }: UserTheme) =>
  StyleSheet.create<Styles>({
    safe: {
      flexGrow: 1
    },
    scrollContent: {
      flex: 1,
      flexGrow: 1
    },
    scrollBox: {
      flexGrow: 1
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 24
    },
    titleBox: {
      gap: 8
    },
    imgBox: {
      flex: 1,
      flexGrow: 1
    },
    img: {
      width: '100%',
      height: '100%'
    },
    buttonBox: {
      paddingHorizontal: 20,
      paddingTop: 24,
      gap: 16
    },
    warningContainer: {
      marginHorizontal: 24,
      marginVertical: 20
    },
    signOutContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      height,
      paddingHorizontal: 20
    },
    signOut: { paddingRight: 0 }
  });

export default useStyles;

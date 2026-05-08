
import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
    iconSize: ViewStyle;
    rounded: ViewStyle;
}

const useStyles = () => {

  return StyleSheet.create<Styles>({
    iconSize: {
        width: 24, 
        height: 24 
    },
    rounded:{
        borderRadius: 100, 
        overflow:'hidden'
    }
  });
};

export default useStyles;

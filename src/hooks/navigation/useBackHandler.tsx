import React, { useLayoutEffect } from 'react';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const useBackHandler = () => {
  const { goBack, canGoBack } = useNavigation<NavigationProp<ParamListBase>>();

  const canBack = canGoBack();

  useLayoutEffect(() => {
    const backAction = () => {
      if (!canBack) {
        return false;
      };
      goBack();

      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return {};
};
export default useBackHandler;

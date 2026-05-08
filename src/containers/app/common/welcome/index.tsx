import React, { FC, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import WelcomeScreen from './screen';

type WelcomeProps = StackScreenProps<CommonRootParamsList, COMMON_ROUTE_NAMES.Welcome>;

const Welcome: FC<WelcomeProps> = ({ route, navigation }) => {
  useFocusEffect(
    useCallback(() => {
      const preventBackAction = () => {
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', preventBackAction);
      return () => backHandler.remove();
    }, [route, navigation])
  );

  return <WelcomeScreen route={route} navigation={navigation} />;
};

export default Welcome;

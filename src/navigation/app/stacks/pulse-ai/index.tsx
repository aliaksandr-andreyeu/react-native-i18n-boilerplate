import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PulseAI } from '@/containers';
import { useTheme } from '@react-navigation/native';
import { BaseTabsHeader } from '@/components';
import { testIDs } from '@/constants';

import useStyles from './styles';

export enum PULSEAI_ROUTE_NAMES {
  PulseAI = 'PulseAI'
}

export type PulseAIRootParamsList = {
  PulseAI: undefined;
};

const Stack = createStackNavigator<PulseAIRootParamsList>();

const PulseAIStackNavigator: FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const screenOptions = {
    headerShadowVisible: false,
    headerStyle: styles.headerStyle,
    header: () => (
      <BaseTabsHeader
        isPulse
        testIDsProps={{
          profileButton: testIDs.pulse.header.profile,
          signInButton: testIDs.pulse.header.signIn,
          signUpButton: testIDs.pulse.header.signUp
        }}
      />
    )
  };

  return (
    <Stack.Navigator initialRouteName={PULSEAI_ROUTE_NAMES.PulseAI} screenOptions={screenOptions}>
      <Stack.Screen name={PULSEAI_ROUTE_NAMES.PulseAI} component={PulseAI} />
    </Stack.Navigator>
  );
};

export default PulseAIStackNavigator;

import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { PULSEAI_ROUTE_NAMES, PulseAIRootParamsList } from '@/navigation/app/stacks';
import PulseAIScreen from './screen';
import { RootRootParamsList } from '@/navigation/app';

type PulseAIProps = StackScreenProps<PulseAIRootParamsList & RootRootParamsList, PULSEAI_ROUTE_NAMES.PulseAI>;

const PulseAI: FC<PulseAIProps> = ({ route, navigation }) => {
  return <PulseAIScreen route={route} navigation={navigation} />;
};

export default PulseAI;

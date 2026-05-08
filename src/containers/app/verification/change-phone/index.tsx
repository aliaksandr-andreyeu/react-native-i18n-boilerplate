import React, { FC } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import ChnagePhoneScreen from './screen';

type ChangePhoneProps = StackScreenProps<CommonRootParamsList, COMMON_ROUTE_NAMES.ChangePhone>;

const ChangePhone: FC<ChangePhoneProps> = ({ route, navigation }) => {
    return <ChnagePhoneScreen route={route} navigation={navigation} />;
};

export default ChangePhone;

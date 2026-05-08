import React from 'react';
import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import TwoFactorScreen from './screen';

type TwoFactorProps = StackScreenProps<CommonRootParamsList, COMMON_ROUTE_NAMES.TwoFactor>;

const TwoFactor: React.FC<TwoFactorProps> = ({ route, navigation }) => {
    return <TwoFactorScreen route={ route } navigation = { navigation } />;
};

export default TwoFactor;

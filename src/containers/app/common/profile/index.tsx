import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import ProfileScreen from './screen';

type ProfileProps = StackScreenProps<CommonRootParamsList, COMMON_ROUTE_NAMES.Profile>;

const Profile: React.FC<ProfileProps> = ({ route, navigation }) => {
  return <ProfileScreen route={route} navigation={navigation} />;
};

export default Profile;

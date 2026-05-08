import React from "react";
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from "@/navigation/app/stacks";
import { StackScreenProps } from "@react-navigation/stack";
import InviteScreen from "./screen";
import { ROOT_ROUTE_NAMES, RootRootParamsList } from "@/navigation/app";
import { ParamListBase } from "@react-navigation/native";

type InviteProps = StackScreenProps<RootRootParamsList & ParamListBase, ROOT_ROUTE_NAMES.Invite>;

const Invite: React.FC<InviteProps> = ({ route, navigation }) => {
    return <InviteScreen route={route} navigation={navigation} />;
};

export default Invite;
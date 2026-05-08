import React from "react";
import { AUTH_ROUTE_NAMES, AuthRootParamsList } from "@/navigation/app/stacks";
import { StackScreenProps } from "@react-navigation/stack";
import SignUpScreen from "./screen";

type SignUpProps = StackScreenProps<AuthRootParamsList, AUTH_ROUTE_NAMES.SignUp>;

const SignUp: React.FC<SignUpProps> = ({ route, navigation }) => {
    return <SignUpScreen route={route} navigation={navigation} />;
};

export default SignUp;
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import WinnerAndLosersArticleScreen from './screen';
import { IDEASHUB_ROUTE_NAMES, IdeasHubRootParamsList } from '@/navigation/app/stacks';

type WinnerAndLosersArticleProps = StackScreenProps<IdeasHubRootParamsList, IDEASHUB_ROUTE_NAMES.WinnerAndLosersArticle>;


const WinnerAndLosersArticle: React.FC<WinnerAndLosersArticleProps> = (props) => {

    return <WinnerAndLosersArticleScreen {...props} />

};

export default WinnerAndLosersArticle;
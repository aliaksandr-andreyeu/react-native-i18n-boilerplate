import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import WidgetArticleScreen from './screen';
import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';

type WidgetArticleProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.WidgetArticle>;

const WidgetArticle: React.FC<WidgetArticleProps> = (props) => {
  return <WidgetArticleScreen {...props} />;
};

export default WidgetArticle;

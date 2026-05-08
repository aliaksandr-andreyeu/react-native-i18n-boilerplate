import { ROOT_ROUTE_NAMES, RootRootParamsList } from '@/navigation/app';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import WidgetListScreen from './screen';

type WidgetListProps = StackScreenProps<RootRootParamsList, ROOT_ROUTE_NAMES.WidgetList>;

const WidgetList: React.FC<WidgetListProps> = (props) => {

    return <WidgetListScreen {...props} />
};

export default WidgetList;
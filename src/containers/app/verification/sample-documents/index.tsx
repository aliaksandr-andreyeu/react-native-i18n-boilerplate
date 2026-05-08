import { COMMON_ROUTE_NAMES, CommonRootParamsList } from '@/navigation/app/stacks';
import { ParamListBase } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import SampleDocumentsScreen from './screen';

type SampleDocumentsprops = StackScreenProps<ParamListBase & CommonRootParamsList, COMMON_ROUTE_NAMES.SampleDocuments>;

const SampleDocuments: React.FC<SampleDocumentsprops> = (props) => {

    return <SampleDocumentsScreen {...props} />
};

export default SampleDocuments;
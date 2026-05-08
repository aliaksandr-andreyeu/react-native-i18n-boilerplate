import { SampleDocument } from '@/store/api/legal-documents/types';

export type legalDocumentSections = {
  title: string;
  data: Array<legalDocument>;
};

export type legalDocument = {
  id: number;
  attributes: {
    sortOrder: number;
    title: string;
    grouping: string;
    id: number;
    beginOn: Date;
    endOn: Date;
    documentFile: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
};

export interface InitialState {
  legalDocuments: legalDocument[];
  termsOfUseURL: string;
  sampleDocuments: SampleDocument[];
}

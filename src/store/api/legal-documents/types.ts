export interface DocumentImageFile {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
      formats: {
        thumbnail: {
          name: string;
          hash: string;
          ext: string;
          mime: string;
          path: string | null;
          width: number;
          height: number;
          size: number;
          sizeInBytes: number;
          url: string;
        };
      };
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string | null;
      provider: string;
      provider_metadata: any | null;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface DocumentImage {
  id: number;
  documentImageLabel: string;
  documentImageFile: DocumentImageFile;
}

export interface SampleDocument {
  id: number;
  documentName: string;
  documentCategory: string;
  documentImage: DocumentImage[];
}

export interface SampleDocumentsResponse {
  data: {
    attributes: {
      country: string;
      countryCode: string;
      createdAt: Date;
      documentSample: SampleDocument[];
      publishedAt: Date;
      updatedAt: Date;
    };
    id: number;
  }[];
}

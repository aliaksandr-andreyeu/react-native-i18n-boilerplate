interface Image {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

interface ImageFormat extends Image {
  path: string | null;
}

interface PreviewImageAttributes extends Image {
  alternativeText: string | null;
  caption: string | null;
  formats: {
    thumbnail: ImageFormat;
    small: ImageFormat;
    medium: ImageFormat;
    large: ImageFormat;
  };
  previewUrl: string | null;
  provider: string;
  provider_metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PreviewImageData {
  id: number;
  attributes: PreviewImageAttributes;
}

export interface TradingAssetAttributes {
  name: string;
  fullName: string;
  systemName: string;
  seoText: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  marketHours: string | null;
  marketHoursNotes: string | null;
  locale: string;
}

export interface TradingAssetData {
  id: number;
  attributes: TradingAssetAttributes;
}

export interface RawIdeaCategoryAttributes {
  title: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  ca_investment_ideas?: {
    data: RawIdeaData[];
  };
}

export interface RawIdeaCategoryData {
  id: number;
  attributes: RawIdeaCategoryAttributes;
}

export interface RawIdeaAttributes {
  title: string;
  shortTitle: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  verticalTextAlignment: 'bottom' | 'top' | 'center';
  shortDescription: string;
  featured: boolean | null;
  previewImage?: {
    data: PreviewImageData;
  };
  ca_investment_idea_categories?: {
    data: RawIdeaCategoryData[];
  };
  trading_assets?: {
    data: TradingAssetData[];
  };
}

export interface RawIdeaData {
  id: number;
  attributes: RawIdeaAttributes;
}

export interface Meta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface Response {
  meta: Meta;
}

export interface RawIdeasResponse extends Response {
  data: RawIdeaData[];
}

export interface RawIdeasCategoriesResponse extends Response {
  data: RawIdeaCategoryData[];
}

export interface IdeaCategoryData {
  id: number;
  title: string;
  createdAt?: Date;
}

export interface IdeaAssetData {
  id: number;
  name: string;
  fullName: string;
  systemName: string;
  createdAt?: Date;
  locale?: string;
}

export interface RegisterWebinarBody {
  email: string;
  webinarId: string;
}

export interface IdeaData {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  image?: string;
  ideasNumber: number;
  categories?: IdeaCategoryData[];
  featured: boolean;
  assets?: IdeaAssetData[];
  verticalTextAlignment: 'bottom' | 'top' | 'center';
}

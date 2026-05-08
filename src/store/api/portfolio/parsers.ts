import { getCMSImageUrl } from '@/helpers';
import { ParsedTradingAssets, PortfolioTradingAssetData } from './types';

export const portfolioTradeAssetsParser = (data: PortfolioTradingAssetData[] = []): ParsedTradingAssets[] => {
  return data.map((item) => ({
    fullName: item?.attributes?.fullName || '',
    image: getCMSImageUrl(item?.attributes?.assetLogo?.data?.attributes?.url) || '',
    systemName: item?.attributes?.systemName || '',
    assetUnitOfMeasure: item?.attributes?.assetUnitOfMeasure || '',
    acuityProductName: item?.attributes?.acuityProductName || '',
    assetUnitOfMeasureDigits: item?.attributes?.assetUnitOfMeasureDigits || 2
  }));
};

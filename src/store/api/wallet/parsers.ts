import { getCMSImageUrl } from '@/helpers';
import {
  ParsedPaymentMethod,
  ParsedWalletData,
  PaymentLogoData,
  PaymentMethod,
  WalletData,
  SupportedChangeAccountTypesData,
  ParsedSupportedChangeAccountTypesData,
  AccountFeaturesDescription,
  ParsedAccountFeaturesDescription,
  UnverifiedPaymentMethod,
  ParsedUnverifiedPaymentMethod
} from '@/store/slices/wallet/types';

export const unverifiedPaymentMethodConfingsParser = (
  data: UnverifiedPaymentMethod[]
): ParsedUnverifiedPaymentMethod[] => {
  return data && Array.isArray(data)
    ? data.map((item) => ({
        available: item?.attributes?.available || false,
        action: item?.attributes?.action === 'withdrawal' ? 'withdrawal' : 'deposit',
        displayDescription: item?.attributes?.displayDescription || '',
        displayName: item?.attributes?.displayName || '',
        logo: getCMSImageUrl(item?.attributes?.logo?.data?.attributes?.url) || '',
        systemId: item?.attributes?.systemId || '',
        systemName: item?.attributes?.systemName || ''
      }))
    : [];
};

export const walletPaymentMethodConfingsParser = (data: PaymentMethod[] = []): ParsedPaymentMethod[] => {
  const handleGuides = (guides: { data: PaymentLogoData[] }) => {
    if (!guides || !guides?.data?.length) return undefined;

    return (
      guides?.data?.map?.((item) => ({
        caption: item?.attributes?.caption || '',
        url: getCMSImageUrl(item?.attributes?.url) || ''
      })) || undefined
    );
  };

  const parsedData = data.map((item) => ({
    systemId: item?.attributes?.systemId || '',
    displayName: item?.attributes?.displayName || '',
    systemName: item?.attributes?.systemName || '',
    logo: getCMSImageUrl(item?.attributes?.logo?.data?.attributes?.url) || '',
    methodGroup: item?.attributes?.methodGroup || '',
    depositGuides: handleGuides(item?.attributes?.depositGuides)
  }));

  return parsedData;
};

export const accountFeaturesDescriptionParser = (
  data?: AccountFeaturesDescription | null
): ParsedAccountFeaturesDescription | null => {
  if (!data) {
    return null;
  }
  return {
    boxStyle: data?.boxStyle || 'simple',
    bulletPointStyle: data?.bulletPointStyle || 'numbers',
    infoBlockElement:
      data?.infoBlockElement?.map((el) => ({
        icon: getCMSImageUrl(el?.icon?.data?.attributes?.url) || '',
        primaryText: el?.primaryText || '',
        secondaryText: el?.secondaryText || ''
      })) || [],
    title: data?.title || ''
  };
};

export const supportedChangeAccountTypesParser = (
  supportedAccount?: SupportedChangeAccountTypesData
): ParsedSupportedChangeAccountTypesData[] => {
  const { data = [] } = supportedAccount || {};
  return (
    data?.map((el) => ({
      accountFeaturesDescription: accountFeaturesDescriptionParser(el?.attributes?.accountFeaturesDescription) || null,
      accountTypeChangeEnabled: el?.attributes?.accountTypeChangeEnabled || false,
      colour: el?.attributes?.colour || '',
      shortDescription: el?.attributes?.shortDescription || '',
      createdAt: el?.attributes?.createdAt || '',
      updatedAt: el?.attributes?.updatedAt || '',
      publishedAt: el?.attributes?.publishedAt || '',
      systemName: el?.attributes?.systemName || '',
      systemTypeId: el?.attributes?.systemTypeId || '',
      typeDisplayName: el?.attributes?.typeDisplayName || '',
      appDescriptionBlockBackground:
        getCMSImageUrl(el?.attributes?.appDescriptionBlockBackground?.data?.attributes?.url) || '',
      icon: getCMSImageUrl(el?.attributes?.iconMobile?.data?.attributes?.url) || '',
      supportedChangeAccountTypes: supportedChangeAccountTypesParser(el?.attributes?.supportedChangeAccountTypes) || []
    })) || []
  );
};

export const walletConfigsParser = (data: WalletData[] = []): ParsedWalletData[] => {
  return data.map((item) => ({
    colour: item?.attributes?.colour || '',
    shortDescription: item?.attributes?.shortDescription || '',
    createdAt: item?.attributes?.createdAt || '',
    updatedAt: item?.attributes?.updatedAt || '',
    publishedAt: item?.attributes?.publishedAt || '',
    icon: getCMSImageUrl(item?.attributes?.iconMobile?.data?.attributes?.url) || '',
    appDescriptionBlockBackground:
      getCMSImageUrl(item?.attributes?.appDescriptionBlockBackground?.data?.attributes?.url) || '',
    systemName: item?.attributes?.systemName || '',
    systemTypeId: item?.attributes?.systemTypeId || '',
    typeDisplayName: item?.attributes?.typeDisplayName || '',
    accountTypeChangeEnabled: item?.attributes?.accountTypeChangeEnabled || false,
    accountFeaturesDescription: accountFeaturesDescriptionParser(item?.attributes?.accountFeaturesDescription),
    supportedChangeAccountTypes: supportedChangeAccountTypesParser(item?.attributes?.supportedChangeAccountTypes)
  }));
};

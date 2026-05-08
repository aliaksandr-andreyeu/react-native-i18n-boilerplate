const application = {
  applicationConfigs: '/applications/configs',
  languages: '/dict/languages',
  legalDocuments: '/legal-documents',
  getPromoWelcomeInfo: '/promo-welcome-account',
  sampleDocumentation: ({ country, locale = 'en' }: { country: string; locale: string }) =>
    `/verification-document-samples?filters[countryCode][$eq]=${country}&populate[2]=documentSample.documentImage.documentImageFile&locale=${locale}`
};

export default application;

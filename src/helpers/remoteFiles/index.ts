import Config from 'react-native-config';

const { CMS_URL } = Config || {};

export const getLegalRemoteDocumentFileURL = (url: string) => {
  if (!url) return '';

  return `${CMS_URL}${url}`;
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import en from './en/index.json';
import es from './es/index.json';
import ms from './ms/index.json';
import pt from './pt/index.json';
import th from './th/index.json';
import vi from './vi/index.json';
import it from './it/index.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Locales = typeof en;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: Locales;
    };
  }
}

export enum LANG {
  EN = 'en',
  ES = 'es',
  MS = 'ms',
  PT = 'pt',
  TH = 'th',
  VI = 'vi',
  IT = 'it'
}

interface LanguageProps {
  languageCode: string;
  scriptCode?: string;
  countryCode: string;
  languageTag: string;
  isRTL: boolean;
}

const checkDeviceLanguage = () => {
  const data: LanguageProps[] = getLocales();
  if (data?.length === 0) {
    return;
  }
  return data?.find((item) => item) || ({} as LanguageProps);
};

const getInitialLanguage = async () => {
  let storedLanguage = await AsyncStorage.getItem('app-language');
  if (!storedLanguage) {
    const deviceLngs = checkDeviceLanguage();
    const { languageCode } = deviceLngs || ({} as LanguageProps);
    storedLanguage = languageCode;
  }
  return Object.values(LANG).includes(storedLanguage as LANG) ? storedLanguage : LANG.EN;
};

export const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  },
  ms: {
    translation: ms
  },
  pt: {
    translation: pt
  },
  th: {
    translation: th
  },
  vi: {
    translation: vi
  },
  it: {
    translation: it
  }
};

const handleLanguage = async () => {
  const lng = await getInitialLanguage();

  return i18n.use(initReactI18next).init({
    resources,
    compatibilityJSON: 'v3',
    lng,
    fallbackLng: LANG.EN,
    interpolation: {
      escapeValue: false
    }
  });
};

handleLanguage();

export default i18n;

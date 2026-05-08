import { useTranslation } from "react-i18next";


const useDynamicTranslations = (path: string) => {

    const { t, i18n } = useTranslation();


    const translate = (key: string, defaultValue?: string, extra?: string | number) => {
        const fullPath = `${path}.${key}`;
        const withExtras = fullPath + `-${extra}`;

        return i18n.exists(fullPath) ? t(fullPath) : i18n.exists(withExtras) ? t(withExtras) : defaultValue;
    }

    return translate

};

export default useDynamicTranslations;
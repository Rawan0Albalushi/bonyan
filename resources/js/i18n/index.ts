import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const LOCALE_STORAGE_KEY = 'bonyan_locale';

export type Locale = 'ar' | 'en';

export function getStoredLocale(): Locale {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === 'en' ? 'en' : 'ar';
}

export function applyDocumentDirection(locale: Locale): void {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
}

void i18n.use(initReactI18next).init({
    resources: {
        ar: { translation: ar },
        en: { translation: en },
    },
    lng: getStoredLocale(),
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
});

applyDocumentDirection(getStoredLocale());

export default i18n;

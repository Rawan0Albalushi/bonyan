import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    applyDocumentDirection,
    getStoredLocale,
    LOCALE_STORAGE_KEY,
    type Locale,
} from '@/i18n';

interface LocaleContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const { i18n } = useTranslation();
    const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

    const setLocale = useCallback(
        (next: Locale) => {
            setLocaleState(next);
            localStorage.setItem(LOCALE_STORAGE_KEY, next);
            void i18n.changeLanguage(next);
            applyDocumentDirection(next);
        },
        [i18n],
    );

    const value = useMemo(
        () => ({
            locale,
            setLocale,
            isRtl: locale === 'ar',
        }),
        [locale, setLocale],
    );

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return ctx;
}

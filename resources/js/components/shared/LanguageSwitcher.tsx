import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

export function LanguageSwitcher() {
    const { t } = useTranslation();
    const { locale, setLocale } = useLocale();

    const toggle = () => {
        const next: Locale = locale === 'ar' ? 'en' : 'ar';
        setLocale(next);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="gap-2 text-muted-foreground hover:text-foreground"
            aria-label={t('common.language')}
        >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{locale === 'ar' ? 'EN' : 'عربي'}</span>
        </Button>
    );
}

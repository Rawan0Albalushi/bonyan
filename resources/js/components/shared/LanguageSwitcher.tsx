import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useLocale, type Locale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
    compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
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
            className={cn(
                'text-muted-foreground hover:text-foreground',
                compact ? 'h-9 gap-1 px-2 sm:gap-2 sm:px-3' : 'gap-2',
            )}
            aria-label={t('common.language')}
        >
            <Globe className="h-4 w-4 shrink-0" />
            <span className={cn('font-medium', compact && 'hidden sm:inline')}>
                {locale === 'ar' ? 'EN' : 'عربي'}
            </span>
        </Button>
    );
}

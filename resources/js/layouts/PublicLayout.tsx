import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { fetchActiveProject } from '@/api/public';
import type { PublicSettings } from '@/api/types';
import { PublicHeader } from '@/components/shared/PublicHeader';
import { useLocale } from '@/contexts/LocaleContext';

export function PublicLayout() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [siteSettings, setSiteSettings] = useState<PublicSettings | null>(null);

    useEffect(() => {
        fetchActiveProject()
            .then((res) => setSiteSettings(res.settings))
            .catch(() => {});
    }, []);

    const siteName =
        locale === 'ar'
            ? siteSettings?.site_name_ar || t('site.name')
            : siteSettings?.site_name_en || t('site.name');

    return (
        <div className="flex min-h-screen flex-col">
            <PublicHeader siteSettings={siteSettings} />

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-primary/15 bg-footer-gradient py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-start">
                    <div className="flex items-center gap-2 text-primary">
                        <Heart className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-display font-bold">{siteName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {siteName}. {t('site.copyright')}
                    </p>
                </div>
            </footer>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchActiveProject } from '@/api/public';
import type { PublicSettings } from '@/api/types';
import { PublicHeader } from '@/components/shared/PublicHeader';
import { useLocale } from '@/contexts/LocaleContext';

export function PublicLayout() {
    const { t } = useTranslation();
    const { isRtl } = useLocale();
    const [siteSettings, setSiteSettings] = useState<PublicSettings | null>(null);

    useEffect(() => {
        fetchActiveProject()
            .then((res) => setSiteSettings(res.settings))
            .catch(() => {});
    }, []);

    return (
        <div className="layout-shell">
            <PublicHeader siteSettings={siteSettings} />

            <main className="layout-main">
                <Outlet />
            </main>

            <footer className="border-t border-primary/15 bg-footer-gradient py-6 safe-bottom sm:py-8">
                <div className="page-container flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:text-start">
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        © {new Date().getFullYear()} {t('site.liwan_name')}. {t('site.copyright')}
                    </p>

                    <a
                        href="https://liwan.om/"
                        target="_blank"
                        rel="noopener noreferrer"
                        dir={isRtl ? 'rtl' : 'ltr'}
                        className="inline-flex items-center gap-2.5 rounded-xl border border-primary/10 bg-card/50 px-3 py-2 transition-colors hover:border-primary/25 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        aria-label={t('site.developed_by_liwan')}
                    >
                        <span className="text-xs text-muted-foreground">{t('site.developed_by')}</span>
                        <img
                            src="/image/liwan-logo.png"
                            alt=""
                            aria-hidden
                            className="h-6 w-auto shrink-0 object-contain sm:h-7"
                        />
                    </a>
                </div>
            </footer>
        </div>
    );
}

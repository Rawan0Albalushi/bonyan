import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchActiveProject } from '@/api/public';
import type { PublicSettings } from '@/api/types';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

const HEADER_OFFSET_VAR = '--public-header-offset';
const HEADER_GAP_VAR = '--public-header-gap';

/** Keeps page content below the fixed header with a small breathing gap. */
export const PUBLIC_HEADER_SPACER_CLASS = 'public-header-spacer';

type PublicHeaderProps = {
    siteSettings?: PublicSettings | null;
};

export function PublicHeader({ siteSettings: externalSettings }: PublicHeaderProps) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const location = useLocation();
    const headerRef = useRef<HTMLElement>(null);
    const [siteSettings, setSiteSettings] = useState<PublicSettings | null>(externalSettings ?? null);

    useEffect(() => {
        if (externalSettings) {
            setSiteSettings(externalSettings);
            return;
        }
        fetchActiveProject()
            .then((res) => setSiteSettings(res.settings))
            .catch(() => {});
    }, [externalSettings]);

    const siteName =
        locale === 'ar'
            ? siteSettings?.site_name_ar || t('site.name')
            : siteSettings?.site_name_en || t('site.name');
    const tagline =
        locale === 'ar'
            ? siteSettings?.tagline_ar || t('site.tagline')
            : siteSettings?.tagline_en || t('site.tagline');

    const navLinks = [
        { to: '/', label: t('nav.home') },
        { to: '/donate', label: t('nav.donate') },
    ];

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty(HEADER_GAP_VAR, '1rem');

        const header = headerRef.current;
        if (!header) {
            return;
        }

        const syncOffset = () => {
            root.style.setProperty(HEADER_OFFSET_VAR, `${header.offsetHeight}px`);
        };

        syncOffset();

        const observer = new ResizeObserver(syncOffset);
        observer.observe(header);
        window.addEventListener('resize', syncOffset);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncOffset);
            root.style.removeProperty(HEADER_OFFSET_VAR);
            root.style.removeProperty(HEADER_GAP_VAR);
        };
    }, [siteSettings, locale, location.pathname]);

    const navButtonClass = (isActive: boolean) =>
        cn(
            !isActive && 'text-foreground/80 hover:bg-primary/8 hover:text-foreground',
            isActive && 'bg-primary/12 text-primary shadow-none hover:bg-primary/16',
        );

    return (
        <header
            ref={headerRef}
            className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8"
        >
            <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-card/55 px-3 py-2 shadow-sm backdrop-blur-xl sm:rounded-full sm:px-5 sm:py-2.5 supports-[backdrop-filter]:bg-card/45">
                <Link
                    to="/"
                    className="flex min-w-0 shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 sm:gap-3"
                >
                    <img
                        src="/image/logo.jpeg"
                        alt={siteName}
                        className="h-11 w-auto max-h-11 object-contain sm:h-12 sm:max-h-12"
                    />
                    <div className="hidden min-w-0 sm:block">
                        <p className="truncate font-display text-base font-bold text-gradient-brand sm:text-lg">
                            {siteName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{tagline}</p>
                    </div>
                </Link>

                <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link key={link.to} to={link.to}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={navButtonClass(isActive)}
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        );
                    })}
                    <LanguageSwitcher />
                </nav>
            </div>
        </header>
    );
}

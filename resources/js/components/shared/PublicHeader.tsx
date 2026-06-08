import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
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
    const [mobileOpen, setMobileOpen] = useState(false);

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
        { to: '/build-a-home', label: t('nav.build_home') },
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

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const navButtonClass = (isActive: boolean) =>
        cn(
            !isActive && 'text-foreground/80 hover:bg-primary/8 hover:text-foreground',
            isActive && 'bg-primary/12 text-primary shadow-none hover:bg-primary/16',
        );

    return (
        <header ref={headerRef} className="pointer-events-none fixed inset-x-0 top-0 z-50 w-full max-w-[100vw]">
            <div className="relative mx-auto w-full max-w-7xl px-4 safe-top sm:px-6 lg:px-8">
                <div className="pointer-events-auto flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-primary/10 bg-card/55 px-3 py-2 shadow-sm backdrop-blur-xl sm:gap-3 sm:rounded-full sm:px-5 sm:py-2.5 supports-[backdrop-filter]:bg-card/45">
                    <Link
                        to="/build-a-home"
                        className="flex min-w-0 shrink-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3"
                    >
                        <img
                            src="/image/logo.jpeg"
                            alt={siteName}
                            className="h-9 w-auto max-h-9 shrink-0 object-contain sm:h-12 sm:max-h-12"
                        />
                        <div className="hidden min-w-0 sm:block">
                            <p className="truncate font-display text-base font-bold text-gradient-brand sm:text-lg">
                                {siteName}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{tagline}</p>
                        </div>
                    </Link>

                <nav className="hidden shrink-0 items-center gap-1 md:flex">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link key={link.to} to={link.to}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn('px-3', navButtonClass(isActive))}
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        );
                    })}
                    <LanguageSwitcher compact />
                </nav>

                <div className="flex shrink-0 items-center gap-1.5 md:hidden">
                    <Link to="/donate">
                        <Button variant="accent" size="sm" className="h-9 px-3 text-xs sm:px-4 sm:text-sm">
                            {t('nav.donate')}
                        </Button>
                    </Link>
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? t('admin.close_menu') : t('admin.open_menu')}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <>
                    <div
                        className="pointer-events-auto fixed inset-0 z-40 bg-black/30 md:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden
                    />
                    <nav className="pointer-events-auto absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 mx-auto w-full max-w-[calc(100%-0.5rem)] overflow-hidden rounded-2xl border border-primary/10 bg-card/95 shadow-brand-lg backdrop-blur-xl sm:max-w-none md:hidden">
                        <div className="flex flex-col gap-1 p-2">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                                        <span
                                            className={cn(
                                                'flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                                                isActive
                                                    ? 'bg-primary/12 text-primary'
                                                    : 'text-foreground/85 hover:bg-muted',
                                            )}
                                        >
                                            {link.label}
                                        </span>
                                    </Link>
                                );
                            })}
                            <div className="border-t border-border/60 px-2 pt-2">
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </nav>
                </>
            )}
            </div>
        </header>
    );
}

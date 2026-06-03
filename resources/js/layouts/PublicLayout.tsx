import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';

export function PublicLayout() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const location = useLocation();
    const siteName = locale === 'ar' ? 'بُنيان' : 'Bonyan';

    const navLinks = [
        { to: '/', label: t('nav.home') },
        { to: '/donate', label: t('nav.donate') },
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 overflow-hidden rounded-b-2xl border-b border-primary/10 bg-card/92 shadow-brand backdrop-blur-lg sm:rounded-b-3xl supports-[backdrop-filter]:bg-card/85">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
                        <img
                            src="/image/logo.jpeg"
                            alt={siteName}
                            className="h-10 w-10 rounded-lg object-cover shadow-sm"
                        />
                        <div className="hidden sm:block">
                            <p className="font-display text-lg font-bold text-gradient-brand">{siteName}</p>
                            <p className="text-xs text-muted-foreground">
                                {locale === 'ar' ? 'نبني لهم حياة كريمة' : 'We build a decent life for them'}
                            </p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-1 sm:gap-2">
                        {navLinks.map((link) => (
                            <Link key={link.to} to={link.to}>
                                <Button
                                    variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                                    size="sm"
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        ))}
                        <LanguageSwitcher />
                    </nav>
                </div>
            </header>

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
                        © {new Date().getFullYear()} {siteName}. {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
                    </p>
                </div>
            </footer>
        </div>
    );
}

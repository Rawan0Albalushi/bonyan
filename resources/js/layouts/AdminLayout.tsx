import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    FolderKanban,
    HandCoins,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { fetchAdminMe, adminLogout } from '@/api/admin';
import type { AdminUser } from '@/api/types';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
    { to: '/admin/projects', icon: FolderKanban, labelKey: 'admin.projects' },
    { to: '/admin/donations', icon: HandCoins, labelKey: 'admin.donations' },
    { to: '/admin/settings', icon: Settings, labelKey: 'admin.settings' },
];

export function AdminLayout() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        fetchAdminMe()
            .then((res) => setUser(res.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const handleLogout = async () => {
        await adminLogout();
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return (
        <div className="admin-shell">
            <aside
                className={cn(
                    'bg-admin-sidebar fixed inset-y-0 z-40 w-64 max-w-[85vw] border-e border-primary/15 shadow-brand-lg transition-transform duration-300 lg:static lg:translate-x-0',
                    mobileOpen
                        ? 'translate-x-0'
                        : '-translate-x-full rtl:translate-x-full rtl:lg:translate-x-0',
                )}
            >
                <div className="flex h-14 items-center justify-between border-b border-primary/10 px-4 safe-top sm:h-16">
                    <Link to="/admin" className="truncate font-display text-sm font-bold text-gradient-brand sm:text-base">
                        {t('admin.brand')}
                    </Link>
                    <button
                        type="button"
                        className="rounded-lg p-2 hover:bg-muted lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-label={t('admin.close_menu')}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="space-y-1 p-3 sm:p-4">
                    {navItems.map(({ to, icon: Icon, labelKey }) => (
                        <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                            <span
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    location.pathname === to
                                        ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-brand'
                                        : 'text-muted-foreground hover:bg-surface hover:text-primary',
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {t(labelKey)}
                            </span>
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-4 start-4 end-4 safe-bottom">
                    <Button variant="outline" className="w-full gap-2" onClick={() => void handleLogout()}>
                        <LogOut className="h-4 w-4" />
                        {t('admin.logout')}
                    </Button>
                </div>
            </aside>

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden
                />
            )}

            <div className="admin-main-column">
                <header className="sticky top-0 z-20 flex h-14 w-full min-w-0 items-center gap-2 border-b border-primary/10 bg-card/95 px-4 shadow-sm backdrop-blur-sm safe-top sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="shrink-0 rounded-lg p-2 hover:bg-muted lg:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label={t('admin.open_menu')}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <p className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">
                        {t('admin.welcome')},{' '}
                        <span className="font-medium text-foreground">{user.name}</span>
                    </p>
                    <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-2">
                        <LanguageSwitcher compact />
                        <Link to="/build-a-home">
                            <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3">
                                <Home className="h-4 w-4 shrink-0" />
                                <span className="hidden md:inline">{t('nav.build_home')}</span>
                            </Button>
                        </Link>
                    </div>
                </header>
                <main className="layout-main p-4 sm:p-6 lg:p-8">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}

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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { fetchAdminMe, adminLogout } from '@/api/admin';
import type { AdminUser } from '@/api/types';

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

    const handleLogout = async () => {
        await adminLogout();
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return (
        <div className="flex min-h-screen bg-page-soft">
            <aside
                className={`bg-admin-sidebar fixed inset-y-0 z-40 w-64 border-e border-primary/15 shadow-brand-lg transition-transform lg:static lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full rtl:lg:translate-x-0'
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-primary/10 px-4">
                    <Link to="/admin" className="font-display font-bold text-gradient-brand">
                        Bonyan Admin
                    </Link>
                    <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="space-y-1 p-4">
                    {navItems.map(({ to, icon: Icon, labelKey }) => (
                        <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                            <span
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    location.pathname === to
                                        ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-brand'
                                        : 'text-muted-foreground hover:bg-surface hover:text-primary'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {t(labelKey)}
                            </span>
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-4 start-4 end-4">
                    <Button variant="outline" className="w-full gap-2" onClick={() => void handleLogout()}>
                        <LogOut className="h-4 w-4" />
                        {t('admin.logout')}
                    </Button>
                </div>
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <div className="flex flex-1 flex-col lg:ms-0">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-primary/10 bg-card/95 px-4 shadow-sm backdrop-blur-sm lg:px-8">
                    <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                        <Menu className="h-5 w-5" />
                    </button>
                    <p className="text-sm text-muted-foreground">
                        {t('admin.welcome')}, <span className="font-medium text-foreground">{user.name}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Link to="/">
                            <Button variant="ghost" size="sm">
                                {t('nav.home')}
                            </Button>
                        </Link>
                    </div>
                </header>
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}

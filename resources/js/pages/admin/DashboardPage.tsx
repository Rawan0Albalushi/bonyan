import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { fetchDashboard } from '@/api/admin';
import type { DashboardStats } from '@/api/types';
import {
    AdminDataTable,
    AdminTableBody,
    AdminTableColGroup,
    AdminTableHead,
    AdminTableRow,
    AdminTableTd,
    AdminTableTh,
} from '@/components/admin/AdminDataTable';
import {
    AdminMobileField,
    AdminMobileGrid,
    AdminMobileList,
    AdminMobileListItem,
} from '@/components/admin/AdminMobileList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import {
    cn,
    ENGLISH_NUMERALS_CLASS,
    formatAdminDate,
    formatNumber,
    formatPhone,
} from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

type RecentDonation = {
    id: number;
    reference: string;
    amount: number;
    phone: string;
    created_at: string;
    project_title: string;
};

export function DashboardPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recent, setRecent] = useState<RecentDonation[]>([]);

    useEffect(() => {
        fetchDashboard().then((res) => {
            setStats(res.stats);
            setRecent(res.recent_donations);
        });
    }, []);

    if (!stats) {
        return <p className="text-muted-foreground">{t('common.loading')}</p>;
    }

    const statCards = [
        { label: t('admin.stats_total'), value: String(stats.total_donations) },
        {
            label: t('admin.stats_raised'),
            value: (
                <CurrencyAmount
                    amount={stats.total_raised}
                    brand
                    iconSize="md"
                    className="text-lg font-extrabold sm:text-2xl"
                />
            ),
        },
        { label: t('admin.stats_today'), value: String(stats.today_donations) },
        {
            label: t('admin.stats_today_raised'),
            value: (
                <CurrencyAmount
                    amount={stats.today_raised}
                    brand
                    iconSize="md"
                    className="text-lg font-extrabold sm:text-2xl"
                />
            ),
        },
    ];

    return (
        <div className="admin-page">
            <h1 className="page-title">{t('admin.dashboard')}</h1>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
                {statCards.map((card) => (
                    <Card key={card.label} className="min-w-0">
                        <CardContent className="p-3 sm:p-6">
                            <p className="text-[11px] leading-snug text-muted-foreground sm:text-sm">{card.label}</p>
                            <div
                                className={cn(
                                    'mt-1.5 min-w-0 text-lg font-extrabold sm:mt-2 sm:text-2xl',
                                    typeof card.value === 'string' && 'text-gradient-brand',
                                    typeof card.value === 'string' && ENGLISH_NUMERALS_CLASS,
                                )}
                            >
                                {card.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {stats.active_project && (
                <Card>
                    <CardHeader className="admin-card-header">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle className="text-base sm:text-lg">{t('admin.is_active')}</CardTitle>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                {t('admin.active_badge')}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="admin-card-body pt-0">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-semibold leading-snug text-gradient-brand sm:text-lg">
                                        {stats.active_project.title}
                                    </p>
                                    <p
                                        className={cn('mt-1 text-xs text-muted-foreground', ENGLISH_NUMERALS_CLASS)}
                                        dir="ltr"
                                    >
                                        {t('admin.id')}: {stats.active_project.id}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" className="shrink-0" asChild>
                                    <Link to="/admin/projects">
                                        {t('admin.projects')}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-end justify-between gap-3">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {t('admin.progress')}
                                    </span>
                                    <span
                                        className={cn(
                                            'font-display text-2xl font-extrabold leading-none text-accent sm:text-3xl',
                                            ENGLISH_NUMERALS_CLASS,
                                        )}
                                        dir="ltr"
                                    >
                                        {formatNumber(stats.active_project.progress_percentage, locale)}%
                                    </span>
                                </div>
                                <Progress
                                    value={stats.active_project.progress_percentage}
                                    variant="hero"
                                    className="h-2.5 sm:h-3"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 rounded-lg bg-muted/40 p-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">{t('home.raised')}</p>
                                    <CurrencyAmount
                                        amount={stats.active_project.raised_amount}
                                        brand
                                        iconSize="sm"
                                        className="mt-1 font-semibold"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{t('home.goal')}</p>
                                    <CurrencyAmount
                                        amount={stats.active_project.goal_amount}
                                        iconSize="sm"
                                        className="mt-1 font-semibold"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{t('home.remaining')}</p>
                                    <CurrencyAmount
                                        amount={Math.max(
                                            0,
                                            stats.active_project.goal_amount - stats.active_project.raised_amount,
                                        )}
                                        iconSize="sm"
                                        className="mt-1 font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="admin-card-header">
                    <CardTitle className="text-base sm:text-lg">{t('admin.recent_donations')}</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-body pt-0 sm:pt-0">
                    {recent.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">{t('admin.no_results')}</p>
                    ) : (
                        <>
                            <AdminMobileList>
                                {recent.map((d) => (
                                    <AdminMobileListItem key={d.id}>
                                        <AdminMobileField label={t('admin.id')}>
                                            <span className={ENGLISH_NUMERALS_CLASS} dir="ltr">
                                                {d.id}
                                            </span>
                                        </AdminMobileField>
                                        <AdminMobileGrid>
                                            <AdminMobileField label={t('success.amount')}>
                                                <CurrencyAmount amount={d.amount} iconSize="sm" />
                                            </AdminMobileField>
                                            <AdminMobileField label={t('donation.phone_label')}>
                                                <span dir="ltr">{formatPhone(d.phone)}</span>
                                            </AdminMobileField>
                                        </AdminMobileGrid>
                                        <AdminMobileField label={t('admin.projects')}>{d.project_title}</AdminMobileField>
                                        <AdminMobileField label={t('admin.date')}>
                                            <span dir="ltr">{formatAdminDate(d.created_at, locale)}</span>
                                        </AdminMobileField>
                                    </AdminMobileListItem>
                                ))}
                            </AdminMobileList>

                            <AdminDataTable>
                                <AdminTableColGroup widths={['8%', '12%', '12%', '36%', '32%']} />
                                <AdminTableHead>
                                    <AdminTableTh variant="numeric">{t('admin.id')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('success.amount')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('donation.phone_label')}</AdminTableTh>
                                    <AdminTableTh variant="text">{t('admin.projects')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('admin.date')}</AdminTableTh>
                                </AdminTableHead>
                                <AdminTableBody>
                                    {recent.map((d) => (
                                        <AdminTableRow key={d.id} striped>
                                            <AdminTableTd variant="numeric" muted>
                                                {d.id}
                                            </AdminTableTd>
                                            <AdminTableTd variant="numeric" className="font-medium">
                                                <CurrencyAmount amount={d.amount} iconSize="sm" />
                                            </AdminTableTd>
                                            <AdminTableTd variant="numeric">{formatPhone(d.phone)}</AdminTableTd>
                                            <AdminTableTd variant="text">{d.project_title}</AdminTableTd>
                                            <AdminTableTd variant="numeric" muted>
                                                {formatAdminDate(d.created_at, locale)}
                                            </AdminTableTd>
                                        </AdminTableRow>
                                    ))}
                                </AdminTableBody>
                            </AdminDataTable>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

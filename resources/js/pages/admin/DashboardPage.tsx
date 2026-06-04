import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchDashboard } from '@/api/admin';
import type { DashboardStats } from '@/api/types';
import {
    AdminDataTable,
    AdminTableBody,
    AdminTableColGroup,
    AdminTableEmpty,
    AdminTableHead,
    AdminTableRow,
    AdminTableTd,
    AdminTableTh,
} from '@/components/admin/AdminDataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyAmount, CurrencyAmountInline } from '@/components/shared/CurrencyAmount';
import {
    cn,
    ENGLISH_NUMERALS_CLASS,
    formatAdminDate,
    formatNumber,
    formatPhone,
} from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

export function DashboardPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recent, setRecent] = useState<
        Array<{ id: number; reference: string; amount: number; phone: string; created_at: string; project_title: string }>
    >([]);

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
                    iconSize="lg"
                    className="text-2xl font-extrabold"
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
                    iconSize="lg"
                    className="text-2xl font-extrabold"
                />
            ),
        },
    ];

    const colCount = 4;

    return (
        <div className="space-y-8">
            <h1 className="font-display text-2xl font-bold text-gradient-brand">{t('admin.dashboard')}</h1>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.label}>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <div
                                className={cn(
                                    'mt-2 text-2xl font-extrabold',
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
                    <CardHeader>
                        <CardTitle>{stats.active_project.title_ar}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={cn('text-lg font-bold text-accent', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                            {formatNumber(stats.active_project.progress_percentage, locale)}%
                        </p>
                        <p className={cn('text-sm text-muted-foreground', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                            <CurrencyAmountInline
                                amounts={[
                                    stats.active_project.raised_amount,
                                    stats.active_project.goal_amount,
                                ]}
                            />
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.recent_donations')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <AdminDataTable className="border-0 sm:border">
                        <AdminTableColGroup widths={['14%', '14%', '38%', '28%']} />
                        <AdminTableHead>
                            <AdminTableTh variant="numeric">{t('success.amount')}</AdminTableTh>
                            <AdminTableTh variant="numeric">{t('donation.phone_label')}</AdminTableTh>
                            <AdminTableTh variant="text">{t('admin.projects')}</AdminTableTh>
                            <AdminTableTh variant="numeric">{t('admin.date')}</AdminTableTh>
                        </AdminTableHead>
                        <AdminTableBody>
                            {recent.length === 0 ? (
                                <AdminTableEmpty colSpan={colCount} message={t('admin.no_results')} />
                            ) : (
                                recent.map((d) => (
                                    <AdminTableRow key={d.id} striped>
                                        <AdminTableTd variant="numeric" className="font-medium">
                                            <CurrencyAmount amount={d.amount} iconSize="sm" />
                                        </AdminTableTd>
                                        <AdminTableTd variant="numeric">{formatPhone(d.phone)}</AdminTableTd>
                                        <AdminTableTd variant="text">{d.project_title}</AdminTableTd>
                                        <AdminTableTd variant="numeric" muted>
                                            {formatAdminDate(d.created_at, locale)}
                                        </AdminTableTd>
                                    </AdminTableRow>
                                ))
                            )}
                        </AdminTableBody>
                    </AdminDataTable>
                </CardContent>
            </Card>
        </div>
    );
}

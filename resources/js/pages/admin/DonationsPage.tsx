import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { exportDonations, fetchDonations, fetchProjects } from '@/api/admin';
import type { Donation, DonationListStats, Project } from '@/api/types';
import {
    AdminDataTable,
    AdminTableBody,
    AdminTableColGroup,
    AdminTableHead,
    AdminTableRow,
    AdminTableTd,
    AdminTableTh,
    ADMIN_TABLE_EMPTY,
} from '@/components/admin/AdminDataTable';
import {
    AdminMobileField,
    AdminMobileGrid,
    AdminMobileList,
    AdminMobileListItem,
} from '@/components/admin/AdminMobileList';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { cn, ENGLISH_NUMERALS_CLASS, formatAdminDate, formatPhone, formatReference, getLocalizedProjectTitle } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

const DONATIONS_PER_PAGE = 10;

export function DonationsPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState('');
    const [projectId, setProjectId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
    const [stats, setStats] = useState<DonationListStats>({ total_donations: 0, total_raised: 0 });
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchProjects().then((res) => setProjects(res.data));
    }, []);

    const buildFilterParams = (includePagination = true): Record<string, string | number> => {
        const params: Record<string, string | number> = {};
        if (includePagination) {
            params.page = page;
            params.per_page = DONATIONS_PER_PAGE;
        }
        if (search.trim()) {
            params.search = search.trim();
        }
        if (projectId) {
            params.project_id = projectId;
        }
        if (dateFrom) {
            params.date_from = dateFrom;
        }
        if (dateTo) {
            params.date_to = dateTo;
        }
        return params;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDonations(buildFilterParams()).then((res) => {
                setDonations(res.data);
                setMeta(res.meta);
                setStats(res.stats);
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, projectId, dateFrom, dateTo, page]);

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportDonations(buildFilterParams(false));
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                <h1 className="page-title">{t('admin.donations')}</h1>
                <Button
                    variant="outline"
                    onClick={() => void handleExport()}
                    disabled={exporting || meta.total === 0}
                    className="w-full gap-2 sm:w-auto"
                >
                    <Download className="h-4 w-4" />
                    {exporting ? t('admin.exporting_report') : t('admin.export_report')}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                <Card className="min-w-0">
                    <CardContent className="p-3 sm:p-6">
                        <p className="text-[11px] leading-snug text-muted-foreground sm:text-sm">
                            {t('admin.stats_total')}
                        </p>
                        <p
                            className={cn(
                                'mt-1.5 text-lg font-extrabold text-gradient-brand sm:mt-2 sm:text-2xl',
                                ENGLISH_NUMERALS_CLASS,
                            )}
                        >
                            {stats.total_donations}
                        </p>
                    </CardContent>
                </Card>
                <Card className="min-w-0">
                    <CardContent className="p-3 sm:p-6">
                        <p className="text-[11px] leading-snug text-muted-foreground sm:text-sm">
                            {t('admin.stats_raised')}
                        </p>
                        <div className="mt-1.5 sm:mt-2">
                            <CurrencyAmount
                                amount={stats.total_raised}
                                brand
                                iconSize="md"
                                className="text-lg font-extrabold sm:text-2xl"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="w-full max-w-md">
                    <Input
                        placeholder={t('common.search')}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[12rem]">
                    <Label htmlFor="donations-project">{t('admin.filter_by_project')}</Label>
                    <select
                        id="donations-project"
                        value={projectId}
                        onChange={(e) => {
                            setProjectId(e.target.value);
                            setPage(1);
                        }}
                        className="flex h-11 w-full rounded-lg border-2 border-input bg-card px-4 py-2 text-sm shadow-sm transition-all focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-auto sm:min-w-[12rem]"
                    >
                        <option value="">{t('admin.all_projects')}</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.id} — {getLocalizedProjectTitle(project, locale)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="donations-date-from">{t('admin.date_from')}</Label>
                    <Input
                        id="donations-date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setPage(1);
                        }}
                        className="w-full sm:w-auto"
                        dir="ltr"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="donations-date-to">{t('admin.date_to')}</Label>
                    <Input
                        id="donations-date-to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setPage(1);
                        }}
                        className="w-full sm:w-auto"
                        dir="ltr"
                    />
                </div>
            </div>

            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="admin-card-header">
                    <CardTitle className="text-base sm:text-lg">
                        {meta.total} {t('admin.donations')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="admin-card-body pt-0 sm:pt-0">
                    {donations.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">{t('admin.no_results')}</p>
                    ) : (
                        <>
                            <AdminMobileList>
                                {donations.map((d) => (
                                    <AdminMobileListItem key={d.id}>
                                        <AdminMobileField label={t('admin.id')}>
                                            <span className={ENGLISH_NUMERALS_CLASS} dir="ltr">
                                                {d.id}
                                            </span>
                                        </AdminMobileField>
                                        <AdminMobileGrid>
                                            <AdminMobileField label={t('success.amount')}>
                                                <CurrencyAmount
                                                    amount={d.amount}
                                                    currency={d.project?.currency ?? 'OMR'}
                                                    iconSize="sm"
                                                />
                                            </AdminMobileField>
                                            <AdminMobileField label={t('donation.phone_label')}>
                                                <span dir="ltr">{formatPhone(d.phone)}</span>
                                            </AdminMobileField>
                                        </AdminMobileGrid>
                                        <AdminMobileField label={t('admin.reference')}>
                                            <span className="break-all font-mono text-xs" dir="ltr">
                                                {formatReference(d.reference)}
                                            </span>
                                        </AdminMobileField>
                                        <AdminMobileField label={t('donation.name_label')}>
                                            {d.donor_name?.trim() || ADMIN_TABLE_EMPTY}
                                        </AdminMobileField>
                                        <AdminMobileField label={t('admin.projects')}>
                                            {getLocalizedProjectTitle(d.project, locale) || ADMIN_TABLE_EMPTY}
                                        </AdminMobileField>
                                        <AdminMobileField label={t('admin.date')}>
                                            <span dir="ltr">{formatAdminDate(d.created_at, locale)}</span>
                                        </AdminMobileField>
                                    </AdminMobileListItem>
                                ))}
                            </AdminMobileList>

                            <AdminDataTable>
                                <AdminTableColGroup widths={['6%', '20%', '10%', '12%', '16%', '20%', '16%']} />
                                <AdminTableHead>
                                    <AdminTableTh variant="numeric">{t('admin.id')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('admin.reference')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('success.amount')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('donation.phone_label')}</AdminTableTh>
                                    <AdminTableTh variant="text">{t('donation.name_label')}</AdminTableTh>
                                    <AdminTableTh variant="text">{t('admin.projects')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('admin.date')}</AdminTableTh>
                                </AdminTableHead>
                                <AdminTableBody>
                                    {donations.map((d) => (
                                        <AdminTableRow key={d.id} striped>
                                            <AdminTableTd variant="numeric" muted>
                                                {d.id}
                                            </AdminTableTd>
                                            <AdminTableTd variant="text" mono muted className="break-all whitespace-normal">
                                                <span dir="ltr">{formatReference(d.reference)}</span>
                                            </AdminTableTd>
                                            <AdminTableTd variant="numeric" className="font-medium">
                                                <CurrencyAmount
                                                    amount={d.amount}
                                                    currency={d.project?.currency ?? 'OMR'}
                                                    iconSize="sm"
                                                />
                                            </AdminTableTd>
                                            <AdminTableTd variant="numeric">{formatPhone(d.phone)}</AdminTableTd>
                                            <AdminTableTd variant="text">
                                                {d.donor_name?.trim() || ADMIN_TABLE_EMPTY}
                                            </AdminTableTd>
                                            <AdminTableTd variant="text">
                                                {getLocalizedProjectTitle(d.project, locale) || ADMIN_TABLE_EMPTY}
                                            </AdminTableTd>
                                            <AdminTableTd variant="numeric" muted>
                                                {formatAdminDate(d.created_at, locale)}
                                            </AdminTableTd>
                                        </AdminTableRow>
                                    ))}
                                </AdminTableBody>
                            </AdminDataTable>

                            <AdminPagination
                                currentPage={meta.current_page}
                                lastPage={meta.last_page}
                                onPageChange={setPage}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

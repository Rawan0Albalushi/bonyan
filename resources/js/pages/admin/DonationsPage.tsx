import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { exportDonations, fetchDonations } from '@/api/admin';
import type { Donation } from '@/api/types';
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
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { formatAdminDate, formatPhone, formatReference } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

const DONATIONS_PER_PAGE = 10;

export function DonationsPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDonations({ search, page, per_page: DONATIONS_PER_PAGE }).then((res) => {
                setDonations(res.data);
                setMeta(res.meta);
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params: Record<string, string> = {};
            if (search.trim()) {
                params.search = search.trim();
            }
            await exportDonations(params);
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

            <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                className="w-full max-w-md"
            />

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
                                        <AdminMobileField label={t('admin.date')}>
                                            <span dir="ltr">{formatAdminDate(d.created_at, locale)}</span>
                                        </AdminMobileField>
                                    </AdminMobileListItem>
                                ))}
                            </AdminMobileList>

                            <AdminDataTable>
                                <AdminTableColGroup widths={['34%', '11%', '15%', '22%', '18%']} />
                                <AdminTableHead>
                                    <AdminTableTh variant="numeric">{t('admin.reference')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('success.amount')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('donation.phone_label')}</AdminTableTh>
                                    <AdminTableTh variant="text">{t('donation.name_label')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('admin.date')}</AdminTableTh>
                                </AdminTableHead>
                                <AdminTableBody>
                                    {donations.map((d) => (
                                        <AdminTableRow key={d.id} striped>
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

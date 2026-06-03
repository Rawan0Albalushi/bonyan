import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchDonations } from '@/api/admin';
import type { Donation } from '@/api/types';
import {
    AdminDataTable,
    AdminTableBody,
    AdminTableColGroup,
    AdminTableEmpty,
    AdminTableHead,
    AdminTableRow,
    AdminTableTd,
    AdminTableTh,
    ADMIN_TABLE_EMPTY,
} from '@/components/admin/AdminDataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatAdminDate, formatCurrency, formatPhone, formatReference } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

export function DonationsPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [search, setSearch] = useState('');
    const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDonations({ search, page: 1 }).then((res) => {
                setDonations(res.data);
                setMeta(res.meta);
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const colCount = 5;

    return (
        <div className="space-y-6">
            <h1 className="font-display text-2xl font-bold text-gradient-brand">{t('admin.donations')}</h1>

            <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
            />

            <Card>
                <CardHeader>
                    <CardTitle>
                        {meta.total} {t('admin.donations')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <AdminDataTable className="border-0 sm:border">
                        <AdminTableColGroup
                            widths={['14%', '12%', '14%', '24%', '22%']}
                        />
                        <AdminTableHead>
                            <AdminTableTh variant="numeric">{t('admin.reference')}</AdminTableTh>
                            <AdminTableTh variant="numeric">{t('success.amount')}</AdminTableTh>
                            <AdminTableTh variant="numeric">{t('donation.phone_label')}</AdminTableTh>
                            <AdminTableTh variant="text">{t('donation.name_label')}</AdminTableTh>
                            <AdminTableTh variant="numeric">{t('admin.date')}</AdminTableTh>
                        </AdminTableHead>
                        <AdminTableBody>
                            {donations.length === 0 ? (
                                <AdminTableEmpty colSpan={colCount} message={t('admin.no_results')} />
                            ) : (
                                donations.map((d) => (
                                    <AdminTableRow key={d.id} striped>
                                        <AdminTableTd variant="numeric" mono muted truncate>
                                            {formatReference(d.reference)}
                                        </AdminTableTd>
                                        <AdminTableTd variant="numeric" className="font-medium">
                                            {formatCurrency(d.amount, d.project?.currency ?? 'OMR', locale)}
                                        </AdminTableTd>
                                        <AdminTableTd variant="numeric">{formatPhone(d.phone)}</AdminTableTd>
                                        <AdminTableTd variant="text">
                                            {d.donor_name?.trim() || ADMIN_TABLE_EMPTY}
                                        </AdminTableTd>
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

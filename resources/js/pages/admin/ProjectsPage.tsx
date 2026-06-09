import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { createProject, deleteProject, fetchProjects, updateProject } from '@/api/admin';
import type { Project } from '@/api/types';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CurrencyAmount, CurrencyAmountInline } from '@/components/shared/CurrencyAmount';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber, getLocalizedProjectTitle } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

const emptyForm = {
    slug: '',
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    goal_amount: 10000,
    raised_amount: 0,
    is_active: false,
};

const textareaClassName =
    'flex min-h-[5.5rem] w-full rounded-lg border-2 border-input bg-card px-4 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50';

const selectClassName =
    'flex h-11 w-full rounded-lg border-2 border-input bg-card px-4 py-2 text-sm shadow-sm transition-all focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-auto sm:min-w-[12rem]';

type StatusFilter = '' | 'active' | 'inactive';

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}

export function ProjectsPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [projects, setProjects] = useState<Project[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saved, setSaved] = useState(false);
    const [slugTouched, setSlugTouched] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);
        setLoadError(false);
        try {
            const res = await fetchProjects();
            setProjects(res.data);
        } catch {
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const stats = useMemo(
        () => ({
            total: projects.length,
            active: projects.filter((p) => p.is_active).length,
            totalRaised: projects.reduce((sum, p) => sum + p.raised_amount, 0),
            totalDonations: projects.reduce((sum, p) => sum + p.donations_count, 0),
        }),
        [projects],
    );

    const filteredProjects = useMemo(() => {
        const query = search.trim().toLowerCase();

        return projects.filter((project) => {
            if (statusFilter === 'active' && !project.is_active) {
                return false;
            }
            if (statusFilter === 'inactive' && project.is_active) {
                return false;
            }
            if (!query) {
                return true;
            }

            const title = getLocalizedProjectTitle(project, locale)?.toLowerCase() ?? '';
            return (
                title.includes(query) ||
                project.slug.toLowerCase().includes(query) ||
                project.title_ar.toLowerCase().includes(query) ||
                project.title_en.toLowerCase().includes(query) ||
                String(project.id).includes(query)
            );
        });
    }, [projects, search, statusFilter, locale]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setSlugTouched(false);
        setSaved(false);
    };

    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        try {
            if (editingId) {
                await updateProject(editingId, form);
            } else {
                await createProject(form);
            }
            setShowForm(false);
            resetForm();
            setSaved(true);
            await load();
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (project: Project) => {
        setEditingId(project.id);
        setForm({
            slug: project.slug,
            title_ar: project.title_ar,
            title_en: project.title_en,
            description_ar: project.description_ar ?? '',
            description_en: project.description_en ?? '',
            goal_amount: project.goal_amount,
            raised_amount: project.raised_amount,
            is_active: project.is_active,
        });
        setSlugTouched(true);
        setSaved(false);
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId === null) {
            return;
        }

        setDeleting(true);
        try {
            await deleteProject(deleteTargetId);
            if (editingId === deleteTargetId) {
                setShowForm(false);
                resetForm();
            }
            await load();
            setDeleteTargetId(null);
        } finally {
            setDeleting(false);
        }
    };

    const updateTitleEn = (titleEn: string) => {
        setForm((current) => ({
            ...current,
            title_en: titleEn,
            slug: !editingId && !slugTouched ? slugify(titleEn) : current.slug,
        }));
    };

    const statCards = [
        { label: t('admin.stats_projects_total'), value: String(stats.total) },
        { label: t('admin.stats_active_projects'), value: String(stats.active) },
        {
            label: t('admin.stats_raised'),
            value: (
                <CurrencyAmount
                    amount={stats.totalRaised}
                    brand
                    iconSize="md"
                    className="text-lg font-extrabold sm:text-2xl"
                />
            ),
        },
        { label: t('admin.donations_count'), value: String(stats.totalDonations) },
    ];

    if (loading && projects.length === 0) {
        return <p className="text-muted-foreground">{t('common.loading')}</p>;
    }

    return (
        <div className="admin-page">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                <h1 className="page-title">{t('admin.projects')}</h1>
                <Button onClick={openCreateForm} className="w-full gap-2 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    {t('common.create')}
                </Button>
            </div>

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

            {showForm && (
                <Card className="min-w-0 overflow-hidden">
                    <CardHeader className="admin-card-header">
                        <CardTitle className="text-base sm:text-lg">
                            {editingId ? t('admin.edit_project_title') : t('admin.create_project_title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="admin-card-body pt-0">
                        <form onSubmit={(e) => void handleSave(e)} className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t('admin.title_ar')}</Label>
                                <Input
                                    value={form.title_ar}
                                    onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.title_en')}</Label>
                                <Input
                                    value={form.title_en}
                                    onChange={(e) => updateTitleEn(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.slug')}</Label>
                                <Input
                                    value={form.slug}
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        setForm({ ...form, slug: e.target.value });
                                    }}
                                    required
                                    disabled={!!editingId}
                                    dir="ltr"
                                    className={ENGLISH_NUMERALS_CLASS}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.goal_amount')}</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={form.goal_amount}
                                    onChange={(e) => setForm({ ...form, goal_amount: +e.target.value })}
                                    required
                                    dir="ltr"
                                    className={ENGLISH_NUMERALS_CLASS}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>{t('admin.description_ar')}</Label>
                                <textarea
                                    value={form.description_ar}
                                    onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                                    className={textareaClassName}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>{t('admin.description_en')}</Label>
                                <textarea
                                    value={form.description_en}
                                    onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                                    className={textareaClassName}
                                    rows={3}
                                />
                            </div>
                            {editingId && (
                                <div className="space-y-2">
                                    <Label>{t('admin.raised_amount')}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.raised_amount}
                                        onChange={(e) => setForm({ ...form, raised_amount: +e.target.value })}
                                        dir="ltr"
                                        className={ENGLISH_NUMERALS_CLASS}
                                    />
                                </div>
                            )}
                            <label className="flex items-center gap-2 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    className="h-4 w-4 rounded border-input accent-primary"
                                />
                                <span className="text-sm">{t('admin.is_active')}</span>
                            </label>
                            {editingId && form.goal_amount > 0 && (
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>{t('admin.progress')}</Label>
                                    <div className="space-y-1.5">
                                        <Progress
                                            value={Math.min(100, (form.raised_amount / form.goal_amount) * 100)}
                                        />
                                        <p className={cn('text-xs text-muted-foreground', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                                            {formatNumber(
                                                Math.min(100, (form.raised_amount / form.goal_amount) * 100),
                                                locale,
                                            )}
                                            %
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:col-span-2">
                                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                    {t('common.save')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {saved && !showForm && (
                <p className="text-sm text-primary">{t('admin.project_saved_success')}</p>
            )}

            {loadError && (
                <p className="text-sm text-destructive">{t('admin.settings_load_error')}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="w-full max-w-md">
                    <Input
                        placeholder={t('common.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[12rem]">
                    <Label htmlFor="projects-status">{t('admin.filter_by_status')}</Label>
                    <select
                        id="projects-status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        className={selectClassName}
                    >
                        <option value="">{t('admin.all_statuses')}</option>
                        <option value="active">{t('admin.status_active')}</option>
                        <option value="inactive">{t('admin.status_inactive')}</option>
                    </select>
                </div>
            </div>

            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="admin-card-header">
                    <CardTitle className="text-base sm:text-lg">
                        {filteredProjects.length} {t('admin.projects')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="admin-card-body pt-0 sm:pt-0">
                    {filteredProjects.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">{t('admin.no_results')}</p>
                    ) : (
                        <>
                            <AdminMobileList>
                                {filteredProjects.map((project) => (
                                    <AdminMobileListItem key={project.id}>
                                        <AdminMobileField label={t('admin.id')}>
                                            <span className={ENGLISH_NUMERALS_CLASS} dir="ltr">
                                                {project.id}
                                            </span>
                                        </AdminMobileField>
                                        <AdminMobileField
                                            label={locale === 'en' ? t('admin.title_en') : t('admin.title_ar')}
                                        >
                                            {getLocalizedProjectTitle(project, locale) || ADMIN_TABLE_EMPTY}
                                        </AdminMobileField>
                                        <AdminMobileField label={t('admin.slug')}>
                                            <span className="break-all font-mono text-xs" dir="ltr">
                                                {project.slug}
                                            </span>
                                        </AdminMobileField>
                                        <AdminMobileField label={t('admin.progress')}>
                                            <div className="space-y-1.5">
                                                <Progress value={project.progress_percentage} />
                                                <p
                                                    className={cn('text-xs text-muted-foreground', ENGLISH_NUMERALS_CLASS)}
                                                    dir="ltr"
                                                >
                                                    <CurrencyAmountInline
                                                        amounts={[project.raised_amount, project.goal_amount]}
                                                        currency={project.currency}
                                                        iconSize="sm"
                                                    />{' '}
                                                    — {formatNumber(project.progress_percentage, locale)}%
                                                </p>
                                            </div>
                                        </AdminMobileField>
                                        <AdminMobileGrid>
                                            <AdminMobileField label={t('admin.donations_count')}>
                                                <span className={ENGLISH_NUMERALS_CLASS} dir="ltr">
                                                    {project.donations_count}
                                                </span>
                                            </AdminMobileField>
                                            <AdminMobileField label={t('admin.status')}>
                                                <span
                                                    className={cn(
                                                        'inline-block rounded-full px-2 py-0.5 text-xs',
                                                        project.is_active
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {project.is_active
                                                        ? t('admin.active_badge')
                                                        : t('admin.inactive_badge')}
                                                </span>
                                            </AdminMobileField>
                                        </AdminMobileGrid>
                                        <div className="flex gap-2 pt-1">
                                            <Button variant="outline" size="sm" onClick={() => startEdit(project)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeleteTargetId(project.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </AdminMobileListItem>
                                ))}
                            </AdminMobileList>

                            <AdminDataTable>
                                <AdminTableColGroup widths={['6%', '20%', '12%', '18%', '14%', '8%', '10%', '12%']} />
                                <AdminTableHead>
                                    <AdminTableTh variant="numeric">{t('admin.id')}</AdminTableTh>
                                    <AdminTableTh variant="text">
                                        {locale === 'en' ? t('admin.title_en') : t('admin.title_ar')}
                                    </AdminTableTh>
                                    <AdminTableTh variant="text">{t('admin.slug')}</AdminTableTh>
                                    <AdminTableTh variant="text">{t('admin.progress')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('admin.goal_amount')}</AdminTableTh>
                                    <AdminTableTh variant="numeric">{t('admin.donations_count')}</AdminTableTh>
                                    <AdminTableTh variant="center">{t('admin.status')}</AdminTableTh>
                                    <AdminTableTh variant="center">{t('admin.actions')}</AdminTableTh>
                                </AdminTableHead>
                                <AdminTableBody>
                                    {filteredProjects.map((project) => (
                                        <AdminTableRow key={project.id} striped>
                                            <AdminTableTd variant="numeric" muted>
                                                {project.id}
                                            </AdminTableTd>
                                            <AdminTableTd variant="text" className="font-medium">
                                                {getLocalizedProjectTitle(project, locale) || ADMIN_TABLE_EMPTY}
                                            </AdminTableTd>
                                            <AdminTableTd variant="text" mono muted className="break-all whitespace-normal">
                                                <span dir="ltr">{project.slug}</span>
                                            </AdminTableTd>
                                            <AdminTableTd variant="text">
                                                <div className="min-w-[8rem] space-y-1">
                                                    <Progress value={project.progress_percentage} />
                                                    <p
                                                        className={cn(
                                                            'text-xs text-muted-foreground',
                                                            ENGLISH_NUMERALS_CLASS,
                                                        )}
                                                        dir="ltr"
                                                    >
                                                        {formatNumber(project.progress_percentage, locale)}%
                                                    </p>
                                                </div>
                                            </AdminTableTd>
                                            <AdminTableTd variant="numeric">
                                                <CurrencyAmountInline
                                                    amounts={[project.raised_amount, project.goal_amount]}
                                                    currency={project.currency}
                                                    iconSize="sm"
                                                />
                                            </AdminTableTd>
                                            <AdminTableTd variant="numeric" muted>
                                                {project.donations_count}
                                            </AdminTableTd>
                                            <AdminTableTd variant="center">
                                                <span
                                                    className={cn(
                                                        'inline-block rounded-full px-2 py-0.5 text-xs',
                                                        project.is_active
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {project.is_active
                                                        ? t('admin.active_badge')
                                                        : t('admin.inactive_badge')}
                                                </span>
                                            </AdminTableTd>
                                            <AdminTableTd variant="center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => startEdit(project)}
                                                        aria-label={t('common.edit')}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setDeleteTargetId(project.id)}
                                                        aria-label={t('common.delete')}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </AdminTableTd>
                                        </AdminTableRow>
                                    ))}
                                </AdminTableBody>
                            </AdminDataTable>
                        </>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={deleteTargetId !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setDeleteTargetId(null);
                    }
                }}
                title={t('admin.delete_project_confirm_title')}
                description={t('admin.delete_project_confirm')}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                variant="destructive"
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

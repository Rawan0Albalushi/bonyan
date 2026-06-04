import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createProject, deleteProject, fetchProjects, updateProject } from '@/api/admin';
import type { Project } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyAmountInline } from '@/components/shared/CurrencyAmount';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';
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

export function ProjectsPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const [projects, setProjects] = useState<Project[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = () => fetchProjects().then((res) => setProjects(res.data));

    useEffect(() => {
        void load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await updateProject(editingId, form);
            } else {
                await createProject(form);
            }
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
            await load();
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (p: Project) => {
        setEditingId(p.id);
        setForm({
            slug: p.slug,
            title_ar: p.title_ar,
            title_en: p.title_en,
            description_ar: p.description_ar ?? '',
            description_en: p.description_en ?? '',
            goal_amount: p.goal_amount,
            raised_amount: p.raised_amount,
            is_active: p.is_active,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.delete_project_confirm'))) return;
        await deleteProject(id);
        await load();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-bold text-gradient-brand">{t('admin.projects')}</h1>
                <Button
                    onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setForm(emptyForm);
                    }}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {t('common.create')}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin.project_form_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => void handleSave(e)} className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t('admin.slug')}</Label>
                                <Input
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    required
                                    disabled={!!editingId}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.goal_amount')}</Label>
                                <Input
                                    type="number"
                                    value={form.goal_amount}
                                    onChange={(e) => setForm({ ...form, goal_amount: +e.target.value })}
                                    required
                                />
                            </div>
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
                                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>{t('admin.description_ar')}</Label>
                                <Input
                                    value={form.description_ar}
                                    onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>{t('admin.description_en')}</Label>
                                <Input
                                    value={form.description_en}
                                    onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                                />
                            </div>
                            {editingId && (
                                <div className="space-y-2">
                                    <Label>{t('admin.raised_amount')}</Label>
                                    <Input
                                        type="number"
                                        value={form.raised_amount}
                                        onChange={(e) => setForm({ ...form, raised_amount: +e.target.value })}
                                    />
                                </div>
                            )}
                            <label className="flex items-center gap-2 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                />
                                {t('admin.is_active')}
                            </label>
                            <div className="flex gap-2 sm:col-span-2">
                                <Button type="submit" disabled={saving}>
                                    {t('common.save')}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {projects.map((p) => (
                    <Card key={p.id}>
                        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                            <div>
                                <p className="font-bold">{locale === 'en' ? p.title_en : p.title_ar}</p>
                                <p className={cn('text-sm text-muted-foreground', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                                    <CurrencyAmountInline
                                        amounts={[p.raised_amount, p.goal_amount]}
                                        currency={p.currency}
                                        iconSize="sm"
                                    />{' '}
                                    — {formatNumber(p.progress_percentage, locale)}%
                                </p>
                                {p.is_active && (
                                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                        {t('admin.active_badge')}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => void handleDelete(p.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

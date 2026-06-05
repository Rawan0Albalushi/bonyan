import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSettings, updateSettings } from '@/api/admin';
import type { PublicSettings } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<Partial<PublicSettings>>({});
    const [amountsText, setAmountsText] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        fetchSettings()
            .then((res) => {
                setSettings(res.data);
                setAmountsText((res.data.donation_amounts ?? []).join(', '));
                setLoadError(false);
            })
            .catch(() => setLoadError(true));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        try {
            const donation_amounts = amountsText
                .split(',')
                .map((s) => parseFloat(s.trim()))
                .filter((n) => !Number.isNaN(n));
            await updateSettings({ ...settings, donation_amounts });
            setSaved(true);
            setLoadError(false);
        } catch {
            setLoadError(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-page">
            <h1 className="page-title">{t('admin.settings')}</h1>

            <Card className="min-w-0 overflow-hidden">
                <CardHeader className="admin-card-header">
                    <CardTitle className="text-base sm:text-lg">{t('admin.site_settings')}</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-body pt-0">
                    <form onSubmit={(e) => void handleSave(e)} className="grid w-full max-w-xl gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>
                                    {t('admin.title_ar')} {t('admin.site_name_suffix')}
                                </Label>
                                <Input
                                    value={settings.site_name_ar ?? ''}
                                    onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    {t('admin.title_en')} {t('admin.site_name_suffix')}
                                </Label>
                                <Input
                                    value={settings.site_name_en ?? ''}
                                    onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t('admin.tagline_ar')}</Label>
                                <Input
                                    value={settings.tagline_ar ?? ''}
                                    onChange={(e) => setSettings({ ...settings, tagline_ar: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.tagline_en')}</Label>
                                <Input
                                    value={settings.tagline_en ?? ''}
                                    onChange={(e) => setSettings({ ...settings, tagline_en: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('admin.donation_amounts')}</Label>
                            <Input
                                value={amountsText}
                                onChange={(e) => setAmountsText(e.target.value)}
                                placeholder="5, 10, 25, 50, 100"
                                dir="ltr"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>{t('admin.min_donation')}</Label>
                                <Input
                                    type="number"
                                    value={settings.min_donation_amount ?? 1}
                                    onChange={(e) =>
                                        setSettings({ ...settings, min_donation_amount: +e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.max_donation')}</Label>
                                <Input
                                    type="number"
                                    value={settings.max_donation_amount ?? 10000}
                                    onChange={(e) =>
                                        setSettings({ ...settings, max_donation_amount: +e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        {loadError && (
                            <p className="text-sm text-destructive">{t('admin.settings_load_error')}</p>
                        )}
                        {saved && <p className="text-sm text-primary">{t('admin.saved_success')}</p>}
                        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                            {t('common.save')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

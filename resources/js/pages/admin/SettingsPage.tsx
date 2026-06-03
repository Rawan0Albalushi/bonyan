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

    useEffect(() => {
        fetchSettings().then((res) => {
            setSettings(res.data);
            setAmountsText((res.data.donation_amounts ?? []).join(', '));
        });
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
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="font-display text-2xl font-bold text-gradient-brand">{t('admin.settings')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.site_settings')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => void handleSave(e)} className="grid max-w-xl gap-4">
                        <div className="space-y-2">
                            <Label>{t('admin.title_ar')} (Site)</Label>
                            <Input
                                value={settings.site_name_ar ?? ''}
                                onChange={(e) => setSettings({ ...settings, site_name_ar: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('admin.title_en')} (Site)</Label>
                            <Input
                                value={settings.site_name_en ?? ''}
                                onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline (AR)</Label>
                            <Input
                                value={settings.tagline_ar ?? ''}
                                onChange={(e) => setSettings({ ...settings, tagline_ar: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline (EN)</Label>
                            <Input
                                value={settings.tagline_en ?? ''}
                                onChange={(e) => setSettings({ ...settings, tagline_en: e.target.value })}
                            />
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
                                <Label>Min donation</Label>
                                <Input
                                    type="number"
                                    value={settings.min_donation_amount ?? 1}
                                    onChange={(e) =>
                                        setSettings({ ...settings, min_donation_amount: +e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max donation</Label>
                                <Input
                                    type="number"
                                    value={settings.max_donation_amount ?? 10000}
                                    onChange={(e) =>
                                        setSettings({ ...settings, max_donation_amount: +e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        {saved && <p className="text-sm text-primary">Saved successfully.</p>}
                        <Button type="submit" disabled={saving}>
                            {t('common.save')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

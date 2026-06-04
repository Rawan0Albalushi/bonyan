import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fetchActiveProject, submitDonation } from '@/api/public';
import type { Project, PublicSettings } from '@/api/types';
import { HouseProgress } from '@/components/house/HouseProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/contexts/LocaleContext';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { cn, ENGLISH_NUMERALS_CLASS } from '@/lib/utils';

export function DonatePage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [donorName, setDonorName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveProject()
            .then((res) => {
                setProject(res.data);
                setSettings(res.settings);
                if (res.settings?.donation_amounts?.[1]) {
                    setAmount(res.settings.donation_amounts[1]);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const selectedAmount = customAmount ? parseFloat(customAmount) : amount;
    const min = settings?.min_donation_amount ?? 1;
    const max = settings?.max_donation_amount ?? 10000;
    const presets = settings?.donation_amounts ?? [5, 10, 25, 50, 100];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!project) {
            setError(t('admin.no_project'));
            return;
        }
        if (!phone.trim()) {
            setError(t('donation.phone_required'));
            return;
        }
        if (!selectedAmount || selectedAmount < min) {
            setError(t('donation.min_error', { min }));
            return;
        }
        if (selectedAmount > max) {
            setError(t('donation.max_error', { max }));
            return;
        }

        setSubmitting(true);
        try {
            const res = await submitDonation({
                project_id: project.id,
                amount: selectedAmount,
                phone: phone.trim(),
                donor_name: donorName.trim() || undefined,
                locale,
            });

            if (res.payment_link) {
                window.location.href = res.payment_link;
                return;
            }

            navigate(`/donation/success/${res.data.reference}`, {
                state: { donation: res.data, project: res.project },
            });
        } catch {
            setError(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="mx-auto max-w-lg px-4 py-20 text-center">
                <p className="text-muted-foreground">{t('admin.no_project')}</p>
            </div>
        );
    }

    return (
        <div className="bg-page-soft py-10 md:py-16">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
                <div className="flex flex-col items-center justify-center">
                    <HouseProgress
                        percentage={project.progress_percentage}
                        size="lg"
                        interactive
                    />
                    <p className="mt-6 text-center text-sm text-muted-foreground">{project.title}</p>
                </div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className="shadow-brand-lg">
                        <CardHeader>
                            <CardTitle>{t('donation.title')}</CardTitle>
                            <CardDescription>{t('donation.subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                                <div className="space-y-3">
                                    <Label>{t('donation.amount_label')}</Label>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                        {presets.map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => {
                                                    setAmount(preset);
                                                    setCustomAmount('');
                                                }}
                                                className={cn(
                                                    ENGLISH_NUMERALS_CLASS,
                                                    'rounded-lg border px-2 py-3 text-sm font-semibold transition-all',
                                                    amount === preset && !customAmount
                                                        ? 'border-accent bg-gradient-to-b from-accent-light/30 to-accent/20 text-primary shadow-accent ring-2 ring-accent/25'
                                                        : 'border-primary/15 bg-card hover:border-primary/40 hover:bg-surface/60',
                                                )}
                                            >
                                                <CurrencyAmount
                                                    amount={preset}
                                                    currency={project.currency}
                                                    iconSize="sm"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div>
                                        <Label htmlFor="custom">{t('donation.custom_amount')}</Label>
                                        <Input
                                            id="custom"
                                            type="number"
                                            min={min}
                                            max={max}
                                            step="0.001"
                                            placeholder="0"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('donation.phone_label')} *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        dir="ltr"
                                        className="text-start"
                                        placeholder={t('donation.phone_placeholder')}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('donation.name_label')}</Label>
                                    <Input
                                        id="name"
                                        value={donorName}
                                        onChange={(e) => setDonorName(e.target.value)}
                                        placeholder={t('donation.name_placeholder')}
                                    />
                                </div>

                                {error && <p className="text-sm text-destructive">{error}</p>}

                                <Button
                                    type="submit"
                                    variant="accent"
                                    size="lg"
                                    className="w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? t('donation.submitting') : t('donation.submit')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

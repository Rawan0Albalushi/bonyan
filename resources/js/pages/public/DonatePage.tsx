import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fetchActiveProject, submitDonation } from '@/api/public';
import type { Project, PublicSettings } from '@/api/types';
import { HouseExperienceViewport } from '@/components/house/experience/HouseExperienceViewport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/contexts/LocaleContext';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { PUBLIC_HEADER_SPACER_CLASS } from '@/components/shared/PublicHeader';
import { cn, ENGLISH_NUMERALS_CLASS } from '@/lib/utils';

export function DonatePage() {
    const { t } = useTranslation();
    const { locale, isRtl } = useLocale();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showCustomAmount, setShowCustomAmount] = useState(false);
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
            })
            .finally(() => setLoading(false));
    }, []);

    const selectedAmount = showCustomAmount ? parseFloat(customAmount) : amount;
    const min = settings?.min_donation_amount ?? 1;
    const settingsMax = settings?.max_donation_amount ?? 5000;
    const remainingMax = project?.max_donatable_amount ?? settingsMax;
    const max = Math.min(settingsMax, remainingMax);
    const goalReached = remainingMax <= 0;
    const belowMinRemaining = !goalReached && remainingMax < min;
    const presets = (settings?.donation_amounts ?? [5, 10, 25, 50, 100]).filter(
        (preset) => preset >= min && preset <= max,
    );

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
        if (goalReached) {
            setError(t('donation.goal_reached'));
            return;
        }
        if (belowMinRemaining) {
            setError(t('donation.goal_reached'));
            return;
        }
        if (!selectedAmount || selectedAmount < min) {
            setError(t('donation.min_error', { min }));
            return;
        }
        if (selectedAmount > max) {
            setError(
                remainingMax < settingsMax
                    ? t('donation.remaining_error', { max })
                    : t('donation.max_error', { max }),
            );
            return;
        }

        setSubmitting(true);
        try {
            const res = await submitDonation({
                project_id: project.id,
                amount: Math.round(selectedAmount * 1000) / 1000,
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
            <div className={cn('bg-page-soft flex flex-1 items-center justify-center', PUBLIC_HEADER_SPACER_CLASS)}>
                <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className={cn('bg-page-soft flex flex-1 items-center justify-center px-4 text-center', PUBLIC_HEADER_SPACER_CLASS)}>
                <p className="text-muted-foreground">{t('admin.no_project')}</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'bg-page-soft flex min-h-[calc(100dvh-var(--public-header-offset,5.75rem))] flex-1 flex-col justify-center',
                PUBLIC_HEADER_SPACER_CLASS,
            )}
        >
            <div className="page-container-narrow grid w-full gap-6 py-8 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
                <div className="mx-auto flex w-full min-w-0 flex-col items-center justify-center lg:max-w-none">
                    <HouseExperienceViewport
                        progress={project.progress_percentage}
                        showLabel
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full min-w-0"
                >
                    <Card className="shadow-brand-lg">
                        <CardHeader>
                            <CardTitle>{t('donation.title')}</CardTitle>
                            <CardDescription>{t('donation.subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {goalReached && (
                                <p className="mb-4 text-sm text-muted-foreground">{t('donation.goal_reached')}</p>
                            )}
                            {belowMinRemaining && (
                                <p className="mb-4 text-sm text-muted-foreground">{t('donation.goal_reached')}</p>
                            )}
                            {!goalReached && !belowMinRemaining && remainingMax < settingsMax && (
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {t('donation.remaining_error', { max })}
                                </p>
                            )}
                            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                                <div className="space-y-3">
                                    <Label>{t('donation.amount_label')}</Label>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                        {presets.map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => {
                                                    setAmount(preset);
                                                    setCustomAmount('');
                                                    setShowCustomAmount(false);
                                                }}
                                                className={cn(
                                                    ENGLISH_NUMERALS_CLASS,
                                                    'rounded-lg border px-1.5 py-2.5 text-xs font-semibold transition-all sm:px-2 sm:py-3 sm:text-sm',
                                                    amount === preset && !showCustomAmount
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
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCustomAmount(true);
                                                setAmount(null);
                                            }}
                                            className={cn(
                                                'rounded-lg border px-1.5 py-2.5 text-xs font-semibold transition-all sm:px-2 sm:py-3 sm:text-sm',
                                                showCustomAmount
                                                    ? 'border-accent bg-gradient-to-b from-accent-light/30 to-accent/20 text-primary shadow-accent ring-2 ring-accent/25'
                                                    : 'border-primary/15 bg-card hover:border-primary/40 hover:bg-surface/60',
                                            )}
                                        >
                                            {t('donation.amount_other')}
                                        </button>
                                    </div>
                                    {showCustomAmount && (
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
                                                autoFocus
                                            />
                                        </div>
                                    )}
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
                                    disabled={submitting || goalReached || belowMinRemaining}
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

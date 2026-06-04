import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Hammer,
    Heart,
    Home,
    Loader2,
    Receipt,
    TrendingUp,
} from 'lucide-react';
import { checkDonationPaymentStatus, fetchDonationConfirmation } from '@/api/public';
import type { Donation, Project } from '@/api/types';
import { getPartUnlockedByDonation } from '@/components/house/houseParts';
import { HouseProgress } from '@/components/house/HouseProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocale } from '@/contexts/LocaleContext';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';

function SuccessSteps({ active }: { active: boolean }) {
    const { t } = useTranslation();
    const { isRtl } = useLocale();
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    if (!active) return null;

    const steps = [
        { label: t('success.step_payment'), done: true },
        { label: t('success.step_build'), done: true },
    ];

    return (
        <ol className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {steps.map((step, i) => (
                <li key={step.label} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {step.label}
                    </span>
                    {i < steps.length - 1 && (
                        <Arrow className="h-4 w-4 shrink-0 text-muted-foreground/70 rtl:rotate-180" aria-hidden />
                    )}
                </li>
            ))}
        </ol>
    );
}

export function SuccessPage() {
    const { t } = useTranslation();
    const { locale, isRtl } = useLocale();
    const { reference } = useParams<{ reference: string }>();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const state = location.state as { donation?: Donation; project?: Project } | null;

    const [donation, setDonation] = useState<Donation | null>(state?.donation ?? null);
    const [project, setProject] = useState<Project | null>(state?.project ?? null);
    const [verifying, setVerifying] = useState(false);

    const successFlag = searchParams.get('success');
    const isPaid = donation?.status === 'completed';
    const showCelebration = isPaid && !verifying;

    useEffect(() => {
        if (!reference) return;

        const load = async () => {
            try {
                const res = await fetchDonationConfirmation(reference);
                setDonation(res.data);
                setProject(res.project);

                if (res.data.status === 'completed') return;

                if (res.data.status === 'pending' && res.data.id) {
                    setVerifying(true);
                    for (let i = 0; i < 10; i++) {
                        const status = await checkDonationPaymentStatus(res.data.id);
                        if (status.status === 'paid') {
                            const refreshed = await fetchDonationConfirmation(reference);
                            setDonation(refreshed.data);
                            setProject(refreshed.project);
                            break;
                        }
                        if (status.status !== 'pending') break;
                        await new Promise((r) => setTimeout(r, 2000));
                    }
                    setVerifying(false);
                }
            } catch {
                setVerifying(false);
            }
        };

        if (!donation || !project || donation.status === 'pending' || successFlag === '0') {
            void load();
        }
    }, [reference, donation, project, successFlag]);

    const progress = project?.progress_percentage ?? 0;
    const donationsCount = project?.donations_count ?? 0;
    const addedPart = getPartUnlockedByDonation(donationsCount);

    return (
        <div className="bg-page-soft min-h-full">
            <section className="relative overflow-hidden border-b border-primary/10 bg-hero-gradient">
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    <div className="absolute -end-20 -top-16 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
                    <div className="absolute -bottom-12 -start-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-start">
                            <motion.div
                                initial={{ scale: 0.85 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                                className={cn(
                                    'flex h-16 w-16 items-center justify-center rounded-2xl shadow-brand-lg',
                                    showCelebration
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {verifying ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-8 w-8" />
                                )}
                            </motion.div>
                            <div className="space-y-2">
                                <h1 className="font-display text-3xl font-extrabold text-gradient-brand sm:text-4xl">
                                    {verifying ? t('success.verifying') : t('success.title')}
                                </h1>
                                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    {verifying
                                        ? t('success.pending')
                                        : showCelebration
                                          ? t('success.subtitle_build')
                                          : t('success.pending')}
                                </p>
                            </div>
                        </div>
                        <SuccessSteps active={showCelebration} />
                    </motion.div>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                {showCelebration ? (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-10">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="order-1 space-y-4 lg:order-none"
                        >
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {t('success.watch_build')}
                                </p>
                                <span
                                    className={cn(
                                        'rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary',
                                        ENGLISH_NUMERALS_CLASS,
                                    )}
                                    dir="ltr"
                                >
                                    {formatNumber(progress, locale)}%
                                </span>
                            </div>
                            <HouseProgress
                                percentage={progress}
                                donationsCount={donationsCount}
                                celebrateDonationNumber={donationsCount}
                                size="celebration"
                                showLabel
                                animated
                                interactive={false}
                                showPartSummary={false}
                                className="mx-auto lg:mx-0"
                            />
                        </motion.section>

                        <motion.aside
                            initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.12 }}
                            className="order-2 space-y-4 lg:sticky lg:top-24 lg:order-none"
                        >
                            {addedPart && (
                                <div className="card-elevated overflow-hidden rounded-2xl">
                                    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary px-5 py-5 text-primary-foreground">
                                        <div
                                            className="pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"
                                            aria-hidden
                                        />
                                        <p className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/85">
                                            <Hammer className="h-3.5 w-3.5" />
                                            {t('success.you_built')}
                                        </p>
                                        <p className="relative mt-2 font-display text-2xl font-bold leading-snug">
                                            <span className="me-2 text-3xl" aria-hidden>
                                                {addedPart.icon}
                                            </span>
                                            {t(addedPart.labelKey)}
                                        </p>
                                    </div>
                                    <p className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                                        {t('success.impact_line')}
                                    </p>
                                </div>
                            )}

                            <div className="card-elevated rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-primary">
                                    <TrendingUp className="h-4 w-4" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {t('success.new_progress')}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-baseline justify-between gap-3">
                                    <span
                                        className={cn(
                                            'font-display text-4xl font-bold text-primary',
                                            ENGLISH_NUMERALS_CLASS,
                                        )}
                                        dir="ltr"
                                    >
                                        {formatNumber(progress, locale)}%
                                    </span>
                                </div>
                                <Progress value={progress} className="mt-4 h-2.5" />
                            </div>

                            {donation && (
                                <div className="card-elevated rounded-2xl p-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-primary" />
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t('success.subtitle')}
                                        </p>
                                    </div>
                                    <div className="grid gap-3">
                                        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {t('success.amount')}
                                            </p>
                                            <p className="mt-1.5" dir="ltr">
                                                <CurrencyAmount
                                                    amount={donation.amount}
                                                    currency={project?.currency}
                                                    className="font-display text-xl font-bold"
                                                    amountClassName="text-accent"
                                                    iconSize="lg"
                                                />
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {t('success.reference')}
                                            </p>
                                            <p
                                                className="mt-1.5 break-all font-mono text-xs leading-relaxed text-foreground sm:text-sm"
                                                dir="ltr"
                                                title={donation.reference}
                                            >
                                                {donation.reference}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-1">
                                <Link to="/donate">
                                    <Button variant="accent" size="lg" className="w-full gap-2 shadow-accent">
                                        <Heart className="h-4 w-4 fill-current" />
                                        {t('success.donate_again')}
                                    </Button>
                                </Link>
                                <Link to="/">
                                    <Button variant="outline" size="lg" className="w-full gap-2">
                                        <Home className="h-4 w-4" />
                                        {t('success.back_home')}
                                    </Button>
                                </Link>
                            </div>
                        </motion.aside>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border/80 bg-card p-10 text-center shadow-brand"
                    >
                        {verifying ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : (
                            <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                        )}
                        <div className="space-y-2">
                            <p className="font-display text-lg font-bold text-foreground">
                                {verifying ? t('success.verifying') : t('success.pending')}
                            </p>
                            <p className="text-sm text-muted-foreground">{t('success.pending')}</p>
                        </div>
                        <Link to="/" className="w-full">
                            <Button variant="outline" className="w-full gap-2">
                                <Home className="h-4 w-4" />
                                {t('success.back_home')}
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Heart,
    Home,
    Loader2,
    Receipt,
    TrendingUp,
} from 'lucide-react';
import { checkDonationPaymentStatus, fetchDonationConfirmation } from '@/api/public';
import type { Donation, Project } from '@/api/types';
import {
    clampPercentage,
    getFundingProgressBeforeDonation,
} from '@/components/house/houseProgressVisual';
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
        <ol className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {steps.map((step, i) => (
                <li key={step.label} className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-5 sm:w-5">
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
                        </span>
                        {step.label}
                    </span>
                    {i < steps.length - 1 && (
                        <Arrow className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 rtl:rotate-180 sm:h-4 sm:w-4" aria-hidden />
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

    const fundingProgress =
        project && project.goal_amount > 0
            ? clampPercentage((project.raised_amount / project.goal_amount) * 100)
            : (project?.progress_percentage ?? 0);
    const donationsCount = project?.donations_count ?? 0;
    const fundingBefore =
        project && donation && isPaid
            ? getFundingProgressBeforeDonation(
                  project.goal_amount,
                  project.raised_amount,
                  donation.amount,
              )
            : fundingProgress;

    return (
        <div className="bg-page-soft min-h-full">
            <section className="relative overflow-hidden border-b border-primary/10 bg-hero-gradient">
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    <div className="absolute -end-20 -top-16 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
                    <div className="absolute -bottom-12 -start-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 text-center md:gap-5"
                    >
                        <motion.div
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-xl shadow-brand sm:h-14 sm:w-14 sm:rounded-2xl',
                                showCelebration
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            {verifying ? (
                                <Loader2 className="h-6 w-6 animate-spin sm:h-7 sm:w-7" />
                            ) : (
                                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                            )}
                        </motion.div>
                        <div className="space-y-2">
                            <h1 className="font-display text-2xl font-extrabold text-gradient-brand sm:text-3xl">
                                {verifying ? t('success.verifying') : t('success.title')}
                            </h1>
                            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {verifying
                                    ? t('success.pending')
                                    : showCelebration
                                      ? t('success.subtitle_build')
                                      : t('success.pending')}
                            </p>
                        </div>
                        <div className="mt-1">
                            <SuccessSteps active={showCelebration} />
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
                {showCelebration ? (
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-12">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="order-1 lg:order-none"
                        >
                            <div className="overflow-hidden rounded-2xl border border-primary/10 bg-card p-4 shadow-brand sm:p-6">
                                <HouseProgress
                                    percentage={fundingProgress}
                                    celebrateFromPercentage={
                                        showCelebration ? fundingBefore : null
                                    }
                                    donationAmount={donation?.amount}
                                    goalAmount={project?.goal_amount}
                                    donationsCount={donationsCount}
                                    size="md"
                                    inlineCelebration
                                    showPhaseIndicator
                                    animated
                                    className="mx-auto w-full"
                                />
                            </div>
                        </motion.section>

                        <motion.aside
                            initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.12 }}
                            className="order-2 space-y-5 lg:sticky lg:top-20 lg:order-none"
                        >
                            <div className="card-elevated overflow-hidden rounded-2xl">
                                <div className="border-b border-border/50 p-5 sm:p-6">
                                    <div className="flex items-center gap-2.5 text-primary">
                                        <TrendingUp className="h-4 w-4 shrink-0" />
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t('success.new_progress')}
                                        </p>
                                    </div>
                                    <p
                                        className={cn(
                                            'mt-3 font-display text-3xl font-bold text-primary',
                                            ENGLISH_NUMERALS_CLASS,
                                        )}
                                        dir="ltr"
                                    >
                                        {formatNumber(fundingProgress, locale)}%
                                    </p>
                                    <Progress value={fundingProgress} className="mt-4 h-2.5" />
                                </div>

                                {donation && (
                                    <div className="border-b border-border/50 p-5 sm:p-6">
                                        <div className="mb-4 flex items-center gap-2.5">
                                            <Receipt className="h-4 w-4 shrink-0 text-primary" />
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                {t('success.subtitle')}
                                            </p>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3.5">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    {t('success.amount')}
                                                </p>
                                                <p className="mt-2" dir="ltr">
                                                    <CurrencyAmount
                                                        amount={donation.amount}
                                                        currency={project?.currency}
                                                        className="font-display text-lg font-bold"
                                                        amountClassName="text-accent"
                                                        iconSize="md"
                                                    />
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3.5">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    {t('success.reference')}
                                                </p>
                                                <p
                                                    className="mt-2 break-all font-mono text-xs leading-relaxed text-foreground"
                                                    dir="ltr"
                                                    title={donation.reference}
                                                >
                                                    {donation.reference}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 p-5 sm:p-6">
                                    <Link to="/donate">
                                        <Button variant="accent" className="h-11 w-full gap-2 shadow-accent">
                                            <Heart className="h-4 w-4 fill-current" />
                                            {t('success.donate_again')}
                                        </Button>
                                    </Link>
                                    <Link to="/">
                                        <Button variant="outline" className="h-11 w-full gap-2">
                                            <Home className="h-4 w-4" />
                                            {t('success.back_home')}
                                        </Button>
                                    </Link>
                                </div>
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

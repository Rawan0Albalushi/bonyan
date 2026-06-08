import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, Heart, Home, Loader2, PartyPopper, Receipt } from 'lucide-react';
import { checkDonationPaymentStatus, fetchDonationConfirmation } from '@/api/public';
import type { Donation, Project } from '@/api/types';
import {
    clampPercentage,
    getFundingProgressBeforeDonation,
} from '@/components/house/houseProgressVisual';
import { HouseExperienceViewport } from '@/components/house/experience/HouseExperienceViewport';
import { Button } from '@/components/ui/button';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { CurvedSectionBottom } from '@/components/shared/CurvedSectionBottom';
import { PUBLIC_HEADER_SPACER_CLASS } from '@/components/shared/PublicHeader';
import { SuccessProgressCard } from '@/components/success/SuccessProgressCard';
import { cn } from '@/lib/utils';

export function SuccessPage() {
    const { t } = useTranslation();
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
    const fundingBefore =
        project && donation && isPaid
            ? getFundingProgressBeforeDonation(
                  project.goal_amount,
                  project.raised_amount,
                  donation.amount,
              )
            : fundingProgress;
    const progressAdded = clampPercentage(fundingProgress - fundingBefore);

    return (
        <div className="bg-page-soft min-h-full">
            <section
                className={cn(
                    'relative w-full max-w-full overflow-x-clip rounded-b-[2rem] bg-hero-gradient-success pb-2 shadow-[inset_0_-1px_0_0_color-mix(in_srgb,var(--color-primary)_12%,transparent)] sm:rounded-b-[2.5rem] sm:pb-3 md:pb-4',
                    PUBLIC_HEADER_SPACER_CLASS,
                )}
            >
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem]"
                    aria-hidden
                >
                    <div className="absolute -top-20 -end-20 h-80 w-80 rounded-full bg-accent/35 blur-3xl" />
                    <div className="absolute -bottom-12 -start-12 h-64 w-64 rounded-full bg-primary/28 blur-3xl" />
                    <div className="absolute start-1/2 top-0 h-48 w-[min(92%,38rem)] -translate-x-1/2 rounded-full bg-primary-light/22 blur-3xl rtl:translate-x-1/2" />
                    {showCelebration && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute end-[12%] top-[18%] h-3 w-3 rounded-full bg-accent/70"
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                                className="absolute start-[14%] top-[28%] h-2 w-2 rounded-full bg-primary-light/80"
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.25, 0.6, 0.25] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                                className="absolute bottom-[32%] end-[20%] h-2.5 w-2.5 rounded-full bg-accent/50"
                            />
                        </>
                    )}
                </div>

                <div className="relative page-container py-2 pb-5 sm:py-2.5 sm:pb-6 md:pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="flex w-full min-w-0 flex-col items-center gap-2.5 overflow-visible text-center sm:gap-3 md:gap-3.5"
                    >
                        {showCelebration ? (
                            <motion.span
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                <PartyPopper className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" />
                                {t('success.step_payment')}
                            </motion.span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm sm:text-sm">
                                {verifying && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary sm:h-4 sm:w-4" />
                                )}
                                {verifying ? t('success.verifying') : t('success.pending')}
                            </span>
                        )}

                        <div className="w-full min-w-0 space-y-3 overflow-visible px-1 sm:space-y-3.5">
                            <div className="overflow-visible py-0.5">
                                <h1
                                    className={cn(
                                        'font-display text-[1.75rem] font-extrabold sm:text-3xl md:text-4xl',
                                        showCelebration ? 'text-gradient-brand-hero' : 'text-gradient-brand',
                                    )}
                                >
                                    {verifying ? t('success.verifying') : t('success.title')}
                                </h1>
                            </div>
                            {!showCelebration && (
                                <p className="mx-auto max-w-xl text-[0.9375rem] leading-7 text-foreground/80 sm:text-base sm:leading-relaxed">
                                    {t('success.pending')}
                                </p>
                            )}
                        </div>

                        {showCelebration && donation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.18, duration: 0.4 }}
                                className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-accent/30 bg-white/65 px-4 py-2.5 shadow-brand backdrop-blur-md sm:gap-2.5 sm:px-5 sm:py-3"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 sm:h-10 sm:w-10">
                                    <Heart className="h-4 w-4 fill-accent text-accent sm:h-5 sm:w-5" />
                                </span>
                                <div className="text-start">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                                        {t('success.amount')}
                                    </p>
                                    <p className="mt-0.5" dir="ltr">
                                        <CurrencyAmount
                                            amount={donation.amount}
                                            currency={project?.currency}
                                            className="font-display text-lg font-bold sm:text-xl"
                                            amountClassName="text-accent"
                                            iconSize="md"
                                        />
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                <CurvedSectionBottom className="[&_svg]:h-5 [&_svg]:sm:h-6 [&_svg]:md:h-7" />
            </section>

            {showCelebration && (
                <section
                    className="relative z-10 -mt-5 w-full sm:-mt-6 md:-mt-8 lg:-mt-10"
                    aria-label={t('success.watch_build')}
                >
                    <div className="page-container">
                        <motion.div
                            initial={{ opacity: 0, y: 28, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                            className="success-house-showcase mx-auto w-full max-w-[min(100%,72rem)] px-1 sm:px-2"
                        >
                            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-primary/80 sm:mb-5 sm:text-sm">
                                {t('success.watch_build')}
                            </p>
                            <HouseExperienceViewport
                                progress={fundingProgress}
                                celebrateFromPercentage={fundingBefore}
                                inlineCelebration
                                showLabel
                                className="mx-auto w-full"
                            />
                        </motion.div>
                    </div>
                </section>
            )}

            <main
                className={cn(
                    'page-container flex flex-col justify-center',
                    showCelebration ? 'py-8 md:py-10' : 'min-h-[50vh] py-6 md:py-10',
                )}
            >
                {showCelebration ? (
                    <motion.aside
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto w-full max-w-2xl"
                    >
                            <div className="card-elevated overflow-hidden rounded-2xl">
                                {project && (
                                    <SuccessProgressCard
                                        fundingProgress={fundingProgress}
                                        fundingBefore={fundingBefore}
                                        progressAdded={progressAdded}
                                        project={project}
                                    />
                                )}

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
                                    <Link to="/build-a-home">
                                        <Button variant="outline" className="h-11 w-full gap-2">
                                            <Home className="h-4 w-4" />
                                            {t('success.back_home')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                    </motion.aside>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 sm:gap-8"
                    >
                        {project && (
                            <HouseExperienceViewport
                                progress={fundingProgress}
                                showLabel
                                className="w-full"
                            />
                        )}
                        <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border/80 bg-card p-6 text-center shadow-brand sm:gap-6 sm:p-10">
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
                        <Link to="/build-a-home" className="w-full">
                            <Button variant="outline" className="w-full gap-2">
                                <Home className="h-4 w-4" />
                                {t('success.back_home')}
                            </Button>
                        </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

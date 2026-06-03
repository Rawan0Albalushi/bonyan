import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, Home } from 'lucide-react';
import { checkDonationPaymentStatus, fetchDonationConfirmation } from '@/api/public';
import type { Donation, Project } from '@/api/types';
import { getPartUnlockedByDonation } from '@/components/house/houseParts';
import { HouseProgress } from '@/components/house/HouseProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, ENGLISH_NUMERALS_CLASS, formatCurrency, formatNumber } from '@/lib/utils';

export function SuccessPage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const { reference } = useParams<{ reference: string }>();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const state = location.state as { donation?: Donation; project?: Project } | null;

    const [donation, setDonation] = useState<Donation | null>(state?.donation ?? null);
    const [project, setProject] = useState<Project | null>(state?.project ?? null);
    const [verifying, setVerifying] = useState(false);

    const successFlag = searchParams.get('success');
    const isPaid = donation?.status === 'completed';

    useEffect(() => {
        if (!reference) return;

        const load = async () => {
            try {
                const res = await fetchDonationConfirmation(reference);
                setDonation(res.data);
                setProject(res.project);

                if (res.data.status === 'completed') {
                    return;
                }

                if (res.data.status === 'pending' && res.data.id) {
                    setVerifying(true);
                    const maxAttempts = 10;
                    for (let i = 0; i < maxAttempts; i++) {
                        const status = await checkDonationPaymentStatus(res.data.id);
                        if (status.status === 'paid') {
                            const refreshed = await fetchDonationConfirmation(reference);
                            setDonation(refreshed.data);
                            setProject(refreshed.project);
                            break;
                        }
                        if (status.status !== 'pending') {
                            break;
                        }
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
    const showCelebration = isPaid && !verifying;

    return (
        <div className="bg-page-soft py-12 md:py-20">
            <div className="mx-auto max-w-2xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <CheckCircle2 className="mx-auto h-16 w-16 text-primary-light drop-shadow-sm" />
                    <h1 className="mt-4 font-display text-3xl font-bold text-gradient-brand">
                        {verifying ? t('success.verifying') : t('success.title')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {verifying
                            ? t('success.pending')
                            : showCelebration
                              ? t('success.subtitle')
                              : t('success.pending')}
                    </p>
                </motion.div>

                {showCelebration && (
                    <>
                        <div className="mt-10 flex justify-center">
                            <HouseProgress
                                percentage={progress}
                                donationsCount={donationsCount}
                                celebrateDonationNumber={donationsCount}
                                size="md"
                                animated
                                interactive
                            />
                        </div>

                        <Card className="mt-10 shadow-brand-lg">
                            <CardContent className="space-y-4 p-6">
                                {donation && (
                                    <>
                                        <div className="flex justify-between border-b border-border pb-3">
                                            <span className="text-muted-foreground">{t('success.reference')}</span>
                                            <span className="font-mono text-sm" dir="ltr">
                                                {donation.reference.slice(0, 8)}...
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-border pb-3">
                                            <span className="text-muted-foreground">{t('success.amount')}</span>
                                            <span className={cn('font-extrabold text-accent', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                                                {formatCurrency(donation.amount, project?.currency, locale)}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('success.new_progress')}</span>
                                    <span className={cn('font-bold text-primary', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                                        {formatNumber(progress, locale)}%
                                    </span>
                                </div>
                                {addedPart && (
                                    <div className="rounded-lg border border-accent/25 bg-gradient-to-r from-accent-light/25 to-accent/15 px-3 py-2 text-center text-sm font-medium text-primary">
                                        <span className="me-1">{addedPart.icon}</span>
                                        {t('house.just_added')} {t(addedPart.labelKey)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link to="/">
                        <Button variant="outline" className="w-full gap-2 sm:w-auto">
                            <Home className="h-4 w-4" />
                            {t('success.back_home')}
                        </Button>
                    </Link>
                    <Link to="/donate">
                        <Button variant="accent" className="w-full sm:w-auto">
                            {t('success.donate_again')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

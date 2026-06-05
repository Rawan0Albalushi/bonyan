import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { fetchActiveProject } from '@/api/public';
import type { Project, PublicSettings } from '@/api/types';
import { HouseProgress } from '@/components/house/HouseProgress';
import { HowDonateStepCard } from '@/components/shared/HowDonateStepCard';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLocale } from '@/contexts/LocaleContext';
import { CurvedSectionBottom } from '@/components/shared/CurvedSectionBottom';
import { PUBLIC_HEADER_SPACER_CLASS } from '@/components/shared/PublicHeader';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';

export function HomePage() {
    const { t } = useTranslation();
    const { locale, isRtl } = useLocale();
    const [project, setProject] = useState<Project | null>(null);
    const [, setSettings] = useState<PublicSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveProject()
            .then((res) => {
                setProject(res.data);
                setSettings(res.settings);
            })
            .finally(() => setLoading(false));
    }, []);

    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    if (loading) {
        return (
            <section
                className={cn(
                    'bg-hero-gradient-home relative overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem]',
                    PUBLIC_HEADER_SPACER_CLASS,
                )}
            >
                <div className="flex min-h-[50vh] items-center justify-center pb-16">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </section>
        );
    }

    const progress = project?.progress_percentage ?? 0;

    return (
        <div>
            <section
                className={cn(
                    'bg-hero-gradient-home relative overflow-hidden rounded-b-[2rem] pb-10 shadow-[inset_0_-1px_0_0_color-mix(in_srgb,var(--color-primary)_12%,transparent)] sm:rounded-b-[2.5rem] sm:pb-12 md:pb-14 lg:pb-16',
                    PUBLIC_HEADER_SPACER_CLASS,
                )}
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem]" aria-hidden>
                    <div className="absolute -end-20 -top-20 h-80 w-80 rounded-full bg-accent/35 blur-3xl" />
                    <div className="absolute -bottom-12 -start-12 h-64 w-64 rounded-full bg-primary/28 blur-3xl" />
                    <div className="absolute start-1/2 top-0 h-48 w-[min(92%,38rem)] -translate-x-1/2 rounded-full bg-primary-light/22 blur-3xl" />
                    <div className="absolute bottom-1/4 end-1/3 h-40 w-40 rounded-full bg-olive/20 blur-2xl" />
                </div>

                <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 xl:gap-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="order-2 flex min-w-0 flex-col justify-center space-y-5 overflow-visible sm:space-y-6 lg:order-1 lg:pe-4 xl:pe-8"
                    >
                        <h1 className="font-display text-3xl font-extrabold leading-snug text-gradient-brand-hero drop-shadow-sm sm:text-4xl lg:text-5xl">
                            {t('home.hero_title')}
                        </h1>
                        <p className="text-lg leading-relaxed text-foreground/85">
                            {project?.description ?? t('home.hero_subtitle')}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/donate">
                                <Button variant="accent" size="lg" className="gap-2">
                                    {t('home.cta_donate')}
                                    <Arrow className="h-4 w-4" />
                                </Button>
                            </Link>
                            <a href="#about">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-primary/35 bg-white/55 backdrop-blur-sm hover:bg-white/80"
                                >
                                    {t('home.cta_learn')}
                                </Button>
                            </a>
                        </div>
                        {project && (
                            <div className="space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-foreground/75">{t('home.progress_label')}</span>
                                    <span
                                        className={cn('text-base font-extrabold text-primary-dark', ENGLISH_NUMERALS_CLASS)}
                                        dir="ltr"
                                    >
                                        {formatNumber(progress, locale)}%
                                    </span>
                                </div>
                                <Progress value={progress} variant="hero" className="h-2.5 sm:h-3" />
                            </div>
                        )}
                    </motion.div>

                    <div className="order-1 flex w-full items-center justify-center lg:order-2 lg:justify-end lg:ps-2 xl:ps-6">
                        <HouseProgress
                            percentage={progress}
                            size="lg"
                            variant="hero"
                            showLabel={false}
                            className="w-full max-w-none lg:max-w-full"
                        />
                    </div>
                </div>
                <CurvedSectionBottom className="[&_svg]:h-8 [&_svg]:sm:h-10 [&_svg]:md:h-14" />
            </section>

            {project && (
                <section className="py-12 md:py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="mb-8 text-center font-display text-2xl font-bold text-gradient-brand">
                            {project.title}
                        </h2>
                        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
                            <StatCard
                                label={t('home.raised')}
                                amount={project.raised_amount}
                                currency={project.currency}
                                variant="raised"
                                index={0}
                                highlight
                            />
                            <StatCard
                                label={t('home.goal')}
                                amount={project.goal_amount}
                                currency={project.currency}
                                variant="goal"
                                index={1}
                            />
                            <StatCard
                                label={t('home.remaining')}
                                amount={project.remaining_amount}
                                currency={project.currency}
                                variant="remaining"
                                index={2}
                            />
                        </div>
                    </div>
                </section>
            )}

            <section id="about" className="bg-section-muted py-12 md:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="mb-10 text-center font-display text-2xl font-bold text-gradient-brand md:mb-12">
                        {t('home.how_title')}
                    </h2>
                    <div className="flex flex-col items-center gap-12 sm:gap-14 md:flex-row md:items-start md:justify-center md:gap-0">
                        <HowDonateStepCard
                            step={1}
                            label={t('home.step1')}
                            variant="amount"
                            index={0}
                            showConnector
                            className="md:flex-1 md:max-w-[15rem]"
                        />
                        <HowDonateStepCard
                            step={2}
                            label={t('home.step2')}
                            variant="phone"
                            index={1}
                            showConnector
                            className="md:flex-1 md:max-w-[15rem]"
                        />
                        <HowDonateStepCard
                            step={3}
                            label={t('home.step3')}
                            variant="complete"
                            index={2}
                            className="md:flex-1 md:max-w-[15rem]"
                        />
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                    <Card className="border-primary/20 bg-gradient-to-br from-card via-surface/30 to-secondary/50 shadow-brand-lg">
                        <CardContent className="flex flex-col items-center gap-4 p-8">
                            <Shield className="h-10 w-10 text-primary drop-shadow-sm" />
                            <h3 className="font-display text-xl font-bold text-primary">{t('home.trust_title')}</h3>
                            <p className="text-muted-foreground">{t('home.trust_desc')}</p>
                            <Link to="/donate">
                                <Button variant="accent" size="lg" className="gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    {t('home.cta_donate')}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}

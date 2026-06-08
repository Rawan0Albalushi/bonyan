import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
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
import {
    cn,
    ENGLISH_NUMERALS_CLASS,
    formatNumber,
    getLocalizedProjectDescription,
    getLocalizedProjectTitle,
} from '@/lib/utils';

export function HomePage() {
    const { t } = useTranslation();
    const { locale } = useLocale();
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
        <div className="w-full min-w-0 max-w-full overflow-x-clip">
            <section
                className={cn(
                    'relative w-full max-w-full overflow-x-clip bg-hero-gradient-home overflow-hidden rounded-b-[2rem] pb-8 shadow-[inset_0_-1px_0_0_color-mix(in_srgb,var(--color-primary)_12%,transparent)] sm:rounded-b-[2.5rem] sm:pb-12 md:pb-14 lg:pb-16',
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
                </div>

                <div className="relative page-container grid w-full gap-5 sm:gap-8 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-mobile-content order-2 flex min-w-0 flex-col justify-center space-y-4 sm:space-y-6 lg:order-1 lg:pe-4 xl:pe-8"
                    >
                        <h1 className="font-display text-[1.625rem] font-extrabold leading-[1.35] text-gradient-brand-hero drop-shadow-sm sm:text-3xl sm:leading-snug md:text-4xl lg:text-5xl">
                            {t('home.hero_title')}
                        </h1>
                        <p className="max-w-prose text-[0.9375rem] leading-7 text-foreground/88 sm:text-lg sm:leading-relaxed">
                            {getLocalizedProjectDescription(project, locale) ?? t('home.hero_subtitle')}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Link to="/donate" className="w-full sm:w-auto">
                                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                                    {t('home.cta_donate')}
                                </Button>
                            </Link>
                            <a href="#about" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full border-primary/35 bg-white/55 backdrop-blur-sm hover:bg-white/80 sm:w-auto"
                                >
                                    {t('home.cta_learn')}
                                </Button>
                            </a>
                        </div>
                        {project && (
                            <div className="space-y-2 pt-1">
                                <div className="flex justify-between gap-3 text-sm">
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

                    <div className="order-1 mx-auto flex w-full max-w-[min(100%,19rem)] items-center justify-center sm:max-w-md lg:order-2 lg:max-w-none lg:justify-end lg:ps-2 xl:ps-6">
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
                <section className="page-section">
                    <div className="page-container">
                        <h2 className="mb-6 text-center font-display text-xl font-bold sm:mb-8 sm:text-2xl">
                            <span className="text-gradient-brand">
                                {getLocalizedProjectTitle(project, locale) ?? project.title}
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
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

            <section id="about" className="bg-section-muted page-section">
                <div className="page-container">
                    <h2 className="mb-8 text-center font-display text-xl font-bold sm:mb-10 sm:text-2xl md:mb-12">
                        <span className="text-gradient-brand">{t('home.how_title')}</span>
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

            <section className="page-section pt-0 sm:pt-0">
                <div className="page-container-tight text-center">
                    <Card className="border-primary/20 bg-gradient-to-br from-card via-surface/30 to-secondary/50 shadow-brand-lg">
                        <CardContent className="flex flex-col items-center gap-4 p-6 sm:gap-5 sm:p-8">
                            <Shield className="h-9 w-9 text-primary drop-shadow-sm sm:h-10 sm:w-10" />
                            <h3 className="font-display text-lg font-bold text-primary sm:text-xl">{t('home.trust_title')}</h3>
                            <p className="text-sm text-muted-foreground sm:text-base">{t('home.trust_desc')}</p>
                            <Link to="/donate" className="w-full sm:w-auto">
                                <Button variant="accent" size="lg" className="w-full sm:w-auto">
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

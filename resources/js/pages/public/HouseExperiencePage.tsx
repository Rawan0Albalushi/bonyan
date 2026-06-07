import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { fetchActiveProject } from '@/api/public';
import type { Project } from '@/api/types';
import { HouseExperienceViewport } from '@/components/house/experience/HouseExperienceViewport';
import { getActiveLifeStage } from '@/components/house/houseLifeProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocale } from '@/contexts/LocaleContext';
import { CurvedSectionBottom } from '@/components/shared/CurvedSectionBottom';
import { PUBLIC_HEADER_SPACER_CLASS } from '@/components/shared/PublicHeader';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';

export function HouseExperiencePage() {
    const { t } = useTranslation();
    const { locale, isRtl } = useLocale();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveProject()
            .then((res) => setProject(res.data))
            .finally(() => setLoading(false));
    }, []);

    const Arrow = isRtl ? ArrowLeft : ArrowRight;
    const progress = project?.progress_percentage ?? 0;
    const activeStage = getActiveLifeStage(progress);

    if (loading) {
        return (
            <section
                className={cn(
                    'bg-hero-gradient-home relative overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem]',
                    PUBLIC_HEADER_SPACER_CLASS,
                )}
            >
                <div className="flex min-h-[60vh] items-center justify-center pb-16">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </section>
        );
    }

    return (
        <div className="w-full min-w-0 max-w-full overflow-x-clip">
            <section
                className={cn(
                    'relative w-full max-w-full overflow-x-clip bg-hero-gradient-home pb-6 shadow-[inset_0_-1px_0_0_color-mix(in_srgb,var(--color-primary)_12%,transparent)] sm:rounded-b-[2.5rem] sm:pb-10 md:pb-12 lg:pb-14',
                    PUBLIC_HEADER_SPACER_CLASS,
                )}
            >
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem]"
                    aria-hidden
                >
                    <div className="absolute -top-24 -end-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
                    <div className="absolute -bottom-16 -start-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
                    <div className="absolute start-1/2 top-0 h-56 w-[min(95%,42rem)] -translate-x-1/2 rounded-full bg-primary-light/20 blur-3xl rtl:translate-x-1/2" />
                </div>

                <div className="relative page-container flex flex-col items-center gap-6 sm:gap-8 lg:gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h1 className="text-balance font-display text-[1.625rem] font-extrabold leading-[1.4] text-gradient-brand-hero drop-shadow-sm sm:text-3xl sm:leading-snug md:text-4xl lg:max-w-4xl">
                            {project?.description ?? t('houseExperience.hero_subtitle')}
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="relative w-full"
                    >
                        <HouseExperienceViewport progress={progress} showLabel liveBuild />

                        <motion.p
                            key={activeStage}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-auto mt-4 max-w-xl text-center text-sm font-medium text-primary-dark/85 sm:mt-5 sm:text-base"
                        >
                            {t(`houseExperience.moment.${activeStage}`)}
                        </motion.p>
                    </motion.div>

                    {project && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="w-full max-w-xl space-y-3 px-2"
                        >
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-foreground/75">
                                    {t('houseExperience.progress_feeling')}
                                </span>
                                <span
                                    className={cn(
                                        'text-base font-extrabold text-primary-dark',
                                        ENGLISH_NUMERALS_CLASS,
                                    )}
                                    dir="ltr"
                                >
                                    {formatNumber(progress, locale)}%
                                </span>
                            </div>
                            <Progress value={progress} variant="hero" className="h-2.5 sm:h-3" />
                            <p className="text-center text-xs text-muted-foreground sm:text-sm">
                                {t(`house.life_stages.${activeStage}`)}
                            </p>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="flex w-full max-w-md flex-col gap-3 px-2 sm:max-w-none sm:flex-row sm:justify-center"
                    >
                        <Link to="/donate" className="w-full sm:w-auto">
                            <Button variant="accent" size="lg" className="w-full gap-2 shadow-accent sm:min-w-[14rem]">
                                <Sparkles className="h-4 w-4" />
                                {t('houseExperience.cta_donate')}
                                <Arrow className="h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                <CurvedSectionBottom className="[&_svg]:h-8 [&_svg]:sm:h-10 [&_svg]:md:h-14" />
            </section>
        </div>
    );
}

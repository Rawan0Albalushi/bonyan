import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { fetchActiveProject } from '@/api/public';
import type { Project, PublicSettings } from '@/api/types';
import { HouseProgress } from '@/components/house/HouseProgress';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLocale } from '@/contexts/LocaleContext';
import { CurvedSectionBottom } from '@/components/shared/CurvedSectionBottom';
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
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
        );
    }

    const progress = project?.progress_percentage ?? 0;

    return (
        <div>
            <section className="bg-hero-gradient relative rounded-b-[2rem] pb-10 pt-10 sm:rounded-b-[2.5rem] sm:pb-12 sm:pt-12 md:pb-14 md:pt-14 lg:pb-16 lg:pt-16">
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem]"
                    aria-hidden
                >
                    <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
                    <div className="absolute -bottom-16 -start-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
                </div>
                <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 xl:gap-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="order-2 flex min-w-0 flex-col justify-center space-y-5 overflow-visible sm:space-y-6 lg:order-1 lg:pe-4 xl:pe-8"
                    >
                        <h1 className="font-display text-3xl font-extrabold leading-snug text-gradient-brand sm:text-4xl lg:text-5xl">
                            {t('home.hero_title')}
                        </h1>
                        <p className="text-lg leading-relaxed text-muted-foreground">
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
                                <Button variant="outline" size="lg">
                                    {t('home.cta_learn')}
                                </Button>
                            </a>
                        </div>
                        {project && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('home.progress_label')}</span>
                                    <span className={cn('font-bold text-primary', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                                        {formatNumber(progress, locale)}%
                                    </span>
                                </div>
                                <Progress value={progress} className="h-2" />
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
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                label={t('home.raised')}
                                amount={project.raised_amount}
                                currency={project.currency}
                                highlight
                            />
                            <StatCard
                                label={t('home.goal')}
                                amount={project.goal_amount}
                                currency={project.currency}
                            />
                            <StatCard
                                label={t('home.remaining')}
                                amount={project.remaining_amount}
                                currency={project.currency}
                            />
                        </div>
                    </div>
                </section>
            )}

            <section id="about" className="bg-section-muted py-12 md:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="mb-10 text-center font-display text-2xl font-bold text-gradient-brand">{t('home.how_title')}</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[t('home.step1'), t('home.step2'), t('home.step3')].map((step, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="card-feature h-full border-none">
                                    <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent font-display text-xl font-bold text-accent-foreground shadow-accent">
                                            {i + 1}
                                        </span>
                                        <p className="font-medium">{step}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
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

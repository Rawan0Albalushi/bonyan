import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    getActiveLifeStage,
    getLifeStageProgress,
    type HouseLifeLayerId,
} from '@/components/house/houseLifeProgress';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';
import {
    BrickWall,
    DoorOpen,
    Flower2,
    Home,
    Lamp,
    Sparkles,
    TreePine,
} from 'lucide-react';

const STAGE_ORDER: HouseLifeLayerId[] = [
    'base',
    'roof',
    'openings',
    'garden',
    'lights',
    'interior',
    'complete',
];

const STAGE_ICONS: Record<HouseLifeLayerId, typeof Home> = {
    base: BrickWall,
    roof: Home,
    openings: DoorOpen,
    garden: TreePine,
    lights: Lamp,
    interior: Sparkles,
    complete: Home,
};

interface HouseJourneyStoryProps {
    progress: number;
    className?: string;
}

export function HouseJourneyStory({ progress, className }: HouseJourneyStoryProps) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const activeStage = getActiveLifeStage(progress);

    return (
        <div className={cn('w-full', className)}>
            <div className="mb-8 text-center sm:mb-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                    {t('houseExperience.journey_label')}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-gradient-brand sm:text-2xl md:text-3xl">
                    {t('houseExperience.journey_title')}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t('houseExperience.journey_desc')}
                </p>
            </div>

            <div className="relative mx-auto max-w-4xl">
                <div
                    className="absolute start-[1.125rem] top-6 bottom-6 w-px bg-gradient-to-b from-primary/10 via-primary/35 to-accent/40 sm:start-1/2 sm:-translate-x-1/2 rtl:sm:translate-x-1/2"
                    aria-hidden
                />

                <ol className="space-y-4 sm:space-y-5">
                    {STAGE_ORDER.map((stageId, index) => {
                        const Icon = STAGE_ICONS[stageId];
                        const stageProgress = getLifeStageProgress(progress, stageId);
                        const isComplete = stageProgress >= 1 || (stageId === 'complete' && progress >= 100);
                        const isActive = stageId === activeStage;
                        const isUpcoming = !isComplete && !isActive;

                        return (
                            <motion.li
                                key={stageId}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                className={cn(
                                    'relative flex gap-4 sm:gap-6',
                                    index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse',
                                )}
                            >
                                <div
                                    className={cn(
                                        'relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 sm:absolute sm:start-1/2 sm:top-1 sm:-translate-x-1/2 rtl:sm:translate-x-1/2',
                                        isComplete &&
                                            'border-primary bg-primary text-primary-foreground shadow-brand',
                                        isActive &&
                                            !isComplete &&
                                            'border-accent bg-accent/15 text-accent shadow-accent',
                                        isUpcoming && 'border-border/80 bg-card/80 text-muted-foreground',
                                    )}
                                >
                                    <Icon className="h-4 w-4" strokeWidth={2} />
                                </div>

                                <div
                                    className={cn(
                                        'min-w-0 flex-1 rounded-2xl border px-4 py-4 transition-shadow sm:max-w-[calc(50%-2.5rem)] sm:px-5 sm:py-5',
                                        isComplete && 'border-primary/20 bg-surface/60 shadow-brand',
                                        isActive &&
                                            !isComplete &&
                                            'border-accent/30 bg-gradient-to-br from-card via-surface/40 to-accent/10 shadow-accent',
                                        isUpcoming && 'border-border/60 bg-card/70',
                                        index % 2 === 0 ? 'sm:me-auto sm:pe-8' : 'sm:ms-auto sm:ps-8',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3
                                                className={cn(
                                                    'font-display text-base font-bold sm:text-lg',
                                                    isComplete || isActive
                                                        ? 'text-primary-dark'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {t(`house.life_stages.${stageId}`)}
                                            </h3>
                                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                                {t(`houseExperience.stage_story.${stageId}`)}
                                            </p>
                                        </div>
                                        {stageId === 'garden' && isComplete && (
                                            <Flower2
                                                className="hidden h-5 w-5 shrink-0 text-olive sm:block"
                                                aria-hidden
                                            />
                                        )}
                                    </div>

                                    {isActive && !isComplete && (
                                        <div className="mt-4 space-y-2">
                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
                                                <motion.div
                                                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                                    initial={{ width: 0 }}
                                                    whileInView={{
                                                        width: `${Math.max(stageProgress * 100, 8)}%`,
                                                    }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.9, ease: 'easeOut' }}
                                                />
                                            </div>
                                            <p
                                                className={cn(
                                                    'text-xs font-semibold text-primary/80',
                                                    ENGLISH_NUMERALS_CLASS,
                                                )}
                                                dir="ltr"
                                            >
                                                {t('houseExperience.stage_active', {
                                                    percent: formatNumber(
                                                        Math.round(stageProgress * 100),
                                                        locale,
                                                    ),
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    {isComplete && stageId !== 'complete' && (
                                        <p className="mt-3 text-xs font-semibold text-primary">
                                            {t('houseExperience.stage_done')}
                                        </p>
                                    )}

                                    {stageId === 'complete' && progress >= 100 && (
                                        <p className="mt-3 text-xs font-semibold text-accent">
                                            {t('house.impact.complete')}
                                        </p>
                                    )}
                                </div>
                            </motion.li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}

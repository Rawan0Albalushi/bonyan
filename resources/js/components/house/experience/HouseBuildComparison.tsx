import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HouseExperienceViewport } from '@/components/house/experience/HouseExperienceViewport';
import { HouseFinalImage } from '@/components/house/HouseFinalImage';
import { cn } from '@/lib/utils';

interface HouseBuildComparisonProps {
    progress: number;
    liveBuild?: boolean;
    className?: string;
}

export function HouseBuildComparison({ progress, liveBuild = false, className }: HouseBuildComparisonProps) {
    const { t } = useTranslation();
    const isComplete = progress >= 100;

    if (isComplete) {
        return (
            <HouseExperienceViewport
                progress={progress}
                showLabel
                liveBuild={liveBuild}
                className={className}
            />
        );
    }

    return (
        <div
            className={cn(
                'house-build-comparison grid w-full gap-5 sm:gap-6 md:grid-cols-2 md:gap-8 lg:gap-10',
                className,
            )}
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex min-w-0 flex-col gap-2 sm:gap-3"
            >
                <p className="text-center text-sm font-semibold text-foreground/75">
                    {t('houseExperience.current_build_label')}
                </p>
                <HouseExperienceViewport progress={progress} showLabel liveBuild={liveBuild} size="lg" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex min-w-0 flex-col gap-2 sm:gap-3"
            >
                <p className="flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-primary-dark">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-dark" aria-hidden />
                    {t('houseExperience.goal_preview_label')}
                </p>
                <div className="house-goal-preview house-goal-preview-panel relative overflow-hidden rounded-2xl ring-2 ring-accent/25 ring-offset-2 ring-offset-transparent sm:rounded-3xl">
                    <HouseFinalImage className="mx-auto w-full max-w-[48rem] sm:max-w-[56rem] lg:max-w-[68rem] xl:max-w-[820px]" />
                </div>
                <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {t('houseExperience.goal_preview_desc')}
                </p>
            </motion.div>
        </div>
    );
}

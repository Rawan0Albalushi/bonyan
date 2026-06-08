import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HouseLifeScene } from '@/components/house/HouseLifeScene';
import { cn } from '@/lib/utils';

interface HouseGoalPreviewProps {
    className?: string;
}

/** Compact completed-house preview — overlays the scene without resizing the live build. */
export function HouseGoalPreview({ className }: HouseGoalPreviewProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                'house-goal-preview pointer-events-none absolute z-40 overflow-hidden',
                'bottom-1.5 end-1.5 w-[min(28%,7.25rem)] max-w-[7.25rem]',
                'sm:bottom-4 sm:end-4 sm:w-[min(34%,12rem)] sm:max-w-[12rem]',
                'md:w-[min(30%,14.5rem)] md:max-w-[14.5rem]',
                'lg:w-[min(28%,16.5rem)] lg:max-w-[16.5rem]',
                'rounded-lg bg-surface/50 shadow-lg backdrop-blur-sm sm:rounded-2xl',
                className,
            )}
            aria-hidden
        >
            <p className="px-1.5 py-1 text-center text-[0.5625rem] font-semibold leading-tight text-accent sm:px-2.5 sm:py-2 sm:text-xs">
                {t('houseExperience.goal_preview_label')}
            </p>
            <div className="house-goal-preview-scene px-0.5 pb-0.5 sm:px-1.5 sm:pb-1.5">
                <HouseLifeScene fundingPercentage={100} size="sm" variant="experience" />
            </div>
        </motion.div>
    );
}

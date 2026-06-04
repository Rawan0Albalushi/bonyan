import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { HousePicture } from '@/components/house/HousePicture';
import { HousePartHighlight } from '@/components/house/HousePartHighlight';
import {
    getCelebrationHighlightPartId,
    getCelebrationStepTransition,
} from '@/components/house/houseCelebration';
import { getMaxPhaseIndexFromFunding } from '@/components/house/housePhases';
import { getHouseStepImageUrl } from '@/components/house/houseStepRender';
import { TOTAL_HOUSE_PARTS } from '@/components/house/housePhases';
import { cn } from '@/lib/utils';

const SIZE_HEIGHT: Record<string, string> = {
    sm: 'min-h-[15rem] max-h-[22rem] sm:max-h-[28rem]',
    md: 'min-h-[18rem] max-h-[30rem] sm:max-h-[38rem]',
    lg: 'min-h-[20rem] max-h-[36rem] sm:max-h-[44rem] lg:max-h-[52rem] xl:max-h-[58rem]',
    celebration: 'min-h-[22rem] max-h-[38rem] sm:max-h-[46rem] md:max-h-[52rem] lg:max-h-[62rem]',
};

const PHASE_SCENE_CLASS: Record<number, string> = {
    0: 'house-scene-phase-structure',
    1: 'house-scene-phase-landscape',
    2: 'house-scene-phase-interior',
};

export type CelebrationRevealPhase = 'waiting' | 'revealing' | 'highlighting' | 'done';

interface HouseCelebrationSceneProps {
    fundingBefore: number;
    fundingAfter: number;
    donationsCount: number;
    revealPhase: CelebrationRevealPhase;
    size?: 'sm' | 'md' | 'lg' | 'celebration';
}

export function HouseCelebrationScene({
    fundingBefore,
    fundingAfter,
    donationsCount,
    revealPhase,
    size = 'md',
}: HouseCelebrationSceneProps) {
    const { t } = useTranslation();
    const transition = useMemo(
        () => getCelebrationStepTransition(fundingBefore, fundingAfter),
        [fundingBefore, fundingAfter],
    );
    const highlightPartId = useMemo(
        () => getCelebrationHighlightPartId(fundingBefore, fundingAfter, donationsCount),
        [fundingBefore, fundingAfter, donationsCount],
    );

    const phaseIndex = getMaxPhaseIndexFromFunding(fundingAfter);
    const heightClass = SIZE_HEIGHT[size] ?? SIZE_HEIGHT.md;
    const isRevealing = revealPhase === 'revealing';
    const showHighlight = revealPhase === 'highlighting';
    const showAfter = revealPhase === 'highlighting' || revealPhase === 'done';

    const preloadSrc =
        transition.afterStep < TOTAL_HOUSE_PARTS
            ? getHouseStepImageUrl(transition.afterStep + 1)
            : null;

    return (
        <div
            className={cn(
                'house-scene house-scene-realistic house-scene-celebration relative w-full overflow-visible',
                PHASE_SCENE_CLASS[phaseIndex],
                heightClass,
            )}
            role="img"
            aria-label={t('house.viewer_label')}
        >
            <div className="house-scene-ambient" aria-hidden />
            <HousePicture
                src={showAfter ? transition.afterSrc : transition.beforeSrc}
                className="invisible block w-full h-auto max-h-full object-contain"
                eager
            />

            <div className="house-scene-stage absolute inset-0">
                <div className="house-scene-inner absolute inset-0">
                    <div className="house-ground-shadow" aria-hidden />

                    {!showAfter && (
                        <div className="house-scene-layer absolute inset-0">
                            <HousePicture src={transition.beforeSrc} eager />
                        </div>
                    )}

                    <AnimatePresence>
                        {isRevealing && transition.stepAdvanced && (
                            <motion.div
                                key={`reveal-${transition.afterStep}`}
                                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                                animate={{ opacity: 1, scale: [0.94, 1.02, 1], y: [10, -3, 0] }}
                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                className="house-scene-layer house-scene-step-reveal absolute inset-0 z-[5]"
                            >
                                <HousePicture src={transition.afterSrc} eager />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {showAfter && (
                        <div className="house-scene-layer absolute inset-0">
                            <HousePicture src={transition.afterSrc} eager />
                        </div>
                    )}

                    {showHighlight && highlightPartId && (
                        <HousePartHighlight partId={highlightPartId} revealing />
                    )}

                    {preloadSrc && <HousePicture src={preloadSrc} preload className="hidden" />}
                </div>
            </div>
        </div>
    );
}

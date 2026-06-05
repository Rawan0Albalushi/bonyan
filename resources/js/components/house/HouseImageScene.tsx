import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { HousePicture } from '@/components/house/HousePicture';
import { HousePartHighlight } from '@/components/house/HousePartHighlight';
import { getLayerOpacityForPart } from '@/components/house/houseBuildState';
import {
    getAdditiveHouseRender,
    getPartLayerSrc,
    isPartNewlyVisible,
} from '@/components/house/houseAdditiveRender';
import { getMaxPhaseIndexFromFunding } from '@/components/house/housePhases';
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

interface HouseImageSceneProps {
    fundingPercentage: number;
    previousFundingPercentage?: number;
    /** Only this part plays the entrance animation (success page). */
    animatePartId?: string | null;
    animatePartActive?: boolean;
    /** Opacity bump on a part already visible (same part, more progress). */
    boostPartId?: string | null;
    boostPartActive?: boolean;
    boostFromOpacity?: number;
    boostToOpacity?: number;
    highlightPartId?: string | null;
    showCompleteCelebration?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'celebration';
    variant?: 'default' | 'hero';
}

interface AdditiveLayerProps {
    src: string;
    opacity: number;
    popIn?: boolean;
    boostOpacity?: boolean;
    boostFrom?: number;
    boostTo?: number;
    eager?: boolean;
}

function AdditiveLayer({
    src,
    opacity,
    popIn = false,
    boostOpacity = false,
    boostFrom = 0,
    boostTo = 1,
    eager,
}: AdditiveLayerProps) {
    if (popIn) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                animate={{ opacity, scale: [0.88, 1.05, 1], y: [12, -4, 0] }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="house-scene-layer house-scene-part-layer house-scene-part-pop absolute inset-0 z-[6]"
            >
                <HousePicture src={src} eager={eager} />
            </motion.div>
        );
    }

    if (boostOpacity) {
        return (
            <motion.div
                initial={{ opacity: boostFrom, scale: 1 }}
                animate={{ opacity: boostTo, scale: [1, 1.03, 1] }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="house-scene-layer house-scene-part-layer house-scene-part-boost absolute inset-0 z-[6]"
            >
                <HousePicture src={src} eager={eager} />
            </motion.div>
        );
    }

    return (
        <div className="house-scene-layer house-scene-part-layer absolute inset-0" style={{ opacity }}>
            <HousePicture src={src} eager={eager} />
        </div>
    );
}

export function HouseImageScene({
    fundingPercentage,
    previousFundingPercentage,
    animatePartId = null,
    animatePartActive = false,
    boostPartId = null,
    boostPartActive = false,
    boostFromOpacity = 0,
    boostToOpacity = 1,
    highlightPartId = null,
    showCompleteCelebration = false,
    size = 'lg',
    variant = 'default',
}: HouseImageSceneProps) {
    const { t } = useTranslation();
    const prevFunding = previousFundingPercentage ?? fundingPercentage;

    const displayFunding =
        animatePartActive && animatePartId ? prevFunding : fundingPercentage;

    const render = useMemo(() => getAdditiveHouseRender(displayFunding), [displayFunding]);
    const phaseIndex = getMaxPhaseIndexFromFunding(fundingPercentage);

    const animatingPartOpacity = useMemo(() => {
        if (!animatePartId) {
            return 0;
        }
        return getLayerOpacityForPart(animatePartId, fundingPercentage);
    }, [animatePartId, fundingPercentage]);

    const heightClass =
        variant === 'hero'
            ? 'min-h-[26rem] max-h-[48rem] sm:max-h-[58rem] md:max-h-[64rem] lg:min-h-[34rem] lg:max-h-[min(88vh,880px)]'
            : SIZE_HEIGHT[size] ?? SIZE_HEIGHT.lg;

    const layoutSrc = render.complete ? render.fullSrc : render.baseSrc;
    const animatingSrc = animatePartId ? getPartLayerSrc(animatePartId) : null;

    return (
        <div
            className={cn(
                'house-scene house-scene-realistic relative w-full overflow-visible',
                PHASE_SCENE_CLASS[phaseIndex],
                showCompleteCelebration && 'house-scene-complete-celebration',
                heightClass,
            )}
            role="img"
            aria-label={t('house.viewer_label')}
        >
            <HousePicture
                src={layoutSrc}
                className="invisible block w-full h-auto max-h-full object-contain"
                eager
            />

            <div className="house-scene-stage absolute inset-0">
                <div className="house-scene-inner absolute inset-0">
                    <div className="house-ground-shadow" aria-hidden />

                    {render.complete ? (
                        <div className="house-scene-layer house-scene-complete absolute inset-0">
                            <HousePicture src={render.fullSrc} eager />
                        </div>
                    ) : (
                        <>
                            <div className="house-scene-layer house-scene-base absolute inset-0">
                                <HousePicture src={render.baseSrc} eager />
                            </div>

                            {render.partLayers
                                .filter(
                                    (layer) =>
                                        !(animatePartActive && layer.id === animatePartId) &&
                                        !(boostPartActive && layer.id === boostPartId),
                                )
                                .map((layer, index) => (
                                    <AdditiveLayer
                                        key={layer.id}
                                        src={layer.src}
                                        opacity={layer.opacity}
                                        eager={index >= render.partLayers.length - 2}
                                    />
                                ))}

                            {boostPartActive &&
                                boostPartId &&
                                getPartLayerSrc(boostPartId) && (
                                    <AdditiveLayer
                                        src={getPartLayerSrc(boostPartId)!}
                                        opacity={boostToOpacity}
                                        boostOpacity
                                        boostFrom={boostFromOpacity}
                                        boostTo={boostToOpacity}
                                        eager
                                    />
                                )}

                            {animatePartActive && animatingSrc && animatingPartOpacity > 0.01 && (
                                <AdditiveLayer
                                    src={animatingSrc}
                                    opacity={animatingPartOpacity}
                                    popIn
                                    eager
                                />
                            )}
                        </>
                    )}

                    {render.preloadPartSrc && (
                        <HousePicture src={render.preloadPartSrc} preload className="hidden" />
                    )}

                    {highlightPartId && (
                        <HousePartHighlight partId={highlightPartId} revealing />
                    )}

                    <AnimatePresence>
                        {showCompleteCelebration && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="house-complete-celebration pointer-events-none absolute inset-0 z-15"
                                aria-hidden
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

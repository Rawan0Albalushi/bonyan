import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HousePicture } from '@/components/house/HousePicture';
import {
    HOUSE_LIFE_BASE_IMAGE,
    HOUSE_LIFE_LAYERS,
    getLifeLayerOpacity,
    type HouseLifeLayerId,
} from '@/components/house/houseLifeProgress';
import { getPartLayerSrc } from '@/components/house/houseAdditiveRender';
import { HOUSE_FULL_IMAGE } from '@/components/house/houseImages';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { cn } from '@/lib/utils';

const SIZE_HEIGHT: Record<string, string> = {
    sm: 'min-h-[14rem] max-h-[22rem] sm:max-h-[26rem]',
    md: 'min-h-[16rem] max-h-[28rem] sm:max-h-[34rem]',
    lg: 'min-h-[18rem] max-h-[32rem] sm:max-h-[40rem] lg:max-h-[48rem]',
    celebration: 'min-h-[18rem] max-h-[34rem] sm:max-h-[42rem] lg:max-h-[50rem]',
};

interface LifeLayerStackProps {
    images: string[];
    opacity: number;
    animate: boolean;
    layerId: HouseLifeLayerId | 'complete';
}

function LifeLayerStack({ images, opacity, animate, layerId }: LifeLayerStackProps) {
    if (opacity <= 0.01) {
        return null;
    }

    const content = (
        <>
            {images.map((src, index) => (
                <HousePicture
                    key={src}
                    src={src}
                    eager={index === images.length - 1}
                    className="absolute inset-0"
                />
            ))}
        </>
    );

    if (!animate) {
        return (
            <div
                className="house-scene-layer house-life-layer absolute inset-0"
                style={{ opacity }}
                data-life-layer={layerId}
            >
                {content}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                'house-scene-layer house-life-layer house-life-layer-reveal absolute inset-0',
                layerId === 'lights' && 'house-life-layer-lights',
            )}
            data-life-layer={layerId}
        >
            {content}
        </motion.div>
    );
}

interface PartPopOverlayProps {
    partId: string;
    active: boolean;
}

/** Highlights the exact build piece affected by the latest donation. */
function PartPopOverlay({ partId, active }: PartPopOverlayProps) {
    const src = getPartLayerSrc(partId);
    if (!src || !active) {
        return null;
    }

    return (
        <motion.div
            key={partId}
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: [0.88, 1.05, 1], y: [10, -4, 0] }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="house-scene-layer house-scene-part-layer house-scene-part-pop pointer-events-none absolute inset-0 z-[8]"
            data-house-part={partId}
            aria-hidden
        >
            <HousePicture src={src} eager />
        </motion.div>
    );
}

interface HouseLifeSceneProps {
    fundingPercentage: number;
    animateLayerIds?: HouseLifeLayerId[];
    /** Part PNG pop-in on donation celebration (e.g. door, garden). */
    popPartId?: string | null;
    popPartActive?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'celebration';
    variant?: 'default' | 'hero';
    className?: string;
}

export function HouseLifeScene({
    fundingPercentage,
    animateLayerIds = [],
    popPartId = null,
    popPartActive = false,
    size = 'lg',
    variant = 'default',
    className,
}: HouseLifeSceneProps) {
    const { t } = useTranslation();
    const progress = clampPercentage(fundingPercentage);
    const isComplete = progress >= 100;
    const animateComplete = animateLayerIds.includes('complete');

    const heightClass =
        variant === 'hero'
            ? 'min-h-[22rem] max-h-[42rem] sm:max-h-[52rem] md:max-h-[58rem] lg:min-h-[28rem] lg:max-h-[min(72vh,720px)]'
            : SIZE_HEIGHT[size] ?? SIZE_HEIGHT.lg;

    const layerStates = useMemo(
        () =>
            HOUSE_LIFE_LAYERS.map((layer) => ({
                layer,
                opacity: getLifeLayerOpacity(layer, progress),
            })),
        [progress],
    );

    return (
        <div
            className={cn(
                'house-scene house-scene-realistic house-scene-life relative w-full overflow-visible',
                isComplete && 'house-scene-life-complete',
                heightClass,
                className,
            )}
            role="img"
            aria-label={t('house.viewer_label')}
        >
            <div className="house-scene-ambient" aria-hidden />

            <HousePicture
                src={HOUSE_LIFE_BASE_IMAGE}
                className="invisible block w-full h-auto max-h-full object-contain"
                eager
            />

            <div className="house-scene-stage absolute inset-0">
                <div className="house-scene-inner absolute inset-0">
                    <div className="house-ground-shadow" aria-hidden />

                    {isComplete ? (
                        <LifeLayerStack
                            layerId="complete"
                            images={[HOUSE_FULL_IMAGE]}
                            opacity={1}
                            animate={animateComplete}
                        />
                    ) : (
                        <>
                            <div className="house-scene-layer house-life-base absolute inset-0">
                                <HousePicture src={HOUSE_LIFE_BASE_IMAGE} eager />
                            </div>

                            {layerStates.map(({ layer, opacity }) => (
                                <LifeLayerStack
                                    key={layer.id}
                                    layerId={layer.id}
                                    images={layer.images}
                                    opacity={opacity}
                                    animate={animateLayerIds.includes(layer.id)}
                                />
                            ))}

                            <PartPopOverlay
                                partId={popPartId ?? ''}
                                active={Boolean(popPartId && popPartActive)}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

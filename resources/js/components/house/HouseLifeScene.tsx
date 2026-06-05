import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HousePicture } from '@/components/house/HousePicture';
import {
    HOUSE_LIFE_BASE_IMAGE,
    getLifeStepImage,
    getLifeStepRender,
    type HouseLifeLayerId,
} from '@/components/house/houseLifeProgress';
import { HOUSE_FULL_IMAGE } from '@/components/house/houseImages';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { cn } from '@/lib/utils';

const SIZE_HEIGHT: Record<string, string> = {
    sm: 'min-h-[14rem] max-h-[22rem] sm:max-h-[26rem]',
    md: 'min-h-[16rem] max-h-[28rem] sm:max-h-[34rem]',
    lg: 'min-h-[18rem] max-h-[32rem] sm:max-h-[40rem] lg:max-h-[48rem]',
    celebration: 'min-h-[18rem] max-h-[34rem] sm:max-h-[42rem] lg:max-h-[50rem]',
};

interface LifeStepFrameProps {
    step: number;
    opacity?: number;
    animate: boolean;
    layerId?: HouseLifeLayerId | 'complete' | 'step';
}

function LifeStepFrame({ step, opacity = 1, animate, layerId = 'step' }: LifeStepFrameProps) {
    if (opacity <= 0.01) {
        return null;
    }

    const src = getLifeStepImage(step);
    const content = <HousePicture src={src} eager className="absolute inset-0" />;

    if (!animate) {
        return (
            <div
                className="house-scene-layer house-life-layer absolute inset-0"
                style={{ opacity }}
                data-life-layer={layerId}
                data-life-step={step}
            >
                {content}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="house-scene-layer house-life-layer house-life-layer-reveal absolute inset-0"
            data-life-layer={layerId}
            data-life-step={step}
        >
            {content}
        </motion.div>
    );
}

interface HouseLifeSceneProps {
    fundingPercentage: number;
    animateLayerIds?: HouseLifeLayerId[];
    size?: 'sm' | 'md' | 'lg' | 'celebration';
    variant?: 'default' | 'hero';
    className?: string;
}

export function HouseLifeScene({
    fundingPercentage,
    animateLayerIds = [],
    size = 'lg',
    variant = 'default',
    className,
}: HouseLifeSceneProps) {
    const { t } = useTranslation();
    const progress = clampPercentage(fundingPercentage);
    const isComplete = progress >= 100;
    const animateReveal = animateLayerIds.length > 0;

    const heightClass =
        variant === 'hero'
            ? 'min-h-[12rem] max-h-[22rem] sm:min-h-[18rem] sm:max-h-[42rem] md:max-h-[58rem] lg:min-h-[28rem] lg:max-h-[min(72vh,720px)] house-scene-hero-mobile'
            : SIZE_HEIGHT[size] ?? SIZE_HEIGHT.lg;

    const stepRender = useMemo(() => getLifeStepRender(progress), [progress]);
    const layoutSrc = HOUSE_LIFE_BASE_IMAGE;

    return (
        <div
            className={cn(
                'house-scene house-scene-realistic house-scene-life relative w-full max-w-full overflow-hidden',
                isComplete && 'house-scene-life-complete',
                heightClass,
                className,
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
                    <div className="house-scene-layer house-life-base absolute inset-0 z-0">
                        <HousePicture src={HOUSE_LIFE_BASE_IMAGE} eager />
                    </div>

                    {isComplete ? (
                        <div
                            className="absolute inset-0 z-[1]"
                            style={{ clipPath: 'inset(0 0 7% 0)' }}
                        >
                            {animateLayerIds.includes('complete') ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                                    className="house-scene-layer house-life-layer house-life-layer-reveal absolute inset-0"
                                    data-life-layer="complete"
                                >
                                    <HousePicture src={HOUSE_FULL_IMAGE} eager />
                                </motion.div>
                            ) : (
                                <div className="house-scene-layer house-life-layer absolute inset-0">
                                    <HousePicture src={HOUSE_FULL_IMAGE} eager />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="absolute inset-0 z-[1]"
                            style={{ clipPath: 'inset(0 0 7% 0)' }}
                        >
                            <LifeStepFrame
                                step={stepRender.currentStep}
                                animate={animateReveal}
                            />

                            {stepRender.nextStep != null && (
                                <LifeStepFrame
                                    step={stepRender.nextStep}
                                    opacity={stepRender.nextOpacity}
                                    animate={animateReveal}
                                />
                            )}
                        </div>
                    )}

                    {/* Stone platform — always on top in the lower band */}
                    <div
                        className="house-scene-layer house-life-base-front pointer-events-none absolute inset-0 z-[2]"
                        style={{ clipPath: 'inset(58% 0 0 0)' }}
                        aria-hidden
                    >
                        <HousePicture src={HOUSE_LIFE_BASE_IMAGE} eager />
                    </div>
                </div>
            </div>
        </div>
    );
}

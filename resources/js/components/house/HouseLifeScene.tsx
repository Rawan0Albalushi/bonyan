import { motion } from 'framer-motion';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HousePicture } from '@/components/house/HousePicture';
import {
    HOUSE_LIFE_BASE_IMAGE,
    getLifeStepImage,
    getLifeStepRender,
    type HouseLifeLayerId,
} from '@/components/house/houseLifeProgress';
import { HOUSE_FULL_IMAGE } from '@/components/house/houseImages';
import {
    HOUSE_SCENE_BUILD_ZONE_CLIP,
    HOUSE_SCENE_PLATFORM_CLIP,
} from '@/components/house/houseSceneLayout';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { cn } from '@/lib/utils';

const BUILD_ZONE_CLIP = HOUSE_SCENE_BUILD_ZONE_CLIP;
const PLATFORM_CLIP = HOUSE_SCENE_PLATFORM_CLIP;

const SIZE_HEIGHT: Record<string, string> = {
    sm: 'min-h-[14rem] max-h-[22rem] sm:max-h-[26rem]',
    md: 'min-h-[16rem] max-h-[28rem] sm:max-h-[34rem]',
    lg: 'min-h-[18rem] max-h-[32rem] sm:max-h-[40rem] lg:max-h-[48rem]',
    celebration: 'min-h-[18rem] max-h-[34rem] sm:max-h-[42rem] lg:max-h-[50rem]',
    immersive:
        'w-full max-h-[46rem] sm:max-h-[58rem] md:max-h-[68rem] lg:max-h-[min(88vh,980px)] xl:max-h-[min(92vh,1080px)]',
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

interface ExperienceStepStackProps {
    currentStep: number;
    nextStep: number | null;
    nextBlend: number;
}

/** Wipe reveal avoids ghosting from overlapping semi-transparent step PNGs. */
function ExperienceStepStack({ currentStep, nextStep, nextBlend }: ExperienceStepStackProps) {
    const revealPercent = Math.round((1 - nextBlend) * 100);

    return (
        <div className="absolute inset-0">
            <div className="house-scene-layer house-life-layer absolute inset-0">
                <HousePicture src={getLifeStepImage(currentStep)} eager className="absolute inset-0" />
            </div>

            {nextStep != null && nextBlend > 0.01 && (
                <motion.div
                    className="house-scene-layer house-life-layer absolute inset-0 overflow-hidden"
                    initial={false}
                    animate={{ clipPath: `inset(${revealPercent}% 0 0 0)` }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                    <HousePicture src={getLifeStepImage(nextStep)} eager className="absolute inset-0" />
                </motion.div>
            )}
        </div>
    );
}

interface HouseLifeSceneProps {
    fundingPercentage: number;
    animateLayerIds?: HouseLifeLayerId[];
    size?: 'sm' | 'md' | 'lg' | 'celebration' | 'immersive';
    variant?: 'default' | 'hero' | 'experience';
    className?: string;
    children?: ReactNode;
}

export function HouseLifeScene({
    fundingPercentage,
    animateLayerIds = [],
    size = 'lg',
    variant = 'default',
    className,
    children,
}: HouseLifeSceneProps) {
    const { t } = useTranslation();
    const progress = clampPercentage(fundingPercentage);
    const isComplete = progress >= 100;
    const animateReveal = animateLayerIds.length > 0;
    const isExperience = variant === 'experience';

    const heightClass =
        variant === 'hero'
            ? 'min-h-[12rem] max-h-[22rem] sm:min-h-[18rem] sm:max-h-[42rem] md:max-h-[58rem] lg:min-h-[28rem] lg:max-h-[min(72vh,720px)] house-scene-hero-mobile'
            : isExperience && size === 'immersive'
              ? 'house-scene-immersive-experience max-h-[46rem] sm:max-h-[58rem] md:max-h-[68rem] lg:max-h-[min(88vh,980px)] xl:max-h-[min(92vh,1080px)]'
              : SIZE_HEIGHT[size] ?? SIZE_HEIGHT.lg;

    const stepRender = useMemo(() => getLifeStepRender(progress), [progress]);
    const layoutSrc = HOUSE_LIFE_BASE_IMAGE;

    return (
        <div
            className={cn(
                'house-scene house-scene-realistic house-scene-life relative w-full max-w-full overflow-hidden',
                isComplete && 'house-scene-life-complete',
                isExperience && 'house-scene-experience',
                heightClass,
                className,
            )}
            role="img"
            aria-label={t('house.viewer_label')}
        >
            <HousePicture
                src={layoutSrc}
                className="invisible block h-auto w-full max-w-full"
                eager
            />

            <div className="house-scene-stage absolute inset-0">
                <div className="house-scene-inner absolute inset-0">
                    <div className="house-scene-layer house-life-base absolute inset-0 z-0">
                        <HousePicture src={HOUSE_LIFE_BASE_IMAGE} eager />
                    </div>

                    {isComplete ? (
                        <div className="absolute inset-0 z-[1]" style={{ clipPath: BUILD_ZONE_CLIP }}>
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
                        <div className="absolute inset-0 z-[1]" style={{ clipPath: BUILD_ZONE_CLIP }}>
                            {isExperience ? (
                                <div className="absolute inset-0 z-[1]">
                                    <ExperienceStepStack
                                        currentStep={stepRender.currentStep}
                                        nextStep={stepRender.nextStep}
                                        nextBlend={stepRender.nextOpacity}
                                    />
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    )}

                    {children}

                    <div
                        className="house-scene-layer house-life-base-front pointer-events-none absolute inset-0 z-[4]"
                        style={{ clipPath: PLATFORM_CLIP }}
                        aria-hidden
                    >
                        <HousePicture src={HOUSE_LIFE_BASE_IMAGE} eager />
                    </div>
                </div>
            </div>
        </div>
    );
}

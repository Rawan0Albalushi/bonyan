import { motion } from 'framer-motion';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HousePicture } from '@/components/house/HousePicture';
import {
    HOUSE_LIFE_BASE_IMAGE,
    HOUSE_LIFE_COMPLETE_IMAGE,
    getLifeBuildGhostClip,
    getLifeBuildRevealClip,
    type HouseLifeLayerId,
} from '@/components/house/houseLifeProgress';
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

interface HouseBuildRevealProps {
    progress: number;
    animateReveal: boolean;
    smoothClip: boolean;
}

/** Bottom-up clip on the final house artwork — progress maps 1:1 to visible height. */
function HouseBuildReveal({ progress, animateReveal, smoothClip }: HouseBuildRevealProps) {
    const revealClip = useMemo(() => getLifeBuildRevealClip(progress), [progress]);
    const ghostClip = useMemo(() => getLifeBuildGhostClip(progress), [progress]);
    const showGhost = progress > 0.5 && progress < 99.5;

    const builtLayer = (
        <div
            className="house-scene-layer house-life-layer house-life-built absolute inset-0 overflow-hidden"
            style={smoothClip ? undefined : { clipPath: revealClip }}
            data-life-layer="built"
        >
            {smoothClip ? (
                <motion.div
                    className="absolute inset-0"
                    initial={false}
                    animate={{ clipPath: revealClip }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                    <HousePicture src={HOUSE_LIFE_COMPLETE_IMAGE} eager className="absolute inset-0" />
                </motion.div>
            ) : (
                <HousePicture src={HOUSE_LIFE_COMPLETE_IMAGE} eager className="absolute inset-0" />
            )}
        </div>
    );

    const ghostLayer = showGhost ? (
        <div
            className="house-scene-layer house-life-ghost absolute inset-0 overflow-hidden"
            style={{ clipPath: ghostClip }}
            aria-hidden
        >
            <HousePicture src={HOUSE_LIFE_COMPLETE_IMAGE} eager className="absolute inset-0" />
        </div>
    ) : null;

    if (!animateReveal) {
        return (
            <div className="absolute inset-0">
                {ghostLayer}
                {builtLayer}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="house-life-layer-reveal absolute inset-0"
        >
            {ghostLayer}
            {builtLayer}
        </motion.div>
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
                        <div
                            className="house-scene-build-zone absolute inset-0 z-[3]"
                            style={{ clipPath: BUILD_ZONE_CLIP }}
                        >
                            {animateLayerIds.includes('complete') ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                                    className="house-scene-layer house-life-layer house-life-layer-reveal absolute inset-0"
                                    data-life-layer="complete"
                                >
                                    <HousePicture src={HOUSE_LIFE_COMPLETE_IMAGE} eager />
                                </motion.div>
                            ) : (
                                <div className="house-scene-layer house-life-layer absolute inset-0">
                                    <HousePicture src={HOUSE_LIFE_COMPLETE_IMAGE} eager />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="house-scene-build-zone absolute inset-0 z-[3]"
                            style={{ clipPath: BUILD_ZONE_CLIP }}
                        >
                            <HouseBuildReveal
                                progress={progress}
                                animateReveal={animateReveal}
                                smoothClip={isExperience}
                            />
                        </div>
                    )}

                    {children}

                    <div
                        className="house-scene-layer house-life-base-front pointer-events-none absolute inset-0 z-[2]"
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

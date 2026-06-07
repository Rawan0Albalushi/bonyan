import { motion } from 'framer-motion';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { HouseDonationToast } from '@/components/house/HouseDonationToast';
import { HouseLifeScene } from '@/components/house/HouseLifeScene';
import { getLayersToAnimate } from '@/components/house/houseLifeProgress';
import {
    clampPercentage,
    getFundingProgressPercentage,
} from '@/components/house/houseProgressVisual';
import { useAnimatedFunding } from '@/components/house/useAnimatedFunding';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

interface HouseProgressProps {
    percentage: number;
    celebrateFromPercentage?: number | null;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'celebration' | 'immersive';
    showLabel?: boolean;
    animated?: boolean;
    variant?: 'default' | 'hero' | 'experience';
    /** Success page: animate funding climb + layer reveal + toast. */
    inlineCelebration?: boolean;
    /** Experience page: animate build progress on entry. */
    liveBuild?: boolean;
    children?: ReactNode;
}

const TOAST_DELAY_MS = 700;
const TOAST_VISIBLE_MS = 4200;
const FUNDING_ANIMATION_MS = 2600;
const LIVE_BUILD_ANIMATION_MS = 3400;

export function HouseProgress({
    percentage,
    celebrateFromPercentage = null,
    className,
    size = 'lg',
    showLabel = true,
    animated = true,
    variant = 'default',
    inlineCelebration = false,
    liveBuild = false,
    children,
}: HouseProgressProps) {
    const { locale } = useLocale();
    const [liveBuildActive, setLiveBuildActive] = useState(liveBuild);

    const fundingTarget = getFundingProgressPercentage(percentage);
    const previousFunding =
        celebrateFromPercentage != null
            ? getFundingProgressPercentage(celebrateFromPercentage)
            : fundingTarget;

    const liveBuildFrom = useMemo(
        () => Math.max(0, fundingTarget - Math.min(8, Math.max(3, fundingTarget * 0.12))),
        [fundingTarget],
    );

    const isCelebration =
        inlineCelebration &&
        celebrateFromPercentage != null &&
        previousFunding < fundingTarget - 0.0001;

    const animationFrom = isCelebration
        ? previousFunding
        : liveBuildActive
          ? liveBuildFrom
          : fundingTarget;

    const animationActive = isCelebration || liveBuildActive;

    const displayFunding = useAnimatedFunding(
        animationFrom,
        fundingTarget,
        animationActive,
        isCelebration ? FUNDING_ANIMATION_MS : LIVE_BUILD_ANIMATION_MS,
    );

    useEffect(() => {
        if (!liveBuild || isCelebration) {
            setLiveBuildActive(false);
            return;
        }

        setLiveBuildActive(true);
        const timer = window.setTimeout(() => setLiveBuildActive(false), LIVE_BUILD_ANIMATION_MS + 120);
        return () => window.clearTimeout(timer);
    }, [liveBuild, isCelebration, fundingTarget]);

    const animateLayerIds = useMemo(
        () =>
            isCelebration
                ? getLayersToAnimate(previousFunding, displayFunding)
                : [],
        [isCelebration, previousFunding, displayFunding],
    );

    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (!isCelebration) {
            setShowToast(false);
            return;
        }

        const showTimer = window.setTimeout(() => setShowToast(true), TOAST_DELAY_MS);
        const hideTimer = window.setTimeout(
            () => setShowToast(false),
            TOAST_DELAY_MS + TOAST_VISIBLE_MS,
        );

        return () => {
            window.clearTimeout(showTimer);
            window.clearTimeout(hideTimer);
        };
    }, [isCelebration, fundingTarget, previousFunding]);

    const labelPercent = isCelebration || liveBuildActive ? displayFunding : fundingTarget;

    const sizeClasses = {
        sm: 'w-full max-w-[28rem]',
        md: 'w-full max-w-[42rem] sm:max-w-[48rem]',
        lg: 'w-full max-w-[48rem] sm:max-w-[56rem] lg:max-w-[68rem] xl:max-w-[820px]',
        celebration: 'w-full max-w-[50rem] sm:max-w-[60rem] md:max-w-[70rem] lg:max-w-[84rem]',
        immersive:
            'w-full max-w-[min(100%,68rem)] sm:max-w-[min(100%,84rem)] md:max-w-[min(100%,98rem)] lg:max-w-[min(100%,112rem)] xl:max-w-[min(100%,120rem)]',
    };

    const heroSizeClass = variant === 'hero' ? 'w-full max-w-none lg:max-w-full' : '';
    const Wrapper = animated ? motion.div : 'div';
    const wrapperProps = animated
        ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }
        : {};

    return (
        <div
            className={cn(
                'flex w-full flex-col items-center',
                variant === 'hero' || variant === 'experience' ? 'gap-0' : 'gap-3',
                className,
            )}
        >
            <Wrapper
                {...wrapperProps}
                className={cn('relative w-full', heroSizeClass || sizeClasses[size])}
            >
                {showLabel && (
                    <div className="absolute end-0 top-0 z-30">
                        <span
                            dir="ltr"
                            className={cn(
                                'rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary backdrop-blur-sm',
                                ENGLISH_NUMERALS_CLASS,
                                (isCelebration || liveBuildActive) && 'ring-2 ring-primary/25',
                            )}
                        >
                            {formatNumber(clampPercentage(labelPercent), locale)}%
                        </span>
                    </div>
                )}

                <HouseLifeScene
                    fundingPercentage={displayFunding}
                    animateLayerIds={animateLayerIds}
                    size={size}
                    variant={variant}
                >
                    {children}
                </HouseLifeScene>
            </Wrapper>

            {isCelebration && (
                <HouseDonationToast visible={showToast} messageKey="house.impact.simple" />
            )}
        </div>
    );
}

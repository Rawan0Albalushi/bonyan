import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { HouseDonationToast } from '@/components/house/HouseDonationToast';
import { HouseLifeScene } from '@/components/house/HouseLifeScene';
import { getDonationImpact } from '@/components/house/donationImpact';
import { shouldPopDonationPart } from '@/components/house/houseBuildState';
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
    size?: 'sm' | 'md' | 'lg' | 'celebration';
    showLabel?: boolean;
    animated?: boolean;
    variant?: 'default' | 'hero';
    /** Success page: animate funding climb + part pop + toast. */
    inlineCelebration?: boolean;
    donationAmount?: number;
    goalAmount?: number;
    donationsCount?: number;
}

const TOAST_DELAY_MS = 700;
const TOAST_VISIBLE_MS = 4200;
const POP_ACTIVE_MS = 2400;
const FUNDING_ANIMATION_MS = 2600;

export function HouseProgress({
    percentage,
    celebrateFromPercentage = null,
    className,
    size = 'lg',
    showLabel = true,
    animated = true,
    variant = 'default',
    inlineCelebration = false,
    donationAmount,
    goalAmount,
    donationsCount,
}: HouseProgressProps) {
    const { locale } = useLocale();

    const fundingTarget = getFundingProgressPercentage(percentage);
    const previousFunding =
        celebrateFromPercentage != null
            ? getFundingProgressPercentage(celebrateFromPercentage)
            : fundingTarget;

    const isCelebration =
        inlineCelebration &&
        celebrateFromPercentage != null &&
        previousFunding < fundingTarget - 0.0001;

    const displayFunding = useAnimatedFunding(
        previousFunding,
        fundingTarget,
        isCelebration,
        FUNDING_ANIMATION_MS,
    );

    const impact = useMemo(
        () =>
            isCelebration
                ? getDonationImpact(previousFunding, fundingTarget, {
                      donationAmount,
                      goalAmount,
                      donationsCount,
                  })
                : null,
        [
            isCelebration,
            previousFunding,
            fundingTarget,
            donationAmount,
            goalAmount,
            donationsCount,
        ],
    );

    const animateLayerIds = useMemo(
        () =>
            isCelebration
                ? getLayersToAnimate(previousFunding, displayFunding)
                : [],
        [isCelebration, previousFunding, displayFunding],
    );

    const popPartId = useMemo(() => {
        if (!isCelebration || !impact || impact.partId.startsWith('bonus-')) {
            return null;
        }
        if (impact.size === 'brick' && impact.brickCount > 0 && !impact.isNewFullLayer) {
            return null;
        }
        if (fundingTarget >= 100 && impact.size === 'complete') {
            return null;
        }
        if (
            shouldPopDonationPart(impact.partId, previousFunding, fundingTarget) ||
            impact.size === 'stage' ||
            impact.size === 'phase' ||
            impact.size === 'complete'
        ) {
            return impact.partId;
        }
        return null;
    }, [isCelebration, impact, previousFunding, fundingTarget]);

    const [popPartActive, setPopPartActive] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (!isCelebration) {
            setPopPartActive(false);
            setShowToast(false);
            return;
        }

        setPopPartActive(Boolean(popPartId));

        const popOff = popPartId
            ? window.setTimeout(() => setPopPartActive(false), POP_ACTIVE_MS)
            : undefined;

        const showTimer = window.setTimeout(() => setShowToast(true), TOAST_DELAY_MS);
        const hideTimer = window.setTimeout(
            () => setShowToast(false),
            TOAST_DELAY_MS + TOAST_VISIBLE_MS,
        );

        return () => {
            if (popOff) window.clearTimeout(popOff);
            window.clearTimeout(showTimer);
            window.clearTimeout(hideTimer);
        };
    }, [isCelebration, popPartId, fundingTarget, previousFunding]);

    const labelPercent = isCelebration ? displayFunding : fundingTarget;

    const sizeClasses = {
        sm: 'w-full max-w-[28rem]',
        md: 'w-full max-w-[42rem] sm:max-w-[48rem]',
        lg: 'w-full max-w-[48rem] sm:max-w-[56rem] lg:max-w-[68rem] xl:max-w-[820px]',
        celebration: 'w-full max-w-[50rem] sm:max-w-[60rem] md:max-w-[70rem] lg:max-w-[84rem]',
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
                variant === 'hero' ? 'gap-0' : 'gap-3',
                className,
            )}
        >
            <Wrapper
                {...wrapperProps}
                className={cn('relative w-full', heroSizeClass || sizeClasses[size])}
            >
                {showLabel && (
                    <div className="absolute end-0 top-0 z-10">
                        <span
                            dir="ltr"
                            className={cn(
                                'rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary backdrop-blur-sm',
                                ENGLISH_NUMERALS_CLASS,
                                isCelebration && 'ring-2 ring-primary/25',
                            )}
                        >
                            {formatNumber(clampPercentage(labelPercent), locale)}%
                        </span>
                    </div>
                )}

                <HouseLifeScene
                    fundingPercentage={displayFunding}
                    animateLayerIds={animateLayerIds}
                    popPartId={popPartId}
                    popPartActive={popPartActive}
                    size={size}
                    variant={variant}
                />

            </Wrapper>

            {isCelebration && (
                <HouseDonationToast
                    visible={showToast}
                    messageKey="house.impact.simple"
                />
            )}
        </div>
    );
}

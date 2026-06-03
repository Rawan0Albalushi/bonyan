import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { HouseScene } from '@/components/house/HouseScene';
import { getHighlightIdForDonation, getPartById, getPartUnlockedByDonation } from '@/components/house/houseParts';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

interface HouseProgressProps {
    percentage: number;
    donationsCount?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    animated?: boolean;
    /** Enables 3D orbit / part picking on the canvas */
    interactive?: boolean;
    /** Part unlocked by the latest donation (success page) */
    celebratePartId?: string | null;
    celebrateDonationNumber?: number;
}

export function HouseProgress({
    percentage,
    donationsCount = 0,
    className,
    size = 'lg',
    showLabel = true,
    animated = true,
    interactive = true,
    celebratePartId = null,
    celebrateDonationNumber,
}: HouseProgressProps) {
    const { locale } = useLocale();
    const clamped = Math.min(100, Math.max(0, percentage));
    const count = Math.max(0, donationsCount);

    const highlightedPartId =
        celebrateDonationNumber != null
            ? getHighlightIdForDonation(celebrateDonationNumber)
            : celebratePartId;

    const celebratedPart = useMemo(() => {
        if (celebratePartId) {
            return getPartById(celebratePartId);
        }
        if (celebrateDonationNumber) {
            return getPartUnlockedByDonation(celebrateDonationNumber);
        }
        return null;
    }, [celebratePartId, celebrateDonationNumber]);

    const sizeClasses = {
        sm: 'w-full max-w-[9rem]',
        md: 'w-full max-w-[13rem]',
        lg: 'w-full max-w-[17rem] md:max-w-[20rem] lg:max-w-[24rem]',
    };

    const Wrapper = animated ? motion.div : 'div';
    const wrapperProps = animated
        ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } }
        : {};

    return (
        <div className={cn('flex w-full flex-col items-center', className)}>
            <Wrapper {...wrapperProps} className={cn('relative w-full', sizeClasses[size])}>
                <div className="relative aspect-[28/30] w-full min-h-[12rem]">
                    <div className="h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-secondary/40 to-background shadow-lg ring-1 ring-border/50">
                        <HouseScene
                            donationsCount={count}
                            highlightedPartId={highlightedPartId}
                            interactive={interactive}
                        />
                    </div>

                    {celebratedPart && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.4, 1] }}
                            transition={{ duration: 1.8, repeat: 2 }}
                            className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-accent/60"
                        />
                    )}
                </div>

                {showLabel && (
                    <div
                        dir="ltr"
                        className={cn(
                            'absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-md',
                            ENGLISH_NUMERALS_CLASS,
                        )}
                    >
                        {formatNumber(clamped, locale)}%
                    </div>
                )}
            </Wrapper>
        </div>
    );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hammer, Sparkles } from 'lucide-react';
import { HouseImageScene } from '@/components/house/HouseImageScene';
import {
    getHighlightIdForDonation,
    getPartById,
    getPartUnlockedByDonation,
} from '@/components/house/houseParts';
import { getPreviousPercentageForCelebration } from '@/components/house/houseProgressVisual';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';

interface HouseProgressProps {
    percentage: number;
    donationsCount?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'celebration';
    showLabel?: boolean;
    animated?: boolean;
    interactive?: boolean;
    celebratePartId?: string | null;
    celebrateDonationNumber?: number;
    variant?: 'default' | 'hero';
    showPartSummary?: boolean;
}

export function HouseProgress({
    percentage,
    className,
    size = 'lg',
    showLabel = true,
    animated = true,
    celebratePartId = null,
    celebrateDonationNumber,
    variant = 'default',
    showPartSummary = true,
}: HouseProgressProps) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const clamped = Math.min(100, Math.max(0, percentage));

    const isCelebration = celebrateDonationNumber != null && celebrateDonationNumber > 0;
    const previousPercentage =
        isCelebration && celebrateDonationNumber != null
            ? getPreviousPercentageForCelebration(clamped, celebrateDonationNumber)
            : clamped;

    const [displayPercentage, setDisplayPercentage] = useState(isCelebration ? previousPercentage : clamped);
    const [revealPhase, setRevealPhase] = useState<'waiting' | 'building' | 'revealed'>(
        isCelebration ? 'waiting' : 'revealed',
    );

    useEffect(() => {
        if (!isCelebration) {
            setDisplayPercentage(clamped);
            setRevealPhase('revealed');
            return;
        }

        setDisplayPercentage(previousPercentage);
        setRevealPhase('waiting');

        const buildTimer = window.setTimeout(() => {
            setRevealPhase('building');
            setDisplayPercentage(clamped);
        }, 900);

        const revealTimer = window.setTimeout(() => {
            setRevealPhase('revealed');
        }, 2800);

        return () => {
            window.clearTimeout(buildTimer);
            window.clearTimeout(revealTimer);
        };
    }, [isCelebration, celebrateDonationNumber, clamped, previousPercentage]);

    useEffect(() => {
        if (!isCelebration) {
            setDisplayPercentage(clamped);
        }
    }, [isCelebration, clamped]);

    const highlightedDetailId =
        revealPhase === 'revealed' && celebrateDonationNumber != null
            ? getHighlightIdForDonation(celebrateDonationNumber)
            : celebratePartId;

    const revealDetailId =
        revealPhase === 'building' && celebrateDonationNumber != null
            ? getHighlightIdForDonation(celebrateDonationNumber)
            : null;

    const celebratedPart = useMemo(() => {
        if (celebratePartId) return getPartById(celebratePartId);
        if (celebrateDonationNumber) return getPartUnlockedByDonation(celebrateDonationNumber);
        return null;
    }, [celebratePartId, celebrateDonationNumber]);

    const effectiveSize = isCelebration ? 'celebration' : size;

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

    const showBuildingOverlay = isCelebration && (revealPhase === 'waiting' || revealPhase === 'building');

    return (
        <div className={cn('flex w-full flex-col items-center gap-4', className)}>
            <Wrapper {...wrapperProps} className={cn('relative w-full', heroSizeClass || sizeClasses[effectiveSize])}>
                {showLabel && (
                    <span
                        dir="ltr"
                        className={cn(
                            'absolute end-0 top-0 z-10 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary backdrop-blur-sm',
                            ENGLISH_NUMERALS_CLASS,
                        )}
                    >
                        {formatNumber(clamped, locale)}%
                    </span>
                )}

                <HouseImageScene
                    percentage={displayPercentage}
                    highlightDetailId={highlightedDetailId}
                    revealDetailId={revealDetailId}
                    size={effectiveSize}
                    variant={variant}
                />

                <AnimatePresence>
                    {showBuildingOverlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-4"
                        >
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                className="flex items-center gap-2.5 rounded-2xl border border-primary/15 bg-card/90 px-5 py-3 text-sm font-semibold text-primary shadow-brand backdrop-blur-md"
                            >
                                <Hammer className="h-4 w-4 text-accent" />
                                {t('success.building')}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {celebratedPart && revealPhase === 'revealed' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="pointer-events-none absolute bottom-0 start-0 end-0 z-10 flex items-center gap-2 rounded-xl border border-accent/30 bg-card/90 px-3 py-2 text-primary shadow-sm backdrop-blur-md"
                    >
                        <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                        <span className="text-xs font-medium leading-snug">{t('house.just_added')}</span>
                    </motion.div>
                )}
            </Wrapper>

            {showPartSummary && celebratedPart && revealPhase === 'revealed' && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="w-full max-w-lg overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-brand"
                >
                    <div className="bg-gradient-to-r from-primary/10 via-accent-light/20 to-transparent px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('success.you_built')}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold text-primary">
                            <span className="me-2">{celebratedPart.icon}</span>
                            {t(celebratedPart.labelKey)}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

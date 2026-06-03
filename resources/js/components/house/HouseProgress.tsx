import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hammer, Layers, Sparkles } from 'lucide-react';
import { HouseScene } from '@/components/house/HouseScene';
import {
    getHighlightIdForDonation,
    getPartById,
    getPartUnlockedByDonation,
} from '@/components/house/houseParts';
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
    donationsCount = 0,
    className,
    size = 'lg',
    showLabel = true,
    animated = true,
    interactive = true,
    celebratePartId = null,
    celebrateDonationNumber,
    variant = 'default',
    showPartSummary = true,
}: HouseProgressProps) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const clamped = Math.min(100, Math.max(0, percentage));
    const count = Math.max(0, donationsCount);

    const isCelebration = celebrateDonationNumber != null && celebrateDonationNumber > 0;
    const [displayCount, setDisplayCount] = useState(isCelebration ? Math.max(0, celebrateDonationNumber - 1) : count);
    const [revealPhase, setRevealPhase] = useState<'waiting' | 'building' | 'revealed'>(
        isCelebration ? 'waiting' : 'revealed',
    );

    useEffect(() => {
        if (!isCelebration) {
            setDisplayCount(count);
            setRevealPhase('revealed');
            return;
        }

        setDisplayCount(Math.max(0, celebrateDonationNumber - 1));
        setRevealPhase('waiting');

        const buildTimer = window.setTimeout(() => {
            setRevealPhase('building');
            setDisplayCount(celebrateDonationNumber);
        }, 900);

        const revealTimer = window.setTimeout(() => {
            setRevealPhase('revealed');
        }, 2800);

        return () => {
            window.clearTimeout(buildTimer);
            window.clearTimeout(revealTimer);
        };
    }, [isCelebration, celebrateDonationNumber, count]);

    const highlightedPartId =
        revealPhase === 'revealed' && celebrateDonationNumber != null
            ? getHighlightIdForDonation(celebrateDonationNumber)
            : celebratePartId;

    const revealPartId =
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
        sm: 'w-full max-w-[10rem]',
        md: 'w-full max-w-[15rem]',
        lg: 'w-full max-w-[20rem] md:max-w-[26rem] lg:max-w-[30rem]',
        celebration: 'w-full max-w-[24rem] sm:max-w-[30rem] md:max-w-[38rem] lg:max-w-[42rem]',
    };

    const aspectClasses = {
        sm: 'min-h-[11rem]',
        md: 'min-h-[14rem]',
        lg: 'min-h-[15rem] md:min-h-[18rem]',
        celebration: 'min-h-[19rem] sm:min-h-[22rem] md:min-h-[26rem] lg:min-h-[28rem]',
    };

    const Wrapper = animated ? motion.div : 'div';
    const wrapperProps = animated
        ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }
        : {};

    const showBuildingOverlay = isCelebration && (revealPhase === 'waiting' || revealPhase === 'building');

    return (
        <div className={cn('flex w-full flex-col items-center gap-4', className)}>
            <Wrapper {...wrapperProps} className={cn('relative w-full', sizeClasses[effectiveSize])}>
                <div
                    className={cn(
                        'house-viewport relative aspect-[4/5] w-full overflow-hidden',
                        aspectClasses[effectiveSize],
                        variant === 'hero' && 'house-viewport-hero',
                        isCelebration && 'house-viewport-celebration',
                    )}
                >
                    <div className="house-viewport-chrome pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                            <Layers className="h-3 w-3" />
                            {t('house.viewer_label')}
                        </span>
                        {showLabel && (
                            <span
                                dir="ltr"
                                className={cn(
                                    'rounded-md bg-black/35 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm',
                                    ENGLISH_NUMERALS_CLASS,
                                )}
                            >
                                {formatNumber(clamped, locale)}%
                            </span>
                        )}
                    </div>

                    <div className="absolute inset-0 h-full w-full">
                        <HouseScene
                            donationsCount={displayCount}
                            highlightedPartId={highlightedPartId}
                            revealPartId={revealPartId}
                            interactive={interactive && !isCelebration}
                            celebrateMode={isCelebration}
                        />
                    </div>

                    <AnimatePresence>
                        {showBuildingOverlay && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-[#0c2420]/70 via-[#0c2420]/20 to-transparent pb-8"
                            >
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                                >
                                    <Hammer className="h-4 w-4 text-accent-light" />
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
                            className="pointer-events-none absolute bottom-3 start-3 end-3 z-10 flex items-center gap-2 rounded-xl border border-accent/40 bg-black/50 px-3 py-2 text-white backdrop-blur-md"
                        >
                            <Sparkles className="h-4 w-4 shrink-0 text-accent-light" />
                            <span className="text-xs font-medium leading-snug">{t('house.just_added')}</span>
                        </motion.div>
                    )}
                </div>
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

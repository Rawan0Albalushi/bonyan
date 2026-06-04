import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Hammer, Sparkles, PartyPopper } from 'lucide-react';
import type { DonationImpact } from '@/components/house/donationImpact';
import { cn } from '@/lib/utils';

interface HouseDonationImpactBannerProps {
    impact: DonationImpact | null;
    visible: boolean;
    building?: boolean;
    className?: string;
}

export function HouseDonationImpactBanner({
    impact,
    visible,
    building = false,
    className,
}: HouseDonationImpactBannerProps) {
    const { t } = useTranslation();

    const Icon =
        impact?.size === 'complete'
            ? PartyPopper
            : impact?.size === 'phase' || impact?.size === 'stage'
              ? Sparkles
              : Hammer;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={cn(
                        'pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 sm:pb-4',
                        className,
                    )}
                >
                    <motion.div
                        animate={building ? { y: [0, -3, 0] } : undefined}
                        transition={building ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
                        className={cn(
                            'max-w-md rounded-2xl border px-4 py-3 text-center shadow-brand backdrop-blur-md',
                            impact?.size === 'complete' || impact?.size === 'phase'
                                ? 'border-accent/40 bg-gradient-to-r from-accent/15 via-card/95 to-primary/10'
                                : 'border-primary/20 bg-card/92',
                        )}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Icon
                                className={cn(
                                    'h-4 w-4 shrink-0',
                                    impact?.size === 'complete' ? 'text-accent' : 'text-primary',
                                )}
                            />
                            <p className="text-sm font-bold leading-snug text-primary">
                                {building
                                    ? t('success.building')
                                    : impact
                                      ? t(impact.messageKey, {
                                            ...impact.messageParams,
                                            part: t(impact.partLabelKey),
                                            defaultValue: t('house.impact.brick'),
                                        })
                                      : t('success.building')}
                            </p>
                        </div>
                        {impact && !building && impact.size !== 'brick' && (
                            <p className="mt-1 text-xs font-medium text-muted-foreground">
                                {t(impact.partLabelKey)}
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

import { motion, AnimatePresence } from 'framer-motion';
import { HousePartHighlight } from '@/components/house/HousePartHighlight';
import { HouseBrickBurst } from '@/components/house/HouseBrickBurst';
import type { DonationImpact } from '@/components/house/donationImpact';

interface HouseDonationImpactOverlayProps {
    impact: DonationImpact | null;
    active: boolean;
}

/** Glow, bricks, and highlight — the part layer itself is composited in the house stack. */
export function HouseDonationImpactOverlay({ impact, active }: HouseDonationImpactOverlayProps) {
    if (!impact || !active) {
        return null;
    }

    const showBricks = impact.size === 'brick' || (impact.size === 'detail' && impact.brickCount > 0);
    const isMilestone = impact.size === 'phase' || impact.size === 'complete';

    return (
        <AnimatePresence>
            <div className="pointer-events-none absolute inset-0 z-20">
                {isMilestone && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.55, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.6, ease: 'easeOut' }}
                        className="house-milestone-flash absolute inset-0 rounded-2xl"
                        aria-hidden
                    />
                )}

                {showBricks && <HouseBrickBurst partId={impact.partId} count={impact.brickCount} />}

                <HousePartHighlight partId={impact.partId} revealing className="z-30" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.85, 1.08, 0.95] }}
                    transition={{ duration: 1.4, repeat: 2, ease: 'easeInOut' }}
                    className="house-impact-pulse absolute inset-0"
                    aria-hidden
                />
            </div>
        </AnimatePresence>
    );
}

import { motion } from 'framer-motion';
import { getDetailById } from '@/components/house/houseDetails';
import { cn } from '@/lib/utils';

interface HousePartHighlightProps {
    partId: string;
    /** Stronger styling during the build/reveal animation. */
    revealing?: boolean;
    className?: string;
}

export function HousePartHighlight({ partId, revealing = false, className }: HousePartHighlightProps) {
    const detail = getDetailById(partId);

    if (!detail) {
        return null;
    }

    const pad = revealing ? 2 : 3;

    return (
        <div className={cn('pointer-events-none absolute inset-0 z-30', className)} aria-hidden>
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="house-part-highlight-ring absolute rounded-lg"
                style={{
                    left: `${detail.x - pad}%`,
                    top: `${detail.y - pad}%`,
                    width: `${detail.w + pad * 2}%`,
                    height: `${detail.h + pad * 2}%`,
                }}
            />
        </div>
    );
}

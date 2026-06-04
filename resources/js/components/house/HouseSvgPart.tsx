import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { getLayerOpacityForPart } from '@/components/house/houseBuildState';
import { HOUSE_SVG_PART_ANCHORS } from '@/components/house/houseSvgAnchors';
import { HOUSE_SVG_VIEWBOX } from '@/components/house/houseSvgPalette';
import { cn } from '@/lib/utils';

interface HouseSvgPartProps {
    partId: string;
    fundingPercentage: number;
    isRevealing?: boolean;
    isHighlighted?: boolean;
    children: ReactNode;
}

export function HouseSvgPart({
    partId,
    fundingPercentage,
    isRevealing = false,
    isHighlighted = false,
    children,
}: HouseSvgPartProps) {
    const opacity = getLayerOpacityForPart(partId, fundingPercentage);

    if (opacity <= 0.001) {
        return null;
    }

    const anchor = HOUSE_SVG_PART_ANCHORS[partId] ?? { x: 0.5, y: 0.5 };
    const originX = anchor.x * HOUSE_SVG_VIEWBOX.width;
    const originY = anchor.y * HOUSE_SVG_VIEWBOX.height;
    const scale = 0.88 + 0.12 * opacity;

    return (
        <motion.g
            id={`house-part-${partId}`}
            data-part-id={partId}
            initial={false}
            animate={{ opacity, scale }}
            transition={{
                duration: isRevealing ? 0.8 : 0.55,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: `${originX}px ${originY}px` }}
            className={cn(
                isRevealing && 'house-svg-part-reveal',
                isHighlighted && 'house-svg-part-highlight',
                opacity < 0.98 && 'house-svg-part-partial',
            )}
        >
            {children}
        </motion.g>
    );
}

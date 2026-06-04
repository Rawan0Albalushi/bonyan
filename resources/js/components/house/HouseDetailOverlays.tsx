import { cn } from '@/lib/utils';
import { getDetailOpacity } from '@/components/house/houseProgressVisual';
import { HOUSE_VISUAL_DETAILS, type HouseDetailKind, type HouseVisualDetail } from '@/components/house/houseDetails';

interface HouseDetailOverlaysProps {
    percentage: number;
    highlightDetailId?: string | null;
    revealDetailId?: string | null;
}

function DetailShape({
    detail,
    opacity,
    highlighted,
    revealing,
}: {
    detail: HouseVisualDetail;
    opacity: number;
    highlighted: boolean;
    revealing: boolean;
}) {
    if (opacity <= 0) {
        return null;
    }

    const baseStyle = {
        left: `${detail.x}%`,
        top: `${detail.y}%`,
        width: `${detail.w}%`,
        height: `${detail.h}%`,
        opacity,
    };

    const kindClass: Record<HouseDetailKind, string> = {
        'foundation-glow': 'house-detail-foundation',
        'wall-fill': 'house-detail-wall',
        'window-glow': 'house-detail-window',
        'door-light': 'house-detail-door',
        'roof-shingle': 'house-detail-roof',
        'chimney-smoke': 'house-detail-chimney',
        plant: 'house-detail-plant',
        walkway: 'house-detail-walkway',
        'warm-wash': 'house-detail-warm-wash',
        'heart-glow': 'house-detail-heart',
    };

    return (
        <div
            className={cn(
                'house-detail absolute transition-opacity duration-700 ease-out',
                kindClass[detail.kind],
                highlighted && 'house-detail-highlight',
                revealing && 'house-detail-reveal',
            )}
            style={baseStyle}
            aria-hidden
        />
    );
}

export function HouseDetailOverlays({
    percentage,
    highlightDetailId = null,
    revealDetailId = null,
}: HouseDetailOverlaysProps) {
    return (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
            {HOUSE_VISUAL_DETAILS.map((detail) => {
                const opacity = getDetailOpacity(percentage, detail.unlockAtPercent, detail.ramp ?? 3.5);

                return (
                    <DetailShape
                        key={detail.id}
                        detail={detail}
                        opacity={opacity}
                        highlighted={highlightDetailId === detail.id}
                        revealing={revealDetailId === detail.id}
                    />
                );
            })}
        </div>
    );
}

import { HOUSE_BUILD_PARTS } from '@/components/house/houseParts';
import { getPartUnlockPercent } from '@/components/house/houseProgressVisual';

export type HouseDetailKind =
    | 'foundation-glow'
    | 'wall-fill'
    | 'window-glow'
    | 'door-light'
    | 'roof-shingle'
    | 'chimney-smoke'
    | 'plant'
    | 'walkway'
    | 'warm-wash'
    | 'heart-glow';

export interface HouseVisualDetail {
    id: string;
    kind: HouseDetailKind;
    unlockAtPercent: number;
    /** Position & size as % of the house image (cutaway faces viewer on the right). */
    x: number;
    y: number;
    w: number;
    h: number;
    ramp?: number;
}

/** Highlight regions aligned to the realistic cutaway villa (house-full.png). */
const DETAIL_LAYOUT: Record<string, Omit<HouseVisualDetail, 'id' | 'unlockAtPercent'>> = {
    foundation: { kind: 'foundation-glow', x: 22, y: 91, w: 56, h: 7, ramp: 4 },
    'ground-walls': { kind: 'wall-fill', x: 24, y: 78, w: 52, h: 12, ramp: 4 },
    columns: { kind: 'wall-fill', x: 46, y: 70, w: 8, h: 20, ramp: 3 },
    'upper-walls': { kind: 'wall-fill', x: 24, y: 58, w: 52, h: 14, ramp: 4 },
    'roof-frame': { kind: 'roof-shingle', x: 18, y: 44, w: 64, h: 12, ramp: 4 },
    'roof-tiles': { kind: 'roof-shingle', x: 14, y: 32, w: 72, h: 14, ramp: 4 },
    'window-left': { kind: 'window-glow', x: 26, y: 80, w: 8, h: 10, ramp: 3 },
    'window-right': { kind: 'window-glow', x: 66, y: 80, w: 8, h: 10, ramp: 3 },
    door: { kind: 'door-light', x: 44, y: 79, w: 14, h: 12, ramp: 3 },
    balcony: { kind: 'wall-fill', x: 40, y: 62, w: 20, h: 8, ramp: 3 },
    chimney: { kind: 'chimney-smoke', x: 68, y: 28, w: 10, h: 14, ramp: 3 },
    facade: { kind: 'wall-fill', x: 28, y: 52, w: 44, h: 8, ramp: 3 },
    walkway: { kind: 'walkway', x: 40, y: 93, w: 22, h: 5, ramp: 3 },
    garden: { kind: 'plant', x: 6, y: 86, w: 16, h: 12, ramp: 3 },
    'olive-tree': { kind: 'plant', x: 82, y: 82, w: 12, h: 16, ramp: 3 },
    fence: { kind: 'wall-fill', x: 2, y: 76, w: 10, h: 16, ramp: 3 },
    lights: { kind: 'window-glow', x: 30, y: 64, w: 40, h: 22, ramp: 5 },
    heart: { kind: 'heart-glow', x: 46, y: 66, w: 8, h: 8, ramp: 3 },
};

export const HOUSE_VISUAL_DETAILS: HouseVisualDetail[] = HOUSE_BUILD_PARTS.map((part) => ({
    id: part.id,
    unlockAtPercent: getPartUnlockPercent(part.id),
    ...DETAIL_LAYOUT[part.id],
}));

export function getDetailById(id: string): HouseVisualDetail | undefined {
    return HOUSE_VISUAL_DETAILS.find((d) => d.id === id);
}

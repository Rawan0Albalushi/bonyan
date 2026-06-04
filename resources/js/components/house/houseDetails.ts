import { CORE_PART_COUNT, HOUSE_BUILD_PARTS } from '@/components/house/houseParts';
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
    /** Position & size as percentages of the house image box. */
    x: number;
    y: number;
    w: number;
    h: number;
    /** Optional extra ramp width for this detail. */
    ramp?: number;
}

const DETAIL_LAYOUT: Record<string, Omit<HouseVisualDetail, 'id' | 'unlockAtPercent'>> = {
    foundation: { kind: 'foundation-glow', x: 14, y: 86, w: 72, h: 10, ramp: 4 },
    'ground-walls': { kind: 'wall-fill', x: 16, y: 72, w: 68, h: 14, ramp: 4 },
    columns: { kind: 'wall-fill', x: 44, y: 68, w: 12, h: 18, ramp: 3 },
    'upper-walls': { kind: 'wall-fill', x: 16, y: 52, w: 68, h: 16, ramp: 4 },
    'roof-frame': { kind: 'roof-shingle', x: 12, y: 38, w: 76, h: 16, ramp: 4 },
    'roof-tiles': { kind: 'roof-shingle', x: 10, y: 28, w: 80, h: 14, ramp: 4 },
    'window-left': { kind: 'window-glow', x: 20, y: 74, w: 10, h: 12, ramp: 3 },
    'window-right': { kind: 'window-glow', x: 70, y: 74, w: 10, h: 12, ramp: 3 },
    door: { kind: 'door-light', x: 44, y: 76, w: 12, h: 14, ramp: 3 },
    balcony: { kind: 'wall-fill', x: 38, y: 58, w: 24, h: 6, ramp: 3 },
    chimney: { kind: 'chimney-smoke', x: 72, y: 24, w: 8, h: 12, ramp: 3 },
    facade: { kind: 'wall-fill', x: 16, y: 48, w: 68, h: 4, ramp: 3 },
    walkway: { kind: 'walkway', x: 38, y: 90, w: 24, h: 4, ramp: 3 },
    garden: { kind: 'plant', x: 8, y: 88, w: 14, h: 10, ramp: 3 },
    'olive-tree': { kind: 'plant', x: 78, y: 84, w: 14, h: 14, ramp: 3 },
    fence: { kind: 'wall-fill', x: 4, y: 80, w: 8, h: 12, ramp: 3 },
    lights: { kind: 'warm-wash', x: 0, y: 0, w: 100, h: 100, ramp: 5 },
    heart: { kind: 'heart-glow', x: 47, y: 56, w: 6, h: 6, ramp: 3 },
};

export const HOUSE_VISUAL_DETAILS: HouseVisualDetail[] = HOUSE_BUILD_PARTS.map((part) => ({
    id: part.id,
    unlockAtPercent: getPartUnlockPercent(part.id),
    ...DETAIL_LAYOUT[part.id],
}));

export const DETAIL_COUNT = HOUSE_VISUAL_DETAILS.length;

export function getDetailById(id: string): HouseVisualDetail | undefined {
    return HOUSE_VISUAL_DETAILS.find((d) => d.id === id);
}

/** Percentage delta per core donation — useful for celebration steps. */
export const PER_DONATION_PERCENT = 100 / CORE_PART_COUNT;

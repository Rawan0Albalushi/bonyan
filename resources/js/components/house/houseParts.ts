import {
    getVisiblePartIdsFromFunding,
    isPartVisibleAtFunding,
} from '@/components/house/houseBuildState';
import {
    getFundingUnlockPercentForPartId,
    HOUSE_CONSTRUCTION_PHASES,
    HOUSE_PHASE_PART_IDS,
} from '@/components/house/housePhases';

export interface HousePart {
    id: string;
    /** Funding % when this layer becomes fully visible. */
    unlockAtPercent: number;
    labelKey: string;
    icon: string;
    phaseId: 'structure' | 'landscape' | 'interior';
}

const PART_META: Record<string, { labelKey: string; icon: string }> = {
    foundation: { labelKey: 'house.parts.foundation', icon: '🧱' },
    'ground-walls': { labelKey: 'house.parts.ground_walls', icon: '🏗️' },
    columns: { labelKey: 'house.parts.columns', icon: '🏛️' },
    'upper-walls': { labelKey: 'house.parts.upper_walls', icon: '🧱' },
    'roof-frame': { labelKey: 'house.parts.roof_frame', icon: '🔨' },
    'roof-tiles': { labelKey: 'house.parts.roof_tiles', icon: '🏠' },
    'window-left': { labelKey: 'house.parts.window_left', icon: '🪟' },
    'window-right': { labelKey: 'house.parts.window_right', icon: '🪟' },
    door: { labelKey: 'house.parts.door', icon: '🚪' },
    balcony: { labelKey: 'house.parts.balcony', icon: '🏡' },
    chimney: { labelKey: 'house.parts.chimney', icon: '🏗️' },
    walkway: { labelKey: 'house.parts.walkway', icon: '🛤️' },
    garden: { labelKey: 'house.parts.garden', icon: '🌿' },
    'olive-tree': { labelKey: 'house.parts.olive_tree', icon: '🌳' },
    fence: { labelKey: 'house.parts.fence', icon: '🪵' },
    facade: { labelKey: 'house.parts.facade', icon: '✨' },
    lights: { labelKey: 'house.parts.lights', icon: '💡' },
    heart: { labelKey: 'house.parts.heart', icon: '💛' },
};

function buildPartsList(): HousePart[] {
    const parts: HousePart[] = [];
    for (const phase of HOUSE_CONSTRUCTION_PHASES) {
        for (const id of phase.partIds) {
            const meta = PART_META[id];
            if (!meta) {
                continue;
            }
            parts.push({
                id,
                unlockAtPercent: getFundingUnlockPercentForPartId(id),
                labelKey: meta.labelKey,
                icon: meta.icon,
                phaseId: phase.id,
            });
        }
    }
    return parts;
}

export const HOUSE_BUILD_PARTS: HousePart[] = buildPartsList();

export const BONUS_PARTS: HousePart[] = [
    { id: 'bonus-planter', unlockAtPercent: 100, labelKey: 'house.parts.bonus_planter', icon: '🪴', phaseId: 'interior' },
    { id: 'bonus-lantern', unlockAtPercent: 100, labelKey: 'house.parts.bonus_lantern', icon: '🏮', phaseId: 'interior' },
    { id: 'bonus-bird', unlockAtPercent: 100, labelKey: 'house.parts.bonus_bird', icon: '🐦', phaseId: 'interior' },
    { id: 'bonus-flag', unlockAtPercent: 100, labelKey: 'house.parts.bonus_flag', icon: '🎗️', phaseId: 'interior' },
    { id: 'bonus-bench', unlockAtPercent: 100, labelKey: 'house.parts.bonus_bench', icon: '🪑', phaseId: 'interior' },
    { id: 'bonus-flowers', unlockAtPercent: 100, labelKey: 'house.parts.bonus_flowers', icon: '🌸', phaseId: 'interior' },
];

export const CORE_PART_COUNT = HOUSE_BUILD_PARTS.length;

export function isPartUnlocked(partId: string, fundingPercent: number): boolean {
    if (HOUSE_PHASE_PART_IDS.includes(partId)) {
        return isPartVisibleAtFunding(partId, fundingPercent);
    }
    return fundingPercent >= 100;
}

export function getUnlockedPartIds(fundingPercent: number): string[] {
    return getVisiblePartIdsFromFunding(fundingPercent);
}

export function getPartById(id: string): HousePart | undefined {
    return HOUSE_BUILD_PARTS.find((p) => p.id === id) ?? BONUS_PARTS.find((p) => p.id === id);
}

export function getBonusPartForDonationIndex(donationsCount: number): HousePart | null {
    if (donationsCount <= CORE_PART_COUNT) {
        return null;
    }
    const bonusIndex = (donationsCount - CORE_PART_COUNT - 1) % BONUS_PARTS.length;
    return BONUS_PARTS[bonusIndex] ?? null;
}

export function countBonusDecorations(donationsCount: number): number {
    return Math.max(0, donationsCount - CORE_PART_COUNT);
}

export const PART_ANCHORS: Record<string, [number, number, number]> = {
    foundation: [0, 0.06, 0.2],
    'ground-walls': [0, 0.55, 0.35],
    columns: [0, 0.5, 0.95],
    'upper-walls': [0, 1.45, 0.2],
    'roof-frame': [0, 2.05, 0.15],
    'roof-tiles': [0, 2.12, 0.15],
    'window-left': [-0.95, 0.75, 1.02],
    'window-right': [0.95, 0.75, 1.02],
    door: [0, 0.55, 1.05],
    balcony: [0, 1.35, 1.08],
    chimney: [1.15, 1.5, 0.35],
    facade: [0, 0.85, 1.06],
    walkway: [0, 0.02, 1.55],
    garden: [-1.35, 0.08, 1.4],
    'olive-tree': [1.5, 0.6, 1.1],
    fence: [-1.75, 0.25, 0.9],
    lights: [0, 1.1, 1.05],
    heart: [0, 1.05, 1.08],
};

export function getNextPartToUnlock(fundingPercent: number): HousePart | null {
    const visible = new Set(getVisiblePartIdsFromFunding(fundingPercent));
    return HOUSE_BUILD_PARTS.find((p) => !visible.has(p.id)) ?? null;
}

export function getRecentUnlockChipIds(fundingPercent: number, limit = 6): string[] {
    return getVisiblePartIdsFromFunding(fundingPercent).slice(-limit);
}

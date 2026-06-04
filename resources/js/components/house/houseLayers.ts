import { HOUSE_BUILD_PARTS } from '@/components/house/houseParts';
import { clampPercentage, getPartUnlockPercent } from '@/components/house/houseProgressVisual';

const LAYERS_BASE = '/image/house/layers';
export const HOUSE_FULL_IMAGE = '/image/house/house-full.png';

export interface HouseConstructionLayer {
    id: string;
    image: string;
    /** Funding progress % (raised / goal) at which this layer appears. */
    unlockAtPercent: number;
    labelKey?: string;
}

export const HOUSE_BASE_LAYER: HouseConstructionLayer = {
    id: 'base',
    image: `${LAYERS_BASE}/base.png`,
    unlockAtPercent: 0,
};

export const HOUSE_PART_LAYERS: HouseConstructionLayer[] = HOUSE_BUILD_PARTS.map((part) => ({
    id: part.id,
    image: `${LAYERS_BASE}/${part.id}.png`,
    unlockAtPercent: getPartUnlockPercent(part.id),
    labelKey: part.labelKey,
}));

export const HOUSE_CONSTRUCTION_LAYERS: HouseConstructionLayer[] = [
    HOUSE_BASE_LAYER,
    ...HOUSE_PART_LAYERS,
];

export function isLayerVisible(fundingProgress: number, layer: HouseConstructionLayer): boolean {
    return clampPercentage(fundingProgress) >= layer.unlockAtPercent;
}

export function getVisibleLayers(fundingProgress: number): HouseConstructionLayer[] {
    return HOUSE_CONSTRUCTION_LAYERS.filter((layer) => isLayerVisible(fundingProgress, layer));
}

/** House is fully built when the funding goal is reached. */
export function isHouseComplete(fundingProgress: number): boolean {
    return clampPercentage(fundingProgress) >= 100;
}

/** Milestone labels aligned with construction phases. */
export const CONSTRUCTION_MILESTONES = [
    { percent: 0, labelKey: 'house.stages.foundation' },
    { percent: 10, labelKey: 'house.parts.foundation' },
    { percent: 20, labelKey: 'house.parts.columns' },
    { percent: 35, labelKey: 'house.stages.walls' },
    { percent: 50, labelKey: 'house.stages.rooms' },
    { percent: 65, labelKey: 'house.parts.facade' },
    { percent: 80, labelKey: 'house.stages.roof' },
    { percent: 90, labelKey: 'house.parts.lights' },
    { percent: 100, labelKey: 'house.stages.complete' },
] as const;

import { HOUSE_BUILD_PARTS } from '@/components/house/houseParts';
import { getBuildVisualStateFromFunding, getLayerOpacityForPart } from '@/components/house/houseBuildState';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { HOUSE_CONSTRUCTION_PHASES } from '@/components/house/housePhases';

import { HOUSE_FULL_IMAGE } from '@/components/house/houseImages';

const LAYERS_BASE = '/image/house/layers';

export interface HouseConstructionLayer {
    id: string;
    image: string;
    labelKey?: string;
}

export const HOUSE_BASE_LAYER: HouseConstructionLayer = {
    id: 'base',
    image: `${LAYERS_BASE}/base.png`,
};

export const HOUSE_PART_LAYERS: HouseConstructionLayer[] = HOUSE_BUILD_PARTS.map((part) => ({
    id: part.id,
    image: `${LAYERS_BASE}/${part.id}.png`,
    labelKey: part.labelKey,
}));

export const HOUSE_CONSTRUCTION_LAYERS: HouseConstructionLayer[] = [...HOUSE_PART_LAYERS];

export { getLayerOpacityForPart } from '@/components/house/houseBuildState';

export function isHouseComplete(fundingProgress: number): boolean {
    return clampPercentage(fundingProgress) >= 100;
}

export const CONSTRUCTION_MILESTONES = [
    { percent: 0, labelKey: 'house.stages.structure' },
    { percent: 10, labelKey: 'house.parts.foundation' },
    { percent: 25, labelKey: 'house.parts.columns' },
    { percent: 40, labelKey: 'house.parts.roof_tiles' },
    { percent: 50, labelKey: 'house.stages.landscape' },
    { percent: 65, labelKey: 'house.parts.garden' },
    { percent: 80, labelKey: 'house.stages.interior' },
    { percent: 90, labelKey: 'house.parts.lights' },
    { percent: 100, labelKey: 'house.stages.complete' },
] as const;

export { HOUSE_CONSTRUCTION_PHASES, getBuildVisualStateFromFunding };

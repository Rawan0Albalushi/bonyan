import { getBuildUnitsFromFunding } from '@/components/house/houseBuildState';
import { TOTAL_HOUSE_PARTS } from '@/components/house/housePhases';

const LAYERS_BASE = '/image/house/layers';

export interface HouseStepBlend {
    /** step-NN.png at floor(units) */
    lowerStep: number;
    /** step-NN.png at ceil(units) */
    upperStep: number;
    /** Crossfade 0–1 between lower and upper */
    blend: number;
}

export function getHouseStepBlend(fundingPercent: number): HouseStepBlend {
    const units = getBuildUnitsFromFunding(fundingPercent);
    const lowerStep = Math.floor(units);
    const upperStep = Math.min(TOTAL_HOUSE_PARTS, Math.ceil(units));
    const blend = upperStep === lowerStep ? 0 : units - lowerStep;

    return { lowerStep, upperStep, blend };
}

export function getHouseStepImageUrl(step: number): string {
    return `${LAYERS_BASE}/step-${String(step).padStart(2, '0')}.png`;
}

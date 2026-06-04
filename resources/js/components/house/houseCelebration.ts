import {
    getBuildUnitsFromFunding,
    getDonationAffectedPartId,
} from '@/components/house/houseBuildState';
import { HOUSE_CONSTRUCTION_PHASES, TOTAL_HOUSE_PARTS } from '@/components/house/housePhases';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { getHouseStepImageUrl } from '@/components/house/houseStepRender';
import { HOUSE_FULL_IMAGE } from '@/components/house/houseImages';

const ORDERED_PART_IDS = HOUSE_CONSTRUCTION_PHASES.flatMap((phase) => phase.partIds);

export interface CelebrationStepTransition {
    beforeStep: number;
    afterStep: number;
    /** True when the cumulative step image actually advances. */
    stepAdvanced: boolean;
    beforeSrc: string;
    afterSrc: string;
}

export function getCelebrationStepTransition(
    previousFunding: number,
    currentFunding: number,
): CelebrationStepTransition {
    const prev = clampPercentage(previousFunding);
    const cur = clampPercentage(currentFunding);

    if (cur >= 100) {
        return {
            beforeStep: TOTAL_HOUSE_PARTS,
            afterStep: TOTAL_HOUSE_PARTS,
            stepAdvanced: true,
            beforeSrc: getHouseStepImageUrl(TOTAL_HOUSE_PARTS),
            afterSrc: HOUSE_FULL_IMAGE,
        };
    }

    const unitsBefore = getBuildUnitsFromFunding(prev);
    const unitsAfter = getBuildUnitsFromFunding(cur);
    const beforeStep = Math.floor(unitsBefore);
    const afterStep = Math.min(TOTAL_HOUSE_PARTS, Math.ceil(unitsAfter));
    const stepAdvanced = afterStep > beforeStep;

    return {
        beforeStep,
        afterStep,
        stepAdvanced,
        beforeSrc: getHouseStepImageUrl(beforeStep),
        afterSrc: getHouseStepImageUrl(afterStep),
    };
}

/**
 * Which build part to ring-highlight — prefers the slot that advanced with this gift.
 */
export function getCelebrationHighlightPartId(
    previousFunding: number,
    currentFunding: number,
    donationsCountAfter: number,
): string {
    const unitsBefore = getBuildUnitsFromFunding(previousFunding);
    const unitsAfter = getBuildUnitsFromFunding(currentFunding);
    const fullBefore = Math.floor(unitsBefore);
    const fullAfter = Math.floor(unitsAfter);

    if (fullAfter > fullBefore) {
        return ORDERED_PART_IDS[Math.min(ORDERED_PART_IDS.length - 1, fullBefore)] ?? ORDERED_PART_IDS[0];
    }

    const fromDelta = getDonationAffectedPartId(previousFunding, currentFunding);
    if (fromDelta) {
        return fromDelta;
    }

    const slot = Math.min(ORDERED_PART_IDS.length - 1, fullAfter);
    if (ORDERED_PART_IDS[slot]) {
        return ORDERED_PART_IDS[slot];
    }

    const donationIndex = Math.min(
        ORDERED_PART_IDS.length - 1,
        Math.max(0, donationsCountAfter - 1),
    );
    return ORDERED_PART_IDS[donationIndex] ?? ORDERED_PART_IDS[0];
}

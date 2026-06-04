import { HOUSE_BUILD_PARTS, type HousePart } from '@/components/house/houseParts';
import {
    getFundingUnlockPercentForPartId,
    getMaxPhaseIndexFromFunding,
    getFundingProgressInPhase,
    HOUSE_CONSTRUCTION_PHASES,
    TOTAL_HOUSE_PARTS,
} from '@/components/house/housePhases';

function clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
}

export interface HouseBuildVisualState {
    /** Fully visible layers (opacity 1). */
    fullPartIds: string[];
    /** Layer currently being built (fractional progress). */
    partialPartId: string | null;
    /** 0–1 opacity for the partial layer. */
    partialOpacity: number;
    /** Part to highlight after a donation (full or partial). */
    activePartId: string | null;
}

/** Continuous build position across all parts (0 … TOTAL_HOUSE_PARTS). */
export function getBuildUnitsFromFunding(fundingPercent: number): number {
    const p = clampPercentage(fundingPercent);
    if (p <= 0) {
        return 0;
    }
    if (p >= 100) {
        return TOTAL_HOUSE_PARTS;
    }

    let units = 0;
    const maxPhase = getMaxPhaseIndexFromFunding(p);

    for (let phaseIndex = 0; phaseIndex <= maxPhase; phaseIndex++) {
        const phase = HOUSE_CONSTRUCTION_PHASES[phaseIndex];
        if (!phase) {
            continue;
        }
        const progress = getFundingProgressInPhase(phaseIndex, p);
        units += progress * phase.partIds.length;
    }

    return Math.min(TOTAL_HOUSE_PARTS, units);
}

export function getBuildVisualStateFromFunding(fundingPercent: number): HouseBuildVisualState {
    const units = getBuildUnitsFromFunding(fundingPercent);
    const fullCount = Math.floor(units);
    const fraction = units - fullCount;

    const orderedIds = HOUSE_CONSTRUCTION_PHASES.flatMap((phase) => phase.partIds);
    const fullPartIds = orderedIds.slice(0, fullCount);
    const partialPartId = fraction > 0.001 && fullCount < orderedIds.length ? orderedIds[fullCount] : null;
    const partialOpacity = partialPartId ? Math.max(0.2, Math.min(1, fraction)) : 0;
    const activePartId = partialPartId ?? fullPartIds[fullPartIds.length - 1] ?? null;

    return {
        fullPartIds,
        partialPartId,
        partialOpacity,
        activePartId,
    };
}

export function getVisiblePartIdsFromFunding(fundingPercent: number): string[] {
    const state = getBuildVisualStateFromFunding(fundingPercent);
    const ids = [...state.fullPartIds];
    if (state.partialPartId) {
        ids.push(state.partialPartId);
    }
    return ids;
}

export function getLayerOpacityForPart(partId: string, fundingPercent: number): number {
    const state = getBuildVisualStateFromFunding(fundingPercent);
    if (state.fullPartIds.includes(partId)) {
        return 1;
    }
    if (partId === state.partialPartId) {
        return state.partialOpacity;
    }
    return 0;
}

export function getPartById(id: string): HousePart | undefined {
    return HOUSE_BUILD_PARTS.find((p) => p.id === id);
}

export interface DonationContribution {
    part: HousePart;
    /** True when a new layer became fully visible. */
    isNewFullLayer: boolean;
    partialOpacity: number;
    fundingPercent: number;
}

const ORDERED_PART_IDS = HOUSE_CONSTRUCTION_PHASES.flatMap((phase) => phase.partIds);

/** Part this donation actually changed — skips layers already complete before the gift. */
export function getDonationAffectedPartId(
    previousFundingPercent: number,
    currentFundingPercent: number,
): string | null {
    const previous = clampPercentage(previousFundingPercent);
    const current = clampPercentage(currentFundingPercent);

    if (current <= previous + 0.0001) {
        return null;
    }

    for (const partId of ORDERED_PART_IDS) {
        const before = getLayerOpacityForPart(partId, previous);
        const after = getLayerOpacityForPart(partId, current);
        if (before < 0.05 && after > before + 0.001) {
            return partId;
        }
    }

    for (const partId of ORDERED_PART_IDS) {
        const before = getLayerOpacityForPart(partId, previous);
        const after = getLayerOpacityForPart(partId, current);
        if (before >= 0.05 && before < 0.98 && after >= 0.98) {
            return partId;
        }
    }

    let bestId: string | null = null;
    let bestDelta = 0;

    for (const partId of ORDERED_PART_IDS) {
        const before = getLayerOpacityForPart(partId, previous);
        if (before >= 0.98) {
            continue;
        }
        const after = getLayerOpacityForPart(partId, current);
        const delta = after - before;
        if (delta > bestDelta + 0.0001) {
            bestDelta = delta;
            bestId = partId;
        }
    }

    return bestId;
}

/** Pop-in animation only for a newly appeared or just-completed part. */
export function shouldPopDonationPart(
    partId: string,
    previousFundingPercent: number,
    currentFundingPercent: number,
): boolean {
    const before = getLayerOpacityForPart(partId, previousFundingPercent);
    const after = getLayerOpacityForPart(partId, currentFundingPercent);
    if (after - before < 0.001) {
        return false;
    }
    if (before < 0.05) {
        return true;
    }
    if (before < 0.98 && after >= 0.98) {
        return true;
    }
    return false;
}

/** Part whose visible opacity increased the most — unique highlight per donation. */
export function getPartIdWithLargestVisibilityGain(
    previousFundingPercent: number,
    currentFundingPercent: number,
): { partId: string; delta: number; isNewFullLayer: boolean } | null {
    const partId = getDonationAffectedPartId(previousFundingPercent, currentFundingPercent);
    if (!partId) {
        return null;
    }

    const previous = clampPercentage(previousFundingPercent);
    const current = clampPercentage(currentFundingPercent);
    const beforeOpacity = getLayerOpacityForPart(partId, previous);
    const afterOpacity = getLayerOpacityForPart(partId, current);
    const delta = afterOpacity - beforeOpacity;

    return {
        partId,
        delta,
        isNewFullLayer: beforeOpacity < 0.05 && afterOpacity >= 0.95,
    };
}

/** What this donation contributed — the part that changed, not an already-finished layer. */
export function getDonationContribution(
    previousFundingPercent: number,
    currentFundingPercent: number,
): DonationContribution | null {
    const partId = getDonationAffectedPartId(previousFundingPercent, currentFundingPercent);
    if (!partId) {
        return null;
    }

    const part = getPartById(partId);
    if (!part) {
        return null;
    }

    const previous = clampPercentage(previousFundingPercent);
    const current = clampPercentage(currentFundingPercent);
    const beforeOpacity = getLayerOpacityForPart(partId, previous);
    const afterOpacity = getLayerOpacityForPart(partId, current);
    const isNewFullLayer = beforeOpacity < 0.05 && afterOpacity >= 0.95;

    return {
        part,
        isNewFullLayer,
        partialOpacity: afterOpacity,
        fundingPercent: current,
    };
}

/** Build part whose funding threshold was crossed between two progress values. */
export function getPartNewlyUnlockedByFunding(
    previousPercent: number,
    currentPercent: number,
): HousePart | null {
    return getDonationContribution(previousPercent, currentPercent)?.part ?? null;
}

/** Highest part touched at this funding level. */
export function getPartActiveAtFunding(fundingPercent: number): HousePart | null {
    const activeId = getBuildVisualStateFromFunding(fundingPercent).activePartId;
    return activeId ? (getPartById(activeId) ?? null) : null;
}

export function isPartVisibleAtFunding(partId: string, fundingPercent: number): boolean {
    return getLayerOpacityForPart(partId, fundingPercent) > 0;
}

/** Part currently receiving fractional build progress. */
export function getActiveBuildPartId(fundingPercent: number): string | null {
    return getBuildVisualStateFromFunding(fundingPercent).activePartId;
}

export { getFundingUnlockPercentForPartId };

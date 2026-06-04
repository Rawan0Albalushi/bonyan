import { CORE_PART_COUNT, HOUSE_BUILD_PARTS, type HousePart } from '@/components/house/houseParts';
import type { HouseStage } from '@/components/house/houseStages';
import { getStageFromPercentage } from '@/components/house/houseStages';

export function clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
}

/** Smooth step for gentle transitions. */
export function smoothStep(t: number): number {
    const clamped = Math.min(1, Math.max(0, t));
    return clamped * clamped * (3 - 2 * clamped);
}

/** Crossfade opacities across the five milestone stage images. */
export function getStageBlendOpacities(percentage: number): Record<HouseStage, number> {
    const p = clampPercentage(percentage);
    const scaled = (p / 100) * 4;
    const lower = Math.floor(scaled) as HouseStage;
    const upper = Math.min(4, lower + 1) as HouseStage;
    const t = smoothStep(scaled - lower);

    const opacities: Record<HouseStage, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

    if (lower === upper) {
        opacities[lower] = 1;
    } else {
        opacities[lower] = 1 - t;
        opacities[upper] = t;
    }

    return opacities;
}

/** Clip inset (from top) for the colored layer — gray skeleton stays fully visible underneath. */
export function getColorRevealClip(percentage: number): number {
    const p = clampPercentage(percentage);
    if (p <= 0) {
        return 100;
    }
    if (p >= 100) {
        return 0;
    }
    return Math.max(0, 100 - p);
}

/** Warm interior glow intensity tied to overall progress. */
export function getWarmGlowOpacity(percentage: number): number {
    return smoothStep(clampPercentage(percentage) / 100) * 0.45;
}

/** Opacity for an incremental detail unlocked at a given percentage threshold. */
export function getDetailOpacity(
    percentage: number,
    unlockAtPercent: number,
    rampPercent = 3.5,
): number {
    const p = clampPercentage(percentage);
    if (p <= unlockAtPercent) {
        return 0;
    }
    return smoothStep((p - unlockAtPercent) / rampPercent);
}

/** Progress within the current 25% milestone segment (0–1). */
export function getSegmentProgress(percentage: number): number {
    const p = clampPercentage(percentage);
    const segmentIndex = Math.min(3, Math.floor(p / 25));
    const segmentStart = segmentIndex * 25;
    return smoothStep((p - segmentStart) / 25);
}

export function getUnlockPercentForDonation(donationNumber: number): number {
    if (donationNumber <= 0) {
        return 0;
    }
    return clampPercentage((donationNumber / CORE_PART_COUNT) * 100);
}

/** Funding progress toward goal (0–100) — drives house build visuals. */
export function getFundingProgressPercentage(progressPercentage: number): number {
    return clampPercentage(progressPercentage);
}

/** Progress before a donation increased raised_amount toward the goal. */
export function getFundingProgressBeforeDonation(
    goalAmount: number,
    raisedAmount: number,
    donationAmount: number,
): number {
    if (goalAmount <= 0) {
        return 0;
    }

    const raisedBefore = Math.max(0, raisedAmount - donationAmount);
    return clampPercentage(Math.round((raisedBefore / goalAmount) * 10000) / 100);
}

export function getMilestoneStage(percentage: number): HouseStage {
    return getStageFromPercentage(percentage);
}

/** Map each build part to a spread unlock point across 0–100% of the funding goal. */
export function getPartUnlockPercent(partId: string): number {
    const part = HOUSE_BUILD_PARTS.find((p) => p.id === partId);
    if (!part) {
        return 100;
    }
    return clampPercentage((part.unlockAt / CORE_PART_COUNT) * 100);
}

/** Highest build part unlocked at the given funding progress. */
export function getPartUnlockedAtPercentage(progressPercentage: number): HousePart | null {
    const progress = clampPercentage(progressPercentage);
    let unlocked: HousePart | null = null;

    for (const part of HOUSE_BUILD_PARTS) {
        if (progress >= getPartUnlockPercent(part.id)) {
            unlocked = part;
        }
    }

    return unlocked;
}

/** Build part whose funding threshold was crossed between two progress values. */
export function getPartNewlyUnlocked(previousPercent: number, currentPercent: number): HousePart | null {
    const previous = clampPercentage(previousPercent);
    const current = clampPercentage(currentPercent);

    if (current <= previous) {
        return null;
    }

    for (let index = HOUSE_BUILD_PARTS.length - 1; index >= 0; index--) {
        const part = HOUSE_BUILD_PARTS[index];
        const threshold = getPartUnlockPercent(part.id);
        if (current >= threshold && previous < threshold) {
            return part;
        }
    }

    return null;
}

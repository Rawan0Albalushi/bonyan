import { CORE_PART_COUNT, HOUSE_BUILD_PARTS } from '@/components/house/houseParts';
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

export function getPreviousPercentageForCelebration(currentPercent: number, donationNumber: number): number {
    const fromDonation = getUnlockPercentForDonation(Math.max(0, donationNumber - 1));
    const fromStep = clampPercentage(currentPercent - 100 / CORE_PART_COUNT);
    return Math.min(fromDonation, fromStep);
}

export function getMilestoneStage(percentage: number): HouseStage {
    return getStageFromPercentage(percentage);
}

/** Map each build part to a spread unlock point across 0–100%. */
export function getPartUnlockPercent(partId: string): number {
    const part = HOUSE_BUILD_PARTS.find((p) => p.id === partId);
    if (!part) {
        return 100;
    }
    return clampPercentage((part.unlockAt / CORE_PART_COUNT) * 100);
}

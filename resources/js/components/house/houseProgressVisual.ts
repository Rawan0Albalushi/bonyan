import { BONUS_PARTS, CORE_PART_COUNT, type HousePart } from '@/components/house/houseParts';
import {
    getDonationContribution,
    getPartActiveAtFunding,
    getPartNewlyUnlockedByFunding,
    getVisiblePartIdsFromFunding,
    type DonationContribution,
} from '@/components/house/houseBuildState';
import { getFundingUnlockPercentForPartId } from '@/components/house/housePhases';
import type { HouseStage } from '@/components/house/houseStages';
import { getStageFromPercentage } from '@/components/house/houseStages';

export function clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
}

export function smoothStep(t: number): number {
    const clamped = Math.min(1, Math.max(0, t));
    return clamped * clamped * (3 - 2 * clamped);
}

export function getStageBlendOpacities(percentage: number): Record<HouseStage, number> {
    const p = clampPercentage(percentage);
    const scaled = (p / 100) * 3;
    const lower = Math.floor(scaled) as HouseStage;
    const upper = Math.min(3, lower + 1) as HouseStage;
    const t = smoothStep(scaled - lower);

    const opacities: Record<HouseStage, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

    if (lower === upper) {
        opacities[lower] = 1;
    } else {
        opacities[lower] = 1 - t;
        opacities[upper] = t;
    }

    return opacities;
}

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

export function getWarmGlowOpacity(percentage: number): number {
    return smoothStep(clampPercentage(percentage) / 100) * 0.45;
}

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

export function getSegmentProgress(percentage: number): number {
    const p = clampPercentage(percentage);
    if (p < 50) {
        return smoothStep(p / 50);
    }
    if (p < 80) {
        return smoothStep((p - 50) / 30);
    }
    return smoothStep((p - 80) / 20);
}

export function getFundingProgressPercentage(progressPercentage: number): number {
    return clampPercentage(progressPercentage);
}

export function getFundingProgressBeforeDonation(
    goalAmount: number,
    raisedAmount: number,
    donationAmount: number,
): number {
    if (goalAmount <= 0) {
        return 0;
    }

    const raisedBefore = Math.max(0, raisedAmount - donationAmount);
    const before = (raisedBefore / goalAmount) * 100;
    const after = (raisedAmount / goalAmount) * 100;

    if (after - before < 0.0001) {
        /** Step back ~¼ of one build part so the success animation has a real before/after. */
        const step = 100 / 72;
        return clampPercentage(Math.max(0, before - step));
    }

    return clampPercentage(before);
}

export function getMilestoneStage(percentage: number): HouseStage {
    return getStageFromPercentage(percentage);
}

export function getPartUnlockPercent(partId: string): number {
    return getFundingUnlockPercentForPartId(partId);
}

export function getPartUnlockedAtPercentage(progressPercentage: number): HousePart | null {
    return getPartActiveAtFunding(progressPercentage);
}

export function getPartNewlyUnlocked(previousPercent: number, currentPercent: number): HousePart | null {
    return getPartNewlyUnlockedByFunding(previousPercent, currentPercent);
}

export function getDonationsCountBeforeDonation(currentCount: number, donationCompleted: boolean): number {
    if (!donationCompleted || currentCount <= 0) {
        return Math.max(0, currentCount);
    }
    return Math.max(0, currentCount - 1);
}

/** What the donor contributed — driven by amount / goal, scales to any donation count. */
export function getDonationBuildContribution(
    previousFundingPercent: number,
    currentFundingPercent: number,
    donationsCount: number,
): DonationContribution | null {
    const core = getDonationContribution(previousFundingPercent, currentFundingPercent);
    if (core) {
        return core;
    }

    if (clampPercentage(currentFundingPercent) >= 100 && donationsCount > CORE_PART_COUNT) {
        const bonusIndex = (donationsCount - CORE_PART_COUNT - 1) % BONUS_PARTS.length;
        const part = BONUS_PARTS[bonusIndex];
        if (part) {
            return {
                part,
                isNewFullLayer: false,
                partialOpacity: 1,
                fundingPercent: currentFundingPercent,
            };
        }
    }

    return null;
}

export function getRecentUnlockChipIds(fundingPercent: number, limit = 6): string[] {
    return getVisiblePartIdsFromFunding(fundingPercent).slice(-limit);
}

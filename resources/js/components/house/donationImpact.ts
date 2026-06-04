import {
    getDonationContribution,
    getPartById,
    type DonationContribution,
} from '@/components/house/houseBuildState';
import { getDonationBuildContribution } from '@/components/house/houseProgressVisual';
import {
    getMaxPhaseIndexFromFunding,
    getPhaseForPartId,
    HOUSE_CONSTRUCTION_PHASES,
    HOUSE_PHASE_FUNDING_THRESHOLDS,
    type HouseConstructionPhaseId,
} from '@/components/house/housePhases';
import { clampPercentage } from '@/components/house/houseProgressVisual';

export type DonationImpactSize = 'brick' | 'detail' | 'stage' | 'phase' | 'complete';

export interface DonationImpact {
    size: DonationImpactSize;
    partId: string;
    partLabelKey: string;
    phaseId: HouseConstructionPhaseId;
    /** i18n key for the floating impact message */
    messageKey: string;
    messageParams?: Record<string, string | number>;
    isNewFullLayer: boolean;
    partialOpacity: number;
    /** 1–5 decorative bricks for small donations */
    brickCount: number;
    /** Crossed 50%, 80%, or 100% */
    phaseMilestone: HouseConstructionPhaseId | 'complete' | null;
    fundingDelta: number;
}

function getPhaseMilestoneCrossed(
    previousPercent: number,
    currentPercent: number,
): DonationImpact['phaseMilestone'] {
    const thresholds: { at: number; id: HouseConstructionPhaseId | 'complete' }[] = [
        { at: 50, id: 'landscape' },
        { at: 80, id: 'interior' },
        { at: 100, id: 'complete' },
    ];

    for (const { at, id } of thresholds) {
        if (previousPercent < at && currentPercent >= at) {
            return id;
        }
    }
    return null;
}

function resolveContribution(
    previousPercent: number,
    currentPercent: number,
): DonationContribution | null {
    return getDonationContribution(previousPercent, currentPercent);
}

/** Classify donor-visible impact from funding change (and optional amount vs goal). */
export function getDonationImpact(
    previousPercent: number,
    currentPercent: number,
    options?: { donationAmount?: number; goalAmount?: number; donationsCount?: number },
): DonationImpact | null {
    const prev = clampPercentage(previousPercent);
    const cur = clampPercentage(currentPercent);

    if (cur <= prev) {
        return null;
    }

    const fundingDelta = cur - prev;
    const phaseMilestone = getPhaseMilestoneCrossed(prev, cur);

    if (cur >= 100) {
        const contribution = resolveContribution(prev, cur);
        const part = contribution?.part ?? getPartById('heart');
        if (!part) {
            return null;
        }
        return {
            size: 'complete',
            partId: part.id,
            partLabelKey: part.labelKey,
            phaseId: 'interior',
            messageKey: 'house.impact.complete',
            isNewFullLayer: true,
            partialOpacity: 1,
            brickCount: 0,
            phaseMilestone: 'complete',
            fundingDelta,
        };
    }

    let contribution = resolveContribution(prev, cur);
    if (!contribution && options?.donationsCount != null) {
        const bonus = getDonationBuildContribution(prev, cur, options.donationsCount);
        if (bonus) {
            contribution = bonus;
        }
    }
    if (!contribution) {
        return null;
    }

    if (cur >= 100 && contribution.part.id.startsWith('bonus-')) {
        return {
            size: 'detail',
            partId: contribution.part.id,
            partLabelKey: contribution.part.labelKey,
            phaseId: 'interior',
            messageKey: 'house.impact.bonus',
            messageParams: { part: contribution.part.labelKey },
            isNewFullLayer: false,
            partialOpacity: 1,
            brickCount: 0,
            phaseMilestone: null,
            fundingDelta,
        };
    }

    const phase = getPhaseForPartId(contribution.part.id);
    const phaseId = phase?.id ?? 'structure';
    const prevPhase = getMaxPhaseIndexFromFunding(prev);
    const curPhase = getMaxPhaseIndexFromFunding(cur);
    const crossedPhase = curPhase > prevPhase;

    const goal = options?.goalAmount ?? 1000;
    const donation = options?.donationAmount ?? 0;
    const donationSharePercent = goal > 0 ? (donation / goal) * 100 : fundingDelta;

    let size: DonationImpactSize = 'brick';

    if (phaseMilestone && phaseMilestone !== 'complete') {
        size = 'phase';
    } else if (crossedPhase) {
        size = 'phase';
    } else if (contribution.isNewFullLayer) {
        size = 'stage';
    } else if (fundingDelta >= 2.5 || donationSharePercent >= 2) {
        size = 'detail';
    } else {
        size = 'brick';
    }

    const brickCount =
        size === 'brick'
            ? Math.max(1, Math.min(5, Math.ceil(fundingDelta * 2) || Math.ceil(donationSharePercent * 2) || 1))
            : size === 'detail'
              ? Math.max(1, Math.min(3, Math.ceil(fundingDelta)))
              : 0;

    let messageKey = 'house.impact.brick';
    const messageParams: Record<string, string | number> = {
        part: contribution.part.labelKey,
    };

    if (size === 'complete') {
        messageKey = 'house.impact.complete';
    } else if (size === 'phase') {
        const milestonePhase =
            phaseMilestone && phaseMilestone !== 'complete'
                ? phaseMilestone
                : HOUSE_CONSTRUCTION_PHASES[curPhase]?.id ?? 'landscape';
        messageKey = `house.impact.phase_${milestonePhase}`;
    } else if (size === 'stage') {
        messageKey = 'house.impact.stage';
    } else if (size === 'detail') {
        messageKey = 'house.impact.detail';
    } else {
        messageKey = 'house.impact.brick';
    }

    return {
        size,
        partId: contribution.part.id,
        partLabelKey: contribution.part.labelKey,
        phaseId,
        messageKey,
        messageParams,
        isNewFullLayer: contribution.isNewFullLayer,
        partialOpacity: contribution.partialOpacity,
        brickCount,
        phaseMilestone,
        fundingDelta,
    };
}

export function getPhaseLabelKey(phaseId: HouseConstructionPhaseId): string {
    const phase = HOUSE_CONSTRUCTION_PHASES.find((p) => p.id === phaseId);
    return phase?.labelKey ?? 'house.stages.structure';
}

export { HOUSE_PHASE_FUNDING_THRESHOLDS };

function clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
}

/** Funding thresholds that unlock each construction phase (structure → landscape → interior). */
export const HOUSE_PHASE_FUNDING_THRESHOLDS = [0, 50, 80, 100] as const;

export type HouseConstructionPhaseId = 'structure' | 'landscape' | 'interior';

export interface HouseConstructionPhase {
    id: HouseConstructionPhaseId;
    fundingStartPercent: number;
    fundingEndPercent: number;
    labelKey: string;
    partIds: readonly string[];
}

export const HOUSE_CONSTRUCTION_PHASES: readonly HouseConstructionPhase[] = [
    {
        id: 'structure',
        fundingStartPercent: 0,
        fundingEndPercent: 50,
        labelKey: 'house.stages.structure',
        partIds: [
            'foundation',
            'ground-walls',
            'columns',
            'upper-walls',
            'roof-frame',
            'roof-tiles',
            'window-left',
            'window-right',
            'door',
            'balcony',
            'chimney',
        ],
    },
    {
        id: 'landscape',
        fundingStartPercent: 50,
        fundingEndPercent: 80,
        labelKey: 'house.stages.landscape',
        partIds: ['walkway', 'garden', 'olive-tree', 'fence'],
    },
    {
        id: 'interior',
        fundingStartPercent: 80,
        fundingEndPercent: 100,
        labelKey: 'house.stages.interior',
        partIds: ['facade', 'lights', 'heart'],
    },
] as const;

export const HOUSE_PHASE_PART_IDS = HOUSE_CONSTRUCTION_PHASES.flatMap((phase) => phase.partIds);

export const TOTAL_HOUSE_PARTS = HOUSE_PHASE_PART_IDS.length;

export function getMaxPhaseIndexFromFunding(fundingPercent: number): number {
    const p = clampPercentage(fundingPercent);
    if (p >= 80) {
        return 2;
    }
    if (p >= 50) {
        return 1;
    }
    return 0;
}

export function getFundingProgressInPhase(phaseIndex: number, fundingPercent: number): number {
    const phase = HOUSE_CONSTRUCTION_PHASES[phaseIndex];
    if (!phase) {
        return 0;
    }
    const p = clampPercentage(fundingPercent);
    if (p <= phase.fundingStartPercent) {
        return 0;
    }
    const band = phase.fundingEndPercent - phase.fundingStartPercent;
    if (band <= 0) {
        return 1;
    }
    return Math.min(1, (p - phase.fundingStartPercent) / band);
}

export function getPhaseIndexForPartId(partId: string): number {
    return HOUSE_CONSTRUCTION_PHASES.findIndex((phase) => phase.partIds.includes(partId));
}

export function getPhaseForPartId(partId: string): HouseConstructionPhase | undefined {
    const index = getPhaseIndexForPartId(partId);
    return index >= 0 ? HOUSE_CONSTRUCTION_PHASES[index] : undefined;
}

export function getFundingUnlockPercentForPartId(partId: string): number {
    const phaseIndex = getPhaseIndexForPartId(partId);
    const phase = HOUSE_CONSTRUCTION_PHASES[phaseIndex];
    if (!phase) {
        return 100;
    }
    const indexInPhase = phase.partIds.indexOf(partId);
    if (indexInPhase < 0) {
        return 100;
    }
    const band = phase.fundingEndPercent - phase.fundingStartPercent;
    const step = band / Math.max(1, phase.partIds.length);
    return clampPercentage(phase.fundingStartPercent + step * (indexInPhase + 1));
}

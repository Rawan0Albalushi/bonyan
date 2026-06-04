import { getPhaseIndexForPartId, HOUSE_PHASE_FUNDING_THRESHOLDS } from '@/components/house/housePhases';

/** Visual build stages mapped to funding progress (structure → landscape → interior → complete). */
export const HOUSE_STAGE_THRESHOLDS = HOUSE_PHASE_FUNDING_THRESHOLDS;

export type HouseStage = 0 | 1 | 2 | 3;

export const HOUSE_STAGE_LABEL_KEYS = [
    'house.stages.structure',
    'house.stages.landscape',
    'house.stages.interior',
    'house.stages.complete',
] as const;

export function getStageFromPercentage(percentage: number): HouseStage {
    const clamped = Math.min(100, Math.max(0, percentage));
    if (clamped >= 100) return 3;
    if (clamped >= 80) return 2;
    if (clamped >= 50) return 1;
    return 0;
}

/** Map part ids to the construction phase for celebration highlights. */
export function getStageForPartId(partId: string): HouseStage {
    if (partId.startsWith('bonus-')) {
        return 3;
    }
    const phaseIndex = getPhaseIndexForPartId(partId);
    if (phaseIndex < 0) {
        return 3;
    }
    return Math.min(2, phaseIndex) as HouseStage;
}

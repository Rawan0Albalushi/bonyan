/** Visual build stages mapped to donation progress percentage. */
export const HOUSE_STAGE_THRESHOLDS = [0, 25, 50, 75, 100] as const;

export type HouseStage = 0 | 1 | 2 | 3 | 4;

export const HOUSE_STAGE_LABEL_KEYS = [
    'house.stages.foundation',
    'house.stages.walls',
    'house.stages.rooms',
    'house.stages.roof',
    'house.stages.complete',
] as const;

export function getStageFromPercentage(percentage: number): HouseStage {
    const clamped = Math.min(100, Math.max(0, percentage));
    if (clamped >= 100) return 4;
    if (clamped >= 75) return 3;
    if (clamped >= 50) return 2;
    if (clamped >= 25) return 1;
    return 0;
}

/** Map legacy part ids to the closest visual stage for celebration highlights. */
export function getStageForPartId(partId: string): HouseStage {
    const stageMap: Record<string, HouseStage> = {
        foundation: 0,
        'ground-walls': 1,
        columns: 1,
        'upper-walls': 2,
        'roof-frame': 3,
        'roof-tiles': 3,
        'window-left': 2,
        'window-right': 2,
        door: 2,
        balcony: 3,
        chimney: 3,
        facade: 4,
        walkway: 4,
        garden: 4,
        'olive-tree': 4,
        fence: 4,
        lights: 4,
        heart: 4,
    };

    if (partId.startsWith('bonus-')) {
        return 4;
    }

    return stageMap[partId] ?? 4;
}

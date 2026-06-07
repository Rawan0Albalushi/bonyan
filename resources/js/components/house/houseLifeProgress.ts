import { clampPercentage } from '@/components/house/houseProgressVisual';

const LAYERS = '/image/house/layers';

export type HouseLifeLayerId =
    | 'base'
    | 'roof'
    | 'openings'
    | 'garden'
    | 'lights'
    | 'interior'
    | 'complete';

interface LifeLayerBand {
    id: HouseLifeLayerId;
    unlockAt: number;
    fullAt: number;
}

/** Progress bands used to pick celebration layer reveals on the success page. */
const LIFE_LAYER_BANDS: LifeLayerBand[] = [
    { id: 'base', unlockAt: 0, fullAt: 20 },
    { id: 'roof', unlockAt: 20, fullAt: 40 },
    { id: 'openings', unlockAt: 40, fullAt: 60 },
    { id: 'garden', unlockAt: 60, fullAt: 75 },
    { id: 'lights', unlockAt: 75, fullAt: 90 },
    { id: 'interior', unlockAt: 90, fullAt: 100 },
];

export const HOUSE_LIFE_BASE_IMAGE = `${LAYERS}/base.png`;

/** Cumulative build frames (step-00 … step-18) — one image per progress slice. */
export const HOUSE_LIFE_STEP_COUNT = 18;

export function getLifeStepImage(step: number): string {
    const clamped = Math.max(0, Math.min(HOUSE_LIFE_STEP_COUNT, Math.round(step)));
    return `${LAYERS}/step-${String(clamped).padStart(2, '0')}.png`;
}

export function getLifeStepIndex(progress: number): number {
    const p = clampPercentage(progress);
    if (p >= 100) {
        return HOUSE_LIFE_STEP_COUNT;
    }
    return Math.min(HOUSE_LIFE_STEP_COUNT, Math.floor((p / 100) * HOUSE_LIFE_STEP_COUNT));
}

function getLifeStepBlend(progress: number): number {
    const p = clampPercentage(progress);
    if (p >= 100) {
        return 0;
    }
    const exact = (p / 100) * HOUSE_LIFE_STEP_COUNT;
    return exact - Math.floor(exact);
}

export interface LifeStepRender {
    currentStep: number;
    nextStep: number | null;
    nextOpacity: number;
}

/** Single cumulative frame (+ optional crossfade) for the life-scene renderer. */
export function getLifeStepRender(progress: number): LifeStepRender {
    const currentStep = getLifeStepIndex(progress);
    const blend = getLifeStepBlend(progress);

    if (blend <= 0.01 || currentStep >= HOUSE_LIFE_STEP_COUNT) {
        return { currentStep, nextStep: null, nextOpacity: 0 };
    }

    return {
        currentStep,
        nextStep: currentStep + 1,
        nextOpacity: blend,
    };
}

function getLifeBandOpacity(progress: number, unlockAt: number, fullAt: number): number {
    const p = clampPercentage(progress);
    if (p < unlockAt) {
        return 0;
    }
    if (p >= fullAt) {
        return 1;
    }
    const span = Math.max(0.001, fullAt - unlockAt);
    return (p - unlockAt) / span;
}

const MIN_LAYER_DELTA = 0.06;

export function getActiveLifeStage(progress: number): HouseLifeLayerId {
    const p = clampPercentage(progress);

    if (p >= 100) {
        return 'complete';
    }

    let active: HouseLifeLayerId = 'base';
    for (const layer of LIFE_LAYER_BANDS) {
        if (p >= layer.unlockAt) {
            active = layer.id;
        }
    }

    return active;
}

export function getLifeStageProgress(progress: number, stageId: HouseLifeLayerId): number {
    if (stageId === 'complete') {
        return progress >= 100 ? 1 : 0;
    }

    const band = LIFE_LAYER_BANDS.find((layer) => layer.id === stageId);
    if (!band) {
        return 0;
    }

    return getLifeBandOpacity(progress, band.unlockAt, band.fullAt);
}

export function getLayersToAnimate(
    previousProgress: number,
    currentProgress: number,
): HouseLifeLayerId[] {
    const prev = clampPercentage(previousProgress);
    const curr = clampPercentage(currentProgress);

    if (curr >= 100 && prev < 100) {
        return ['complete'];
    }

    const ids: HouseLifeLayerId[] = [];
    for (const layer of LIFE_LAYER_BANDS) {
        const before = getLifeBandOpacity(prev, layer.unlockAt, layer.fullAt);
        const after = getLifeBandOpacity(curr, layer.unlockAt, layer.fullAt);
        if (after - before >= MIN_LAYER_DELTA) {
            ids.push(layer.id);
        }
    }

    return ids;
}

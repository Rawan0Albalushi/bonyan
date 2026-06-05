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

export interface HouseLifeLayerDef {
    id: HouseLifeLayerId;
    /** Progress % when this layer starts appearing. */
    unlockAt: number;
    /** Progress % when this layer is fully visible. */
    fullAt: number;
    images: string[];
    toastKey: string;
}

/** Cumulative life overlays — base image stays underneath all stages. */
export const HOUSE_LIFE_LAYERS: HouseLifeLayerDef[] = [
    {
        id: 'base',
        unlockAt: 0,
        fullAt: 20,
        images: [
            `${LAYERS}/foundation.png`,
            `${LAYERS}/ground-walls.png`,
            `${LAYERS}/columns.png`,
        ],
        toastKey: 'house.life_toast.base',
    },
    {
        id: 'roof',
        unlockAt: 20,
        fullAt: 40,
        images: [
            `${LAYERS}/upper-walls.png`,
            `${LAYERS}/roof-frame.png`,
            `${LAYERS}/roof-tiles.png`,
            `${LAYERS}/chimney.png`,
        ],
        toastKey: 'house.life_toast.roof',
    },
    {
        id: 'openings',
        unlockAt: 40,
        fullAt: 60,
        images: [
            `${LAYERS}/window-left.png`,
            `${LAYERS}/window-right.png`,
            `${LAYERS}/door.png`,
            `${LAYERS}/balcony.png`,
        ],
        toastKey: 'house.life_toast.openings',
    },
    {
        id: 'garden',
        unlockAt: 60,
        fullAt: 75,
        images: [
            `${LAYERS}/walkway.png`,
            `${LAYERS}/garden.png`,
            `${LAYERS}/olive-tree.png`,
            `${LAYERS}/fence.png`,
        ],
        toastKey: 'house.life_toast.garden',
    },
    {
        id: 'lights',
        unlockAt: 75,
        fullAt: 90,
        images: [`${LAYERS}/lights.png`],
        toastKey: 'house.life_toast.lights',
    },
    {
        id: 'interior',
        unlockAt: 90,
        fullAt: 100,
        images: [`${LAYERS}/facade.png`],
        toastKey: 'house.life_toast.interior',
    },
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

export function getLifeStepBlend(progress: number): number {
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

/** Single cumulative frame (+ optional crossfade) instead of stacking faint part deltas. */
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

export function getLifeBandOpacity(
    progress: number,
    unlockAt: number,
    fullAt: number,
): number {
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

export function getLifeLayerOpacity(
    layer: HouseLifeLayerDef,
    progress: number,
): number {
    return getLifeBandOpacity(progress, layer.unlockAt, layer.fullAt);
}

export function getLifeLayerOpacities(progress: number): Record<HouseLifeLayerId, number> {
    const result = {} as Record<HouseLifeLayerId, number>;
    for (const layer of HOUSE_LIFE_LAYERS) {
        result[layer.id] = getLifeLayerOpacity(layer, progress);
    }
    result.complete = clampPercentage(progress) >= 100 ? 1 : 0;
    return result;
}

const MIN_LAYER_DELTA = 0.06;

/** Layer that gained the most visibility from the latest donation. */
export function getMostAffectedLifeLayer(
    previousProgress: number,
    currentProgress: number,
): HouseLifeLayerDef | null {
    const prev = clampPercentage(previousProgress);
    const curr = clampPercentage(currentProgress);

    if (curr >= 100 && prev < 100) {
        return {
            id: 'complete',
            unlockAt: 100,
            fullAt: 100,
            images: [],
            toastKey: 'house.life_toast.complete',
        };
    }

    let best: HouseLifeLayerDef | null = null;
    let bestDelta = MIN_LAYER_DELTA;

    for (const layer of HOUSE_LIFE_LAYERS) {
        const delta =
            getLifeLayerOpacity(layer, curr) - getLifeLayerOpacity(layer, prev);
        if (delta >= bestDelta) {
            bestDelta = delta;
            best = layer;
        }
    }

    return best;
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
    for (const layer of HOUSE_LIFE_LAYERS) {
        const before = getLifeLayerOpacity(layer, prev);
        const after = getLifeLayerOpacity(layer, curr);
        if (after - before >= MIN_LAYER_DELTA) {
            ids.push(layer.id);
        }
    }

    return ids.length > 0 ? ids : [];
}

export function getLifeStageLabelKey(progress: number): string {
    const p = clampPercentage(progress);
    if (p >= 100) {
        return 'house.life_stages.complete';
    }
    if (p >= 90) {
        return 'house.life_stages.interior';
    }
    if (p >= 75) {
        return 'house.life_stages.lights';
    }
    if (p >= 60) {
        return 'house.life_stages.garden';
    }
    if (p >= 40) {
        return 'house.life_stages.openings';
    }
    if (p >= 20) {
        return 'house.life_stages.roof';
    }
    return 'house.life_stages.base';
}

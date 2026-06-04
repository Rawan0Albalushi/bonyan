import { getLayerOpacityForPart } from '@/components/house/houseBuildState';
import { HOUSE_BUILD_PARTS } from '@/components/house/houseParts';
import { HOUSE_BASE_LAYER, HOUSE_PART_LAYERS } from '@/components/house/houseLayers';
import { HOUSE_FULL_IMAGE } from '@/components/house/houseImages';
import { clampPercentage } from '@/components/house/houseProgressVisual';

export interface AdditivePartLayer {
    id: string;
    src: string;
    opacity: number;
}

export interface AdditiveHouseRender {
    complete: boolean;
    fullSrc: string;
    baseSrc: string;
    partLayers: AdditivePartLayer[];
    /** Next part image to preload (performance). */
    preloadPartSrc: string | null;
}

/** Visible house = foundation base + stacked part deltas (real construction layers). */
export function getAdditiveHouseRender(fundingPercent: number): AdditiveHouseRender {
    const p = clampPercentage(fundingPercent);

    if (p >= 100) {
        return {
            complete: true,
            fullSrc: HOUSE_FULL_IMAGE,
            baseSrc: HOUSE_BASE_LAYER.image,
            partLayers: [],
            preloadPartSrc: null,
        };
    }

    const partLayers: AdditivePartLayer[] = [];

    for (const part of HOUSE_BUILD_PARTS) {
        const opacity = getLayerOpacityForPart(part.id, p);
        if (opacity <= 0.01) {
            continue;
        }
        const layer = HOUSE_PART_LAYERS.find((l) => l.id === part.id);
        if (!layer) {
            continue;
        }
        partLayers.push({ id: part.id, src: layer.image, opacity });
    }

    const nextPart = HOUSE_BUILD_PARTS.find((part) => getLayerOpacityForPart(part.id, p) <= 0.01);
    const preloadPartSrc = nextPart
        ? (HOUSE_PART_LAYERS.find((l) => l.id === nextPart.id)?.image ?? null)
        : null;

    return {
        complete: false,
        fullSrc: HOUSE_FULL_IMAGE,
        baseSrc: HOUSE_BASE_LAYER.image,
        partLayers,
        preloadPartSrc,
    };
}

export function isPartNewlyVisible(
    partId: string,
    previousFunding: number,
    currentFunding: number,
): boolean {
    return (
        getLayerOpacityForPart(partId, previousFunding) < 0.05 &&
        getLayerOpacityForPart(partId, currentFunding) > 0.05
    );
}

export function getPartLayerSrc(partId: string): string | null {
    return HOUSE_PART_LAYERS.find((l) => l.id === partId)?.image ?? null;
}

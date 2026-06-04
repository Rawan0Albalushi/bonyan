import { getBuildVisualStateFromFunding } from '@/components/house/houseBuildState';
import {
    getFundingProgressInPhase,
    getMaxPhaseIndexFromFunding,
    HOUSE_CONSTRUCTION_PHASES,
} from '@/components/house/housePhases';
import { HOUSE_PART_LAYERS, type HouseConstructionLayer } from '@/components/house/houseLayers';

function clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
}

export const HOUSE_BASE_IMAGE = '/image/house/layers/base.png';
export const HOUSE_EXTERIOR_IMAGE = '/image/house/house-exterior.png';
export const HOUSE_LANDSCAPE_COMPLETE_IMAGE = '/image/house/house-landscape-complete.png';
export const HOUSE_FULL_IMAGE = '/image/house/house-full.png';

export interface PhaseLayerRender {
    layer: HouseConstructionLayer;
    opacity: number;
}

export type PhasedHouseRender =
    | { type: 'full' }
    | {
          type: 'structure';
          /** 0–1 — reveals exterior from bottom. */
          exteriorReveal: number;
      }
    | {
          type: 'landscape';
          overlays: PhaseLayerRender[];
      }
    | {
          type: 'interior';
          overlays: PhaseLayerRender[];
          furnishedOpacity: number;
      };

function getOverlayStackForPhase(phaseIndex: number, fundingPercent: number): PhaseLayerRender[] {
    const phase = HOUSE_CONSTRUCTION_PHASES[phaseIndex];
    if (!phase) {
        return [];
    }

    const progress = getFundingProgressInPhase(phaseIndex, fundingPercent);
    const units = progress * phase.partIds.length;
    const stack: PhaseLayerRender[] = [];

    phase.partIds.forEach((partId, index) => {
        const layer = HOUSE_PART_LAYERS.find((l) => l.id === partId);
        if (!layer) {
            return;
        }

        const partStart = index;
        const partEnd = index + 1;
        let opacity = 0;

        if (units >= partEnd) {
            opacity = 1;
        } else if (units > partStart) {
            opacity = Math.max(0.55, units - partStart);
        }

        if (opacity > 0.01) {
            stack.push({ layer, opacity });
        }
    });

    return stack;
}

/**
 * - &lt;50%: foundation (base) + exterior shell rising (cutaway empty)
 * - 50–80%: foundation + full exterior + landscape layers
 * - 80–100%: landscape-complete base + interior layers + furnished fade-in
 */
export function getPhasedHouseRender(fundingPercent: number): PhasedHouseRender {
    const p = clampPercentage(fundingPercent);

    if (p >= 100) {
        return { type: 'full' };
    }

    const maxPhase = getMaxPhaseIndexFromFunding(p);

    if (maxPhase === 0) {
        return {
            type: 'structure',
            exteriorReveal: getFundingProgressInPhase(0, p),
        };
    }

    if (maxPhase === 1) {
        return {
            type: 'landscape',
            overlays: getOverlayStackForPhase(1, p),
        };
    }

    const interiorProgress = getFundingProgressInPhase(2, p);

    return {
        type: 'interior',
        overlays: getOverlayStackForPhase(2, p),
        furnishedOpacity: Math.max(0, Math.min(1, interiorProgress)),
    };
}

export { getActiveBuildPartId } from '@/components/house/houseBuildState';

/** clip-path inset from top — 0 hides layer, 1 shows full layer (bottom-up build). */
export function getStepRevealClipInsetTop(reveal: number): number {
    const amount = Math.max(0, Math.min(1, reveal));
    return Math.round((1 - amount) * 1000) / 10;
}

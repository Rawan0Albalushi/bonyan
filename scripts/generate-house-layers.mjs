/**
 * Builds construction layers for step-by-step house assembly.
 * - step-00.png: land / foundation only (always visible)
 * - {part-id}.png: additive layer revealed by each donation
 * - house-full.png: shown at 100% (18 donations)
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const houseDir = join(root, 'public/image/house');
const layersDir = join(houseDir, 'layers');

const STAGES = [
    'house-stage-0.png',
    'house-stage-1.png',
    'house-stage-2.png',
    'house-stage-3.png',
    'house-stage-4.png',
];

const PART_IDS = [
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
    'facade',
    'walkway',
    'garden',
    'olive-tree',
    'fence',
    'lights',
    'heart',
];

const CORE_PART_COUNT = PART_IDS.length;

function stripBackground(data) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;

        const isBackground =
            (r > 235 && g > 235 && b > 235) ||
            (r > 210 && g > 210 && b > 210 && saturation < 0.12);

        if (isBackground) {
            data[i + 3] = 0;
        } else if (r > 200 && g > 200 && b > 200 && saturation < 0.2) {
            data[i + 3] = Math.round(255 * (1 - (r - 200) / 35));
        }
    }
}

async function loadTransparentImage(filename) {
    const { data, info } = await sharp(join(houseDir, filename))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    stripBackground(data);
    return { data: Buffer.from(data), info };
}

function blendRaw(a, b, weight) {
    const out = Buffer.alloc(a.length);
    const w = Math.min(1, Math.max(0, weight));

    for (let i = 0; i < a.length; i += 4) {
        const aw = a[i + 3] / 255;
        const bw = b[i + 3] / 255;
        const blendedAlpha = aw * (1 - w) + bw * w;

        if (blendedAlpha <= 0) {
            out[i + 3] = 0;
            continue;
        }

        out[i] = Math.round((a[i] * aw * (1 - w) + b[i] * bw * w) / blendedAlpha);
        out[i + 1] = Math.round((a[i + 1] * aw * (1 - w) + b[i + 1] * bw * w) / blendedAlpha);
        out[i + 2] = Math.round((a[i + 2] * aw * (1 - w) + b[i + 2] * bw * w) / blendedAlpha);
        out[i + 3] = Math.round(blendedAlpha * 255);
    }

    return out;
}

/** Pixels that appear in `next` but not in `prev` — one donation's construction detail. */
function extractStepDelta(prev, next) {
    const out = Buffer.alloc(next.length);

    for (let i = 0; i < next.length; i += 4) {
        const prevAlpha = prev[i + 3] / 255;
        const nextAlpha = next[i + 3] / 255;
        const deltaAlpha = Math.max(0, nextAlpha - prevAlpha);

        if (deltaAlpha <= 0.015) {
            out[i + 3] = 0;
            continue;
        }

        out[i] = next[i];
        out[i + 1] = next[i + 1];
        out[i + 2] = next[i + 2];
        out[i + 3] = Math.round(Math.min(255, deltaAlpha * 255));
    }

    return out;
}

async function saveRaw(data, info, filename) {
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(join(layersDir, filename));
}

async function main() {
    await mkdir(layersDir, { recursive: true });

    const stageImages = [];
    for (const stage of STAGES) {
        stageImages.push(await loadTransparentImage(stage));
    }

    const info = stageImages[0].info;
    const stepImages = [];

    for (let step = 0; step <= CORE_PART_COUNT; step++) {
        const t = (step / CORE_PART_COUNT) * (STAGES.length - 1);
        const lower = Math.floor(t);
        const upper = Math.min(STAGES.length - 1, lower + 1);
        const weight = t - lower;

        const data =
            lower === upper
                ? Buffer.from(stageImages[lower].data)
                : blendRaw(stageImages[lower].data, stageImages[upper].data, weight);

        stepImages.push(data);
        await saveRaw(data, info, `step-${String(step).padStart(2, '0')}.png`);
    }

    await saveRaw(stepImages[0], info, 'base.png');

    for (let i = 0; i < CORE_PART_COUNT; i++) {
        const delta = extractStepDelta(stepImages[i], stepImages[i + 1]);
        await saveRaw(delta, info, `${PART_IDS[i]}.png`);
    }

    const manifest = {
        base: '/image/house/layers/base.png',
        full: '/image/house/house-full.png',
        parts: PART_IDS.map((id, index) => ({
            id,
            image: `/image/house/layers/${id}.png`,
            unlockAtDonations: index + 1,
        })),
    };

    await writeFile(join(layersDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(`Generated base + ${CORE_PART_COUNT} part layers in ${layersDir}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

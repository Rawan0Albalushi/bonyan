/**
 * Phase-aware layers with pixel filters so structure ≠ furniture.
 * All build steps progress toward the same final model (stage 0→4) so the
 * animated house matches house-full.png. Intermediate stages 1–3 are not blended
 * directly — they are different 3D models and would cause shape mismatches.
 * - Structure (0–52%): brick/stone/concrete only
 * - Landscape (52–78%): plants & exterior ground (lower band)
 * - Interior (78–100%): furnishings & lights
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const houseDir = join(root, 'public/image/house');
const layersDir = join(houseDir, 'layers');

const STAGE_FILES = [
    'house-stage-0.png',
    'house-stage-1.png',
    'house-stage-2.png',
    'house-stage-3.png',
    'house-stage-4.png',
];

const FINAL_STAGE_INDEX = 4;

const BUILD_PHASES = [
    {
        id: 'structure',
        tStart: 0,
        tEnd: 0.52,
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
        pixelFilter: 'structure',
    },
    {
        id: 'landscape',
        tStart: 0.52,
        tEnd: 0.78,
        partIds: ['walkway', 'garden', 'olive-tree', 'fence'],
        pixelFilter: 'landscape',
        minYPercent: 0.62,
    },
    {
        id: 'interior',
        tStart: 0.78,
        tEnd: 1,
        partIds: ['facade', 'lights', 'heart'],
        pixelFilter: 'interior',
    },
];

const PART_IDS = BUILD_PHASES.flatMap((phase) => phase.partIds);
const CORE_PART_COUNT = PART_IDS.length;

function stripBackground(data) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;

        const isMintBackdrop = g > 235 && g >= r && g >= b && r > 215 && b > 215;
        const isBackground =
            isMintBackdrop ||
            (r > 235 && g > 235 && b > 235) ||
            (r > 210 && g > 210 && b > 210 && saturation < 0.12);

        if (isBackground) {
            data[i + 3] = 0;
        } else if (r > 200 && g > 200 && b > 200 && saturation < 0.2) {
            data[i + 3] = Math.round(255 * (1 - (r - 200) / 35));
        }
    }
}

function isStructurePixel(r, g, b, a) {
    if (a < 24) return false;
    if (g > r + 28 && g > b + 12 && g > 95) return false;
    if (r > 210 && g > 175 && b < 140) return false;
    if (r > 180 && g > 150 && b > 120 && r - b < 60) return false;
    return true;
}

function isLandscapeBackdropPixel(r, g, b, a) {
    if (a < 24) return false;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    return (
        (g > 145 && g >= r && g >= b && r > 110 && b > 110 && saturation < 0.22) ||
        (g > 175 && g >= r && r > 150 && b > 150 && saturation < 0.14)
    );
}

function isLandscapePixel(r, g, b, a, y, height, minY) {
    if (a < 24) return false;
    if (y < minY) return false;
    if (isLandscapeBackdropPixel(r, g, b, a)) return false;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    // Foliage & garden plants — saturated greens only
    if (g > r + 22 && g > b + 18 && g > 85 && saturation > 0.12) return true;
    // Walkway / stone / soil in the garden band
    if (r > 85 && r < 210 && g > 65 && b < 135 && r - b > 15 && saturation > 0.08) return true;
    return false;
}

function isInteriorPixel(r, g, b, a) {
    if (a < 24) return false;
    if (r > 200 && g > 170 && b < 150) return true;
    if (r > 160 && g > 130 && b > 90 && r - b < 80) return true;
    if (b > 120 && r < 140 && g < 160) return true;
    return false;
}

function passesFilter(filter, r, g, b, a, y, height, phase) {
    if (filter === 'structure') return isStructurePixel(r, g, b, a);
    if (filter === 'landscape') {
        const minY = Math.floor(height * (phase.minYPercent ?? 0.55));
        return isLandscapePixel(r, g, b, a, y, height, minY);
    }
    if (filter === 'interior') return isInteriorPixel(r, g, b, a);
    return true;
}

function filterDelta(delta, info, phase) {
    const out = Buffer.alloc(delta.length);
    const { width, height } = info;
    const filter = phase.pixelFilter;

    for (let i = 0; i < delta.length; i += 4) {
        const pixelIndex = i / 4;
        const y = Math.floor(pixelIndex / width);
        const r = delta[i];
        const g = delta[i + 1];
        const b = delta[i + 2];
        const a = delta[i + 3];

        if (a < 8) {
            out[i + 3] = 0;
            continue;
        }

        if (passesFilter(filter, r, g, b, a, y, height, phase)) {
            out[i] = r;
            out[i + 1] = g;
            out[i + 2] = b;
            out[i + 3] = a;
        } else {
            out[i + 3] = 0;
        }
    }

    return out;
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

function blendStages(stageImages, startIdx, endIdx, t) {
    return blendRaw(stageImages[startIdx].data, stageImages[endIdx].data, t);
}

/** Progress blend from empty foundation toward the completed house model. */
function blendTowardFinal(stageImages, t) {
    return blendStages(stageImages, 0, FINAL_STAGE_INDEX, t);
}

/** Fade the completed house in over the foundation (avoids ghosting the base through walls). */
function revealHouseOverFoundation(stageImages, weight) {
    return compositeOver(stageImages[0].data, fadeLayer(stageImages[FINAL_STAGE_INDEX].data, weight));
}

function fadeLayer(data, weight) {
    const out = Buffer.alloc(data.length);
    const w = Math.min(1, Math.max(0, weight));

    for (let i = 0; i < data.length; i += 4) {
        out[i] = data[i];
        out[i + 1] = data[i + 1];
        out[i + 2] = data[i + 2];
        out[i + 3] = Math.round(data[i + 3] * w);
    }

    return out;
}

function phaseBlendAt(phase, localT) {
    const t = Math.min(1, Math.max(0, localT));
    return phase.tStart + (phase.tEnd - phase.tStart) * t;
}

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

function compositeOver(base, delta) {
    const out = Buffer.from(base);

    for (let i = 0; i < out.length; i += 4) {
        const ba = base[i + 3] / 255;
        const da = delta[i + 3] / 255;
        const outA = da + ba * (1 - da);

        if (outA <= 0) {
            out[i + 3] = 0;
            continue;
        }

        out[i] = Math.round((delta[i] * da + base[i] * ba * (1 - da)) / outA);
        out[i + 1] = Math.round((delta[i + 1] * da + base[i + 1] * ba * (1 - da)) / outA);
        out[i + 2] = Math.round((delta[i + 2] * da + base[i + 2] * ba * (1 - da)) / outA);
        out[i + 3] = Math.round(outA * 255);
    }

    return out;
}

async function saveRaw(data, info, filename) {
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(join(layersDir, filename));
}

/** Cutaway interior (furniture visible through the wall opening). */
const INTERIOR_CUTAWAY = { x0: 0.3, x1: 0.7, y0: 0.24, y1: 0.66 };

function inInteriorCutaway(nx, ny) {
    return (
        nx > INTERIOR_CUTAWAY.x0 &&
        nx < INTERIOR_CUTAWAY.x1 &&
        ny > INTERIOR_CUTAWAY.y0 &&
        ny < INTERIOR_CUTAWAY.y1
    );
}

/**
 * Walls, roof, windows — no cutaway furnishings. Pixels are fully opaque (no ghost fade).
 */
function buildExteriorOnly(stageData, info) {
    const { width, height } = info;
    const out = Buffer.alloc(stageData.length);

    for (let i = 0; i < stageData.length; i += 4) {
        const a = stageData[i + 3];
        if (a < 24) {
            out[i + 3] = 0;
            continue;
        }

        const pixel = i / 4;
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        const nx = x / width;
        const ny = y / height;
        const r = stageData[i];
        const g = stageData[i + 1];
        const b = stageData[i + 2];

        if (inInteriorCutaway(nx, ny)) {
            out[i + 3] = 0;
            continue;
        }

        if (isInteriorPixel(r, g, b, a)) {
            out[i + 3] = 0;
            continue;
        }

        const keep =
            isStructurePixel(r, g, b, a) ||
            isLandscapePixel(r, g, b, a, y, height, Math.floor(height * 0.55));

        if (keep) {
            out[i] = r;
            out[i + 1] = g;
            out[i + 2] = b;
            out[i + 3] = 255;
        } else {
            out[i + 3] = 0;
        }
    }

    return out;
}

/** Exterior shell only — walls/roof without interior furnishings. */
function buildShell(stageData, info) {
    const { width, height } = info;
    const out = Buffer.alloc(stageData.length);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let i = 0; i < stageData.length; i += 4) {
        if (stageData[i + 3] > 24) {
            const pixel = i / 4;
            const x = pixel % width;
            const y = Math.floor(pixel / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    const boxW = Math.max(1, maxX - minX);
    const boxH = Math.max(1, maxY - minY);

    for (let i = 0; i < stageData.length; i += 4) {
        const a = stageData[i + 3];
        if (a < 24) {
            out[i + 3] = 0;
            continue;
        }

        const pixel = i / 4;
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        const nx = (x - minX) / boxW;
        const ny = (y - minY) / boxH;
        const edge = Math.min(nx, 1 - nx, ny, 1 - ny);
        const r = stageData[i];
        const g = stageData[i + 1];
        const b = stageData[i + 2];

        const exterior =
            edge < 0.2 ||
            (isStructurePixel(r, g, b, a) && !isInteriorPixel(r, g, b, a) && edge < 0.38);

        if (exterior) {
            out[i] = r;
            out[i + 1] = g;
            out[i + 2] = b;
            out[i + 3] = a;
        } else {
            out[i + 3] = 0;
        }
    }

    return out;
}

function stripGhostPixels(data, minAlpha = 40) {
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0 && data[i] < minAlpha) {
            data[i] = 0;
        }
    }
}

/** Remove sage/mint wash left by stage-3 landscape deltas. */
function stripSageBackdrop(data) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (isLandscapeBackdropPixel(r, g, b, data[i + 3])) {
            data[i + 3] = 0;
        }
    }
}

/** Kill semi-transparent fringe below the platform (faint white/mint line). */
function stripBottomFeather(data, info, cutPercent = 0.09, minAlpha = 220) {
    const { width, height } = info;
    const cutY = Math.floor(height * (1 - cutPercent));

    for (let y = cutY; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (width * y + x) * 4;
            if (data[i + 3] < minAlpha) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 0;
            }
        }
    }
}

/** Extend the lowest solid platform row for a clean bottom edge. */
function solidifyBaseBottom(data, info) {
    const { width, height } = info;
    let lastSolidY = -1;

    for (let y = height - 1; y >= 0; y--) {
        let opaque = 0;
        for (let x = 0; x < width; x++) {
            if (data[(width * y + x) * 4 + 3] > 200) {
                opaque++;
            }
        }
        if (opaque > 80) {
            lastSolidY = y;
            break;
        }
    }

    if (lastSolidY < 0 || lastSolidY >= height - 2) {
        return;
    }

    const endY = Math.min(height - 1, lastSolidY + 6);
    for (let y = lastSolidY + 1; y <= endY; y++) {
        for (let x = 0; x < width; x++) {
            const src = (width * lastSolidY + x) * 4;
            const dst = (width * y + x) * 4;
            if (data[src + 3] > 200) {
                data[dst] = data[src];
                data[dst + 1] = data[src + 1];
                data[dst + 2] = data[src + 2];
                data[dst + 3] = 255;
            }
        }
    }
}

function collectHouseFullPixels(houseFullData, info, phase) {
    const { width, height } = info;
    const pixels = [];

    for (let i = 0; i < houseFullData.length; i += 4) {
        const alpha = houseFullData[i + 3];
        if (alpha < 24) {
            continue;
        }

        const pixel = i / 4;
        const y = Math.floor(pixel / width);
        const r = houseFullData[i];
        const g = houseFullData[i + 1];
        const b = houseFullData[i + 2];

        if (!passesFilter(phase.pixelFilter, r, g, b, alpha, y, height, phase)) {
            continue;
        }

        pixels.push({ index: i, y, x: pixel % width });
    }

    if (phase.pixelFilter === 'structure') {
        const deckY = Math.floor(height * 0.64);
        const houseStructure = pixels.filter((pixel) => pixel.y < deckY);
        houseStructure.sort((a, b) => b.y - a.y || a.x - b.x);
        return houseStructure;
    }

    if (phase.pixelFilter === 'interior') {
        pixels.sort((a, b) => a.y - b.y || a.x - b.x);
        return pixels;
    }

    pixels.sort((a, b) => b.y - a.y || a.x - b.x);
    return pixels;
}

function buildFoundationBase(stageImages, info) {
    const base = Buffer.from(stageImages[0].data);
    solidifyBaseBottom(base, info);
    stripBottomFeather(base, info, 0.07, 200);
    return base;
}

/**
 * Step frames for the UI — bottom-up reveal of house-full.png on the stone base.
 * Progress maps 1:1 to visible height so 63% funding does not look like a finished home.
 */
function buildAllStepFrames(houseFullData, baseFrame, info) {
    const frames = [Buffer.from(baseFrame)];
    const { width, height } = info;

    let minY = height;
    let maxY = 0;
    for (let i = 0; i < houseFullData.length; i += 4) {
        if (houseFullData[i + 3] > 24) {
            const y = Math.floor(i / 4 / width);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }

    const houseHeight = Math.max(1, maxY - minY + 1);

    for (let step = 1; step <= CORE_PART_COUNT; step++) {
        const progress = step / CORE_PART_COUNT;
        const revealY = Math.floor(maxY - houseHeight * progress);
        const slice = Buffer.alloc(houseFullData.length);

        for (let i = 0; i < houseFullData.length; i += 4) {
            const y = Math.floor(i / 4 / width);
            if (houseFullData[i + 3] > 24 && y >= revealY) {
                slice[i] = houseFullData[i];
                slice[i + 1] = houseFullData[i + 1];
                slice[i + 2] = houseFullData[i + 2];
                slice[i + 3] = houseFullData[i + 3];
            }
        }

        const frame = compositeOver(baseFrame, slice);
        stripBottomFeather(frame, info);
        frames.push(Buffer.from(frame));
    }

    return frames;
}

async function main() {
    await mkdir(layersDir, { recursive: true });

    const stageImages = [];
    for (const stage of STAGE_FILES) {
        stageImages.push(await loadTransparentImage(stage));
    }

    const info = stageImages[0].info;
    const globalCumulative = [];
    let current = Buffer.from(stageImages[0].data);

    for (const phase of BUILD_PHASES) {
        const n = phase.partIds.length;
        const phaseFrames = [];

        for (let i = 0; i <= n; i++) {
            phaseFrames.push(blendTowardFinal(stageImages, phaseBlendAt(phase, n === 0 ? 1 : i / n)));
        }

        for (let i = 0; i < n; i++) {
            const rawDelta = extractStepDelta(phaseFrames[i], phaseFrames[i + 1]);
            // Part layers = true pixels added at this step (unfiltered) for additive build in UI.
            const filtered = filterDelta(rawDelta, info, phase);
            current = compositeOver(current, filtered);
            globalCumulative.push(Buffer.from(current));
            await saveRaw(rawDelta, info, `${phase.partIds[i]}.png`);
        }
    }

    const shell = buildShell(stageImages[FINAL_STAGE_INDEX].data, info);
    await saveRaw(shell, info, 'shell.png');

    const exterior = buildExteriorOnly(stageImages[FINAL_STAGE_INDEX].data, info);
    await sharp(exterior, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(join(houseDir, 'house-exterior.png'));

    let landscapeBase = Buffer.from(stageImages[0].data);
    landscapeBase = compositeOver(landscapeBase, exterior);
    for (const partId of BUILD_PHASES[1].partIds) {
        const layerPath = join(layersDir, `${partId}.png`);
        const { data } = await sharp(layerPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        landscapeBase = compositeOver(landscapeBase, data);
    }
    await sharp(landscapeBase, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(join(houseDir, 'house-landscape-complete.png'));

    const houseFullImage = await loadTransparentImage('house-full.png');
    const baseFrame = buildFoundationBase(stageImages, info);
    const stepFrames = buildAllStepFrames(houseFullImage.data, baseFrame, info);
    await saveRaw(stepFrames[0], info, 'base.png');
    for (let step = 0; step <= CORE_PART_COUNT; step++) {
        await saveRaw(stepFrames[step], info, `step-${String(step).padStart(2, '0')}.png`);
    }

    await writeFile(
        join(layersDir, 'manifest.json'),
        JSON.stringify(
            {
                base: '/image/house/layers/base.png',
                full: '/image/house/house-full.png',
                shell: '/image/house/house-shell.png',
                exterior: '/image/house/house-exterior.png',
                landscapeComplete: '/image/house/house-landscape-complete.png',
                foundation: '/image/house/layers/base.png',
                phases: BUILD_PHASES.map((phase) => ({
                    id: phase.id,
                    pixelFilter: phase.pixelFilter,
                    partIds: phase.partIds,
                })),
                parts: PART_IDS.map((id, index) => ({
                    id,
                    image: `/image/house/layers/${id}.png`,
                    step: index + 1,
                })),
            },
            null,
            2,
        ),
    );

    console.log(`Generated filtered phase layers (${CORE_PART_COUNT} parts)`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

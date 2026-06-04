/**
 * Generates WebP companions for house PNGs (smaller transfer, same dimensions).
 */
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const houseDir = join(__dirname, '..', 'public/image/house');
const layersDir = join(houseDir, 'layers');

const ROOT_FILES = [
    'house-full.png',
    'house-exterior.png',
    'house-landscape-complete.png',
    'house-shell.png',
];

import { statSync } from 'fs';

async function toWebp(inputPath, quality = 82) {
    const outputPath = inputPath.replace(/\.png$/i, '.webp');
    const inSize = statSync(inputPath).size;
    await sharp(inputPath).webp({ quality, effort: 4 }).toFile(outputPath);
    const outSize = statSync(outputPath).size;
    console.log(
        `${outputPath.replace(houseDir, '')} (${Math.round(outSize / 1024)}kb, was ${Math.round(inSize / 1024)}kb)`,
    );
}

async function main() {
    for (const file of ROOT_FILES) {
        await toWebp(join(houseDir, file));
    }

    const layerFiles = await readdir(layersDir);
    for (const file of layerFiles) {
        if (!file.endsWith('.png')) {
            continue;
        }
        await toWebp(join(layersDir, file));
    }

    console.log('WebP assets ready.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const input = join(root, 'public/image/house/house-stage-4.png');
const output = join(root, 'public/image/house/house-full.png');

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    // Remove near-white / light gray background, keep house pixels
    const isBackground =
        (r > 235 && g > 235 && b > 235) ||
        (r > 210 && g > 210 && b > 210 && saturation < 0.12);

    if (isBackground) {
        data[i + 3] = 0;
    } else if (r > 200 && g > 200 && b > 200 && saturation < 0.2) {
        // Soft edge feather for anti-aliased borders
        data[i + 3] = Math.round(255 * (1 - (r - 200) / 35));
    }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(output);

console.log(`Saved transparent house: ${output} (${info.width}x${info.height})`);

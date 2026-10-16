/**
 * Generates the social-sharing preview image (1200 × 630).
 *
 * Usage: node scripts/generate-social-image.mjs
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const logo = await readFile(resolve(root, 'public/assets/brand/logo.svg'));
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="8" fill="#fb0602"/>
  <g transform="translate(240, 90) scale(0.75)">
    ${logo.toString('utf-8').replace(/<\?xml[^>]*>/, '').replace(/<\/?svg[^>]*>/, '')}
  </g>
  <text x="600" y="380" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="52" font-weight="700" fill="#010067">
    IT Equipment, Technology &amp; Technical Support
  </text>
  <text x="600" y="440" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="28" font-weight="400" fill="#1a1a23">
    Supplies, Installation, Maintenance &amp; Support
  </text>
  <text x="600" y="500" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="22" font-weight="400" fill="#6e6e91">
    Ar-Rafiu Integrated Services Limited
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .resize(1200, 630, { fit: 'cover' })
  .toFile(resolve(root, 'public/assets/brand/social-share.png'));

console.log('Generated public/assets/brand/social-share.png (1200×630)');

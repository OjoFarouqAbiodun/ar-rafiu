/**
 * Generates the social-sharing preview image (1200 × 630 PNG).
 *
 * Usage: node scripts/generate-social-image.mjs
 *
 * The layout is driven entirely by the named constants below so the asset can
 * be reproduced or adjusted without hunting through the SVG markup. Only the
 * project's existing `sharp` dependency is used.
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/* ---------------------------------------------------------------- canvas -- */

const WIDTH = 1200;
const HEIGHT = 630;

const COLOR = {
  navy: '#010067',
  white: '#ffffff',
  red: '#fb0602',
  ink: '#1a1a23',
};

const FONT = "'Segoe UI', Arial, Helvetica, sans-serif";
const MARGIN = 72;
const CONTENT_RIGHT = WIDTH - MARGIN;

/* ----------------------------------------------------------- background -- */

// Full-width brand-red rule across the very top of the canvas.
const TOP_RULE = { height: 6 };

/* ----------------------------------------------------------------- logo -- */

// The logo artwork is navy and red, so it needs the white field to stay legible.
const LOGO = { x: MARGIN, y: 66, width: 340 };
const LOGO_VIEWBOX = { minX: 32, minY: 272, width: 1412, height: 256 };

/* ------------------------------------------------------------- headline -- */

const ACCENT_RULE = { x: MARGIN, y: 200, width: 56, height: 3 };

const HEADLINE = {
  x: MARGIN,
  firstBaseline: 276,
  lineHeight: 68,
  size: 56,
  weight: 700,
  lines: ['IT equipment,', 'technology & support'],
};

/* ----------------------------------------------------------- categories -- */

const CATEGORY = {
  size: 20,
  weight: 600,
  tickWidth: 40,
  tickHeight: 3,
  ruleY: 418,
  baseline: 456,
  // Four evenly spaced columns that fit within the 72px safe margins.
  columns: [MARGIN, 336, 600, 864],
  items: [
    'Computers & servers',
    'CCTV & biometrics',
    'Solar & power backup',
    'Networking & IT support',
  ],
};

/* ------------------------------------------------------------------- cta -- */

const CTA = {
  x: MARGIN,
  baseline: 512,
  size: 20,
  weight: 700,
  label: 'Enquire on WhatsApp ',
  arrow: '→',
};

/* ---------------------------------------------------------------- footer -- */

const FOOTER = {
  height: 90,
  legal: 'Ar-Rafiu Integrated Services Limited',
  site: 'ar-rafiu.vercel.app',
  size: 18,
  siteSize: 16,
};
const FOOTER_Y = HEIGHT - FOOTER.height;
const FOOTER_BASELINE = FOOTER_Y + FOOTER.height / 2 + 6;

/* ------------------------------------------------------------- rendering -- */

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Scale the logo to the target box and shift by its viewBox origin so the
// artwork (not the viewBox) aligns to LOGO.x / LOGO.y.
const logoScale = LOGO.width / LOGO_VIEWBOX.width;
const logoTranslateX = LOGO.x - LOGO_VIEWBOX.minX * logoScale;
const logoTranslateY = LOGO.y - LOGO_VIEWBOX.minY * logoScale;

// Pull the inner markup out of the logo file, discarding the XML declaration
// and the outer <svg> wrapper (the bug in the previous version).
const logoSource = await readFile(resolve(root, 'public/assets/brand/logo.svg'), 'utf-8');
const logoInner = (logoSource.match(/<svg[^>]*>([\s\S]*?)<\/svg>/s) ?? [null, logoSource])[1];

const headline = HEADLINE.lines
  .map((line, index) => {
    const y = HEADLINE.firstBaseline + index * HEADLINE.lineHeight;
    return `  <text x="${HEADLINE.x}" y="${y}" font-family="${FONT}" font-size="${HEADLINE.size}" font-weight="${HEADLINE.weight}" fill="${COLOR.navy}">${escapeXml(line)}</text>`;
  })
  .join('\n');

const categories = CATEGORY.items
  .map((label, index) => {
    const x = CATEGORY.columns[index];
    return [
      `  <rect x="${x}" y="${CATEGORY.ruleY}" width="${CATEGORY.tickWidth}" height="${CATEGORY.tickHeight}" fill="${COLOR.red}"/>`,
      `  <text x="${x}" y="${CATEGORY.baseline}" font-family="${FONT}" font-size="${CATEGORY.size}" font-weight="${CATEGORY.weight}" fill="${COLOR.ink}">${escapeXml(label)}</text>`,
    ].join('\n');
  })
  .join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.white}"/>
  <rect width="${WIDTH}" height="${TOP_RULE.height}" fill="${COLOR.red}"/>

  <g transform="translate(${logoTranslateX.toFixed(3)} ${logoTranslateY.toFixed(3)}) scale(${logoScale.toFixed(5)})">
    ${logoInner}
  </g>

  <rect x="${ACCENT_RULE.x}" y="${ACCENT_RULE.y}" width="${ACCENT_RULE.width}" height="${ACCENT_RULE.height}" fill="${COLOR.red}"/>

${headline}

${categories}

  <text x="${CTA.x}" y="${CTA.baseline}" font-family="${FONT}" font-size="${CTA.size}" font-weight="${CTA.weight}" fill="${COLOR.navy}">${escapeXml(CTA.label)}<tspan fill="${COLOR.red}">${escapeXml(CTA.arrow)}</tspan></text>

  <rect x="0" y="${FOOTER_Y}" width="${WIDTH}" height="${FOOTER.height}" fill="${COLOR.navy}"/>
  <text x="${MARGIN}" y="${FOOTER_BASELINE}" font-family="${FONT}" font-size="${FOOTER.size}" fill="${COLOR.white}">${escapeXml(FOOTER.legal)}</text>
  <text x="${CONTENT_RIGHT}" y="${FOOTER_BASELINE}" text-anchor="end" font-family="${FONT}" font-size="${FOOTER.siteSize}" fill="${COLOR.white}">${escapeXml(FOOTER.site)}</text>
</svg>`;

const outPath = resolve(root, 'public/assets/brand/social-share-2.png');

await sharp(Buffer.from(svg)).png().resize(WIDTH, HEIGHT, { fit: 'cover' }).toFile(outPath);

console.log(`Generated ${outPath} (${WIDTH}×${HEIGHT})`);

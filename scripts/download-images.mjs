/**
 * Finite downloader for the planned imagery in image-manifest.json.
 *
 * The manifest is the single source of truth: this script downloads exactly the
 * entries it lists and creates exactly the directories those entries name. It
 * never searches, never picks images, and never invents URLs — selecting the
 * photograph is a human step (PRD section 27.12), performed by filling an
 * entry's `imageUrl` after reviewing the photo against its `subject`.
 *
 * Deliberate constraints:
 *
 * 1. No dependencies. Node 22+ ships a global `fetch`, so downloading needs
 *    nothing from npm (FRONTEND-CORE-RULES 19).
 * 2. No network for entries that are not ready. An entry with `imageUrl: null`
 *    is reported as pending without any request, so running this before the
 *    URLs are filled costs nothing and still fails clearly.
 * 3. One attempt per asset, with a 30-second timeout. No retries: a repeated
 *    failure is reported, not hammered (AGENTS.md 4.1 and 12).
 * 4. Existing files are never overwritten silently. Re-downloading requires
 *    the explicit `--force` flag.
 * 5. Only the licensed CDNs named in the manifest policy are accepted:
 *    images.pexels.com and images.unsplash.com (PRD section 27.3). A page URL
 *    or an unknown host is rejected before any request is made.
 * 6. Bytes are validated (JPEG magic, plausible size) so an error page can
 *    never be saved under an image filename.
 *
 * Usage:
 *   node scripts/download-images.mjs                    # scripts/image-manifest.json
 *   node scripts/download-images.mjs path/to/manifest.json
 *   node scripts/download-images.mjs --force            # overwrite existing files
 *
 * Exit code 0 only when every entry is present on disk (freshly downloaded or
 * already there). Exit code 1 when anything failed or is still pending, with a
 * per-asset reason. Never prompts for input.
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_MANIFEST = join(ROOT, 'scripts', 'image-manifest.json');
const REQUEST_TIMEOUT_MS = 30_000;
const MIN_BYTES = 10_000;

/** The only hosts an `imageUrl` may point at, per PRD section 27.3. */
const ALLOWED_HOSTS = {
  pexels: ['images.pexels.com'],
  unsplash: ['images.unsplash.com', 'plus.unsplash.com'],
};

const args = process.argv.slice(2);
const force = args.includes('--force');
const unknownFlags = args.filter((a) => a.startsWith('--') && a !== '--force');
const manifestPath = args.find((a) => !a.startsWith('--')) ?? DEFAULT_MANIFEST;

if (unknownFlags.length) {
  console.error(`Unknown option: ${unknownFlags[0]} (only --force is recognised).`);
  process.exit(1);
}

/** Validate one entry; returns a list of problems, empty when usable. */
function validate(entry, index) {
  const label = entry?.id ?? `entry #${index}`;
  const problems = [];
  if (!entry || typeof entry !== 'object') return [`${label}: not an object`];
  if (!entry.id) problems.push(`${label}: missing "id"`);
  if (typeof entry.target !== 'string' || !/^\/assets\/.+\.(jpg|jpeg)$/i.test(entry.target)) {
    problems.push(`${label}: "target" must be a site path under /assets/ ending in .jpg`);
  }
  if (typeof entry.subject !== 'string' || !entry.subject) {
    problems.push(`${label}: missing "subject" (the photo must be checked against it)`);
  }
  if (entry.imageUrl == null) return problems; // pending, reported later

  let url;
  try {
    url = new URL(entry.imageUrl);
  } catch {
    problems.push(`${label}: "imageUrl" is not a valid URL`);
    return problems;
  }
  if (url.protocol !== 'https:') problems.push(`${label}: "imageUrl" must be https`);
  const allowed = ALLOWED_HOSTS[entry.source];
  if (!allowed) {
    problems.push(`${label}: "source" must be one of ${Object.keys(ALLOWED_HOSTS).join(', ')}`);
  } else if (!allowed.includes(url.hostname)) {
    problems.push(
      `${label}: host ${url.hostname} is not allowed for source "${entry.source}" ` +
        `(expected ${allowed.join(' or ')})`,
    );
  }
  return problems;
}

/** One-shot download with validation. Throws with a human-readable reason. */
async function download(entry) {
  const url = new URL(entry.imageUrl);
  const response = await fetch(url, {
    headers: { Accept: 'image/jpeg' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url.hostname}`);

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`content-type "${contentType}" is not an image — this looks like a page URL, not a direct image URL`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < MIN_BYTES) throw new Error(`only ${bytes.length} bytes — too small to be the photograph`);
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isJpeg) throw new Error('bytes are not JPEG — append &fm=jpg (Unsplash) or request JPEG from the source');

  return bytes;
}

// A BOM is stripped first: Windows editors sometimes save JSON as "UTF-8 with
// BOM", which JSON.parse rejects, and the reason should be said plainly.
const rawManifest = (await readFile(manifestPath, 'utf8')).replace(/^\uFEFF/, '');
let manifest;
try {
  manifest = JSON.parse(rawManifest);
} catch (error) {
  console.error(`${manifestPath} is not valid JSON: ${error.message}`);
  process.exit(1);
}
const entries = Array.isArray(manifest?.entries) ? manifest.entries : null;
if (!entries || entries.length === 0) {
  console.error(`${manifestPath}: no "entries" array found.`);
  process.exit(1);
}

const structural = entries.flatMap((entry, i) => validate(entry, i));
if (structural.length) {
  console.error('Manifest problems (nothing was downloaded):');
  for (const problem of structural) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`${manifestPath}: ${entries.length} planned images`);

const downloaded = [];
const existing = [];
const pending = [];
const failed = [];

for (const entry of entries) {
  const diskPath = join(ROOT, 'public', entry.target.slice(1));

  if (existsSync(diskPath)) {
    if (!force) {
      existing.push(entry);
      console.log(`SKIP  ${entry.target} (already exists; use --force to replace)`);
      continue;
    }
  }

  if (entry.imageUrl == null) {
    pending.push(entry);
    console.log(`WAIT  ${entry.target} — imageUrl not set; pick a photo at ${entry.sourceUrl}`);
    continue;
  }

  try {
    const bytes = await download(entry);
    await mkdir(dirname(diskPath), { recursive: true });
    await writeFile(diskPath, bytes);
    const size = (await stat(diskPath)).size;
    downloaded.push(entry);
    console.log(`OK    ${entry.target} (${(size / 1024).toFixed(0)} KB)`);
    if (!entry.attribution) {
      console.log(`      note: record photographer and photo page URL in attribution for "${entry.id}"`);
    }
  } catch (error) {
    failed.push(entry);
    console.error(`FAIL  ${entry.target} — ${error.message}`);
  }
}

console.log('');
console.log(
  `Done: ${downloaded.length} downloaded, ${existing.length} already present, ` +
    `${pending.length} pending, ${failed.length} failed.`,
);

if (pending.length) {
  console.log('');
  console.log('Pending entries need their imageUrl filled from the sourceUrl first:');
  for (const entry of pending) console.log(`  - ${entry.id}: ${entry.sourceUrl}`);
}

if (failed.length) {
  console.log('');
  console.log('Failed downloads:');
  for (const entry of failed) console.log(`  - ${entry.id}: ${entry.imageUrl}`);
}

if (pending.length || failed.length) process.exit(1);

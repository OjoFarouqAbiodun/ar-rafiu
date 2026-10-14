# Ar-Rafiu Integrated Services Limited — Website

Company website for Ar-Rafiu Integrated Services Limited, covering the IT
equipment and technology it supplies and the installation, maintenance, repair
and replacement services it provides.

**Status:** V1. The contact details are the confirmed ones supplied by the
company; product and service imagery is representative stock photography (see
Product and service imagery below), and no production domain has been set.

Visitors reach the company through WhatsApp, so every product, service and
contact path leads to a pre-filled WhatsApp enquiry.

## Stack

- **Astro** — static site output, no server runtime.
- **TypeScript** — strict, checked with `astro check`.
- **Plain CSS** — design tokens and base styles, plus component-scoped styles.
  No CSS framework or preprocessor.
- **Self-hosted fonts** — Archivo and IBM Plex Sans, served from
  `node_modules` via `@fontsource-variable` and copied into the build. No
  third-party font CDN.
- **Static output** — `npm run build` writes plain files to `dist/`.

There is no backend, database, or server-side code of any kind.

## Requirements

- **Node.js 22.12.0 or newer** (`engines` in `package.json`).
- **npm**, which ships with Node.
- **Google Chrome** installed locally — only for the verification harness.

A `package-lock.json` is committed, so use `npm ci` to install the exact
resolved dependency tree.

## Local setup

```bash
npm ci
npm run check
npm run build
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload. Long-running; stop it yourself. |
| `npm run check` | Type-check `.ts` and `.astro` files. |
| `npm run build` | Build the static site into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally to check the production output. |

`dist/` and `.astro/` are build output and are gitignored.

## Project structure

```text
src/
  pages/          Routes. Static pages plus the two dynamic routes
                  products/[category].astro and services/[service].astro.
  components/     Astro components. home/ holds the homepage sections.
  data/           Structured content: company.ts, equipment.ts, services.ts,
                  enquiry.ts (homepage enquiry topics), navigation.ts.
  lib/            Pure TypeScript helpers: whatsapp.ts builds every enquiry
                  URL, seo.ts builds page metadata.
  scripts/        site.ts — the only client script. Navigation and the
                  enquiry form. Each feature initialises independently.
  styles/         fonts.css, tokens.css (design tokens), base.css.
public/           Files copied verbatim, including robots.txt and assets/.
scripts/
  verify.mjs          Automated verification harness. See Verification below.
  image-manifest.json The representative photography: one entry per image slot.
  download-images.mjs Downloads the manifest entries. See Product and
                      service imagery below.
```

Pages are built from the structured data in `src/data`. Adding an equipment
item or a service to those files is enough to create its page, list it on the
relevant index page, and add it to the enquiry form's options.

## Updating company details

The contact details are confirmed company information. They are all held in
one place:

```text
src/data/company.ts
```

That file holds the WhatsApp number, the phone number, the email address, the
business address, the business hours and the service area. A single edit there
updates every WhatsApp link, telephone link and email link across the site —
header, footer, contact page and enquiry form — because the pages read from
this file rather than repeating the values.

Details the company has not supplied (history, founding year, certifications,
registration numbers, partners, social accounts) are deliberately absent
rather than filled in. Add them to the same file and the relevant page once
the company provides them.

## Brand assets

Official brand files live in `public/`:

```text
public/assets/brand/logo.svg   Header and footer logo
public/favicon.svg             Favicon
public/favicon-32x32.png       Raster favicon
public/apple-touch-icon.png    Touch icon
```

These are the supplied brand assets and are used as-is. Do not recolour,
redraw, crop or otherwise restyle them; change the surrounding layout instead.
Site colours are defined as tokens in `src/styles/tokens.css`.

Product and service imagery is representative stock photography installed from
the manifest described under Product and service imagery below; the labelled
placeholder (`src/components/PlaceholderMedia.astro`) remains as the fallback
for any slot without an image. Replace the imagery with official photography
once it exists — do not present stock or generated imagery as the company's
own.

## Product and service imagery

The photographs each page needs are recorded in one file:

```text
scripts/image-manifest.json
```

Each entry names the slot (`id`), where the file lives (`target`, a path under
`public/`), what the photograph must show (`subject`), and a search page on the
source platform (`sourceUrl`). All 33 entries are currently installed. Selecting
a photograph is a human step: review candidates against the entry's `subject`,
then record the direct image URL in `imageUrl` and the photographer and photo
page in `attribution`.

Download the files with:

```bash
node scripts/download-images.mjs
```

The script downloads only from the licensed CDNs named in the manifest
policy, validates the bytes before writing anything, never overwrites an
existing file unless `--force` is given, and makes no network requests for
entries whose `imageUrl` is still empty. It exits non-zero while any entry is
missing or failed, so an incomplete set cannot pass unnoticed. Select photos
according to PRD section 27 (representative imagery, not presented as the
company's own, replaced when official photography arrives).

## Enquiries

An enquiry is composed in the browser and handed off to WhatsApp:

1. The visitor fills in the general enquiry form, or follows a product or
   service link that already names the item.
2. The details are assembled into a message in the page.
3. The visitor is taken to WhatsApp with that message pre-filled, and they read
   it and decide whether to send it.

Nothing is sent to this website. There is no backend, no database, no
WhatsApp API and no chatbot, so there is no stored enquiry and no confirmation
state. Message assembly lives in `src/lib/whatsapp.ts` and the form lives in
`src/components/EnquiryForm.astro`.

The form is revealed by `src/scripts/site.ts`. Without JavaScript the form is
not shown and a direct WhatsApp link is offered instead.

## Verification

Run in order:

```bash
npm run check
npm run build
node scripts/verify.mjs
```

- **`npm run check`** — `astro check`. Reports TypeScript and template errors.
- **`npm run build`** — builds to `dist/`. Must run before the harness, which
  tests the built output.
- **`node scripts/verify.mjs`** — serves `dist/` from a local HTTP server,
  drives a local Chrome over the Chrome DevTools Protocol, and runs a list of
  named checks covering routes and console errors, horizontal overflow at
  several widths, images and alt text, `aria-current` marking, the header
  breakpoint, mobile navigation and Escape/focus behaviour, footer layout,
  colour contrast, the 404 page, and the enquiry form's WhatsApp URL. Each
  check reports PASS or FAIL. It needs `npm run build` to have run, and a
  local Chrome install.

The harness is automated. It is not a substitute for reviewing the site
visually in a real browser on real devices, which has not been done.

There is no test runner, linter or formatter configured, and no `verify` npm
script — run the harness directly with `node` as shown.

## Deployment

`npm run build` produces a self-contained `dist/` directory of static files.
Deploy it to any static host. No application server is required.

The production domain has not been confirmed. Once it is, complete the
following in `astro.config.mjs` and the site metadata:

- Set Astro's `site` option to the production origin.
- Add canonical URLs, `og:url` and the Open Graph image.
- Add a sitemap, and reference it from `public/robots.txt`.

Until the domain exists, those URL-dependent values are deliberately omitted
rather than guessed.

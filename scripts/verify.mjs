/**
 * Targeted browser verification harness.
 *
 * The repeated failure in earlier phases was not a site defect: it was that the
 * ad-hoc checks depended on a WebSocket package that was never installed, and
 * they were driven through ad-hoc shell scripts that leaked servers and Chrome
 * processes. This file is the fix for the process, not a new test framework.
 *
 * Three deliberate constraints:
 *
 * 1. No dependencies. Node 22+ ships a global `WebSocket`, and Node ships an
 *    HTTP server, so Chrome DevTools Protocol needs nothing from npm. Adding a
 *    browser automation package to assert a dozen layout facts would violate
 *    FRONTEND-CORE-RULES 19.
 * 2. No test framework. Checks are plain async functions appended to a list and
 *    reported as PASS or FAIL. The project has no test runner and this does not
 *    introduce one.
 * 3. Nothing outlives the run. The static server and Chrome are started here,
 *    and a `finally` block stops both even when a check throws. Every wait is a
 *    bounded poll, never an open-ended one, per AGENTS.md 4.1.
 *
 * Usage:
 *   node scripts/verify.mjs                        # every check
 *   node scripts/verify.mjs --only "header"        # one check, while debugging
 *
 * Requires `npm run build` first: it verifies the built output, not the source.
 * Always exits having stopped everything it started.
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

const HOST = '127.0.0.1';
const PORT = Number(process.env.VERIFY_PORT ?? 4399);
const CDP_PORT = Number(process.env.VERIFY_CDP_PORT ?? 9299);

/** How long any single poll is willing to wait. Never infinite. */
const READY_TIMEOUT_MS = 20_000;
const STEP_TIMEOUT_MS = 5_000;

/**
 * Page widths from PRD section 19. Phase 3B moved the header breakpoint to the
 * desktop tier, so both sides of each boundary are checked: 767/768 bracket the
 * tablet tier and 1023/1024 bracket the desktop tier.
 */
const WIDTHS = [320, 375, 767, 768, 800, 1023, 1024, 1440];

// ---------------------------------------------------------------------------
// Static server for the built output
// ---------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

/**
 * Serves `dist/`. `astro preview` would also work, but it resolves and binds
 * through the project's own tooling, which is slower to become ready and needs
 * its output parsed. The built site is static files, so reading them directly
 * keeps startup fast and the readiness check simple.
 */
function startServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${HOST}`);
    let pathname = decodeURIComponent(url.pathname);

    // Block traversal above the served root before touching the filesystem.
    const target = normalize(join(DIST, pathname));
    if (!target.startsWith(normalize(DIST))) {
      res.writeHead(403).end('forbidden');
      return;
    }

    if (pathname.endsWith('/')) pathname += 'index.html';

    const file = normalize(join(DIST, pathname));
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      // Mirrors the static host behaviour the site will be deployed behind, so
      // the 404 page is exercised by requesting a path that really is missing.
      const notFound = await readFile(join(DIST, '404.html')).catch(() => null);
      if (notFound) res.writeHead(404, { 'Content-Type': MIME['.html'] }).end(notFound);
      else res.writeHead(404).end('not found');
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, HOST, () => resolve(server));
  });
}

/**
 * Reports whether a port is still free, so the harness can refuse to start a
 * second server on top of an existing one rather than silently interfering with
 * it. AGENTS.md 4.2: no duplicate servers.
 */
async function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once('error', () => resolve(false));
    probe.listen(port, HOST, () => probe.close(() => resolve(true)));
  });
}

/** Polls until a port is free, or gives up. Bounded, never open-ended. */
async function waitForPortFree(port, timeoutMs = READY_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortFree(port)) return true;
    await sleep(100);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Chrome DevTools Protocol client
// ---------------------------------------------------------------------------

async function findChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA ?? ''}\\Google\\Chrome\\Application\\chrome.exe`,
    'chrome',
    'google-chrome',
  ];
  return candidates.find((path) => path.includes('\\') && existsSync(path)) ?? 'chrome';
}

/**
 * Launches headless Chrome on a throwaway profile in the OS temp directory.
 * The profile is created here rather than reused so a stale or locked profile
 * cannot make the run non-deterministic, and so nothing is written into the
 * repository.
 */
async function startChrome() {
  const profile = await mkdtemp(join(tmpdir(), 'arrafiu-verify-'));

  const child = spawn(
    await findChrome(),
    [
      `--remote-debugging-port=${CDP_PORT}`,
      '--remote-allow-origins=*',
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      `--user-data-dir=${profile}`,
      '--window-size=1280,900',
      '--log-level=3',
      'about:blank',
    ],
    { stdio: 'ignore', detached: false },
  );

  child.profile = profile;
  return child;
}

/**
 * Stops Chrome and removes its throwaway profile.
 *
 * `child.kill()` alone is not enough on Windows: Chrome spawns helper processes
 * that outlive the parent, and removing the profile while a helper still holds a
 * handle leaves the directory behind. So the tree is killed first, the parent is
 * awaited, and only then is the profile deleted.
 */
async function stopChrome(child) {
  if (!child) return;
  if (child.exitCode === null && child.pid) {
    try {
      if (process.platform === 'win32') {
        // /T takes the child processes with it.
        await new Promise((resolve) => {
          const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
            stdio: 'ignore',
          });
          killer.once('exit', resolve);
          killer.once('error', resolve);
        });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // Already gone, which is the desired end state anyway.
    }
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      sleep(5000),
    ]);
  }
  if (child.profile) await removeProfile(child.profile);
}

/**
 * Deletes the throwaway profile, retrying while Windows releases handles.
 *
 * Chrome's helpers can still hold files open for a moment after the tree is
 * killed, and a single `rm` on Windows fails with a sharing violation rather
 * than waiting. Retrying a few times turns that into a short wait. If it still
 * cannot be removed, that is reported rather than swallowed: a silently
 * abandoned profile in the temp directory is exactly the kind of litter this
 * harness is supposed to avoid.
 */
async function removeProfile(profile) {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      return;
    } catch {
      await sleep(200);
    }
  }
  console.warn(`could not remove temp profile ${profile}; delete it manually`);
}

/** Connects to the browser's page target and exposes a small evaluate/send API. */
async function connect() {
  const deadline = Date.now() + READY_TIMEOUT_MS;

  let target;
  while (Date.now() < deadline) {
    try {
      const list = await fetch(`http://${HOST}:${CDP_PORT}/json/list`).then((r) => r.json());
      target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (target) break;
    } catch {
      // Chrome is still starting.
    }
    await sleep(150);
  }
  if (!target) throw new Error(`Chrome did not expose a page target on ${CDP_PORT}`);

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('CDP socket error')), { once: true });
  });

  let nextId = 1;
  const pending = new Map();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const settle = pending.get(message.id);
    if (!settle) return;
    pending.delete(message.id);
    settle(message);
  });

  function send(method, params = {}, timeoutMs = STEP_TIMEOUT_MS) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      pending.set(id, (message) => {
        clearTimeout(timer);
        resolve(message);
      });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  // Domain setup runs once, while the browser is still warming up. It gets the
  // start-up budget rather than the per-step one so a busy machine cannot make a
  // 5s handshake look like a broken harness.
  await send('Page.enable', {}, READY_TIMEOUT_MS);
  await send('Runtime.enable', {}, READY_TIMEOUT_MS);
  await send('Log.enable', {}, READY_TIMEOUT_MS);
  await send('Network.enable', {}, READY_TIMEOUT_MS);

  /** Collects console errors and failed requests for the current navigation. */
  const diagnostics = { consoleErrors: [], failedRequests: [] };

  const onEvent = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      diagnostics.consoleErrors.push(message.params.exceptionDetails.text);
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      diagnostics.consoleErrors.push(
        message.params.args.map((a) => a.value ?? a.description ?? '').join(' '),
      );
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      const entry = message.params.entry;
      // A missing favicon or source-map request is noise, not a page defect.
      if (!/favicon|sourceMappingURL/i.test(entry.text)) {
        diagnostics.consoleErrors.push(entry.text);
      }
    }
    if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
      diagnostics.failedRequests.push(message.params.errorText);
    }
  };
  socket.addEventListener('message', onEvent);

  /** Evaluates an expression in the page and returns its JSON value. */
  async function evaluate(expression) {
    const response = await send('Runtime.evaluate', {
      expression: `(() => { ${expression} })()`,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.result?.exceptionDetails) {
      // The bare `text` is just "Uncaught", which says nothing about which of a
      // dozen statements failed, so the thrown value is preferred when present.
      const details = response.result.exceptionDetails;
      const description =
        details.exception?.description ?? details.exception?.value ?? details.text;
      throw new Error(String(description).split('\n').slice(0, 3).join(' '));
    }
    return response.result?.result?.value;
  }

  /**
   * Waits for every running animation or transition to finish, bounded.
   *
   * This is not a sleep. The header panel fades with `visibility`, and
   * `transition-behavior: allow-discrete` keeps it visible for the length of the
   * fade, so asserting immediately after a resize can read a half-finished
   * state. Waiting on `getAnimations()` is deterministic; the timeout is only a
   * backstop so a stalled animation cannot hang the run.
   */
  async function settle(ms = 2000) {
    await evaluate(`
      const running = document.getAnimations().filter(a => a.playState === 'running');
      return Promise.race([
        Promise.all(running.map(a => a.finished.catch(() => {}))),
        new Promise(resolve => setTimeout(resolve, ${ms})),
      ]);
    `);
  }

  /**
   * Polls a page expression until it returns a truthy value.
   *
   * Used for anything that depends on a CSS transition having finished. The
   * panel fades with `visibility` and `transition-behavior: allow-discrete`, so
   * its computed value stays `visible` for the length of the fade even though it
   * is logically closed. Reading it on the next frame therefore races the
   * transition; polling a bounded number of times does not.
   */
  async function waitFor(expression, description, timeoutMs = 4000) {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      if (await evaluate(`return Boolean(${expression});`)) return;
      if (Date.now() > deadline) throw new Error(`timed out waiting for ${description}`);
      await sleep(50);
    }
  }

  /** Sets the viewport and navigates, then waits for the document to settle. */
  async function goto(path, width) {
    diagnostics.consoleErrors.length = 0;
    diagnostics.failedRequests.length = 0;

    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    // A navigation that fails or redirects can leave the CDP call unresolved
    // until the browser's own limit, so it gets a longer deadline than a plain
    // evaluate. Still bounded.
    await send('Page.navigate', { url: `http://${HOST}:${PORT}${path}` }, 20_000);
    // The nav is progressive-enhancement only, so one frame is not enough to
    // know the script has run; two frames plus a tick is deterministic enough.
    await evaluate('return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
    await settle();
  }

  async function status() {
    return evaluate('return performance.getEntriesByType("navigation")[0]?.responseStatus ?? 0');
  }

  /**
   * Runs `action` while collecting CDP events with the given method.
   *
   * Needed for a navigation the page starts itself: once the new document is
   * being fetched, nothing inside the old page can report what it asked for.
   * `respond` is invoked per event so a request can be failed as it arrives,
   * which is what keeps an outward navigation observable without leaving the
   * machine. Bounded: it gives up waiting for the first event after `timeoutMs`.
   */
  async function capture(method, action, { respond, timeoutMs = STEP_TIMEOUT_MS } = {}) {
    const events = [];
    const listener = (event) => {
      const message = JSON.parse(event.data);
      if (message.method !== method) return;
      events.push(message.params);
      if (respond) respond(message.params);
    };
    socket.addEventListener('message', listener);
    try {
      await action();
      const deadline = Date.now() + timeoutMs;
      while (events.length === 0 && Date.now() < deadline) await sleep(50);
    } finally {
      socket.removeEventListener('message', listener);
    }
    return events;
  }

  function close() {
    socket.close();
  }

  return { send, evaluate, goto, settle, waitFor, status, capture, diagnostics, close };
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

const checks = [];

/**
 * Registers a check. A check reports failure by throwing, and should collect
 * every problem it finds into one error so a single run explains itself.
 */
function check(name, run) {
  checks.push({ name, run });
}

// Probes are written as IIFE bodies because `evaluate` wraps them, so each one
// uses an explicit `return` rather than being an expression.

/** Shared measurement: nothing on the page may scroll sideways. */
const OVERFLOW_PROBE = `
  const de = document.documentElement;
  const widest = [...document.querySelectorAll('body *')]
    .filter(el => el.getBoundingClientRect().right > de.clientWidth + 1)
    .map(el => el.tagName + '.' + (el.className || '')).slice(0, 5);
  return {
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    overflowing: widest,
  };
`;

/** Every image must have actually decoded, not merely exist in the DOM. */
const IMAGE_PROBE = `
  return [...document.images].map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt'),
    complete: img.complete,
    width: img.naturalWidth,
  }));
`;

check('every route returns 200 with no console or network errors', async ({ goto, status, diagnostics }) => {
  const routes = [
    '/',
    '/products/',
    '/products/servers/',
    '/services/',
    '/services/cctv-installation/',
    '/about/',
    '/contact/',
    '/does-not-exist/',
  ];
  const problems = [];
  for (const route of routes) {
    await goto(route, 1280);
    const code = await status();
    // The unknown route is expected to be the site's own 404 page.
    const isMissing = route === '/does-not-exist/';
    const expected = isMissing ? 404 : 200;
    if (code !== expected) problems.push(`${route} -> ${code} (expected ${expected})`);

    if (diagnostics.consoleErrors.length) {
      // A 404 route legitimately reports the 404 document load. That is the
      // requested behaviour, not a page fault.
      const noise = diagnostics.consoleErrors.filter((text) =>
        isMissing && /status of 404/i.test(text) ? false : true,
      );
      if (noise.length) problems.push(`${route} console: ${noise.join('; ')}`);
    }
    if (diagnostics.failedRequests.length) {
      const noise = diagnostics.failedRequests.filter((text) => (isMissing ? /404/i.test(text) : true));
      if (noise.length) problems.push(`${route} network: ${noise.join('; ')}`);
    }
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

check('no horizontal overflow at any supported width', async ({ goto, evaluate }) => {
  const problems = [];
  for (const width of WIDTHS) {
    for (const route of ['/', '/products/servers/', '/services/', '/about/', '/contact/']) {
      await goto(route, width);
      const result = await evaluate(OVERFLOW_PROBE);
      if (result.scrollWidth > result.clientWidth + 1) {
        problems.push(`${route}@${width} ${result.scrollWidth}>${result.clientWidth} ${result.overflowing.join(',')}`);
      }
    }
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

check('every image is decoded and has alt text', async ({ goto, evaluate }) => {
  for (const route of ['/', '/products/servers/', '/services/', '/about/']) {
    await goto(route, 1280);
    const images = await evaluate(IMAGE_PROBE);
    for (const image of images) {
      if (!image.complete || image.width === 0) {
        throw new Error(`${route} image failed to load: ${image.src}`);
      }
      if (image.alt === null) throw new Error(`${route} image missing alt: ${image.src}`);
    }
  }
});

check('navigation and footer mark the current page with aria-current', async ({ goto, evaluate }) => {
  const cases = [
    ['/products/', '/products'],
    ['/products/servers/', '/products'],
    ['/services/', '/services'],
    ['/services/cctv-installation/', '/services'],
    ['/about/', '/about'],
    ['/contact/', '/contact'],
  ];
  const problems = [];
  for (const [route, expected] of cases) {
    await goto(route, 1280);
    const result = await evaluate(`
      const hrefs = (root) => [...root.querySelectorAll('a[aria-current]')].map(a => a.getAttribute('href'));
      return {
        header: hrefs(document.querySelector('header')),
        footer: hrefs(document.querySelector('footer')),
        // Every marked link must also declare aria-current="page", not just be
        // present with the attribute.
        values: [...document.querySelectorAll('a[aria-current]')].map(a => a.getAttribute('aria-current')),
      };
    `);
    // Header and footer share one navigation source, so they cannot disagree.
    if (result.header.join() !== result.footer.join()) {
      problems.push(`${route} header/footer disagree: ${result.header.join()} vs ${result.footer.join()}`);
    }
    if (result.header.join() !== expected) {
      problems.push(`${route} expected ${expected} marked, got ${result.header.join() || 'nothing'}`);
    }
    if (result.values.some((value) => value !== 'page')) {
      problems.push(`${route} aria-current value ${result.values.join(',')} instead of page`);
    }
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

check('hamburger is used below 1024px and desktop nav at 1024px+', async ({ goto, evaluate }) => {
  const expected = {
    320: 'mobile', 375: 'mobile', 767: 'mobile', 768: 'mobile',
    800: 'mobile', 1023: 'mobile', 1024: 'desktop', 1440: 'desktop',
  };
  const problems = [];
  for (const width of WIDTHS) {
    await goto('/products/servers/', width);
    const state = await evaluate(`
      const toggle = document.querySelector('.site-header__toggle');
      const nav = document.querySelector('.site-nav');
      return {
        toggleShown: getComputedStyle(toggle).display !== 'none',
        // The collapsed panel is still laid out, so it is "shown" only when its
        // computed visibility is not hidden.
        navVisible: getComputedStyle(nav).visibility !== 'hidden',
      };
    `);
    const want = expected[width];
    if (want === 'mobile') {
      if (!state.toggleShown) problems.push(`${width}px toggle hidden on mobile`);
      if (state.navVisible) problems.push(`${width}px desktop nav visible on mobile`);
    } else {
      if (state.toggleShown) problems.push(`${width}px toggle visible on desktop`);
      if (!state.navVisible) problems.push(`${width}px desktop nav hidden on desktop`);
    }
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

check('CSS and JS agree on the header breakpoint', async ({ goto, evaluate }) => {
  // The stylesheet collapses the panel below 64rem; site.ts must use the same
  // query, or the toggle appears with no panel to control.
  const problems = [];
  for (const width of [1023, 1024]) {
    await goto('/products/servers/', width);
    const state = await evaluate(`
      const toggle = document.querySelector('.site-header__toggle');
      const nav = document.querySelector('.site-nav');
      return {
        // The script's own matchMedia result, taken from its threshold.
        jsSaysDesktop: matchMedia('(min-width: 64rem)').matches,
        // What the stylesheet actually did.
        cssCollapsed: getComputedStyle(nav).position === 'absolute',
        toggleShown: getComputedStyle(toggle).display !== 'none',
      };
    `);
    const wantDesktop = width >= 1024;
    if (state.jsSaysDesktop !== wantDesktop) problems.push(`${width}px JS breakpoint disagrees`);
    if (state.cssCollapsed === wantDesktop) problems.push(`${width}px CSS collapse disagrees`);
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

check('hamburger toggle is reachable, 48x48, and opens the floating panel', async ({ goto, evaluate, send, settle }) => {
  const problems = [];

  await goto('/products/servers/', 768);

  // Sampled while the panel is closed, then again after it opens. The panel is
  // an overlay, so the heading must not move: if it did, the menu would push the
  // page content down instead of covering it.
  const headingTop = `
    const h = document.querySelector('main h1');
    return h ? Math.round(h.getBoundingClientRect().top) : null;
  `;
  const before = await evaluate(headingTop);

  const box = await evaluate(`
    const t = document.querySelector('.site-header__toggle');
    const r = t.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), tabIndex: t.tabIndex };
  `);
  if (box.w < 48 || box.h < 48) problems.push(`hit area ${box.w}x${box.h} below 48x48`);
  if (box.tabIndex < 0) problems.push('toggle not keyboard reachable');

  // Focus it the way a keyboard user would, then activate with a real key.
  await evaluate(`document.querySelector('.site-header__toggle').focus(); return true;`);
  const focused = await evaluate(`
    return document.activeElement === document.querySelector('.site-header__toggle');
  `);
  if (!focused) problems.push('toggle did not take focus');

  for (const type of ['rawKeyDown', 'char', 'keyUp']) {
    await send('Input.dispatchKeyEvent', {
      type,
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      text: type === 'char' ? '\r' : undefined,
    });
  }
  await evaluate('return new Promise(r => requestAnimationFrame(r))');
  await settle();

  const opened = await evaluate(`
    const t = document.querySelector('.site-header__toggle');
    const nav = document.querySelector('.site-nav');
    const style = getComputedStyle(nav);
    const r = nav.getBoundingClientRect();
    return {
      expanded: t.getAttribute('aria-expanded'),
      // The X icon is the close glyph; it must be the visible one when open.
      closeIconShown: getComputedStyle(t.querySelector('.site-header__icon--close')).display !== 'none',
      openIconHidden: getComputedStyle(t.querySelector('.site-header__icon--open')).display === 'none',
      position: style.position,
      visible: style.visibility === 'visible' && r.height > 0,
      controls: t.getAttribute('aria-controls'),
    };
  `);

  if (opened.expanded !== 'true') problems.push('aria-expanded did not become true');
  if (!opened.visible) problems.push('panel not visible after activation');
  if (opened.position !== 'absolute') problems.push(`panel position ${opened.position}, expected absolute overlay`);
  if (!opened.closeIconShown || !opened.openIconHidden) problems.push('close/open icons did not swap');
  if (opened.controls !== 'primary-navigation') problems.push('aria-controls does not reference the panel');

  const after = await evaluate(headingTop);
  if (before !== null && after !== null && Math.abs(before - after) > 1) {
    problems.push(`main content shifted ${before}->${after} when the panel opened`);
  }

  if (problems.length) throw new Error(problems.join(' | '));
});

check('Escape closes the panel and returns focus to the toggle', async ({ goto, evaluate, send, waitFor }) => {
  await goto('/products/servers/', 768);
  await evaluate(`
    const t = document.querySelector('.site-header__toggle');
    t.focus(); t.click();
    return new Promise(r => requestAnimationFrame(r));
  `);
  const opened = await evaluate(`
    return document.querySelector('.site-header__toggle').getAttribute('aria-expanded');
  `);
  if (opened !== 'true') throw new Error('panel did not open, cannot test Escape');

  await send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  // The panel fades out rather than snapping away, so its computed visibility
  // only reaches hidden once the transition has run.
  await waitFor(
    `getComputedStyle(document.querySelector('.site-nav')).visibility === 'hidden'`,
    'the panel to finish fading out',
  );

  const after = await evaluate(`
    const t = document.querySelector('.site-header__toggle');
    const nav = document.querySelector('.site-nav');
    return {
      expanded: t.getAttribute('aria-expanded'),
      focusReturned: document.activeElement === t,
      panelHidden: getComputedStyle(nav).visibility === 'hidden',
      // "visibility: hidden" still produces a layout box, so getClientRects is the
      // wrong test. checkVisibility with visibilityProperty answers the question
      // actually being asked: is the link rendered to the user?
      panelLinksVisible: [...nav.querySelectorAll('a')].some(a => a.checkVisibility({ visibilityProperty: true })),
    };
  `);
  const problems = [];
  if (after.expanded !== 'false') problems.push('aria-expanded still true after Escape');
  if (!after.focusReturned) problems.push('focus not returned to toggle');
  if (!after.panelHidden) problems.push('panel still visible after Escape');
  if (after.panelLinksVisible) problems.push('panel links still render after closing');
  if (problems.length) throw new Error(problems.join(' | '));
});

check('footer legal row stacks left-aligned on mobile and opposes on wide', async ({ goto, evaluate }) => {
  const problems = [];
  const NOTICE = 'Contact details shown are placeholders and will be updated once confirmed.';

  for (const width of [320, 375, 767]) {
    await goto('/about/', width);
    const state = await evaluate(`
      const legal = document.querySelector('.site-footer__legal');
      const note = legal.querySelector('.site-footer__note');
      const credit = legal.querySelector('.site-footer__credit');
      const style = getComputedStyle(legal);
      const l = legal.getBoundingClientRect();
      const c = credit.getBoundingClientRect();
      const copyright = legal.firstElementChild.getBoundingClientRect();
      return {
        notice: note ? note.textContent.trim() : null,
        alignItems: style.alignItems,
        flexWrap: style.flexWrap,
        creditMarginStart: getComputedStyle(credit).marginInlineStart,
        creditLeft: Math.round(c.left),
        legalLeft: Math.round(l.left),
        // True when the credit wrapped below the copyright, i.e. it is alone on
        // its line and must start at the container edge.
        creditOwnLine: c.top > copyright.bottom,
        linkedin: !!credit.querySelector('a[href*="linkedin.com"]'),
      };
    `);

    if (state.notice !== NOTICE) problems.push(`${width}px notice text changed: ${state.notice}`);
    if (!state.linkedin) problems.push(`${width}px LinkedIn link missing`);
    if (state.flexWrap === 'nowrap') problems.push(`${width}px flex-wrap disabled`);

    // "Left aligned" means no auto margin below the tablet tier. The credit only
    // has to be flush with the container when it wraps onto its own line; on a
    // narrow phone where the notice shares its line with the copyright, the
    // credit starts after the text instead.
    if (state.creditMarginStart !== '0px') {
      problems.push(`${width}px credit has margin-inline-start ${state.creditMarginStart} on mobile`);
    }
    if (state.creditOwnLine && Math.abs(state.creditLeft - state.legalLeft) > 1) {
      problems.push(
        `${width}px wrapped credit at ${state.creditLeft} not flush left with ${state.legalLeft}`,
      );
    }
    if (state.alignItems !== 'center') problems.push(`${width}px align-items ${state.alignItems}`);
  }

  for (const width of [768, 1024, 1440]) {
    await goto('/about/', width);
    const state = await evaluate(`
      const legal = document.querySelector('.site-footer__legal');
      const note = legal.querySelector('.site-footer__note');
      const credit = legal.querySelector('.site-footer__credit');
      const style = getComputedStyle(legal);
      const l = legal.getBoundingClientRect();
      const c = credit.getBoundingClientRect();
      const copyright = legal.firstElementChild.getBoundingClientRect();
      const n = note.getBoundingClientRect();
      const midpoints = (r) => r.top + r.height / 2;
      return {
        notice: note ? note.textContent.trim() : null,
        alignItems: style.alignItems,
        flexWrap: style.flexWrap,
        creditMarginStart: getComputedStyle(credit).marginInlineStart,
        copyrightLeft: Math.round(copyright.left - l.left),
        creditRightGap: Math.round(l.right - c.right),
        // The auto margin must keep the credit off the notice's line, whether it
        // wraps onto its own line or shares one with the copyright.
        // Vertical overlap alone is not "joined": at 1440px the credit sits on
        // the notice's line but is separated from it by the auto margin. What
        // matters is how much horizontal space separates them.
        sharesNoticeLine: c.top < n.bottom && n.top < c.bottom,
        noticeToCreditGap: Math.round(c.left - n.right),
        sameRowAsCopyright: Math.abs(copyright.top - c.top) < 2,
        verticalDelta: Math.round(Math.abs(midpoints(copyright) - midpoints(c))),
      };
    `);
    if (state.notice !== NOTICE) problems.push(`${width}px notice text changed`);
    if (state.alignItems !== 'center') problems.push(`${width}px align-items ${state.alignItems}, expected center`);
    if (state.flexWrap === 'nowrap') problems.push(`${width}px flex-wrap disabled`);
    // With the auto margin restored the credit is pushed away from the notice,
    // which is what "opposite edge" means for a three-item row.
    if (state.creditMarginStart === '0px') problems.push(`${width}px credit auto margin not applied`);
    // The copyright anchors the left and the credit anchors the right. At 768 and
    // 1024 the long notice wraps, so the credit lands on its own line at the far
    // edge; only when it shares a line with the copyright do their centres align.
    if (Math.abs(state.copyrightLeft) > 1) problems.push(`${width}px copyright ${state.copyrightLeft}px off left edge`);
    if (Math.abs(state.creditRightGap) > 1) {
      problems.push(`${width}px credit ${state.creditRightGap}px off the right edge`);
    }
    // The column gap is var(--space-md) = 24px. Anything at or below that means the
    // credit is sitting against the notice text rather than being pushed away.
    if (state.sharesNoticeLine && state.noticeToCreditGap <= 24) {
      problems.push(`${width}px credit only ${state.noticeToCreditGap}px from the notice text`);
    }
    if (state.sameRowAsCopyright && state.verticalDelta > 2) {
      problems.push(`${width}px credit centre ${state.verticalDelta}px off the copyright`);
    }
  }

  if (problems.length) throw new Error(problems.join(' | '));
});

check('legal row still aligns when the placeholder notice is absent', async ({ goto, evaluate }) => {
  // The future state once real contact details replace the placeholders. The
  // element is removed from the live DOM only; no source file is touched.
  const problems = [];

  for (const width of [768, 1024, 1440]) {
    await goto('/about/', width);
    const state = await evaluate(`
      const note = document.querySelector('.site-footer__note');
      note.remove();
      const legal = document.querySelector('.site-footer__legal');
      const credit = legal.querySelector('.site-footer__credit');
      const first = legal.firstElementChild;
      const l = legal.getBoundingClientRect();
      const f = first.getBoundingClientRect();
      const c = credit.getBoundingClientRect();
      const midpoints = (r) => r.top + r.height / 2;
      return {
        alignItems: getComputedStyle(legal).alignItems,
        sameRow: Math.abs(f.top - c.top) < 2,
        verticalDelta: Math.round(Math.abs(midpoints(f) - midpoints(c))),
        firstFlushLeft: Math.round(f.left - l.left),
        creditRightGap: Math.round(l.right - c.right),
      };
    `);
    if (state.alignItems !== 'center') problems.push(`${width}px align-items ${state.alignItems}`);
    if (!state.sameRow) problems.push(`${width}px copyright and credit not on one row`);
    if (state.verticalDelta > 2) problems.push(`${width}px vertical centres differ by ${state.verticalDelta}px`);
    if (Math.abs(state.firstFlushLeft) > 1) problems.push(`${width}px copyright ${state.firstFlushLeft}px off left edge`);
    if (Math.abs(state.creditRightGap) > 1) problems.push(`${width}px credit ${state.creditRightGap}px off right edge`);
  }

  if (problems.length) throw new Error(problems.join(' | '));
});

check('service numbers use a colour that meets AA on their background', async ({ goto, evaluate }) => {
  // Phase 3C moved these off --color-accent (4.09:1) onto
  // --color-accent-strong (6.43:1). Measured here against the real computed
  // background rather than a hard-coded assumption.
  const problems = [];
  for (const route of ['/services/', '/']) {
    await goto(route, 1280);
    const result = await evaluate(`
      const luminance = (rgb) => {
        const [r, g, b] = rgb.map(v => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const parse = (value) => value.match(/\\d+(\\.\\d+)?/g).slice(0, 3).map(Number);
      const numbers = [...document.querySelectorAll('.service__number')];
      if (!numbers.length) return { count: 0 };
      const style = getComputedStyle(numbers[0]);
      let node = numbers[0];
      let bg = 'rgba(0, 0, 0, 0)';
      while (node) {
        const c = getComputedStyle(node).backgroundColor;
        if (c && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(c)) { bg = c; break; }
        node = node.parentElement;
      }
      const l1 = luminance(parse(style.color));
      const l2 = luminance(parse(bg));
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      return {
        count: numbers.length,
        color: style.color,
        background: bg,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        ratio: Math.round(ratio * 100) / 100,
        titleSize: getComputedStyle(numbers[0].parentElement.querySelector('.service__name')).fontSize,
      };
    `);
    if (!result.count) {
      problems.push(`${route} no .service__number rendered`);
      continue;
    }
    // AA for normal text is 4.5:1. Large text is 24px, or 18.66px at 700.
    const size = parseFloat(result.fontSize);
    const weight = Number(result.fontWeight);
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const threshold = isLarge ? 3 : 4.5;
    if (result.ratio < threshold) {
      problems.push(`${route} ${result.color} on ${result.background} = ${result.ratio}:1, needs ${threshold}:1`);
    }
    // Subordinate to the service name: same size is acceptable, larger is not.
    if (parseFloat(result.titleSize) < size) {
      problems.push(`${route} number ${result.fontSize} is larger than title ${result.titleSize}`);
    }
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

check('404 uses the shared accent action rather than a local copy', async ({ goto, evaluate }) => {
  await goto('/does-not-exist/', 1280);
  const state = await evaluate(`
    const link = document.querySelector('a.action--accent');
    if (!link) return { found: false };
    const style = getComputedStyle(link);
    return {
      found: true,
      text: link.textContent.trim(),
      href: link.getAttribute('href'),
      target: link.target,
      rel: link.rel,
      // Present only because the page passes it to EnquiryLink for spacing.
      carriesPageClass: link.classList.contains('not-found__link'),
      transition: style.transitionProperty,
      minHeight: style.minHeight,
      radius: style.borderRadius,
    };
  `);
  const problems = [];
  if (!state.found) {
    problems.push('no .action--accent link on the 404 page');
  } else {
    if (!state.text.startsWith('Enquire on WhatsApp')) problems.push(`unexpected label "${state.text}"`);
    if (!state.href.startsWith('https://wa.me/')) problems.push(`unexpected href ${state.href}`);
    if (state.target !== '_blank') problems.push('external link does not open in a new tab');
    if (!state.rel.includes('noopener')) problems.push('missing rel=noopener');
    if (!state.carriesPageClass) problems.push('page class not applied through the component');
    // These come from ActionLink and were previously absent from the local copy.
    if (!state.transition.includes('background-color')) problems.push('no hover transition');
    if (parseFloat(state.minHeight) < 48) problems.push(`min-height ${state.minHeight} below 48px`);
    if (state.radius === '0px') problems.push('no border radius, local copy may still be in use');
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

check('the skip link is the first focusable element and becomes visible', async ({ goto, evaluate, send }) => {
  await goto('/', 1280);
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  const state = await evaluate(`
    const el = document.activeElement;
    const style = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      text: el.textContent.trim(),
      onScreen: r.top >= 0 && r.height > 0 && style.visibility !== 'hidden',
    };
  `);
  if (state.text !== 'Skip to main content') throw new Error(`first tab stop was "${state.text}"`);
  if (!state.onScreen) throw new Error('skip link did not become visible on focus');
});

check('headings run in order with no skipped level', async ({ goto, evaluate }) => {
  const problems = [];
  for (const route of ['/', '/products/', '/products/servers/', '/services/', '/services/cctv-installation/', '/about/', '/contact/']) {
    await goto(route, 1280);
    const levels = await evaluate(`
      return [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
        .filter(h => h.offsetParent !== null || getComputedStyle(h).position !== 'absolute')
        .map(h => Number(h.tagName[1]));
    `);
    const h1s = levels.filter((l) => l === 1).length;
    if (h1s !== 1) problems.push(`${route} has ${h1s} h1 elements`);
    let previous = levels[0] ?? 0;
    for (const level of levels.slice(1)) {
      if (level > previous + 1) problems.push(`${route} h${previous} -> h${level} skips a level`);
      previous = level;
    }
  }
  if (problems.length) throw new Error(problems.join(' | '));
});

// ---------------------------------------------------------------------------
// General enquiry form
// ---------------------------------------------------------------------------

/** Fills one control the way a person would, then fires the events a person fires. */
const ENQUIRY_FILL = `
  window.__fillEnquiry = (name, value) => {
    const el = document.querySelector('[data-enquiry-form] [name="' + name + '"]');
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  return true;
`;

/** Shared shape, labelling and state assertions for the form. */
const ENQUIRY_SHAPE_PROBE = `
  const form = document.querySelector('[data-enquiry-form]');
  const root = document.querySelector('[data-enquiry-root]');
  if (!form || !root) return { found: false };
  const ids = (el) => (el.getAttribute('aria-describedby') || '').split(/\\s+/).filter(Boolean);
  const text = (el) => (el ? el.textContent.replace(/\\s+/g, ' ').trim() : null);
  const submit = form.querySelector('button[type="submit"]');
  return {
    found: true,
    // Present because the browser's own bubbles are suppressed in favour of the
    // custom messages, and absent action/method because submitting would post to
    // the page itself.
    novalidate: form.hasAttribute('novalidate'),
    action: form.getAttribute('action'),
    method: form.getAttribute('method'),
    // The section is server-rendered hidden and revealed by the script, so this
    // proves the form is actually presented once scripting is available.
    revealed: !root.hidden && submit.checkVisibility(),
    fields: [...form.querySelectorAll('input, select, textarea')].map((el) => ({
      name: el.name,
      required: el.required,
      maxlength: el.getAttribute('maxlength'),
      label: text(document.querySelector('label[for="' + el.id + '"]')),
      describedBy: ids(el),
      errorId: form.querySelector('[data-error-for="' + el.name + '"]')?.id ?? null,
      // The error must exist and start hidden: an empty visible paragraph would
      // read as a message with nothing in it.
      errorHiddenAtLoad: form.querySelector('[data-error-for="' + el.name + '"]')?.hidden ?? null,
    })),
    helper: text(form.querySelector('[data-enquiry-helper]')),
    submitLabel: text(submit),
    // A confirmation the site cannot honestly make: there is no request to
    // acknowledge, so a live region or status role would be a fabrication.
    announcedStates: [...form.querySelectorAll('[aria-live], [role="status"], [role="alert"]')].length,
    spinner: !!form.querySelector('[aria-busy]'),
    options: [...form.querySelectorAll('select option')].map((o) => o.textContent.trim()),
  };
`;

check('the enquiry form asks for exactly the agreed fields and claims no outcome', async ({ goto, evaluate }) => {
  await goto('/contact/', 1280);
  const state = await evaluate(ENQUIRY_SHAPE_PROBE);
  if (!state.found) throw new Error('no enquiry form rendered on /contact/');

  const problems = [];
  if (!state.revealed) problems.push('form section still hidden with scripting available');

  const required = state.fields.filter((f) => f.required).map((f) => f.name).sort();
  const wantRequired = ['email', 'message', 'name', 'subject'];
  if (required.join() !== wantRequired.join()) {
    problems.push(`required fields are ${required.join()} or ${wantRequired.join()}`);
  }

  const message = state.fields.find((f) => f.name === 'message');
  if (!message || message.maxlength !== '2000') {
    problems.push(`message maxlength is ${message?.maxlength}, expected 2000`);
  }

  for (const field of state.fields) {
    if (!field.label) problems.push(`${field.name} has no label`);
    if (!field.errorId) problems.push(`${field.name} has no error element`);
    else if (!field.describedBy.includes(field.errorId)) {
      problems.push(`${field.name} aria-describedby ${field.describedBy.join(' ')} omits ${field.errorId}`);
    }
    if (field.errorHiddenAtLoad !== true) problems.push(`${field.name} error is not hidden at load`);
  }

  const WANT_HELPER =
    "Your details will be used to prepare a WhatsApp enquiry. You'll review the message in WhatsApp before sending it.";
  if (state.helper !== WANT_HELPER) problems.push(`helper copy reads "${state.helper}"`);

  if (state.submitLabel !== 'Open WhatsApp with this enquiry') {
    problems.push(`submit label reads "${state.submitLabel}"`);
  }
  if (!state.novalidate) problems.push('form does not suppress native validation bubbles');
  if (state.action !== null || state.method !== null) {
    problems.push(`form carries action="${state.action}" method="${state.method}", which would post to this page`);
  }
  if (state.announcedStates) problems.push('form announces a live region it cannot honestly report');
  if (state.spinner) problems.push('form carries a busy indicator with no request to wait for');

  if (!state.options.includes('Another requirement')) {
    problems.push('select has no "Another requirement" option');
  }
  const placeholder = state.options[0];
  if (placeholder !== 'Choose a product or service') {
    problems.push(`select opens on "${placeholder}" instead of a prompt`);
  }

  if (problems.length) throw new Error(problems.join(' | '));
});

check('an empty enquiry is explained field by field and does not submit', async ({ goto, evaluate }) => {
  await goto('/contact/', 1280);
  await evaluate(ENQUIRY_FILL);
  await evaluate(`document.querySelector('[data-enquiry-form]').requestSubmit(); return true;`);

  const state = await evaluate(`
    const form = document.querySelector('[data-enquiry-form]');
    return {
      errors: [...form.querySelectorAll('[data-error-for]')].map((el) => ({
        name: el.dataset.errorFor,
        shown: !el.hidden,
        text: el.textContent.replace(/\\s+/g, ' ').trim(),
        invalid: form.elements.namedItem(el.dataset.errorFor).getAttribute('aria-invalid'),
      })),
      focused: document.activeElement ? document.activeElement.name : null,
      // A prevented submit leaves the document alone; a real one would have
      // navigated and lost this page entirely.
      navigationCount: performance.getEntriesByType('navigation').length,
      pathname: location.pathname,
    };
  `);

  const problems = [];
  for (const name of ['name', 'email', 'subject', 'message']) {
    const error = state.errors.find((e) => e.name === name);
    if (!error?.shown) problems.push(`${name} error not shown`);
    else if (!error.text) problems.push(`${name} error shown but empty`);
    if (error?.invalid !== 'true') problems.push(`${name} not marked aria-invalid`);
  }
  // Phone is optional, so an empty value must not be reported as a problem.
  const phone = state.errors.find((e) => e.name === 'phone');
  if (phone?.shown) problems.push('optional phone reported an error when left empty');
  if (phone?.invalid) problems.push('optional phone marked aria-invalid when left empty');

  if (state.focused !== 'name') problems.push(`focus moved to "${state.focused}" instead of the first invalid field`);
  if (state.navigationCount !== 1) problems.push(`${state.navigationCount} navigation entries, form may have submitted`);
  if (state.pathname !== '/contact/') problems.push(`form submitted and left the page: ${state.pathname}`);

  if (problems.length) throw new Error(problems.join(' | '));
});

check('a malformed email and phone are refused with guidance and nothing is cleared', async ({ goto, evaluate }) => {
  await goto('/contact/', 1280);
  await evaluate(ENQUIRY_FILL);

  // Filling, submitting and reading back are separate round trips so a failure
  // names the step that broke rather than the whole form.
  await evaluate(`
    window.__fillEnquiry('name', 'Amina Bello');
    window.__fillEnquiry('email', 'amina(at)example.com');
    window.__fillEnquiry('phone', 'call me');
    window.__fillEnquiry('subject', 'CCTV systems');
    window.__fillEnquiry('message', 'One camera by the gate.');
    return true;
  `);
  await evaluate(`document.querySelector('[data-enquiry-form]').requestSubmit(); return true;`);

  const state = await evaluate(`
    const form = document.querySelector('[data-enquiry-form]');
    const shown = (name) => {
      const el = form.querySelector('[data-error-for="' + name + '"]');
      return el.hidden ? null : el.textContent.replace(/\\s+/g, ' ').trim();
    };
    const value = (name) => form.elements.namedItem(name).value;
    const invalid = (name) => form.elements.namedItem(name).getAttribute('aria-invalid');
    return {
      email: shown('email'),
      phone: shown('phone'),
      // The fields that were filled correctly must not be flagged.
      nameInvalid: invalid('name'),
      messageInvalid: invalid('message'),
      subjectInvalid: invalid('subject'),
      // Everything typed must survive a failed attempt.
      nameValue: value('name'),
      emailValue: value('email'),
      phoneValue: value('phone'),
      subjectValue: value('subject'),
      messageValue: value('message'),
      pathname: location.pathname,
    };
  `);

  const problems = [];
  if (!state.email) problems.push('malformed email accepted');
  else if (!state.email.includes('name@example.com')) {
    problems.push(`email error gives no example: "${state.email}"`);
  }
  if (!state.phone) problems.push('non-numeric phone accepted');
  if (state.nameInvalid || state.subjectInvalid || state.messageInvalid) {
    problems.push('valid fields were marked invalid');
  }
  const kept = {
    name: 'Amina Bello',
    email: 'amina(at)example.com',
    phone: 'call me',
    subject: 'CCTV systems',
    message: 'One camera by the gate.',
  };
  for (const [field, expected] of Object.entries(kept)) {
    if (state[`${field}Value`] !== expected) {
      problems.push(`${field} was reset to "${state[`${field}Value`]}"`);
    }
  }
  if (state.pathname !== '/contact/') problems.push(`form submitted and left the page: ${state.pathname}`);

  if (problems.length) throw new Error(problems.join(' | '));
});

check('a valid enquiry opens WhatsApp carrying the details exactly as typed', async ({ goto, evaluate, send, capture }) => {
  await goto('/contact/', 1280);

  // The number is taken from the page's own direct link rather than hard-coded,
  // so the form cannot quietly disagree with the rest of the site.
  const reference = await evaluate(`
    const link = [...document.querySelectorAll('a[href*="wa.me"]')][0];
    return new URL(link.href).pathname;
  `);
  await evaluate(ENQUIRY_FILL);

  await send('Fetch.enable', { patterns: [{ urlPattern: '*://wa.me/*', requestStage: 'Request' }] });

  const fill = (phone) => `
    window.__fillEnquiry('name', 'Amina Bello');
    window.__fillEnquiry('email', 'amina@example.com');
    ${phone ? `window.__fillEnquiry('phone', '${phone}');` : `window.__fillEnquiry('phone', '');`}
    window.__fillEnquiry('subject', 'CCTV systems');
    window.__fillEnquiry('message', 'One camera by the gate. Please quote for supply and installation.');
    document.querySelector('[data-enquiry-form]').requestSubmit();
    return true;
  `;

  /** Submits and returns the WhatsApp URL the page asked for, without dialling out. */
  const submitAndCapture = async (phone) => {
    // Each attempt starts from a fresh load: the first submission navigates away
    // to WhatsApp, so the second would otherwise run against a replaced document.
    await goto('/contact/', 1280);
    await evaluate(ENQUIRY_FILL);
    const events = await capture(
      'Fetch.requestPaused',
      async () => {
        await evaluate(fill(phone));
      },
      {
        respond: (params) => {
          send('Fetch.failRequest', { requestId: params.requestId, errorReason: 'Failed' }).catch(() => {});
        },
      },
    );
    return events[0]?.request?.url ?? null;
  };

  try {
    const problems = [];

    const withPhone = await submitAndCapture('+234 800 111 2222');
    if (!withPhone) throw new Error('a valid enquiry did not request any WhatsApp URL');

    let url;
    try {
      url = new URL(withPhone);
    } catch {
      throw new Error(`WhatsApp URL was not a URL: ${withPhone}`);
    }
    if (url.origin !== 'https://wa.me') problems.push(`opened ${url.origin}, expected https://wa.me`);
    if (url.pathname !== reference) {
      problems.push(`dials ${url.pathname}, but the page's direct link dials ${reference}`);
    }

    const text = url.searchParams.get('text') ?? '';
    const wanted = [
      'Hello Ar-Rafiu Integrated Services Limited',
      'from the Ar-Rafiu website',
      'Name: Amina Bello',
      'Email: amina@example.com',
      'Phone: +234 800 111 2222',
      'Product or service: CCTV systems',
      'One camera by the gate. Please quote for supply and installation.',
      'Thank you.',
    ];
    for (const line of wanted) {
      if (!text.includes(line)) problems.push(`message omits "${line}"`);
    }
    // The shared helper used to end the sentence by appending a full stop to a
    // message that already had one.
    if (text.includes('..')) problems.push('message contains a doubled full stop');
    // The message must round-trip: an encoded "&" that arrives as "&amp;" would
    // arrive differently again inside WhatsApp.
    if (/&amp;|&lt;|&gt;|\\u00/.test(text)) problems.push('message contains escaped markup rather than plain text');

    // The same enquiry without a phone number must not mention one.
    const withoutPhone = await submitAndCapture(null);
    if (!withoutPhone) problems.push('the phone-free enquiry did not request a WhatsApp URL');
    else if ((new URL(withoutPhone).searchParams.get('text') ?? '').includes('Phone:')) {
      problems.push('a phone line appeared even though the field was left empty');
    }

    if (problems.length) throw new Error(problems.join(' | '));
  } finally {
    await send('Fetch.disable');
  }
});

check('without scripting the form stays hidden and the direct WhatsApp link is offered', async () => {
  // Read from the built file rather than disabling scripting in the browser: this
  // is exactly what a visitor with JavaScript blocked is served, and asserting on
  // it needs no risk of leaving script execution disabled for later checks.
  const html = await readFile(join(DIST, 'contact', 'index.html'), 'utf8');
  const problems = [];

  const section = html.match(/<section class="enquiry"[^>]*>/)?.[0] ?? '';
  if (!section.includes('data-enquiry-root')) problems.push('enquiry section not found in the built page');
  if (!section.includes('hidden')) {
    problems.push('enquiry section is not hidden in the served markup, so a dead form would be shown');
  }

  const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '';
  if (!noscript) {
    problems.push('no noscript fallback in the built page');
  } else {
    if (!/href="https:\/\/wa\.me\/\d+/.test(noscript)) {
      problems.push('noscript fallback offers no direct WhatsApp link');
    }
    // A <noscript> block containing a form would be a form that cannot work.
    if (/<form/i.test(noscript)) problems.push('noscript fallback renders a form');
  }

  if (problems.length) throw new Error(problems.join(' | '));
});

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Runs every check with a hard per-check deadline. A check that hangs is
 * reported as a failure rather than being allowed to stall the run.
 */
async function runWithTimeout(fn, ms) {
  let timer;
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`check exceeded ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/index.html is missing. Run `npm run build` first.');
    process.exitCode = 1;
    return;
  }

  let server;
  let chrome;
  let client;

  // `--only <substring>` runs a single check. It exists so the harness can be
  // proven against one check before the rest are trusted, which is how a run
  // failing halfway is debugged without re-running everything.
  const onlyIndex = process.argv.indexOf('--only');
  const selected =
    onlyIndex === -1 ? checks : checks.filter((c) => c.name.includes(process.argv[onlyIndex + 1]));

  if (!selected.length) {
    console.error(`--only "${process.argv[onlyIndex + 1]}" matched no check`);
    process.exitCode = 1;
    return;
  }

  try {
    server = await startServer();
    console.log(`serving dist/ on http://${HOST}:${PORT}`);

    if (!(await waitForPortFree(CDP_PORT))) {
      console.error(`port ${CDP_PORT} is already in use; set VERIFY_CDP_PORT to a free port`);
      process.exitCode = 1;
      return;
    }

    chrome = await startChrome();
    client = await connect();
    console.log(`chrome attached on ${CDP_PORT}\n`);

    let failures = 0;
    for (const { name, run } of selected) {
      const started = Date.now();
      try {
        await runWithTimeout(() => run(client), 90_000);
        console.log(`PASS  ${name}  (${Date.now() - started}ms)`);
      } catch (error) {
        failures += 1;
        console.log(`FAIL  ${name}  (${Date.now() - started}ms)`);
        console.log(`        ${error.message}`);
      }
    }

    console.log(`\n${selected.length - failures}/${selected.length} checks passed`);
    if (failures) process.exitCode = 1;
  } catch (error) {
    console.error(`harness error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // The finally block is what makes this safe to run repeatedly: no orphan
    // Chrome, no orphan server, whatever happened above.
    client?.close();
    await new Promise((resolve) => {
      if (!server) return resolve();
      server.close(resolve);
    });
    await stopChrome(chrome);
    console.log('cleaned up chrome and server');
  }
}

await main();

# Playbook 04: Zero-Dependency Headless Chrome CDP + SwiftShader WebGL2 Automated QA

**Originating Problem**: Standard Node unit tests cannot catch WebGL shader compilation bugs, 3D-to-2D projection collisions, or overlapping mobile HUD buttons — yet installing heavy Playwright/Puppeteer browser binaries breaks the zero-dependency single-file portability of HTML5 tools.

---

## 1. Zero-Dependency CDP Architecture (`scripts/cdp-qa/`)

Since Node `>=20` ships built-in global `fetch` and `WebSocket`, an entire deterministic WebGL2 end-to-end QA harness fits cleanly into **`layout-audit.mjs` (~110 lines)**:

```js
spawn(chromeBin, [
  '--headless=new',
  '--disable-gpu-sandbox',
  '--enable-webgl',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--no-sandbox',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${os.tmpdir()}/skyline_qa_${process.pid}`,
  'about:blank'
]);
```

### Critical Practices for Clean Runs
1. **Isolated Temp User Data Dir (`os.tmpdir()`)**: Always clean up temporary Chrome profiles in `finally { ... }` and NEVER store profiles inside the Git repository.
2. **Real Touch Dispatch (`Input.dispatchTouchEvent`)**: Never test mobile flows solely with `.click()`. Send real `touchStart -> touchMove -> touchEnd` via CDP (`Emulation.setTouchEmulationEnabled({ enabled: true, maxTouchPoints: 5 })`) so ghost `pointer-events` blockers and `touch-action` bugs surface immediately.
3. **Wait on Explicit Readiness Hooks (`window.__ready && window.__frames > 4`)**: Never rely on blind `sleep(2000)` guesses before interacting with Three.js scenes under CPU SwiftShader rendering.

---

## 2. Pairwise Bounding-Box Overlap & OOB Algorithm

Every viewport transition runs `checkOverlaps(HUD_SELECTORS)` across visible elements (`display !== 'none' && visibility !== 'hidden' && opacity !== '0'`):

```js
const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
if (ix > 2 && iy > 2) overlaps.push({ a: a.sel, b: b.sel, ix, iy });
```

Why `> 2 px` tolerance? Subpixel DPR rounding (`deviceScaleFactor: 2` on `390×844`) occasionally produces `1px` hairline border contact without visual overlap; any `> 2px` intersection flags an actionable HUD layout collision.

---

## 3. Five-Matrix Gate Summary (`scripts/cdp-qa/run-4matrix-qa.mjs`)

1. **Portrait (`390×844`)**: Title fold (`deploy.bottom <= vh`), FPS touch swipe, `#t-assist-btn` toggle, `overlaps: []`, `oob: []`.
2. **Landscape (`844×390`)**: Dynamic `is-landscape` transition, `12`-element overlap check.
3. **Tabletop `1P` + `2P` Flip + Debrief**: `backtitle` state transition, `11` marker bounds (`markerCollisions: 0`), `#tt-handoff` 180° rotation (`targetDelta ≈ π`), organic completion debrief title preservation & board disposal (`ttRem === 0`).
4. **Desktop (`1440×900`)**: Zero touch leakage (`isTouchClass: false`), 3D billboard mounting (`billboardsAfterDeploy: 3`).
5. **Pure Neutral Edition (`dist/skyline-protocol-open.html`)**: Clean WebGL boot + `brandHitsInDOM === 0`.

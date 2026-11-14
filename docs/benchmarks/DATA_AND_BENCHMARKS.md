# Engineering Data & Verified QA Benchmarks

All file sizes, symbol checks, and runtime assertions below are directly measured from **`skyline-protocol` v3.1.0** outputs using `npm run build:all`, `npm run check`, and `npm run qa` (`docs/benchmarks/latest-qa-report.json`).

---

## 1. Version Evolution & Single-File Footprint

| Deliverable / Version | Primary Capabilities Added | Build Output | Verified UTF-8 Size | Script Payload Size | Third-Party Brand PNGs |
| --- | --- | --- | --- | --- | --- |
| **V1 Baseline** (`几猫国产3A大作_V1.html`) | Procedural Three.js r180 PBR engine, East Sea Bridge (`east_sea_mega_bridge`), FPS combat, basic touch stick | Legacy standalone HTML (unmodified baseline) | `1,425,707 B` | — | 0 |
| **V2 Strategic Upgrade** (`src/core/engine-base.html`) | Mission 2 (*Red Sand Spaceport*), asymmetric 4-wave balance, `7.5s` combo decay, 8 ranks & 10 medals (`skyline.career.v2`), Tier +1 ladder, `SA_ASSETS` showcase integration | `engine-base.html` | `1,590,585 B` | — | 5 PNGs inline |
| **V3.1 Showcase Build** (`index.html`) | Modular `src/` overlay (`35` injected slots), Portrait + Landscape mobile 4-quadrant HUD, cone aim-assist (`findMobAssistTarget`), auto-fire pill, gyro option, 11-node **1P/2P Tabletop Wargame** + 180° flip | `index.html` & `dist/skyline-protocol-standalone.html` | `1,642,122 B` | `1,575,303 B` | 5 PNGs inline |
| **V3.1 Pure Open Build** (`dist/skyline-protocol-open.html`) | Full V3.1 FPS + Tabletop engine with SVG emblems and neutral tactical nomenclature (`SENTRY-X1`, `DUO-EYE`, `TAC-CAM`, `SUPPLY-POD`) | `dist/skyline-protocol-open.html` | `1,572,207 B` | `1,505,399 B` | 0 (100% SVG) |

> **Verification Command**: `npm run check` validates `node --check` ES syntax on the extracted `<script>` payload of all three built HTML files plus all modular scripts under `src/modules/` and `scripts/cdp-qa/`, checks `7` core runtime anchors, verifies `0` legacy `几猫` tokens, and confirms `0` third-party brand tokens or raster PNGs inside `dist/skyline-protocol-open.html`.

---

## 2. Headless Chrome CDP + SwiftShader WebGL2 Verification Matrix

Executed by `scripts/cdp-qa/run-4matrix-qa.mjs` (`durationMs: 52526`, `executedAt: 2026-11-14T16:33:56.279Z`):

| Matrix ID | Emulated Device / Mode | Key Functional & Geometric Checks | Observed Telemetry Result |
| --- | --- | --- | --- |
| **1. Mobile Portrait Title & FPS** | `390×844`, DPR `2`, Touch `5 pts`, Pixel 8 UA | Auto `is-touch is-portrait`; primary CTA above fold; right-half touch swipe look; `findMobAssistTarget` active; no desktop lock warning; toggle `#t-assist-btn`; `getBoundingClientRect()` pairwise audit across `12` visible HUD elements | `deploy: {top: 385, bottom: 429, vh: 844}`, `modesCount: 3`, `state: "playing"`, `hasLockPrompt: false`, `assistText: "自动开火:开"` -> `"仅手控:关"`, **`overlaps: []`, `oob: []`** |
| **2. Mobile Landscape FPS** | `844×390`, DPR `2`, Touch `5 pts` | Dynamic orientation switch to `is-landscape`; `12` HUD elements repositioned cleanly without touching controls | `classes: ["is-touch", "is-landscape"]`, `checkedElements: 12`, **`overlaps: []`, `oob: []`** |
| **3. Tabletop 1P / 2P & Debrief** | Portrait `390×844` (`tt1p`), Landscape `844×390` (`tt2p`), Desktop `1280×800` | Back-to-title transition (`backtitle`); 11-node board spawn (`TT_MAPS`); dynamic safe-zone clamp between `.tt-top-wrap` & `.tt-dock`; tap move + EMP card (`AP: 4 -> 1`); Mission 1 switch; `#tt-handoff` + **180° camera flip**; organic completion cleanup | `markersCount: 11`, **`markerCollisions: 0`**, `handoffShown: true`, **`targetDelta: 3.142 rad`** (`yawDeltaRad: 3.117 rad`), `kicker: "东海深蓝港区 · 2P 双人面对面战棋简报"`, **`ttRem: 0`** |
| **4. Desktop Regression** | `1440×900`, DPR `1`, Non-touch Desktop UA | Ensures V3 mobile touch layers stay inactive on desktop; verifies title top/bottom margin and showcase 3D billboards | `isTouchClass: false`, `inputTouch: false`, `eyebrowTop: 93`, `deployBot: 760` (`vh: 900`), `fpsState: "playing"`, **`billboardsAfterDeploy: 3`** |
| **5. Pure Neutral Open Boot** | `dist/skyline-protocol-open.html` | Verifies zero fatal errors on boot and zero brand strings leaked into rendered DOM | `fatal: null`, `state: "title"`, **`brandHitsInDOM: 0`** |
| **Global Error Gate** | All 5 Matrices Combined | Captures `Runtime.exceptionThrown`, `Runtime.consoleAPICalled(error)`, `Runtime.evaluate` exceptions, and `window.__fatal` | **`runtimeErrors: []`** |

---

## 3. Showcase Hardware Preset & Career Progression Constants

From `src/core/engine-base.html` and `src/presets/superacme-showcase.json`:
- **Showcase Asset Bundle (`assets/presets/superacme/`)**:
  - `superacme_logo.png` (`3,642 B`)
  - `sa_pt2c.png` (`12,671 B`)
  - `sa_bc4pro.png` (`11,796 B`)
  - `sa_bc6v.png` (`13,595 B`)
  - `sa_bc22.png` (`12,310 B`)
- **Career Rank Thresholds (`RANKS`, key `skyline.career.v2`)**:
  `列兵 (0)` -> `下士 (800)` -> `中士 (2,000)` -> `少尉 (4,000)` -> `上尉 (7,000)` -> `少校 (11,500)` -> `上校 (17,500)` -> `将星 (25,000)`.
- **Achievement Medals (`MEDALS`)**: `8` FPS combat/progression medals in `engine-base.html` + `2` tabletop medals (`table_master`, `table_grand`) injected by `src/modules/tabletop-engine.js` = **`10` total medals**.

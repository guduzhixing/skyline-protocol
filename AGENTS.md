# AGENTS.md — AI Coding Agent Repository Guide

> Read this manifest before modifying code in `skyline-protocol`. It maps modular source files to the compiled single-file Three.js r180 engine and lists every hard invariant verified by CI.

## 1. Repository Map (Source of Truth)

| Path | Ownership & Edit Policy |
| --- | --- |
| `src/core/engine-base.html` | Base WebGL/PBR FPS runtime (Three.js r180, Mission 1 & 2 terrain/landmarks, V2 balance, rank/medal system). Treat as stable core; prefer adding V3+ features via `src/styles/` & `src/modules/`. |
| `src/styles/mobile-responsive.css` | Portrait (`max-width: 760px`), Landscape (`html.is-touch.is-landscape`), and desktop comfort spacing CSS. |
| `src/styles/tabletop-ui.css` | `#tt-ui` overlay styles (markers `.tt-nbtn`, top status `.tt-top-wrap`, pawn/card `.tt-dock`, 2P `.tt-handoff`). |
| `src/modules/mobile-input-aim.js` | `MOBILE_PATCHES`: viewport detection (`IS_TOUCH_DEV`, `syncViewportEnv`), mobile shadow/DPR clamps, PointerLock guard, idle stick + auto-fire pill + gyro listener, `findMobAssistTarget()` cone aim-assist & auto-fire. |
| `src/modules/tabletop-engine.js` | `TABLETOP_ENGINE_CODE` + `TABLETOP_PATCHES`: `i.tabletop` subsystem, 11-node `TT_MAPS` (`1` & `2`), 1P AI stepper, 2P handoff + 180° flip, dynamic node projection clamping, title mode selector, settings toggles, and `mM` loop dispatch (`case "tabletop"`). |
| `src/presets/superacme-showcase.json` | Showcase asset mapping pointing to `assets/presets/superacme/*.png`. |
| `src/presets/open-neutral.json` | Procedural SVG emblems + ordered string neutralizer table for `--mode=pure`. |
| `scripts/build.mjs` | Deterministic Slot/Overlay Assembler producing `index.html`, `dist/skyline-protocol-standalone.html`, and `dist/skyline-protocol-open.html`. |
| `scripts/verify-build.mjs` | Syntax check (`node --check`), required anchor verification, and pure neutrality audit. |
| `scripts/cdp-qa/` | Zero-dependency Chrome CDP + SwiftShader WebGL2 automated 5-matrix test runner (`run-4matrix-qa.mjs` + `layout-audit.mjs`). |

> **NEVER hand-edit compiled `index.html` or `dist/*.html` directly.** Always edit `src/*`, then run `npm run build:all`.

## 2. Standard Commands

```bash
npm run build       # Build Showcase index.html + dist/skyline-protocol-standalone.html
npm run build:pure  # Build Neutral MIT-clean dist/skyline-protocol-open.html
npm run build:all   # Build both editions cleanly
npm run check       # Run node --check + anchor audit + pure neutrality audit
npm run qa          # Run headless Chrome CDP + SwiftShader WebGL2 5-matrix suite
npm run dev         # Start local zero-dep HTTP server printing LAN URL for phone tests
```

## 3. Verified Core Engine Symbol Glossary (`src/core/engine-base.html`)

- **Three.js / Math Aliases (r180, `M2="180"`)**:
  `wt` = `Group`, `Qe` = `Mesh`, `Nn` = `MeshBasicMaterial`, `O0` = `RingGeometry`, `ls` = `SphereGeometry`, `rn` = `PlaneGeometry`, `xs` = `CanvasTexture`, `Wi(w,h,d,r)` = RoundedBox helper, `ot(rt,rb,h,seg)` = Cylinder helper, `W` / `gi` = `Vector3`, `Zn(v,min,max)` = clamp, `Sn` = `DoubleSide` (`2`).
- **Subsystem Functions & Globals**:
  `v_(i)` = Input / PointerLock / Touch UI controller
  `x_(i)` = Player movement & camera rig
  `dm(i)` = Weapon viewmodel & firing solver (`findMobAssistTarget` lives here)
  `hM(i)` = Combat HUD controller (`#h-map`, `.h-score`, `.h-tac`, `.comms`)
  `pM(i, e)` = Menu & Settings controller (`syncMissionUI`, `v(U)`, `fM="saltline.settings.v1"`, `XC`)
  `mM(i)` = Main Game Manager (`U()`, `G()`, `j()`, `B()`, `RANKS`, `MEDALS`, `CAREER_KEY="skyline.career.v2"`)
  `i.tabletop` = 3D Tabletop Wargame engine (`start`, `stop`, `endTurn`, `getState`, `actNode`, `update`)
  `window.__G` = Live game context exposed for CDP automation; `window.__ready`, `window.__frames`, `window.__fatal`.

## 4. Non-Negotiable Engineering Invariants

1. **Ghost Pointer-Event Trap**: `.loc-card` and `.hud:not(.on), .hud:not(.on) .h-tac` MUST remain `pointer-events: none !important;`, and `.menu.open` stays `z-index: 20`. Removing these silently steals touch taps during Tabletop/Title!
2. **Viewport Class Pairing**: JS `syncViewportEnv()` toggles `is-touch`, `is-portrait`, and `is-landscape` on `document.documentElement`. CSS rules MUST match `.is-touch.is-portrait` / `.is-touch.is-landscape` (never orphaned `.mobile` or `.landscape` class names).
3. **PointerLock Mobile & Tabletop Guard**: Never call `r.requestLock()` unless `!r.touch && !IS_TOUCH_DEV && (i.playMode || "fps") === "fps"`. Unconditional calls trigger browser errors and false `"鼠标捕获不可用"` prompts on phones.
4. **Tabletop Debrief Protection**: `syncMissionUI()` MUST guard desktop debrief kicker/heading updates with `(pm === "fps")` so calling `syncMissionUI()` after tabletop victory does not overwrite the tabletop summary!
5. **Dynamic Marker Safe-Zone Clamping**: In `i.tabletop.update()`, always clamp projected `.tt-nbtn` node coordinates dynamically between `.tt-top-wrap.getBoundingClientRect().bottom + 20` and `.tt-dock.getBoundingClientRect().top - 22` rather than hardcoding pixel bounds.
6. **Pure Neutral Build Parity**: Any new branded UI string or tabletop card added to `src/modules/*` MUST have a matching entry in `src/presets/open-neutral.json` (`replacements`), verified by `npm run check`.

## 5. Mandatory Verification Before Task Completion

Every PR or Agent task modifying code MUST run and pass in order:
1. `npm run build:all`
2. `npm run check` (expect exit `0`, `0` syntax errors, `pureNeutralOk: true`)
3. `npm run qa` (expect `runtimeErrors: []`, `overlaps: []`, `oob: []`, `markerCollisions: 0`, `brandHitsInDOM: 0`)

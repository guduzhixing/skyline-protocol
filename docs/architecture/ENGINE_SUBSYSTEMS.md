# Engine Subsystems & Runtime Architecture (`skyline-protocol`)

`skyline-protocol` compiles a self-contained single-file HTML5 WebGL application (`index.html`) that switches cleanly between **3D First-Person Shooter (FPS)** and **1P/2P 3D Tabletop Wargame** over the same procedural terrain and landmarks.

---

## 1. High-Level Compilation Pipeline

```
  src/core/engine-base.html          (V2 Three.js r180 + PBR + Missions 1 & 2)
        │
        ├── + src/styles/mobile-responsive.css   (Portrait <=760px & Landscape <=560px)
        ├── + src/styles/tabletop-ui.css         (#tt-ui overlay & handoff modal)
        ├── + src/modules/mobile-input-aim.js    (IS_TOUCH_DEV, gyro, cone aim-assist)
        ├── + src/modules/tabletop-engine.js     (i.tabletop, TT_MAPS, 1P AI, 2P 180° flip)
        └── + src/presets/<showcase|open-neutral>.json
                    │
             scripts/build.mjs
                    ├── index.html & dist/skyline-protocol-standalone.html
                    └── dist/skyline-protocol-open.html
```

---

## 2. Core Runtime Subsystems Inside the Closure

All runtime subsystems share context object `i` (exposed at runtime as `window.__G` for automated QA).

### 2.1 Graphics & Scene Graph (`src/core/engine-base.html`)
- **Three.js r180 (`var M2 = "180"`)**: Procedural geometries (`Wi` rounded boxes, `ot` cylinders, `Fn` splines, `ls` spheres, `rn` planes, `O0` rings) plus generated `xs` (`CanvasTexture`) diffuse/normal maps.
- **Landmarks & Billboards**:
  - Mission 1 (*East Sea Deep Blue Harbor*): `east_sea_mega_bridge` cable-stayed bridge, oil rig platform, 3-lane waterfront container yard.
  - Mission 2 (*Red Sand Spaceport*): molten-salt solar tower, radio telescope array, 32m heavy launchpad, cliffside tilt-rotor pad.
  - Dynamic showcase prop group: `superacme-billboards` populated via `syncBrandBillboards()` (`3` illuminated double-sided billboards per mission).
- **Mobile GPU Scaling**: In `mobile-input-aim.js`, `low` shadow map size is capped to `1024` (`shadow: 1024`), volumetric steps reduced to `10`, and pixel ratio clamped to `Math.min(window.devicePixelRatio || 1, IS_TOUCH_DEV ? 1.5 : 2)`.

### 2.2 Input, Touch & Aim-Assist (`v_(i)` + `dm(i)`)
- **Environment Sync (`syncViewportEnv`)**: Evaluates `IS_TOUCH_DEV` and screen geometry on boot, `resize`, and `orientationchange`, toggling `.is-touch`, `.is-portrait`, and `.is-landscape` on `document.documentElement`.
- **PointerLock Guard (`v_(i) -> A()`)**: Skips `e.requestPointerLock()` whenever `f.touch || IS_TOUCH_DEV || f.locked || (i.playMode && i.playMode !== "fps")`, preventing uncaught Promise/security noise and false desktop warning banners on mobile.
- **Mobile Cone Aim-Assist & Auto-Fire (`dm(i) -> findMobAssistTarget`)**:
  - Scans `i.enemies.list` with line-of-sight verification (`i.physics.lineOfSight`).
  - Subtle magnetism (`11°` cone, `65m` range) gently steers `yaw` and `pitch`.
  - Shot bullet correction (`7.5°` cone, `85m` range) blends projectile vector `ze.lerp(dt, .72)`.
  - Optional Auto-Fire (`4.5°` cone, `65m` range) toggles live via `#t-assist-btn` ("自动开火:开" / "仅手控:关").

### 2.3 Game State Machine (`mM(i)`)
`mM(i)` drives transitions across five states:

| State (`_.state`) | Active Root | Camera Control | Loop Handler (`B(P)`) |
| --- | --- | --- | --- |
| `"title"` | `.menu[data-screen="title"]` | Slow scenic orbit (`z(P)`) | `ttUI.classList.remove("on"); z(P)` |
| `"playing"` | `.hud.on` + `#view` | First-person `x_(i)` | Standard FPS movement, enemies, waves, combo (`7.5s` decay) |
| `"tabletop"` | `#tt-ui.on` + `#view` | Spherical board orbit (`camYaw`, `camPitch`, `camDist`) | `i.tabletop.update(P)` |
| `"paused"` | `.menu[data-screen="paused"]` | Frozen | Returns early; resumes either `"tabletop"` or `"playing"` based on `i.playMode` |
| `"complete"` | `.menu[data-screen="complete"]` | Scenic orbit | Displays persistent `skyline.career.v2` rank, score, and `10` medals (`MEDALS`) |

### 2.4 Tabletop Wargame Subsystem (`i.tabletop`)
- **11-Node Strategic Graphs (`TT_MAPS`)**: Separate node graphs for Mission 1 (`n_gate`..`n_ext`) and Mission 2 (`m_gate`..`m_ext`), querying terrain elevation cleanly via `i.physics.groundHeight(x, z, 6)`.
- **3D Units & Turrets (`ttRoot` named `"tabletop-board"`)**: Spawns `6` pawns per match (`3` Attackers vs `3` Defenders across `leader`, `hound`, `drone` archetypes) and dynamically constructed sentry turrets.
- **Screen-Space Node Projection**: Every frame projects `nd.x, nd.y + 1.8, nd.z` via `tt.projVec.project(i.camera)` and clamps `(sx, sy)` strictly inside the safe rectangle bounded by `.tt-top-wrap.bottom + 20` and `.tt-dock.top - 22`.

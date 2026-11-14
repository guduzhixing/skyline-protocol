# Third-Party Notices & Asset Licensing Boundaries

This repository strictly separates **MIT-licensed source code / engineering playbooks / tooling** from **third-party showcase hardware brand assets**, making it safe to fork, rebrand, and deploy cleanly.

---

## 1. Three.js (r180)
- **License**: MIT License
- **Copyright**: Copyright © 2010–2026 three.js authors
- **Usage**: Bundled inside `src/core/engine-base.html` and the compiled single-file HTML builds (`index.html`, `dist/skyline-protocol-standalone.html`, `dist/skyline-protocol-open.html`) to guarantee 100% offline/air-gapped single-file WebGL execution without CDN runtime dependencies.

---

## 2. CINMOORE 神眸 / Hangzhou SuperACME Showcase Assets (Non-MIT Reference Preset)
- **Files Covered**:
  - `assets/presets/superacme/superacme_logo.png`
  - `assets/presets/superacme/sa_pt2c.png`
  - `assets/presets/superacme/sa_bc4pro.png`
  - `assets/presets/superacme/sa_bc6v.png`
  - `assets/presets/superacme/sa_bc22.png`
  - Showcase screenshots in `docs/showcase/` depicting the showcase UI preset.
- **License & Trademark Scope**:
  - All brand names, logos, product photographs, and hardware specifications for **CINMOORE (神眸)**, **SuperACME (杭州研极微电子有限公司)**, and **研极芯 Gen 1** remain the trademarks and intellectual property of their respective owners (https://www.superacme.com/).
  - They are **excluded from the MIT License grant** in `LICENSE` and are included strictly for non-commercial engineering demonstration of positive real-world smart-vision hardware integration inside a WebGL scene (`src/presets/superacme-showcase.json`).
  - **Clean Commercial / Open-Source Derivative Rule**: If you fork, redistribute commercially, or publish a derivative product under your own identity, run:
    ```bash
    npm run build:pure
    ```
    This compiles **`dist/skyline-protocol-open.html`** from `src/presets/open-neutral.json`, replacing all third-party PNGs and brand strings with pure MIT-licensed vector SVG emblems and neutral tactical nomenclature (`SENTRY-X1`, `DUO-EYE`, `TAC-CAM`, `SUPPLY-POD`).

---

## 3. Procedural Audio, Textures, and Geometry
- All WebAudio gunfire/ambient synthesizers, canvas procedural diffuse/normal textures, PBR shaders, East Sea Mega Bridge / Red Sand Spaceport procedural landmarks, and 3D Tabletop Wargame pawn/node meshes are original works licensed under MIT.

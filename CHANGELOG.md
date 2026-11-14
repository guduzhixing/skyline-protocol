# Changelog

All notable engineering milestones in **Skyline Protocol (苍穹引擎·零号协议)** are documented below.

## [3.1.0] - 2026-11-14 (Open-Source Architecture & Dual-Preset Release)
### Added
- **Modular Source & Slot/Overlay Build System (`scripts/build.mjs`)**: Extracted V3 mobile and tabletop systems out of monolithic HTML into `src/styles/`, `src/modules/`, `src/presets/`, and `assets/presets/`.
- **Dual-Mode Distribution**:
  - `npm run build` (`--mode=showcase`): Emits `index.html` and `dist/skyline-protocol-standalone.html` with inline base64 hardware showcase assets.
  - `npm run build:pure` (`--mode=pure`): Emits clean MIT-neutral `dist/skyline-protocol-open.html` with inline SVG vector emblems and `0` third-party trademarks.
- **Zero-Dependency Tooling**: Added `scripts/verify-build.mjs` (`node --check` + anchor/brand audits), `scripts/dev-server.mjs` (prints mobile LAN URLs), and `scripts/cdp-qa/` (5-matrix Chrome CDP + SwiftShader WebGL2 automated QA writing `docs/benchmarks/latest-qa-report.json`).
- **Open-Source Governance & AI-Agent Playbooks**: Added `AGENTS.md`, `CLAUDE.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `CONTRIBUTING.md`, `docs/OPEN_SOURCE_STRATEGY.md`, `docs/benchmarks/DATA_AND_BENCHMARKS.md`, `docs/architecture/*`, `docs/agent-playbook/01..06`, and `.github/workflows/ci-and-pages.yml`.

## [3.0.0] - 2026-11-14 (Mobile Web-First & 1P/2P Tabletop Wargame)
### Added
- **Mobile Portrait (`390×844`) & Landscape (`844×390`) Non-Overlapping HUD**: Auto touch detection (`IS_TOUCH_DEV`), 4-quadrant responsive layout, PointerLock suppression, idle stick cue, cone aim-assist (`findMobAssistTarget`), toggleable Auto-Fire pill (`#t-assist-btn`), and optional Gyro aim.
- **3D Tabletop Wargame (`i.tabletop`)**: 11-node Mission 1 & Mission 2 strategic boards on live terrain, **1P Solo vs AI (`tt1p`)**, **2P Face-to-Face Pass-and-Play (`tt2p`)** with `#tt-handoff` + automatic **180° camera flip**, tactical cards, dynamic viewport marker clamping, and 2 new tabletop medals (`10` total).
- Fixed ghost `pointer-events` interception on `.loc-card` / `.hud:not(.on) .h-tac` and protected tabletop debrief headlines inside `syncMissionUI()`.

## [2.0.0] - 2026-11-14 (Dual-Theater Rebalance & Strategic Visual Showcase)
### Added
- Mission 2 (*Red Sand Spaceport*), asymmetric offense/defense balance (`turretsMax: 2`, 4 waves + 2 bosses, 11s EMP overload, `[G]` wingman), `7.5s` decay combo system, `8` military ranks, `skyline.career.v2` persistence, `Tier +1` ladder, and CINMOORE / SuperACME visual integration.

## [1.0.0] - Prototype Baseline
- Initial single-file procedural Three.js r180 WebGL 3D FPS featuring East Sea Bridge (`east_sea_mega_bridge`) and dual Attack/Defend switching.

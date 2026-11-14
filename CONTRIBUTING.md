# Contributing to Skyline Protocol (苍穹引擎·零号协议)

Thank you for helping grow **Skyline Protocol** into a practical open-source reference for zero-dependency WebGL games, mobile-first touch UX, local pass-and-play tabletop engines, and AI-Agent software engineering!

## Design Principles

1. **Zero Runtime Dependencies (`0` npm runtime deps)**:
   Everything in `scripts/` and `scripts/cdp-qa/` must run on standard Node.js `>=22` built-ins (`node:fs`, `node:path`, `node:http`, `node:child_process`, global `fetch` / `WebSocket`). No `webpack`, `vite`, `puppeteer`, or `playwright` packages required.
2. **Modular Source -> Single-File Deliverable**:
   Never treat compiled `index.html` or `dist/*.html` as the hand-edited source of truth for V3 layers. Edit files in:
   - `src/styles/` (CSS rules)
   - `src/modules/` (Mobile & Tabletop JS patches)
   - `src/presets/` (Preset metadata & neutral string tables)
   Then run `npm run build:all`.
3. **Dual-Preset Integrity (`showcase` + `pure`)**:
   Every UI string, tabletop tactical card, or 3D prop label you add must build cleanly in both `npm run build` (`showcase`) and `npm run build:pure` (`dist/skyline-protocol-open.html`), leaving zero third-party brand tokens in `dist/skyline-protocol-open.html`.
4. **Evidence-Based QA Gate**:
   Before opening a pull request, run:
   ```bash
   npm run build:all
   npm run check
   npm run qa
   ```
   All 5 Chrome CDP matrices (Mobile Portrait `390x844`, Mobile Landscape `844x390`, Tabletop `1P` + `2P` Flip + Debrief, Desktop `1440x900` Regression, and Pure Open Build Boot) must pass with `runtimeErrors: []`, `overlaps: []`, and `markerCollisions: 0`.

## Pull Request Checklist

- [ ] Edited modular sources (`src/`, `scripts/`, or `docs/`), then rebuilt `index.html` and `dist/*`.
- [ ] Preserved backward compatibility with `1440x900` desktop pointer lock and mobile touch auto-detection.
- [ ] Passed `npm run check` (`node --check` + anchor checks + pure neutrality audit).
- [ ] Passed `npm run qa` (Chrome CDP headless WebGL2 check).
- [ ] Updated `AGENTS.md` / `docs/architecture/` if new DOM IDs, hooks, or game states were introduced.

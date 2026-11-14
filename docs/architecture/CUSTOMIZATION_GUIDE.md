# Customization Guide: Adding Presets, Tabletop Maps & Missions

This guide walks developers and AI agents through extending **Skyline Protocol** safely while keeping `npm run build:all`, `npm run check`, and `npm run qa` green.

---

## 1. Creating a Custom Brand / Educational Theme Preset

You can swap the UI logos, 3D in-world billboards, and hardware cards without editing any game loop code:

1. Add PNG or SVG files under `assets/presets/<your-theme>/`.
2. Create a preset JSON in `src/presets/<your-theme>.json` following `src/presets/superacme-showcase.json` or `src/presets/open-neutral.json`.
3. Point `SA_ASSETS` mapping in `scripts/build.mjs` (or extend `applyPureNeutralPreset` with your replacement table) to your custom preset.
4. Run:
   ```bash
   npm run build:all
   npm run check
   ```
   Remember to keep `dist/skyline-protocol-open.html` (`--mode=pure`) free of third-party trademarks so downstream MIT forks stay clean.

---

## 2. Adding or Rebalancing a Tabletop Map (`TT_MAPS`)

Each Mission ID maps to an array of `11` strategic nodes in `src/modules/tabletop-engine.js` (`TT_MAPS`):

```js
{ id: "n_c1", name: "PT2C巨幕广场", x: -15, z: 3, type: "supply", adj: ["n_gate", "n_n1", "n_c2", "n_s1"] }
```

### Node Types & Mechanics
- `atk_hq` / `def_hq`: Starting deployment hubs for Attackers (`a1..a3`) and Defenders (`d1..d3`).
- `relay` (requires `relay: "甲" | "乙" | "丙"`): Capture/sabotage objective; Attackers spend `1 AP` when standing on the node to cut it (`relayCut = true`), Defenders spend `1 AP` to repair it.
- `supply`: Controls AP regeneration at turn start (`tt.ap = 4 + supBonus`).
- `ext`: Extraction point; Attacker wins immediately if `cutCnt >= 2` and Leader (`a1`) reaches `ext`.
- `node`: Standard cover chokepoint.

### Graph Invariants
1. Keep adjacency lists `adj` **symmetric** (if A lists B, B must list A) so BFS hop calculation `ttDistHops(idA, idB)` and structural beam placement (`nd.id < nbId`) work identically from both ends.
2. Keep `(x, z)` coordinates within roughly `[-32, 28] x [-24, 24]` so portrait framing (`camDist: 76`, `baseYaw: -Math.PI / 2`) keeps all `11` nodes visible inside `390×844` without clipping.
3. Also update `src/presets/open-neutral.json` if any node name introduces brand strings!

---

## 3. Adding a Tabletop Tactical Card

Inside `ttRenderUI()` and the `ttUI` click delegation block in `src/modules/tabletop-engine.js`:
1. Render a `<button class="tt-card" data-cid="your_card">` inside `#tt-cards-row`.
2. Handle `cid === "your_card"` in `ttUI.addEventListener("click", ...)` (deduct `tt.ap`, mutate pawn/node state, log via `ttLog(...)`, call `ttRenderUI()` and `ttCheckWin()`).
3. If your card displays a brand name, add its neutral replacement string to `src/presets/open-neutral.json`.

---

## 4. Extending HUD Elements Safely on Mobile

When adding any new HUD widget:
1. Place layout overrides inside BOTH `@media (max-width: 760px)` (`html.is-touch.is-portrait`) AND `html.is-touch.is-landscape` inside `src/styles/mobile-responsive.css`.
2. Add the new selector to `HUD_SELECTORS` in `scripts/cdp-qa/run-4matrix-qa.mjs`.
3. Run `npm run qa` to prove zero pairwise pixel intersection (`overlaps: []`) and zero viewport clipping (`oob: []`) across `390×844` and `844×390`.

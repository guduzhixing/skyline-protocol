# Playbook 06: Multi-Agent (Claude × Gemini) Co-Engineering Workflow

**Originating Problem**: Complex multi-domain tasks (3D shader/physics tuning, mobile UX layout, tabletop AI, brand integration, automated QA, and open-source packaging) easily exceed a single monolithic prompt or accumulate silent regressions across edits.

---

## 1. Proven Division of Responsibilities

1. **Architecture & Invariant Spec First**:
   - Write concrete design contracts before touching `1.6 MB` bundles: DOM IDs, CSS class triggers, camera math (`baseYaw = -Math.PI / 2` in portrait, `+ Math.PI` on 2P handoff), and explicit acceptance metrics.
2. **Byte-Exact Anchored Patching Over Blind Rewrites**:
   - Never ask an agent to "rewrite the whole 1.6 MB HTML file from memory".
   - Store edits in clean modular files (`src/styles/*.css`, `src/modules/*.js`) merged by a deterministic build script (`scripts/build.mjs`) that asserts **anchor uniqueness**.
3. **Two-Speed Verification Loop**:
   - **Fast Loop (< 1s)**: `node --check` on extracted `<script>` + anchor integrity audit (`npm run check`). Run after EVERY code edit!
   - **Slow Real-Renderer Loop (~55s)**: Headless Chrome CDP + SwiftShader WebGL2 (`npm run qa`) testing touch events, pairwise bounding-box overlap (`0` allowed), and WebGL error freedom (`runtimeErrors: []`), plus visual PNG screenshot inspection on key state transitions (`docs/showcase/*.png`).
4. **Dual-Preset Licensing Hygiene from Day 1**:
   - Whenever showcasing real-world partners (`CINMOORE / SuperACME`), isolate binary assets into `assets/presets/<partner>/` and provide a `--mode=pure` target + automated DOM cleanliness check (`brandHitsInDOM === 0`) so MIT open-source integrity stays airtight.

---

## 2. Anti-Hallucination & Session Continuity Protocol

- **Never cite symbol names or byte metrics from memory**: Audit target files programmatically with Node / `rg -n` and record exact verified outputs (`AGENTS.md`, `DATA_AND_BENCHMARKS.md`).
- **Keep legacy user prototypes untouched**: Build open-source structures cleanly (`skyline-protocol/`) rather than overwriting historical milestones (`V1`, `V2`, `V3`).
- **Commit Hygiene**: Isolate open-source Git identity (`user.name` / `users.noreply.github.com`) locally per repository, ignore temp browser profiles and heavy `.mp4` renders in `.gitignore`, and validate all links via `git status` + remote verification after pushing.

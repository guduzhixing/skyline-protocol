# Playbook 01: Slot/Overlay Assembler vs. Naive Code Splitting on Single-File WebGL Bundles

**Originating Problem**: In V1->V2->V3, the core 3D engine (`src/core/engine-base.html`, `1.59 MB`) bundles Three.js r180 and six tightly coupled game subsystems (`v_`, `x_`, `dm`, `hM`, `pM`, `mM`) inside a single `<script>` IIFE sharing minified 1–2 character closure identifiers (`wt`, `Qe`, `Nn`, `O0`, `Wi`, `ot`, `ls`, `rn`, `Zn`, `Sn`, `W`, `gi`, `i`, `c`, `o`, `l`, `r`).

---

## 1. Why Naive Splitting Fails

Trying to extract `dm(i)` or `mM(i)` blindly into external `<script type="module">` files creates three severe failure modes:
1. **Closure Scope Severance**: `i.tabletop` or `findMobAssistTarget` directly needs `wt`, `Qe`, `Nn`, `W`, `i.physics`, `i.mats`, `c.score`, and `M("tabletop")` from the inner IIFE scope. Externalizing modules naively forces exporting dozens of minified globals onto `window` and risks subtle initialization-order races.
2. **Loss of Zero-Dependency Single-File Distribution**: Mobile users opening the game directly from air-gapped storage, LAN file shares, or a single downloadable HTML file rely on inline Three.js + procedural assets working offline via `file://` without CORS module blocks!
3. **Regex / Line-Number fragility**: Applying raw regexes across `53 KB+` minified lines easily corrupts strings or matches duplicate snippets.

---

## 2. The Winning Pattern: Modular Source Overlays + Deterministic Slot Assembler

Store all human/AI-editable extensions in clean, commented files (`src/styles/*.css`, `src/modules/*.js`, `src/presets/*.json`), and assemble them at build time via `scripts/build.mjs` using **strict unique-anchor assertions (`replaceExact`)**:

```js
function replaceExact(source, target, replacement, label) {
  const idx = source.indexOf(target);
  if (idx === -1) throw new Error(`Anchor not found [${label}]`);
  const idx2 = source.indexOf(target, idx + target.length);
  if (idx2 !== -1) throw new Error(`Anchor not unique [${label}]`); // Critical safety net!
  return {
    text: source.slice(0, idx) + replacement + source.slice(idx + target.length),
    offset: idx
  };
}
```

### Why This Pattern Works Across Projects
- **Fail-Fast Uniqueness Check**: Checking `idx2 !== -1` prevents patching the wrong call site inside minified JS before a single byte hits disk.
- **Closure Access Preserved**: Injected subsystems (`MOBILE_PATCHES`, `TABLETOP_PATCHES`) execute *inside* the core closure, enjoying zero-overhead direct access to `wt`, `Qe`, `c`, and `mM` helpers.
- **Mandatory Post-Assembly Syntax Gate**: Immediately extract `<script>...</script>` from every built HTML into a temporary `.mjs` and execute `node --check <tmp>` (`scripts/verify-build.mjs`). In V3 development, this caught syntax mistakes in <100ms without wasting browser startup cycles.

---

## 3. Reusable Rules for Future AI Agents

1. **Before patching**, inspect anchor occurrence counts (`count === 1`) in the target file.
2. **Keep base assets modular** (`assets/presets/superacme/*.png`) and re-encode them during `build.mjs` rather than hardcoding stale base64 blobs in source modules.
3. **Never ship without `--check` + runtime boot** (`window.__fatal === null`).

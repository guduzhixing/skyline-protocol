# Open-Source Product Strategy: Public Utility × Personal Leverage × Compliance

> Why elevate a single-file 3D WebGL demo into **Skyline Protocol (`skyline-protocol` / 苍穹引擎·零号协议)**?

Most AI-generated game prototypes end up as disposable, unmaintainable `index.html` blobs. To transform `几猫国产3A大作_V1 -> V2 -> V3` into a lasting **open-source project** that creates genuine value for both the **public (大众)** and the **creator/engineer (个人)**, the architecture is organized around four concrete pillars.

---

## 1. Public Value (对大众有什么真正用处？)

| Audience | Real-World Need | How Skyline Protocol Solves It |
| --- | --- | --- |
| **Casual Players & Families / Friends** | Want an instant game to play on a phone browser or across a dining table without downloading 5 GB APKs, creating accounts, or watching ads. | Single-file zero-backend delivery (`index.html` / GitHub Pages). Works on mobile Portrait, mobile Landscape, Desktop, and supports **Pass-and-Play 2P Tabletop** with automatic **180° board flip** for face-to-face play on one phone/tablet. |
| **WebGL / Indie Developers** | Struggle to make Three.js games feel responsive on mobile touch screens, fail at desktop/mobile HUD overlap, and lack affordable automated WebGL visual QA. | Provides a runnable reference implementing a 4-quadrant touch HUD, PointerLock mobile guard, cone aim-assist (`findMobAssistTarget`), dynamic viewport clamping for 3D-to-2D markers, and a zero-dependency **Chrome CDP + SwiftShader QA harness** (`npm run qa`). |
| **AI Coding Agent Builders (Claude / Gemini / Codex)** | Need concrete, battle-tested architectural patterns showing how AI agents can safely evolve a 1.6 MB minified Three.js single-file codebase without introducing `SyntaxError`s or silent mobile regressions. | Ships 6 actionable Engineering Playbooks (`docs/agent-playbook/`) plus machine-readable repo manifests (`AGENTS.md`, `CLAUDE.md`) codifying exact byte-verified invariants. |
| **CS / Game-Design Students** | Need complete examples of procedural geometry, PBR lighting, asymmetric wave/relay game loops, and combo/rank math (`skyline.career.v2`) without webpack fatigue. | Zero `npm` runtime dependencies (`dependencies: {}`). Clone, run `npm run dev`, and test immediately over LAN on any phone. |

---

## 2. Personal Value (对个人成长与技术资产有什么意义？)

1. **Full-Stack Technical Proof (不只是写页面，而是工程交付)**:
   - Demonstrates Three.js r180 graphics pipeline, custom WebGL shaders, responsive CSS (`100dvh` + `env(safe-area-inset-*)`), input state machines, graph pathfinding (BFS hop distance on 11-node tactical maps), AI turn execution, and automated browser verification.
2. **Transferable Meta-Framework (可复用的造轮子能力)**:
   - The **Slot/Overlay Assembler (`scripts/build.mjs`)** + **CDP 5-Matrix Layout Audit (`scripts/cdp-qa/`)** are domain-agnostic. Any developer or AI agent can drop this scaffolding into a future H5 game, interactive data visualization, or hardware digital twin project.
3. **Positive Real-World Hardware Storytelling**:
   - Shows how industrial/consumer IoT hardware (like low-power smart vision cameras, PTZ units, dual-lens sensors, and portable body cams) can be naturally mapped into positive, protective game mechanics (`turrets`, `wingman`, `supply beacons`) instead of intrusive popup ads.
4. **AI Co-Engineering Methodology Asset**:
   - Captures hard-won lessons from coordinating multi-step Claude + Gemini workflows cleanly under strict verification gates.

---

## 3. Dual-Preset Architecture: Solving the Commercial Brand vs. Open-Source License Dilemma

A critical pitfall when open-sourcing a project containing real company logos (**CINMOORE 神眸 / SuperACME 杭州研极微**) is accidentally licensing third-party trademarks under MIT. **Skyline Protocol** resolves this cleanly via build-time preset separation:

```
src/core/ + src/styles/ + src/modules/   (100% MIT Open Source)
                  │
        scripts/build.mjs
         ├── --mode=showcase  (Default: bundles assets/presets/superacme/*.png)
         │     -> index.html & dist/skyline-protocol-standalone.html
         │
         └── --mode=pure      (Neutralized: bundles inline SVG emblems & generic copy)
               -> dist/skyline-protocol-open.html
```

- **Showcase Mode** lets visitors play the rich, full-visual edition (and lets hardware partners evaluate interactive 3D digital showcase concepts).
- **Pure Open Mode (`npm run build:pure`)** strips every third-party trademark PNG and brand string, automatically verified by `scripts/verify-build.mjs --all` and headless DOM checks (`brandHitsInDOM === 0`), allowing anyone to fork, rebrand, or deploy commercially with zero legal friction.

---

## 4. Sustainable Growth Roadmap

- **Phase 1 (Current v3.1)**: Open-source architecture extraction, dual `showcase` / `pure` build pipeline, 5-matrix headless Chrome CDP QA, and 6 AI-Agent Playbooks.
- **Phase 2 (Community Extensibility)**: Externalize `TT_MAPS` JSON schema and procedural landmark templates so contributors can author new maps (e.g., *Orbital Elevator*, *Arctic Relay*) via PRs.
- **Phase 3 (WebRTC Room Optional Add-on)**: Keep single-file zero-backend local P2P as default while offering an optional WebRTC QR-code room bridge for two-device tabletop play.

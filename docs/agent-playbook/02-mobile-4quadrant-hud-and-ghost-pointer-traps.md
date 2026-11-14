# Playbook 02: Mobile Portrait/Landscape 4-Quadrant HUD & Ghost Pointer-Event Traps

**Originating Problem**: Porting a desktop 3D FPS HTML game to mobile browsers fails in two ways that visual-only inspection misses: **overlapping controls across narrow `390×844` / `844×390` viewports** and **invisible DOM overlays blocking touch taps**.

---

## 1. The Ghost Pointer-Event Trap (Silent Touch Killer)

During V3 testing, tapping `.m-mode` cards or tabletop HUD buttons intermittently failed on mobile even when the CSS looked visually clean on screenshots.

### Root Cause
Full-screen or docked overlay elements (`div.loc-card`, `.hud:not(.on) .h-tac`) remained above or aligned over clickable UI while visually faded (`opacity: 0`), still intercepting `pointerdown`/`click` events! Meanwhile `.menu.open` sat at too low a stacking context (`z-index`) on certain screens.

### Permanent Fix (`src/styles/mobile-responsive.css`)
```css
.loc-card { pointer-events: none !important; }
.hud:not(.on), .hud:not(.on) .h-tac { pointer-events: none !important; }
.menu.open { z-index: 20; }
```

> **Agent Rule**: Whenever an overlay hides via `opacity: 0` or class toggle instead of `display: none`, ALWAYS enforce `pointer-events: none` on its inactive state AND test real `Input.dispatchTouchEvent` taps on UI elements underneath it!

---

## 2. Synchronized Viewport Classification (`syncViewportEnv`)

In `mobile-input-aim.js`, JS and CSS must agree on exact device state classes toggled on `document.documentElement`:
- `is-touch`: Detected via `IS_TOUCH_DEV` (UA + `"ontouchstart" in window` + `(pointer: coarse)` + touchpoints on viewports `< 1024px`). Prevents mobile touch HUD styles from leaking onto `1440×900` desktops.
- `is-portrait`: `isMob && !land`
- `is-landscape`: `isMob && (innerWidth > innerHeight && innerHeight <= 560)`

Always pair viewport sizing with dynamic height `#app { height: 100dvh; }`, `touch-action: none` on `#view, #tt-ui`, and `touch-action: pan-x` on `.tt-row` so horizontal card swiping doesn't fight 3D orbit dragging!

---

## 3. Non-Overlapping 4-Quadrant HUD Budgeting

Instead of hiding minimap & scoreboard on mobile (as V2 did with `@media (max-width:760px)`), allocate strict orthogonal lanes verified mathematically via `getBoundingClientRect()` pairwise checks (`scripts/cdp-qa/layout-audit.mjs`):
- **Portrait (`390×844`)**:
  - Top-Left: Objective + Compact Compass (`width: calc(100vw - 174px)`)
  - Top-Right: Compact Radar Minimap (`top: 8px, right: 52px`) + Score Card (`top: 134px`) + Pause/Auto-Fire Toggle Column (`right: 8px`)
  - Bottom-Left: Dashed Move Stick Idle Cue (`bottom: 86px`) + Health (`bottom: 212px`)
  - Bottom-Right: Staggered thumb cluster (`Fire`, `ADS`, `Jump`, `Reload`, `Interact`) above the 4-column Tactical Bar (`bottom: 6px`).
- **Landscape (`844×390`)**:
  - Side columns hug `var(--sal)` / `var(--sar)` safe areas while center-bottom `.h-tac` stays `max-width: 56vw`, keeping the center crosshair (`50%, 50%`) 100% unobstructed!

---

## 4. Mobile Playability Helpers Without Desktop Side Effects

1. **PointerLock Suppression (`v_`)**: Desktop calls `e.requestPointerLock()`, which rejects or warns on Android/iOS touchscreens. Guard both `requestLock()` calls (`tryLockFPS`) AND comms drag warnings (`"鼠标捕获不可用"`) with `!IS_TOUCH_DEV && (i.playMode || "fps") === "fps"`.
2. **Cone Aim-Assist + Auto-Fire Pill (`dm`)**:
   - Gentle target lock cone (`11°`) + shot blending (`7.5°`) compensates for thumb-drag precision limits without snapping erratically.
   - `#t-assist-btn` lets players toggle between casual `自动开火:开` and hardcore `仅手控:关` mid-match.

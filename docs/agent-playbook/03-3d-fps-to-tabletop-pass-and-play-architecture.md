# Playbook 03: Converting a Live 3D FPS World into a 1P/2P Pass-and-Play Tabletop Wargame

**Originating Problem**: Mobile players often cannot play twitch 3D FPS shooters when commuting one-handed or sitting across a table with a friend. Reusing the existing 3D procedural harbor & spaceport assets to power a **turn-based 3D Tabletop Wargame (`tt1p` & `tt2p`)** multiplies the game's social value without duplicating 3D geometry.

---

## 1. Architectural Trick: Reusing the Live 3D Terrain & FX Pipeline

Instead of building a flat 2D SVG minigame:
- `ttRoot` (`Group` named `"tabletop-board"`) mounts straight into `i.scene` above the existing ocean bridge / spaceport terrain.
- `ttGroundY(x, z)` queries `i.physics.groundHeight(x, z, 6)` so every node ring and pawn (`leader`, `hound`, `drone`) snaps accurately to real terrain contours.
- Attacks call `i.fx.tracer`, `i.fx.sparks`, `i.fx.explosion`, and `a(i.audio, "play", "rifle_shot", ...)` directly, making the board feel alive!
- Calling `i.tabletop.stop()` wipes `ttRoot.children` (`ttRem === 0`) so returning to FPS leaves zero orphan geometry.

---

## 2. Three Real Bugs Fixed While Shipping Tabletop Mode

### Bug 1: Portrait Orientation Clipping (`390×844`)
- **Symptom**: Using the default desktop camera yaw (`0.24 rad`) horizontally clipped leftmost/rightmost map nodes on narrow portrait screens.
- **Fix (`ttResetCam`)**: When `innerWidth < innerHeight`, pull `tt.camDist = 76`, `tt.camPitch = 0.94`, and rotate `baseYaw = -Math.PI / 2` so the east-west battlefield aligns vertically down the tall phone screen!

### Bug 2: Projected 3D Node Buttons Colliding with Top Bar & Bottom Dock
- **Symptom**: As the user zooms or orbits, `.tt-nbtn` node labels projected from 3D world coords (`tt.projVec.project(i.camera)`) can land behind `.tt-top-wrap` or `.tt-dock`, stealing taps from cards!
- **Fix (Dynamic DOM Safe Clamping)**: Every frame in `i.tabletop.update(P)`, measure live UI rects:
  ```js
  let topSafe = Math.round((tw ? tw.getBoundingClientRect().bottom : 80) + 20);
  let botSafe = Math.round((dk ? dk.getBoundingClientRect().top : H0 - 120) - 22);
  let sy = Math.max(topSafe, Math.min(botSafe, Math.round((-tt.projVec.y * .5 + .5) * H0)));
  ```
  Result in `latest-qa-report.json`: **`markerCollisions: 0`** across all `11` nodes.

### Bug 3: `syncMissionUI()` Overwriting Tabletop Debrief Titles
- **Symptom**: After winning a 2P Tabletop match and calling `l.show("complete")`, subsequent calls to `syncMissionUI()` reset `#m-debrief-k` and `#m-debrief-h` back to `"东海深蓝港区 · 突击简报"`!
- **Fix**: Wrap desktop debrief text assignment with `(pm === "fps") && (...)`, preserving `"东海深蓝港区 · 2P 双人面对面战棋简报"` (`verified` in `tabletopDebrief.kicker`).

---

## 3. Designing Frictionless 2P Pass-and-Play (`#tt-handoff`)

When sitting face-to-face across a table with one device (`tt2p`):
1. Clicking `#tt-endturn-btn` pops `#tt-handoff` (opaque frosted blocker) BEFORE rotating the camera so neither player accidentally sees or taps during transition.
2. Confirming `#tt-ho-go` dismisses `#tt-handoff` and increments `tt.camTargetYaw += Math.PI` (smoothly lerped in `update(P)` over ~1 second, verified `targetDelta: 3.142 rad`, unless disabled via `#tt-flip-btn`).

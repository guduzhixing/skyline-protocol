# Agent 工程剧本 02：移动端四象限 HUD 与“幽灵点击拦截陷阱”排雷

**适用场景**：将原先为桌面 `1440×900` 设计的 3D WebGL 网页升级为兼顾手机竖屏（`390×844`）与横屏（`844×390`）直接游玩的双栖体验时，极易遇到**“按钮看得见却点不动”**、**桌面弹层误触锁死**、以及**慢帧下视口布局类名未同步**等问题。

---

## 1. 隐形杀手：幽灵 `pointer-events` 拦截陷阱（Ghost Pointer-Event Trap）

在桌面大屏 `1440×900` 下，角落的提示卡或居中装饰层很少挡住主按钮；但一旦切换至 `390×844` 手机竖屏，未严格收口的图层就会静默覆盖交互区：

- **典型元凶 1：大厅装饰浮层 `.loc-card`** —— 若仅靠透明度隐去而未在非激活态设为 `pointer-events: none`，它在竖屏居中位置恰好盖住 `DEPLOY` 启动按钮。
- **典型元凶 2：未激活 HUD `.hud:not(.on)`** —— 隐藏状态的 FPS HUD 如果只改了 `opacity: 0` 没有加 `pointer-events: none`，即使当前处于大厅菜单或战棋界面，隐形按钮依旧在抢夺屏幕点击事件。

**修复契约**（已在 [src/styles/mobile-responsive.css](../../src/styles/mobile-responsive.css) 强制落地并写入 [AGENTS.md](../../AGENTS.md)）：所有非交互容器（全局提示蒙层、未激活 `.hud:not(.on)`、`.loc-card` 等）必须显式声明 `pointer-events: none`，仅对 `.on` 激活态面板与具体可交互控件局部放行 `pointer-events: auto`。

---

## 2. 视口状态类严格成对同步 + 慢帧自愈

仅靠 CSS `@media (max-width: 760px)` 远远不够，原因有二：其一，手机横屏宽度常达 `844px` 以上，会绕过狭隘的宽度媒体查询，退化成桌面 HUD；其二，软件渲染或无头测试下视口改变后浏览器事件派发可能滞后于首帧渲染。

我们在 [src/modules/mobile-input-aim.js](../../src/modules/mobile-input-aim.js) 中建立了**特征探测 + 成对互斥类 + 主循环兜底校验**三重机制：

```js
let _svW=0,_svH=0;
function syncViewportEnv(){
  _svW=innerWidth, _svH=innerHeight;
  let doc=document.documentElement;
  let isMob=IS_TOUCH_DEV||innerWidth<900&&("ontouchstart"in window||navigator.maxTouchPoints>0);
  doc.classList.toggle("is-touch",!!isMob);
  let land=innerWidth>innerHeight&&innerHeight<=560;
  doc.classList.toggle("is-portrait",!!isMob&&!land);
  doc.classList.toggle("is-landscape",!!isMob&&!!land);
}
```

并在 [src/modules/tabletop-engine.js](../../src/modules/tabletop-engine.js) 的 `mM-B-tabletop-loop` 主循环帧函数 `B(P)` 顶部加入自愈守卫：

```js
(_svW!==innerWidth||_svH!==innerHeight)&&syncViewportEnv();
```

即使在 WebGL 软件渲染慢帧或系统窗口先变尺寸后发 `resize` 的极端情况下，下一渲染帧也会毫秒级完成 `.is-portrait` / `.is-landscape` 切换，绝不污染桌面端 `1440×900`（实测 `isTouchClass: false`）。

---

## 3. 四象限拇指安全区 HUD 布局预算

为了在 `390×844` 竖屏与 `844×390` 横屏均保持 **`0` 重叠（`overlaps: []`）与 `0` 越界（`oob: []`）**，[src/styles/mobile-responsive.css](../../src/styles/mobile-responsive.css) 将 `12` 个活跃 HUD 元素（`.h-obj`、`#h-map`、`.h-score`、`.h-compass`、`.t-pause`、`#t-assist-btn`、`.h-health`、`.h-ammo`、`.h-tac`、`.t-fire`、`.t-ads`、`.t-jump`、`.t-reload`、`.t-stick-idle` 中的可视集合）严格按四象限预算分配：
- **顶部左侧 / 中上**：任务目标与雷达、暂停按钮；保留 Safe Area Inset `env(safe-area-inset-top)`（`--sat`）。
- **顶部右侧**：自瞄自动开火开关 `#t-assist-btn`（点击即切 `自动开火:开` ↔ `仅手控:关`）。
- **底部左侧**：虚拟左摇杆 `.t-stick-idle` + 生命/状态栏。
- **底部右侧**：拇指扇形集群——开火 `.t-fire`、瞄准 `.t-ads`、跳跃 `.t-jump`、换弹 `.t-reload`。
- **正中央**：完全留空作为视角拖拽滑动区与准星战场视野。

---

## 4. 屏蔽指针锁定与三级圆锥自瞄系统

1. **指针锁定（PointerLock）隔离**：在 `guard-pointerlock-mobile-tabletop` 补丁中对 `f.touch || IS_TOUCH_DEV || (i.playMode && i.playMode !== "fps")` 直接短路 `requestPointerLock()`，配合 `guard-drag-msg-*` 消除“鼠标捕获不可用”提示干扰（QA 校验 `hasLockPrompt: false`）。
2. **三级触屏圆锥辅助瞄准**：
   - `11°` / `65 m`：柔和磁性视角牵引 `we.yaw` / `we.pitch`（需通过 `lineOfSight` 视线遮挡校验）。
   - `7.5°` / `85 m`：开火瞬时射击向量 `.72` 权重平滑对齐目标。
   - `4.5°` / `65 m`：开启 `autoFire` 时自动扣动扳机，显著降低单手竖屏门槛。

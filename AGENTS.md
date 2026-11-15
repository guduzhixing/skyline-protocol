# AGENTS.md — 编码智能体架构契约与工程守则

本文件为 **AI 编码智能体**（Codex / Antigravity / Claude Code / Gemini）以及人类核心维护者在修改 `skyline-protocol` 仓库时必须严格遵守的第一手架构契约。

---

## 1. 唯一真相源（Source of Truth）文件表

> **严禁直接手改生成的产物文件**（`index.html`、`dist/skyline-protocol-standalone.html`、`dist/skyline-protocol-open.html`）。所有修改必须在 `src/` 源文件完成，然后通过构建脚本重新生成产物。

| 文件路径 | 职责定位 | 允许编辑？ |
| :--- | :--- | :--- |
| [src/core/engine-base.html](src/core/engine-base.html) | V2 单闭包 WebGL2/Three.js 基础游戏引擎（`1,590,585 B`） | 仅底层引擎缺陷时修改 |
| [src/styles/mobile-responsive.css](src/styles/mobile-responsive.css) | 触屏 / 竖屏 / 横屏响应式四象限 HUD 样式与幽灵事件屏蔽 | 是 |
| [src/styles/tabletop-ui.css](src/styles/tabletop-ui.css) | 3D 战棋悬浮节点、`#tt-top` / `#tt-dock` 及 2P `#tt-handoff` 界面样式 | 是 |
| [src/modules/mobile-input-aim.js](src/modules/mobile-input-aim.js) | `MOBILE_PATCHES` 槽位补丁（自适应摇杆、圆锥辅助瞄准、帧同步） | 是 |
| [src/modules/tabletop-engine.js](src/modules/tabletop-engine.js) | `TABLETOP_PATCHES` 槽位补丁（11 节点 `TT_MAPS`、战棋 AI、180° 翻转） | 是 |
| [src/presets/superacme-showcase.json](src/presets/superacme-showcase.json) | Showcase 演示版外部 PNG 贴图映射 | 是 |
| [src/presets/open-neutral.json](src/presets/open-neutral.json) | Pure 纯净开源版内联 SVG 与品牌字符串中性替换表 | 是 |
| [scripts/build.mjs](scripts/build.mjs) | 零依赖精确字符串槽位叠加构建器（`replaceExact`） | 需谨慎维护锚点 |
| [scripts/verify-build.mjs](scripts/verify-build.mjs) | 快速静态检查与内联 JS `node --check` 语法验证 | 需谨慎 |
| [scripts/cdp-qa/run-4matrix-qa.mjs](scripts/cdp-qa/run-4matrix-qa.mjs) | 无头 Chrome CDP 5 矩阵自动化视觉与交互测试套件 | 可扩展测试用例 |
| [dist/index.html](dist/index.html) | GitHub Pages `/dist/` 单机版本在线试玩与下载中心门户页 | 可按发布版式维护 |
| `index.html`, `dist/skyline-protocol-*.html` | 构建输出产物 | **禁止手改**，运行 `npm run build:all` 生成 |

---

## 2. 标准工作流命令（Node.js `>= 22.0.0`）

```bash
npm run build        # 仅构建 showcase 展示版（index.html + dist/skyline-protocol-standalone.html）
npm run build:pure   # 仅构建 pure 纯净开源版（dist/skyline-protocol-open.html）
npm run build:all    # 构建全部两个发布版本（日常开发标准命令）
npm run check        # 快速门禁（<1s）：内联 script 语法检验、Pure 版品牌残留归零检验
npm run qa           # 完整 5 矩阵无头 Chrome CDP + SwiftShader WebGL2 回归测试（约 50-60s）
npm run dev          # 启动本地 HTTP 预览服务
```

---

## 3. 核心引擎关键符号索引表（严禁猜测或重命名）

`src/core/engine-base.html` 采用单一闭包的压缩核心代码以保障零加载延迟；下列核心标识符是外部模块槽位挂载与 CDP 测试依赖的精确契约：

| 符号 / Key | 实测含义与作用 |
| :--- | :--- |
| `M2="180"` | 内建 Three.js 核心版本号标识 |
| `wt`, `Qe`, `Nn`, `O0`, `ls` | 核心底层渲染 / 材质 / 场景工具函数族 |
| `rn`, `xs`, `Wi`, `ot`, `W` | `W` 为主 Three.js 命名空间 / 场景上下文相关核心变量族 |
| `gi`, `Zn`, `Sn`, `v_`, `x_` | 实体 / AI / 关卡与物理逻辑变量族 |
| `dm`, `hM`, `pM`, `mM` | `mM(i)` 为核心游戏主状态机入口函数，驱动整个生命周期流转 |
| `YC`, `fM="saltline.settings.v1"` | 用户设置读写管理（音量、灵敏度等持久化本地键名） |
| `XC`, `CAREER_KEY="skyline.career.v2"` | 生涯军衔、分数与勋章持久化系统（`RANKS`、`MEDALS`） |
| `i.tabletop` | 运行时挂载在主上下文对象 `i` 上的 3D 战棋子系统命名空间 |
| `window.__G` / `window.__ready` / `window.__frames` / `window.__fatal` | QA 与遥测钩子：`__G` 暴露核心上下文，`__ready` 标志引擎就绪，`__frames` 统计帧数，`__fatal` 捕获致命异常 |

---

## 4. 六条绝对不可破坏的工程不变量（Hard Invariants）

1. **禁止幽灵 `pointer-events` 陷阱（Ghost Pointer-Event Trap）**
   - 所有处于隐藏状态全屏叠层或半透明信息卡片（如桌面端 `.loc-card`、未激活的 `.hud:not(.on)`）在非交互态必须保持 `pointer-events: none`；否则在手机端 `390×844` / `844×390` 等紧凑视口中会静默拦截中央 `DEPLOY` 按钮或触摸摇杆的点击事件。
2. **视口状态类成对严格同步（`is-touch` / `is-portrait` / `is-landscape`）**
   - `syncViewportEnv()` 不仅要更新 CSS `body` / `html` 类名，且必须在帧循环中校验缓存画布尺寸（`_svW !== innerWidth || _svH !== innerHeight`），防止在软件渲染慢帧或旋转延迟时样式与实际分辨率撕裂；同时 `is-portrait` 与 `is-landscape` 必须互斥成对切换。
3. **触屏环境指针锁定（PointerLock）隔离守卫**
   - 在触屏设备（`isTouch`）或桌面仿真触屏测试模式下，严禁触发桌面鼠标独占的 `requestPointerLock()`，且不可弹出“点击屏幕锁定视角”提示蒙层（QA 强制断言 `hasLockPrompt: false`）。
4. **结算面板（Debrief）`pm === "fps"` 模式保护**
   - 游戏从战棋模式与 FPS 模式复用共用战局或结算界面时，`syncMissionUI()` 必须严格校对 `pm === "fps"` 前置条件，严禁在战棋模式下误触发 FPS 装备面板或结算重映射导致 DOM 状态错乱。
5. **战棋 3D 悬浮节点安全区投影夹紧（Dynamic Marker Safe-Zone Clamping）**
   - [src/modules/tabletop-engine.js](src/modules/tabletop-engine.js) 在将 11 个 3D 节点坐标实时投影到屏幕二维像素时，必须动态计算顶栏 `.tt-top-wrap.bottom + 20` 与底栏 `.tt-dock.top - 22` 之间的安全垂直走廊并夹紧偏移，确保在 `390×844` 与 `844×390` 任意旋转视角下 `markerCollisions === 0`。
6. **Pure 纯净开源版零品牌残留对等契约（Pure Neutral Parity）**
   - `open-neutral.json` 定义的全部展示版品牌词条与图像在 `npm run build:pure` 输出的 [dist/skyline-protocol-open.html](dist/skyline-protocol-open.html) 中必须被 100% 替换为内联 SVG 与通用战术名称，`npm run check` 及 CDP 测试中的 `brandHitsInDOM` 必须严格为 `0`。

---

## 5. 修改代码后的标准 3 步验证清单

每次对 `src/` 或 `scripts/` 进行修改后，在提交或报告完成前**必须按序执行**：

1. **构建全量产物**：`npm run build:all`（确保 showcase 与 pure 两个版本的所有 `replaceExact` 槽位全部精确命中且未冲突）。
2. **运行秒级静态检查**：`npm run check`（确认内联 JS `node --check` 零语法错误，Pure 版无任何第三方品牌残留）。
3. **运行 5 矩阵无头 Chrome CDP QA**：`npm run qa`（验证所有 5 个矩阵绿灯通过、`runtimeErrors` 为空、HUD 重叠与越界为 `0`）。

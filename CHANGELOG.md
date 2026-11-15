# 更新日志（Changelog）

本文件记录了 **苍穹防线：零号协议（Skyline Protocol）** 从最初单一桌面原型演化为双模式、移动端优先开源引擎的完整版本历程。

---

## [3.1.0] - 2026-11-14

### 新增与工程化重构（Added & Modularized）
- **仓库开源架构与槽位组装构建管线**：将单一单文件拆分为 `src/core/engine-base.html` + `src/styles/` + `src/modules/` + `src/presets/`，推出零外部依赖组装器 [scripts/build.mjs](scripts/build.mjs)。
- **双预设合规构建体系**：支持 `--mode=showcase`（输出 `index.html` 与 `dist/skyline-protocol-standalone.html`，体积 `1,642,122 B`）与 `--mode=pure`（依据 [open-neutral.json](src/presets/open-neutral.json) 输出零第三方商标的 `dist/skyline-protocol-open.html`，体积 `1,572,207 B`）。
- **完整 QA 与 CI/CD 基础设施**：新增 `scripts/verify-build.mjs`、5 矩阵 Chrome CDP 自动化审计套件 [run-4matrix-qa.mjs](scripts/cdp-qa/run-4matrix-qa.mjs) / [layout-audit.mjs](scripts/cdp-qa/layout-audit.mjs)，以及 GitHub Actions CI + GitHub Pages 自动部署流水线。
- **Agent 工程手册与系统文档**：整理并发布 [AGENTS.md](AGENTS.md)、[CLAUDE.md](CLAUDE.md)、[docs/OPEN_SOURCE_STRATEGY.md](docs/OPEN_SOURCE_STRATEGY.md)、架构文档与 `01–06` 号实战 Playbook。

### 修复（Fixed）
- 修复慢速软件渲染帧下视口缩放延迟导致触屏类未及时同步问题：在动画帧循环增加 `_svW !== innerWidth || _svH !== innerHeight` 自同步判定。
- 修复 Linux/Windows CI 无头 Chrome 启动偶发端口冲突与固定延时不稳定问题：改为 `--remote-debugging-port=0` 解析 `DevTools listening on ws://...`，并使用基于状态的条件等待。

---

## [3.0.0] - 2026-11-14

### 新增（Added）
- **手机端双栖体验（`mobile-input-aim.js` & `mobile-responsive.css`）**：新增竖屏 `390×844` / 横屏 `844×390` 自适应四象限触屏 HUD、虚拟左移动摇杆与右视角划区、指针锁定屏蔽、圆锥辅助瞄准与一键自动开火开关（`自动开火:开` ↔ `仅手控:关`）。
- **同源 3D 战棋引擎（`tabletop-engine.js` & `tabletop-ui.css`）**：复刻并共享战场实时 3D 地形高度采样与特效管线，实现 11 节点连通图沙盘推演、AP 行动力、战术支援卡，支持 **1P 单人指挥** 与 **2P 双人面对面传玩（交接时自动平滑翻转 180° / `3.142 rad`）**。
- **动态投影安全区夹紧与防误触发护栏**：保证竖屏/横屏切换中 11 个 3D 节点标记与顶栏/底栏零碰撞（`markerCollisions: 0`），并在 `syncMissionUI()` 中严格检查 `pm === "fps"` 保护战棋模式不受结算状态污染。

---

## [2.0.0] - 2026-11-14

### 新增与优化（Added & Changed）
- **作品定名与世界观扩展**：由原型更名为《苍穹防线：零号协议》（Skyline Protocol），引入“研极微 SuperACME / CINMOORE 神眸”正能量战略硬件视觉整合方案（展示版实机 3D 广告牌、PT2C/BC4 Pro+/BC6V/BC22 装备卡与品牌弹窗）。
- **非对称数值重构与 3 层成长体系**：重构波次难度曲线（自动炮台上限 `2` 台 / `115 HP` / `42 s` 寿命、EMP 过载瘫痪时长 `11 s`、4 波进攻含 2 个重型 Boss、新增 `[G]` 翼卫支援），接入 `skyline.career.v2` 生涯体系（`7.5 s` 连击衰减、8 阶军衔 `RANKS`、10 枚勋章 `MEDALS`）。

---

## [1.0.0] - 2026-11-14

### 初始原型（Initial）
- 完成首个零外部请求的单文件 WebGL2 3D FPS 防空塔防原型，内置程序化纹理、合成音效、第一人称射击与基础波次敌人生成逻辑（`1,425,707 B`）。

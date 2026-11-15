# 更新日志（Changelog）

本文件记录了 **苍穹防线：零号协议（Skyline Protocol）** 从最初单一桌面原型演化为双模式、移动端优先开源引擎的完整版本历程。

---

## [3.2.0] - 2026-11-15

### 新增与精细化升级（Bionic Hound, Global Character Overhaul & Catharsis Loop）
- **守护方仿生四足机器狗精细化重塑（`src/modules/bionic-hound-and-catharsis.js`）**：
  - 将原版粗糙几何体（仅 7 个静态方块/圆柱体）升级为 **59+ 子网格的高精度具身智能仿生四足机器狗（`buildBionicHoundRig`）**，严格做到**零第三方侵权 Logo**。
  - **结构特征**：抬升式流线兜帽双目 AI 视觉头舱（左右圆形双摄 + 中央胶囊形 ToF 深度窗 + 顶部青色神经灯带 + 银白前胸龙骨支架）、4 组香槟钛金同轴双鼓伺服关节电机（带散热环与 `Fn` 三维编织线缆导管）、4 条 S 型反关节双段式铰接腿（大腿 + 膝关节枢轴 + 弧形小腿刃 + 半球形橡胶足垫）、腹部散热鳍片 + 4 块卧姿缓冲垫、尾部 432Wh 快拆电池灯阵、背部 20kg 载荷导轨与双联电磁脉冲炮塔。
  - **实时步态与特技**：实现四足对角小跑步态（`FL+RR` / `FR+RL` 交替摆动）、转向倾角反馈、呼吸扫描待机，以及 **720° 仿生后空翻脉冲震击（`al.flipT`）**；守护方开局自动伴随部署 1 台仿生灵犬守卫。
- **全角色与第一人称接管视角（ViewModel）全局升级**：
  - 升级 `[V]` 机械犬/无人机第一人称接管模型（`houndVm` 同轴电机鼓+编织导管+双联交替后坐力电磁炮、`droneVm` 前伸碳纤旋翼臂+高速旋转桨盘）、守护方 `[G]` 太阳能双翼三脚架云台哨兵炮塔（超频链式闪电）、突击方 `[G]` 倾转双旋翼双目突击僚机、特战指挥官全息分身（`opHolo`），以及敌方精英/首领（`Elite` / `Boss`）重装肩甲与背部双联等离子炮。
  - 同步升级 3D 沙盘战棋（`tabletop-engine.js`）全部微缩模型，并为战棋机械犬赋予 **「仿生二段跃击（2 格）」与「近身扑击（+8 伤害）」** 专属机制与棋盘 720° 空翻动画。
- **全链路爽感反馈闭环（Catharsis & Dopamine Loop）**：
  - **3D 浮动暴击伤害跳字（`#h-popups` / `#tt-popups`）**：实时投影命中点、弱点暴击（`⚡暴击!`）与技能震波数值（严格 `pointer-events: none !important`）。
  - **五阶连杀勋章横幅与即时自动增益（`#h-streak`）**：`DOUBLE KILL`（+60 战功）→ `TRIPLE STRIKE`（瞬满弹匣 + 纳米回血 +25 HP）→ `QUADRA OVERLOAD`（`[Q]` 冷却缩减 4.5s）→ `RAMPAGE`（5.5s 无限弹匣 + 射速飙升 35%）→ `SKYLINE DOMINATOR`（召唤轨道电磁天罚光柱 `180 DMG`）。
  - **新增 `[F]` 战术脉冲震击与灵犬协同空翻（`triggerPulseStrike`）**：激活原本闲置的 `[F]` 键（以及机械犬高空落地震击、中继切断/满修谐波震击），一键震退周身敌群并号令全场仿生灵犬同步施展 720° 空翻震击。

---

## [3.1.0] - 2026-11-14

### 新增与工程化重构（Added & Modularized）
- **仓库开源架构与槽位组装构建管线**：将单一单文件拆分为 `src/core/engine-base.html` + `src/styles/` + `src/modules/` + `src/presets/`，推出零外部依赖组装器 [scripts/build.mjs](scripts/build.mjs)。
- **双预设合规构建体系**：支持 `--mode=showcase`（输出 `index.html` 与 `dist/skyline-protocol-standalone.html`，体积 `1,642,502 B`）与 `--mode=pure`（依据 [open-neutral.json](src/presets/open-neutral.json) 输出零第三方商标的 `dist/skyline-protocol-open.html`，体积 `1,572,587 B`），并新增 [dist/index.html](dist/index.html) 单机发行中心入口页。
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

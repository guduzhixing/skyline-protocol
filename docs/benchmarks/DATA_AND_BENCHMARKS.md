# 数据与性能基准报告（Data & Benchmarks）

本报告汇总了 **苍穹防线：零号协议（Skyline Protocol）** 各版本单文件构建体积对比、最近一次 5 矩阵 Chrome CDP WebGL2 真机视口实测数据，以及核心数值配置清单。所有实时 QA 遥测数据均直接来自 [latest-qa-report.json](latest-qa-report.json)。

---

## 1. 版本演进与单文件构建体积对比

| 版本 / 构建产物 | 路径说明 | 总字节数 | 内联 `<script>` 体积 | 关键架构特征 |
| :--- | :--- | ---: | ---: | :--- |
| **V1.0 初始原型** | `几猫国产3A大作_V1.html`（父工作区归档） | `1,425,707 B` | — | 首版桌面 WebGL2 FPS + 防空波次原型 |
| **V2.0 核心基线** | `苍穹防线_零号协议_V2.html` / [engine-base.html](../../src/core/engine-base.html) | `1,590,585 B` | — | 东海海空 + 赤沙航天港双战区、生涯体系、非对称数值、Showcase 广告集成 |
| **V3.0 双栖原型** | `苍穹防线_零号协议_V3.html`（父工作区归档） | `1,641,901 B` | — | 引入竖屏/横屏触屏 HUD、自动开火胶囊及 1P/2P 3D 战棋原型 |
| **V3.1 Showcase 默认版** | [index.html](../../index.html) / [skyline-protocol-standalone.html](../../dist/skyline-protocol-standalone.html) | `1,642,122 B` | `1,575,303 B` | 模块化 `src/` 槽位构建，包含 5 枚内联 PNG 硬件贴图及帧循环视口自同步 |
| **V3.1 Pure 纯净开源版** | [skyline-protocol-open.html](../../dist/skyline-protocol-open.html) | `1,572,207 B` | `1,505,399 B` | 由 [open-neutral.json](../../src/presets/open-neutral.json) 注入内联 SVG，零专有商标残留 |

### Showcase 展示预设二进制贴图开销明细（`assets/presets/superacme/`）

| 资产键名 | 文件名 | 原始文件大小 | 用途 |
| :--- | :--- | ---: | :--- |
| `logo` | [superacme_logo.png](../../assets/presets/superacme/superacme_logo.png) | `3,642 B` | 大厅及 HUD 角标展示横幅 |
| `pt2c` | [sa_pt2c.png](../../assets/presets/superacme/sa_pt2c.png) | `12,671 B` | 防御哨兵台 / 云台炮塔视觉标识 |
| `bc4pro` | [sa_bc4pro.png](../../assets/presets/superacme/sa_bc4pro.png) | `11,796 B` | 游骑突击 / 双目锁定装备卡 |
| `bc6v` | [sa_bc6v.png](../../assets/presets/superacme/sa_bc6v.png) | `13,595 B` | 突击队长穿戴式视觉记录装备 |
| `bc22` | [sa_bc22.png](../../assets/presets/superacme/sa_bc22.png) | `12,310 B` | 便携式补给锚点与回血空投箱 |

---

## 2. 5 矩阵无头 Chrome CDP + WebGL2 实测结果

最近一次完整全量 QA 记录（[latest-qa-report.json](latest-qa-report.json)）：
- **执行时间戳**：`2026-11-14T16:33:56.279Z`
- **总耗时**：`52,526 ms`
- **运行时 JS 报错（`runtimeErrors`）**：`[]`（0 条报错）

| 测试矩阵 | 测试视口与模式 | 实测关键指标与断言结果 |
| :--- | :--- | :--- |
| **Matrix A：手机竖屏大厅 & FPS** | `390×844`（触屏仿真） | `12` 个 HUD 元素布局检测：`overlaps: []`，`oob: []`；`DEPLOY` 按钮居中坐标 `{top: 385, bottom: 429, vh: 844}`；`modesCount: 3`；无误触指针锁定提示（`hasLockPrompt: false`）；自瞄开关点击响应：`自动开火:开` → `仅手控:关` |
| **Matrix B：手机横屏 FPS** | `844×390`（触屏仿真） | 根元素挂载类名：`["is-touch", "is-landscape"]`；`12` 个 HUD 元素分布于左右安全象限：`overlaps: []`，`oob: []` |
| **Matrix C：3D 战棋 1P / 2P 传玩** | 竖屏 1P & 横屏 2P | 棋盘拓扑节点：`11` 个；动态安全区投影重叠：`markerCollisions: 0`；2P 结束回合弹出传玩遮罩（`handoffShown: true`）；确认换手后相机目标增量 `targetDelta: 3.142 rad`，实测旋转收敛 `yawDeltaRad: 3.117 rad`；退出后结算标题 `kicker: "东海深蓝港区 · 2P 双人面对面战棋简报"`，二次重开残留战棋 DOM：`ttRem: 0` |
| **Matrix D：桌面端标准回归** | `1440×900`（非触屏） | 未污染桌面类名（`isTouchClass: false`）；部署后战区 3D 实景标牌可见数量：`billboardsAfterDeploy: 3`；大厅标题垂直位置 `eyebrowTop: 93`，`deployBot: 760`；正常进入 FPS 态（`fpsState: "playing"`） |
| **Matrix E：Pure 纯净版引导** | `dist/skyline-protocol-open.html` | 引擎无异常引导完成（`fatal: null`）；页面 DOM 遍历专有品牌词命中数：`brandHitsInDOM: 0` |

> **如何本地复现该基准测试**：执行 `npm run check && npm run qa`（详见 [run-4matrix-qa.mjs](../../scripts/cdp-qa/run-4matrix-qa.mjs)）。

---

## 3. 核心视觉回归图集索引（`docs/showcase/`）

| 截图场景 | 预览图文件 | 说明 |
| :--- | :--- | :--- |
| 桌面端大厅回归 | [v3_desktop_title_regression.png](../showcase/v3_desktop_title_regression.png) | `1440×900` 大厅主视觉与模式卡片回归 |
| 手机竖屏大厅 | [v3_mobile_portrait_title.png](../showcase/v3_mobile_portrait_title.png) | `390×844` 三模式切换卡片与中央部署键 |
| 手机竖屏 FPS | [v3_mobile_portrait_fps.png](../showcase/v3_mobile_portrait_fps.png) | 四象限无重叠摇杆与右上自瞄胶囊 |
| 手机横屏 FPS | [v3_mobile_landscape_fps.png](../showcase/v3_mobile_landscape_fps.png) | 双手握持横屏安全布局 |
| 1P 手机竖屏战棋 | [v3_tabletop_portrait_1p.png](../showcase/v3_tabletop_portrait_1p.png) | `-Math.PI/2` 横向偏航全景 + 11 节点零碰撞 |
| 2P 横屏交接遮罩 | [v3_tabletop_landscape_2p_handoff.png](../showcase/v3_tabletop_landscape_2p_handoff.png) | 回合交接防偷看遮罩与 180° 旋转提示 |
| 桌面端海空战棋 | [v3_tabletop_desktop_ocean.png](../showcase/v3_tabletop_desktop_ocean.png) | 东海大桥实景地形上方俯瞰推演 |
| 战棋结算简报 | [v3_tabletop_debrief.png](../showcase/v3_tabletop_debrief.png) | `syncMissionUI()` 模式保护下的战棋胜利结算页 |

---

## 4. 核心玩法数值与生涯配置概览

- **本地持久化 Keys**：
  - 设置键：`fM = "saltline.settings.v1"`（包含 `quality`, `sens`, `invertY`, `volume`, `fov`, `aimAssist`, `autoFire`, `gyroAim`, `tableFlip`）。
  - 生涯键：`CAREER_KEY = "skyline.career.v2"`。
- **生涯等级与勋章体系**：
  - 共设 **`8` 阶军衔（`RANKS`）** 与 **`10` 枚解锁勋章（`MEDALS`）**（V3 新增 `table_master`《沙盘运筹》`+350` 与 `table_grand`《桌面棋圣》`+450`）。
  - 实时连击衰减窗口：**`7.5 s`**；完局支持 `Tier + 1` 无尽难度跃升。
- **非对称攻防与战棋数值**：
  - FPS 守方自动炮塔上限 `2` 台（单台耐久 `115 HP`，存在寿命 `42 s`），抗衡 `4` 波分路进攻与 `2` 名重型首领；攻方持有 `11 s` 超长 EMP 过载与 `[G]` 翼卫召唤支援。
  - 3D 战棋每轮初始行动力 **`4 AP`**（每占领 `1` 个 `supply` 节点额外 `+1 AP`），`maxRounds: 6` 轮对抗；单位攻击射程 1–3 跳（如 `PT2C巡飞无人机` 射程 `3` 跳，`BC6V突击队长` `120 HP / 42 DMG / 2 跳`），战术卡消耗 `1–2 AP`（`EMP` 与 `BC22+` 共享 `2` 回合冷却节拍）。

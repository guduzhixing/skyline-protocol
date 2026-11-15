# 引擎子系统与架构拆解（Engine Subsystems）

本文档深入剖析 **苍穹防线：零号协议（Skyline Protocol）** 从构建时组装到运行时四大核心子系统的内部实现机理。修改代码前，建议先对照阅读 [AGENTS.md](../../AGENTS.md)。

---

## 1. 构建期“槽位叠加组装流水线”

为避免把 [src/core/engine-base.html](../../src/core/engine-base.html) 中 `1.59 MB` 的高度压缩 Single-Closure WebGL2/Three.js 内核强行拆散引发闭包变量作用域断裂，项目采用基于精确字符串锚点（`replaceExact`）的组装器 [scripts/build.mjs](../../scripts/build.mjs)：

```text
  src/core/engine-base.html (V2 单闭包基线引擎，1,590,585 B)
         │
         ├──► [Step 1] 资产注入（仅 showcase 模式）
         │      └─ 读取 superacme-showcase.json → Base64 序列化 5 张 PNG 替换 SA_ASSETS={...}
         │
         ├──► [Step 2] 模块化 CSS 注入（锚点: v3-modular-css）
         │      └─ 合并 src/styles/mobile-responsive.css + src/styles/tabletop-ui.css
         │
         ├──► [Step 3] 行为槽位补丁注入（有序校验唯一锚点）
         │      ├─ MOBILE_PATCHES  (src/modules/mobile-input-aim.js: 视口检测、指针锁守卫、触屏UI、圆锥自瞄)
         │      └─ TABLETOP_PATCHES (src/modules/tabletop-engine.js: TT_MAPS、战棋核心、状态机切入、新增勋章)
         │
         └──► [Step 4] 按模式分支产出（showcase vs pure）
                ├─ --mode=showcase ──► index.html & dist/skyline-protocol-standalone.html (1,642,122 B)
                └─ --mode=pure     ──► 读取 open-neutral.json 替换 SVG + 清洗品牌词条
                                       ──► dist/skyline-protocol-open.html (1,572,207 B)
```

---

## 2. 运行时四大核心子系统

### 2.1 图形与共用场景图（Graphics & Scene Graph）

- **底层基线**：内嵌 Three.js r180（全局版本号标识 `M2="180"`，场景/矩阵/几何体工具集合 `wt`、`Qe`、`Nn`、`O0`、`ls`、`Wi`、`ot`、`gi`、`Sn`）。
- **场景根分区**：主 `i.scene` 上分别挂载了常规战术实体根节点 `tacRoot`（`tactical-entities`）与 V3 新增战棋根节点 `ttRoot`（`tabletop-board`）。
- **零重复地面采样与特效复用**：战棋引擎不单独重建世界模型，而是直接读取主物理引擎 `i.physics.groundHeight(x, z, 6)` 计算节点高程并限幅在 `[0, 4.2]`（`ttGroundY`），并复用主局内 `i.fx.tracer`、`i.fx.sparks`、`i.fx.explosion` 与 `i.audio` 发声管道，实现“FPS 实景地图 → 上帝视角立体棋盘”无缝转换。
- **移动端帧率与画质节制**：在触屏设备上，[mobile-input-aim.js](../../src/modules/mobile-input-aim.js) 将 `low` 档阴影贴图从 `2048` 降至 `1024`（`volSteps: 10`，`rain: .45`），并把设备像素比 `devicePixelRatio` 钳制在 `1.5` 以内（桌面保持最高 `2.0`）。

### 2.2 输入自适应、四象限触屏与圆锥辅助瞄准（`mobile-input-aim.js`）

- **精准触屏环境识别（`IS_TOUCH_DEV` & `syncViewportEnv()`）**：结合 UA、`"ontouchstart" in window`、`(pointer: coarse)` 媒体查询与 `maxTouchPoints` 自动识别手机竖屏与横屏，在 `document.documentElement` 互斥切换 `is-touch`、`is-portrait` 与 `is-landscape`；同时在主循环 `B(P)` 中持续比对 `_svW !== innerWidth || _svH !== innerHeight` 以自愈软件渲染慢帧下的布局滞后。
- **桌面防污染与指针锁屏蔽**：`guard-pointerlock-mobile-tabletop` 与 `guard-drag-msg-*` 补丁确保非 FPS 桌面场景（一切触屏与 `tt1p`/`tt2p` 战棋）绝不调用 `requestPointerLock()` 或弹出鼠标提示。
- **三级手势友好型自瞄体系（运行于武器更新函数 `dm(i)` / `Be()` 中）**：
  1. **视角温和磁吸**：当视口准星前向 `11°` 锥角、最远 `65 m` 且视线无遮挡（`lineOfSight`）内存在敌方存活目标时，缓慢插值收拢 `we.yaw` / `we.pitch`。
  2. **开火射线弹道修正**：实际扣动扳机瞬间，检索 `7.5°` / `85 m` 内最佳目标并将射击向量 `ze` 与目标方向向量 `dt` 进行 `.72` 权重 `lerp` 对齐。
  3. **智能自动开火（可选开关）**：当 `#t-assist-btn`（`autoFire`）开启时，进入 `4.5°` / `65 m` 精准锁定圆锥即触发自动点射，玩家也可随时一键切换为“仅手控:关”。
  4. **陀螺仪辅助（`gyroAim`）**：支持监听 `deviceorientation`（含 iOS `requestPermission()` 适配）叠加微调视角偏移。

### 2.3 游戏主状态机 `mM(i)`（5 状态流转模型）

通过 [tabletop-engine.js](../../src/modules/tabletop-engine.js) 的 `mM-*` 槽位补丁，原本的 4 态 FPS 状态机平滑扩展为 **5 态双栖状态机**：

| 状态名（`_.state`） | 入口触发途径 | 激活视图层 / 相机控制 | 核心帧更新与离开逻辑 |
| :--- | :--- | :--- | :--- |
| **`"title"`** | 初始化完成 / `backtitle()` / 切换战区 | 显示大厅菜单与 3 枚模式卡（`fps` / `tt1p` / `tt2p`）；强制隐藏 `ttUI` | 执行 `z(P)` 标题环绕展示镜头 |
| **`"playing"`** | `playMode === "fps"` 点击部署或 `resume()` | 激活 `.hud.on`、武器模型与（桌面端）指针锁定 | 驱动第一人称移动、射弹物理与波次进攻 |
| **`"tabletop"`** | `playMode` 为 `"tt1p"` / `"tt2p"` 点击部署 | 隐藏武器模型并禁用鼠标锁定，激活 `#tt-ui.on` 与 `i.tabletop.start()` | 执行 `i.tabletop.update(P)`：3D 阻尼相机轨道、AI 步进及 11 节点投影刷新 |
| **`"paused"`** | 按下 Pause / ESC / `#tt-pause-btn` | 隐藏 `.hud` 与 `ttUI`，展示暂停弹窗（含返回模式主界面按钮） | `j(P)` 恢复时自动根据 `i.playMode` 分流回 `"tabletop"` 或 `"playing"` |
| **`"complete"`** | 胜负判定 `ttCheckWin()` 或 FPS 撤离成功 | 调用 `l.setDebrief(...)` 写入战绩、`CAREER_KEY` 积分与新解锁勋章 | `syncMissionUI()` 受 `pm === "fps"` 保护，防止战棋简报标题被覆盖 |

### 2.4 3D 战棋内核（`i.tabletop`）与动态安全区投影夹紧

- **双战区 11 节点无向图（`TT_MAPS[1]` & `TT_MAPS[2]`）**：覆盖战区 `1`（东海深蓝港区 `n_gate` → `n_ext`）与战区 `2`（赤沙航天港 `m_gate` → `m_ext`），包含攻方司令部（`atk_hq`）、守方司令部（`def_hq`）、3 座中继枢纽（`relay`：甲 / 乙 / 丙）、2 座补给站（`supply`，控制后每轮额外提供 `+1 AP`）、普通节点（`node`）与撤离点（`ext`）。
- **视口自适应初始机位（`ttResetCam`）**：
  - 手机竖屏（`innerWidth < innerHeight`）：由于纵深比狭窄，采用横向横置布局视角 `baseYaw = -Math.PI / 2`、远景距 `camDist = 76`、`camPitch = 0.94`，让 `[-30, 25]` 全战线完整纳入竖屏视野。
  - 横屏 / 桌面：使用 `baseYaw = 0.24`、`camDist = 50`（横屏）或 `44`（桌面）、`camPitch = 0.86`。
- **屏幕安全走廊动态投影夹紧（`i.tabletop.update`）**：
  每帧将所有 11 个 3D 节点位置 `(nd.x, nd.y + 1.8, nd.z)` 通过 `project(i.camera)` 转至规范化屏幕空间后，水平夹紧在 `[46, W0 - 46]`，垂直严格测量顶栏 `.tt-top-wrap.getBoundingClientRect().bottom + 20` 与底栏 `.tt-dock.getBoundingClientRect().top - 22` 之间的安全高度并钳制，消除任何机型旋转下的 DOM 按钮遮挡（QA 强制断言 `markerCollisions: 0`）。
- **2P 面对面 180° 平滑转盘**：回合切换且 `settings.tableFlip !== false` 时，弹出全屏交接遮罩 `#tt-handoff`，接手指挥官点击 `#tt-ho-go` 后对 `tt.camTargetYaw` 累加 `Math.PI`（实测稳定旋转约 `3.117 ~ 3.142 rad`）。

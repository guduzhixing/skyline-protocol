# 二次开发与定制指南（Customization Guide）

本指南说明如何在不破坏 [AGENTS.md](../../AGENTS.md) 工程不变量的前提下，基于 `skyline-protocol` 的模块化源码定制品牌预设、3D 战棋地图拓扑、战术支援卡牌以及移动端 HUD 控件。

---

## 1. 定制主题与品牌预设（Showcase vs Pure 模式）

系统内的全部图片贴图键名由 `SA_ASSETS`（包含 `logo`、`pt2c`、`bc4pro`、`bc6v`、`bc22` 五个槽位）统一驱动：

1. **如需替换真实商业品牌展示素材（`--mode=showcase`）**：
   - 将您的透明底或紧凑 PNG 文件放入自定义目录（建议单张控制在 15 KB 内以保证单文件秒开）。
   - 修改 [src/presets/superacme-showcase.json](../../src/presets/superacme-showcase.json) 中的 `assets` 相对路径映射。
   - 运行 `npm run build`，[scripts/build.mjs](../../scripts/build.mjs) 会自动将其 Base64 内联进 [index.html](../../index.html) 与 [dist/skyline-protocol-standalone.html](../../dist/skyline-protocol-standalone.html)。
2. **如需定制中性开源版或国际化翻译预设（`--mode=pure`）**：
   - 编辑 [src/presets/open-neutral.json](../../src/presets/open-neutral.json)：
     - `svgAssets` 字段：替换 5 个槽位为轻量 `data:image/svg+xml;utf8,...` 矢量图标。
     - `replacements` 字段：有序字符串替换数组 `[from, to]`（注意把**更长、更具体的短语排在前面**，避免被短词条提前截断匹配）。
   - 执行 `npm run build:pure && npm run check`，确认产物 [dist/skyline-protocol-open.html](../../dist/skyline-protocol-open.html) 通过纯净度检查。

---

## 2. 扩展或设计 11 节点 3D 战棋地图（`TT_MAPS`）

战棋棋盘定义位于 [src/modules/tabletop-engine.js](../../src/modules/tabletop-engine.js) 顶部的 `TT_MAPS` 对象，按战区编号 `1` / `2` 索引。定制新战区时，务必遵守以下 **4 条几何与连通性不变量**：

1. **坐标安全边界（适配竖屏/横屏全景相机）**：
   - 将节点的 `(x, z)` 世界坐标限定在 **`x ∈ [-32, 28]`、`z ∈ [-24, 24]`** 范围内（例如当前节点分布在 `x: -30..25`、`z: -21..20`），确保竖屏默认相机（`camDist = 76`、`baseYaw = -Math.PI/2`）能一眼看全所有点位而不产生过多屏幕边缘拥挤或投影碰撞。
2. **严格无向对称邻接表（Symmetric `adj`）**：
   - 若节点 `A` 的 `adj` 数组包含 `B`，则 `B.adj` 也必须包含 `A`；否则 `ttDistHops()` 最短路搜索与连线渲染（仅在 `nd.id < nbId` 时绘制连接光束）会出现单向死路或断线。
3. **关键功能节点必须齐备**：
   - 胜利判定 `ttCheckWin()` 与初始化逻辑要求图中至少包含 `1` 个 `atk_hq`、`1` 个 `def_hq`、`1` 个 `ext`（撤离点）以及 `3` 个 `relay` 中继枢纽（分别携带 `relay: "甲" | "乙" | "丙"`），建议配 `2` 个 `supply` 节点用于提供 `AP` 加成。
4. **地形高度贴合**：
   - `y` 值无需手动硬编码，初始化阶段 `ttGroundY(d.x, d.z)` 会自动从 `i.physics.groundHeight` 读取对应实景 3D 地形高度并钳制在 `[0, 4.2]`。

---

## 3. 新增或调整战棋战术指令卡

战术卡 UI 渲染与点击结算均集中在 [src/modules/tabletop-engine.js](../../src/modules/tabletop-engine.js) 的两处位置：

1. **卡片渲染（`ttRenderUI()`）**：通过 `#tt-cards-row` 生成 `data-cid="..."` 按钮，利用 `tt.ap < cost` 与 `tt.cardsUsed.<key> > 0` 控制 `.disabled` 禁用样式。
2. **效果执行（`ttUI.addEventListener("click", ...)`）**：在 `if (btn.dataset.cid)` 分支中校验 AP 与冷却，消耗 `tt.ap` 并调用 `ttFireVisual` / `i.fx` / `ttLog`，最后务必补全 `ttRenderUI(), ttCheckWin();` 刷新界面与胜负判定。
3. **冷却衰减（`ttEndTurn()`）**：记得在 `ttEndTurn()` 顶部像 `emp` 与 `aid` 一样递减新卡的 `tt.cardsUsed.<key>` 冷却计数器。

---

## 4. 扩展移动端 HUD 控件与 QA 验证

若需要在移动端 HUD 或设置菜单增加新按钮/切换项：

1. **样式层（[src/styles/mobile-responsive.css](../../src/styles/mobile-responsive.css)）**：
   - 所有移动端布局规则应挂载在 `html.is-touch.is-portrait` 或 `html.is-touch.is-landscape` 下，切忌污染普通桌面宽度布局；可交互控件尺寸需兼容安全区环境变量 `var(--sat)` / `var(--sab)`。
2. **事件与设置持久化（[src/modules/mobile-input-aim.js](../../src/modules/mobile-input-aim.js)）**：
   - 在 `v3-settings-schema` 槽位向默认配置对象 `XC` 与校验函数 `YC()` 注册布尔字段。
   - 若新增全局触屏按钮，请同步绑定 `click` 与 `{passive: false}` 的 `touchstart` 事件并调用 `ev.stopPropagation()` 防止穿透触发开火。
3. **自动布局回归审计**：
   - 修改 HUD 后必须执行 `npm run build:all && npm run check && npm run qa`，让 [layout-audit.mjs](../../scripts/cdp-qa/layout-audit.mjs) 自动检查新版布局在 `390×844` 与 `844×390` 下的边界矩形，确保 `overlaps: []` 且 `oob: []`。

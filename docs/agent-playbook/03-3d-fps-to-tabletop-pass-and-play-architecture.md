# Agent 工程剧本 03：3D FPS 引擎同源复用为 1P/2P 面对面战棋架构

**适用场景**：当你希望同一套 WebGL 3D 动作游戏不仅能“拿起来单人横冲直撞”，还能在一两周聚会时变成“两个人把手机摆桌面上面对面下棋”的桌游，且不愿重新搭建一套重复的 3D 地形、特效与音效系统。

---

## 1. 同源引擎零冗余复用（Zero-Duplicate Asset Sharing）

[src/modules/tabletop-engine.js](../../src/modules/tabletop-engine.js) 挂载于主场景上下文 `i`（暴露在 `i.tabletop`），直接向主 `i.scene` 插入一个平行分支容器 `ttRoot`（`tabletop-board`），直接共享 FPS 战场的物理、特效与音频设施：

1. **地形高程复用（`ttGroundY`）**：棋盘 11 个节点的立体支架与兵棋高度直接查询主物理函数：
   ```js
   function ttGroundY(x,z){
     let y=i.physics&&i.physics.groundHeight?i.physics.groundHeight(x,z,6):0;
     return Math.max(0,Math.min(4.2,y));
   }
   ```
   因此战棋并非浮在空中的假板，而是直接降维俯瞰真实的东海海空码头与赤沙航天港地形。
2. **视听管线复用**：战棋兵棋交火时调用主引擎 `i.fx.tracer`、`i.fx.sparks`、`i.fx.explosion` 与 `a(i.audio, "play", ...)`，直接继承高质量弹道、火花与爆破音效。

---

## 2. 上线前夕修复的三大跨模态真实 Bug

### Bug 1：竖屏下战棋棋盘左右被裁切一半
- **根因**：沿用桌面 `camDist = 42` 与偏航 `0.25 rad` 时，东海/赤沙 11 节点战线横跨 `x: -30..25`，在狭窄的 `390×844` 竖屏里两侧起点/撤离节点直接飞出画幅。
- **解法（`ttResetCam`）**：竖屏自动旋转 90° 让漫长战线沿竖向铺展（`baseYaw = -Math.PI / 2`），同时拉开相机距离（`camDist = 76`，`camPitch = 0.94`），让整条海岸线/戈壁走廊严丝合缝铺满手机竖屏上下视野。

### Bug 2：3D 悬浮节点文字在低俯仰角时遮挡顶栏与底栏按钮
- **根因**：仅仅把 `project(i.camera)` 算出的屏幕坐标硬钳制在固定像素范围（如 `[60, H-120]`），在竖屏信息密度较高或横屏 `390px` 极矮视口中，节点标签 `.tt-nbtn` 会撞上顶栏 `.tt-top-wrap` 或底栏卡牌 `.tt-dock`。
- **解法（动态走廊安全区投影夹紧）**：每帧实时读取顶底 DOM 真实边界盒子，动态留白后再夹紧：
  ```js
  let topSafe = Math.round((tw ? tw.getBoundingClientRect().bottom : 80) + 20);
  let botSafe = Math.round((dk ? dk.getBoundingClientRect().top : H0 - 120) - 22);
  topSafe = Math.min(topSafe, H0 * .4);
  botSafe = Math.max(botSafe, topSafe + 40);
  ```
  该机制保证 `markerCollisions: 0` 通过率 100%。

### Bug 3：战棋结算简报文字被 FPS 逻辑静默覆写
- **根因**：战棋结束调用 `l.setDebrief(...)` 后设置 `#m-debrief-k`（例如“东海深蓝港区 · 2P 双人面对面战棋简报”），而 `syncMissionUI()` 在某些切换路径中被触发，又无条件把标题改回“突击简报 / 防卫简报”。
- **解法（`pm-preserve-tabletop-debrief` 补丁）**：在 `syncMissionUI()` 中对 FPS 简报写入加装模式护栏：
  ```js
  (pm === "fps") && (o("#m-debrief-k").textContent = ..., o("#m-debrief-h").textContent = ...);
  ```

---

## 3. 2P 面对面传玩与 180° 平滑转盘设计

面对面桌游核心不在界面花哨，而在**“信息防偷窥 + 方位零脑力转换”**：
1. P1 结束回合后，系统立刻覆盖 `#tt-handoff` 遮罩阻断棋盘视角并提示“请将设备转交下一位指挥官”。
2. P2 接过手机点击 `#tt-ho-go`（我已接手 · 开始行动）后，若开启 `tableFlip`（默认开），引擎对 `tt.camTargetYaw` 累加 **`Math.PI`**，由渲染循环平滑插值阻尼旋转至 `~3.142 rad`（CDP 实测 `yawDeltaRad: 3.043 rad`），沙盘建筑与兵棋直接正面朝向对坐玩家。
3. 退出重开新局时 `i.tabletop.stop()` 彻底清空 `ttRoot` 与 `.ttUI.on` 类名，CDP 验证二次重开残留战棋 DOM 为 `ttRem: 0`。

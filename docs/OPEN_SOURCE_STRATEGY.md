# 开源战略与价值定位（Open-Source Strategy）

**苍穹防线：零号协议（Skyline Protocol）** 并不仅是一份能够打开即玩的 3D 网页小游戏，而是一套围绕**“个人生产力复利 + 公众免费可用 + 多 AI Agent 工程契约”**三维一体设计的开源工程样板间。

---

## 1. 对公众与社区的价值（Public Good）

| 受众群体 | 核心痛点 | 本项目提供的开源解法 |
| :--- | :--- | :--- |
| **普通玩家 / 聚会桌游用户** | 传统 3D 手游动辄数 GB 下载包、满屏氪金弹窗；聚会缺少无需发牌器的零门槛面对面棋类 | 单个 HTML 浏览器点开即玩；同屏兼容 **FPS 射击**、**1P 沙盘指挥** 与 **2P 面对面 180° 自动翻盘战棋** |
| **前端 / WebGL 独立开发者** | Three.js 官方示例碎片化；缺乏从主状态机、物理碰撞、触屏双摇杆到自动化测试的完整闭环案例 | [ENGINE_SUBSYSTEMS.md](architecture/ENGINE_SUBSYSTEMS.md) 拆解了零后端状态机、`groundHeight` 同源复用与槽位热组装方案 |
| **开源品牌合规研究者** | 真实项目中商业合作素材（商标/产品图）常与开源主仓库耦合，导致无法用 MIT 协议干净开源 | 提供 `--mode=showcase` 与 `--mode=pure`（[open-neutral.json](../src/presets/open-neutral.json)）双构建通道，彻底剥离专有商标 |
| **AI 编码智能体研发者（Codex / Claude / Gemini）** | 大模型面对 1.5MB+ 单闭包代码极易破坏局部作用域或漏掉真机视口回归陷阱 | 配备 [AGENTS.md](../AGENTS.md) 符号契约、`docs/agent-playbook/01..06` 踩坑手册及零外部依赖 Chrome CDP 视觉验收流水线 |

---

## 2. 对个人与团队的长期复利（Personal Leverage）

1. **零基础设施托管成本的永久作品集**
   - 构建产物为单一静态 HTML（Showcase 版 `1,642,502 B`，Pure 纯净版 `1,572,587 B`），可零配置永久托管于 GitHub Pages（`https://guduzhixing.github.io/skyline-protocol/` 与 `https://guduzhixing.github.io/skyline-protocol/dist/`），无需维护后端服务器或构建缓存失效问题。
2. **可跨项目复制的“槽位叠加构建”资产**
   - 面对高密度 WebGL / Canvas 单闭包内核时，用 [scripts/build.mjs](../scripts/build.mjs) 的 `replaceExact` 精确锚点机制叠加模块化 CSS/JS，可复用至任意重型网页应用迭代，避免“一拆分就崩作用域”。
3. **无外包测试的自动化质量防线**
   - 内置 Zero-Dep Chrome CDP + SwiftShader WebGL2 五矩阵验收脚本（[run-4matrix-qa.mjs](../scripts/cdp-qa/run-4matrix-qa.mjs)），能在 `52.5 s` 内全自动验证竖屏/横屏重叠、越界、2P 翻转与品牌清洗状态，形成可持续演进的个人工程底座。
4. **双预设商务演示模板（Showcase vs Pure）**
   - 需要向外演示真实硬件品牌植入效果时使用 `npm run build`（展示 3D 广告牌与装备卡片）；需要公开发布纯开源工具链时运行 `npm run build:pure` 生成零版权风险版本。

---

## 3. 双预设版权与合规隔离架构

```text
                       ┌─────────────────────────────┐
                       │  src/core/engine-base.html  │ (MIT 核心引擎基线)
                       │  src/styles/*.css           │ (MIT 响应式与桌游样式)
                       │  src/modules/*.js           │ (MIT 触屏输入 & 战棋模块)
                       └──────────────┬──────────────┘
                                      │ scripts/build.mjs
                   ┌──────────────────┴──────────────────┐
                   ▼ --mode=showcase                     ▼ --mode=pure
   ┌───────────────────────────────┐     ┌──────────────────────────────────┐
   │ src/presets/                  │     │ src/presets/open-neutral.json    │
   │ superacme-showcase.json       │     │ 内联 MIT SVG + 中性战术词库      │
   │ + assets/presets/superacme/*  │     └────────────────┬─────────────────┘
   └───────────────┬───────────────┘                      │
                   ▼                                      ▼
    index.html & dist/skyline-              dist/skyline-protocol-open.html
    protocol-standalone.html (1,642,502 B)  (1,572,587 B, brandHitsInDOM = 0)
```

---

## 4. 开源演进三阶段路线图（Roadmap）

| 阶段 | 核心目标 | 关键交付与里程碑 |
| :--- | :--- | :--- |
| **Phase 1：工程筑基（已完成，V3.1）** | 单闭包核分离、双栖模式落地、CDP 自动化验收、MIT 双预设分发 | `src/` 模块拆分、`5/5` Chrome CDP 矩阵通过、GitHub Actions CI + GitHub Pages 上线 |
| **Phase 2：内容与联机扩展（规划中）** | 社区自定义地图与本地离线包扩展 | 更多 `TT_MAPS` 11 节点沙盘战区预设、桌面 PWA Offline Service Worker 缓存清单、多语言 i18n 预设 JSON |
| **Phase 3：WebRTC 无线桌游互联（规划中）** | 从单机传玩升级为跨手机零服务器本地对战 | 基于局域网 WebRTC DataChannel（手动扫码信令）的双手机同步 3D 沙盘状态机 |

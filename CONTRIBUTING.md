# 贡献指南（Contributing Guide）

欢迎为 **苍穹防线：零号协议（Skyline Protocol）** 贡献代码、地图拓扑、视觉预设或工程文档！在提交 Pull Request 前，请先阅读 [AGENTS.md](AGENTS.md) 并了解本项目的核心工程原则。

---

## 1. 四大核心设计原则

1. **Node.js `>= 22.0.0` 零运行时外部依赖**：构建脚本、校验工具及 Chrome CDP 自动化测试仅使用 Node.js 内置标准库（`node:fs`、`node:path`、`node:http`、`node:child_process` 与全局 `WebSocket`），保持仓库可随时在离线或受限 CI 环境零安装启动。
2. **模块化源码开发 → 单文件离线产物分发**：在 `src/` 下保持样式、触屏输入、战棋引擎、JSON 预设的清晰分离；通过 [scripts/build.mjs](scripts/build.mjs) 合成可直接浏览器双击运行的零依赖单文件 HTML。
3. **Showcase 展示版与 Pure 纯净开源版严格对等**：任何涉及贴图资源或品牌文案的新增特性，必须同步维护 [src/presets/superacme-showcase.json](src/presets/superacme-showcase.json) 与 [src/presets/open-neutral.json](src/presets/open-neutral.json)，保证纯开源版功能完整且无品牌残留。
4. **5 矩阵 Chrome CDP 自动化 QA 强门禁**：不能仅凭肉眼猜测移动端适配或 3D 视角表现；布局重叠、越界、2P 旋转、纯开源启动都必须由 [scripts/cdp-qa/run-4matrix-qa.mjs](scripts/cdp-qa/run-4matrix-qa.mjs) 提供客观量化通过报告。

---

## 2. 开发工作流与 PR 提交检查清单

1. **Fork 并基于 `main` 分支开发**：保持每次 PR 聚焦单一功能、Bug 修复或文档完善。
2. **仅修改源目录**：确保修改限定在 `src/`、`scripts/` 或 `docs/`，随后运行：
   ```bash
   npm run build:all
   ```
   使 `index.html`、`dist/skyline-protocol-standalone.html` 与 `dist/skyline-protocol-open.html` 保持同步更新。
3. **通过秒级静态验证**：
   ```bash
   npm run check
   ```
   确认语法与 Pure 版商标过滤全绿灯。
4. **运行完整无头浏览器 QA**：
   ```bash
   npm run qa
   ```
   检查输出的 5 矩阵结果，确认 `runtimeErrors: []`、`overlaps: []`、`oob: []`、`markerCollisions: 0` 与 `brandHitsInDOM: 0`。
5. **保持文档与契约同步**：若新增了战棋地图、HUD 控件或 `window.__G` 调试接口，请同步更新 [AGENTS.md](AGENTS.md) 与 [docs/architecture/CUSTOMIZATION_GUIDE.md](docs/architecture/CUSTOMIZATION_GUIDE.md)。

---

## 3. 开源合规提醒

提交的代码、图片及文案必须是您原创拥有版权的作品或与 MIT 兼容的自由许可资源。切勿向纯开源代码核心（`src/core/`、`src/modules/`、`src/styles/`、`open-neutral.json`）提交未经授权的第三方专有商标或二进制素材；如涉及真实品牌适配案例研究，应像 Showcase 预设一样与纯开源构建路径严格隔离。

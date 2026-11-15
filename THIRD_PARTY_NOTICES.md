# 第三方版权声明与资产许可边界（Third-Party Notices）

本项目在工程架构上明确区分**开源引擎代码资产**与**商业展示预设视觉资产**，以便社区开发者安全地学习、修改与合规分发。

---

## 1. 本项目原创引擎与文档（MIT License）

以下所有核心源码、构建与测试脚本、自适应样式及工程文档均采用 **MIT License**（完整法律原文见 [LICENSE](LICENSE)）：

- `src/core/engine-base.html`（不包含其中通过 Showcase 预设注入的第三方品牌资产字节）
- `src/styles/*.css`
- `src/modules/*.js`
- `src/presets/open-neutral.json`（100% 开源原创内联矢量图标 SVG 与中性战术名词库）
- `scripts/**/*.mjs`
- `docs/**/*.md` 与各类工程剧本（不含 `docs/showcase/*.png` 中包含展示版 UI 截图的画面商标部分）
- 引擎运行时内建的**全部程序化 Web Audio 合成音效、Canvas 程序化地表贴图以及 Three.js 程序化 3D 几何体**

---

## 2. Three.js 运行时引擎（MIT License）

- **库名称**：Three.js（内部版本标记 `M2="180"` / r180）
- **版权声明**：Copyright © 2010–2026 Three.js Authors
- **许可证**：MIT License（https://github.com/mrdoob/three.js/blob/dev/LICENSE）
- **打包方式**：为满足单文件离线零网络请求运行目标，Three.js r180 核心已内联封装于 `src/core/engine-base.html` 中。

---

## 3. Showcase 展示预设中的第三方品牌与硬件图像（非 MIT 授权）

- **涉及资产目录与配置**：
  - `src/presets/superacme-showcase.json`
  - `assets/presets/superacme/`（`superacme_logo.png`、`sa_pt2c.png`、`sa_bc4pro.png`、`sa_bc6v.png`、`sa_bc22.png`）
  - `index.html` 与 `dist/skyline-protocol-standalone.html` 中嵌合的品牌呈现，以及 `docs/showcase/*.png` 展示截图中的相关商标外观。
- **版权与商标说明**：
  “SuperACME”、“杭州研极微”、“CINMOORE 神眸”及其对应的硬件产品型号外观图像（PT2C、BC4 Pro+、BC6V、BC22）均属于其各自合法权利人所有。在本项目中，它们仅作为“真实商业品牌无侵入式融入 3D WebGL 游戏场景与 UI 卡片”的技术整合展示示例（Showcase Reference），**不受 MIT 开源协议授权**。任何第三方的商业使用、商标再发布或产品宣传需另行获得原权利人授权。

---

## 4. 如何生成 100% 纯净无商标争议的开源发行版

若您计划基于本项目进行商业产品二次开发、公网重分发或闭源衍生，请直接执行：

```bash
npm run build:pure
```

该命令将读取 [src/presets/open-neutral.json](src/presets/open-neutral.json)，彻底剥离全部第三方二进制 PNG 图标与专有品牌词条，替换为 MIT 许可的内联矢量 SVG 与通用战术代号，并输出零外部版权争议的：

- **[dist/skyline-protocol-open.html](dist/skyline-protocol-open.html)**（在 CI 与静态门禁 `npm run check` 中强制校验 `brandHitsInDOM === 0`）。
